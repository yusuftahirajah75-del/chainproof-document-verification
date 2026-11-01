import fs from "fs";
import crypto from "crypto";
import { query, getClient } from "../config/database.js";
import { HashService } from "./hashService.js";
import { BlockchainService } from "./blockchainService.js";
import { AuditService } from "./auditService.js";
import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";

export class DocumentService {
  /**
   * Generates a readable reference string: DOC-YYYYMMDD-XXXX
   */
  static generateReference() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randStr = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `DOC-${dateStr}-${randStr}`;
  }

  /**
   * Process and store an uploaded PDF document
   */
  static async uploadDocument({ file, title, description, user, ipAddress, userAgent }) {
    if (!file) {
      throw new AppError("No document file provided.", 400);
    }

    const filePath = file.path;

    try {
      // 1. Calculate SHA-256 hash from file bytes
      const sha256Hash = await HashService.calculateHashFromFile(filePath);
      const bytes32Hash = HashService.toBytes32(sha256Hash);

      // 2. Duplicate Detection: Check if hash already exists in database
      const existingHash = await query(
        `
        SELECT dh.sha256_hash, d.id as document_id, d.document_reference, d.title, d.status, d.created_at
        FROM document_hashes dh
        JOIN documents d ON dh.document_id = d.id
        WHERE dh.sha256_hash = $1
        `,
        [sha256Hash]
      );

      if (existingHash.rows.length > 0) {
        // Clean up uploaded duplicate file to avoid clutter
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        const match = existingHash.rows[0];
        throw new AppError(
          `Duplicate document detected: This exact file has already been uploaded as '${match.title}' (Reference: ${match.document_reference}).`,
          409,
          {
            existingDocumentId: match.document_id,
            documentReference: match.document_reference,
            sha256Hash: match.sha256_hash,
            status: match.status,
          }
        );
      }

      // 3. Insert document and hash in a database transaction
      const client = await getClient();
      let newDocument;

      try {
        await client.query("BEGIN");

        const docRef = this.generateReference();

        const insertDocSql = `
          INSERT INTO documents (
            user_id, document_reference, title, description,
            original_filename, stored_filename, file_path,
            mime_type, file_size_bytes, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING_REGISTRATION')
          RETURNING *;
        `;

        const docResult = await client.query(insertDocSql, [
          user.id,
          docRef,
          title,
          description || null,
          file.originalname,
          file.filename,
          filePath,
          file.mimetype || "application/pdf",
          file.size,
        ]);

        newDocument = docResult.rows[0];

        // Insert hash
        const insertHashSql = `
          INSERT INTO document_hashes (document_id, sha256_hash, bytes32_hash, algorithm)
          VALUES ($1, $2, $3, 'SHA-256')
          RETURNING *;
        `;

        await client.query(insertHashSql, [newDocument.id, sha256Hash, bytes32Hash]);

        await client.query("COMMIT");
      } catch (dbErr) {
        await client.query("ROLLBACK");
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        throw dbErr;
      } finally {
        client.release();
      }

      // 4. Log Audit Event
      await AuditService.log({
        userId: user.id,
        action: "DOCUMENT_UPLOAD",
        entityType: "DOCUMENT",
        entityId: newDocument.id,
        ipAddress,
        userAgent,
        details: {
          reference: newDocument.document_reference,
          sha256Hash,
          fileSize: file.size,
        },
      });

      return {
        id: newDocument.id,
        documentReference: newDocument.document_reference,
        title: newDocument.title,
        description: newDocument.description,
        originalFilename: newDocument.original_filename,
        fileSizeBytes: Number(newDocument.file_size_bytes),
        mimeType: newDocument.mime_type,
        status: newDocument.status,
        sha256Hash,
        bytes32Hash,
        createdAt: newDocument.created_at,
      };
    } catch (err) {
      if (fs.existsSync(filePath) && !(err.statusCode === 409)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // ignore
        }
      }
      throw err;
    }
  }

  /**
   * Register an existing uploaded document on the blockchain
   */
  static async registerDocumentOnBlockchain({ documentId, user, ipAddress, userAgent }) {
    // 1. Fetch document and hash
    const docQuery = `
      SELECT d.*, dh.sha256_hash, dh.bytes32_hash
      FROM documents d
      JOIN document_hashes dh ON d.id = dh.document_id
      WHERE d.id = $1
    `;
    const docRes = await query(docQuery, [documentId]);

    if (docRes.rows.length === 0) {
      throw new AppError("Document not found.", 404);
    }

    const doc = docRes.rows[0];

    // Authorization: only the owner or an admin can register
    if (user.role !== "ADMIN" && doc.user_id !== user.id) {
      throw new AppError("You do not have permission to register this document.", 403);
    }

    if (doc.status === "REGISTERED") {
      throw new AppError("This document has already been registered on the blockchain.", 400);
    }

    // 2. Perform on-chain registration
    const txReceipt = await BlockchainService.registerDocumentOnChain(
      doc.sha256_hash,
      doc.document_reference
    );

    // 3. Persist blockchain transaction and update document status
    const client = await getClient();
    try {
      await client.query("BEGIN");

      const insertTxSql = `
        INSERT INTO blockchain_transactions (
          document_id, transaction_hash, block_number, block_timestamp,
          network_name, chain_id, contract_address, submitter_address,
          gas_used, effective_gas_price, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
      `;

      await client.query(insertTxSql, [
        doc.id,
        txReceipt.transactionHash,
        txReceipt.blockNumber,
        txReceipt.blockTimestamp,
        txReceipt.networkName,
        txReceipt.chainId,
        txReceipt.contractAddress,
        txReceipt.submitterAddress,
        txReceipt.gasUsed,
        txReceipt.effectiveGasPrice,
        txReceipt.status,
      ]);

      await client.query(
        "UPDATE documents SET status = 'REGISTERED', updated_at = NOW() WHERE id = $1",
        [doc.id]
      );

      await client.query("COMMIT");
    } catch (dbErr) {
      await client.query("ROLLBACK");
      logger.error(`[DB Failure storing tx for doc ${doc.id}]: ${dbErr.message}`);
      throw dbErr;
    } finally {
      client.release();
    }

    // 4. Log Audit Event
    await AuditService.log({
      userId: user.id,
      action: "BLOCKCHAIN_REGISTER",
      entityType: "DOCUMENT",
      entityId: doc.id,
      ipAddress,
      userAgent,
      details: {
        documentReference: doc.document_reference,
        transactionHash: txReceipt.transactionHash,
        blockNumber: txReceipt.blockNumber,
      },
    });

    return {
      documentId: doc.id,
      documentReference: doc.document_reference,
      status: "REGISTERED",
      transaction: txReceipt,
    };
  }

  /**
   * Upload and register atomically in one operation
   */
  static async uploadAndRegister({ file, title, description, user, ipAddress, userAgent }) {
    const uploaded = await this.uploadDocument({
      file,
      title,
      description,
      user,
      ipAddress,
      userAgent,
    });

    const registered = await this.registerDocumentOnBlockchain({
      documentId: uploaded.id,
      user,
      ipAddress,
      userAgent,
    });

    return {
      ...uploaded,
      status: "REGISTERED",
      transaction: registered.transaction,
    };
  }

  /**
   * List documents with pagination and filters
   */
  static async listDocuments({ userId, role, page = 1, limit = 10, search, status }) {
    const offset = (page - 1) * limit;
    const values = [];
    const whereClauses = [];

    // Normal users see only their documents; Admins see all
    if (role !== "ADMIN") {
      values.push(userId);
      whereClauses.push(`d.user_id = $${values.length}`);
    }

    if (status) {
      values.push(status);
      whereClauses.push(`d.status = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      whereClauses.push(`(d.title ILIKE $${values.length} OR d.document_reference ILIKE $${values.length})`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countSql = `SELECT COUNT(*) AS total FROM documents d ${whereSql}`;
    const countRes = await query(countSql, values);
    const total = parseInt(countRes.rows[0].total, 10);

    const dataValues = [...values, limit, offset];
    const dataSql = `
      SELECT 
        d.id, d.document_reference, d.title, d.description,
        d.original_filename, d.file_size_bytes, d.status,
        d.created_at, d.updated_at,
        dh.sha256_hash, dh.bytes32_hash,
        bt.transaction_hash, bt.block_number, bt.block_timestamp,
        u.email as owner_email, u.full_name as owner_name
      FROM documents d
      JOIN document_hashes dh ON d.id = dh.document_id
      LEFT JOIN blockchain_transactions bt ON d.id = bt.document_id
      JOIN users u ON d.user_id = u.id
      ${whereSql}
      ORDER BY d.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2};
    `;

    const dataRes = await query(dataSql, dataValues);

    return {
      documents: dataRes.rows,
      total,
      page,
      limit,
    };
  }

  /**
   * Get detailed document by ID
   */
  static async getDocumentById(documentId, user) {
    const sql = `
      SELECT 
        d.*,
        dh.sha256_hash, dh.bytes32_hash,
        bt.transaction_hash, bt.block_number, bt.block_timestamp,
        bt.contract_address, bt.submitter_address, bt.gas_used,
        u.email as owner_email, u.full_name as owner_name, u.organization as owner_organization
      FROM documents d
      JOIN document_hashes dh ON d.id = dh.document_id
      LEFT JOIN blockchain_transactions bt ON d.id = bt.document_id
      JOIN users u ON d.user_id = u.id
      WHERE d.id = $1;
    `;
    const res = await query(sql, [documentId]);

    if (res.rows.length === 0) {
      throw new AppError("Document not found.", 404);
    }

    const doc = res.rows[0];

    // Authorization: User must be owner or ADMIN
    if (user.role !== "ADMIN" && doc.user_id !== user.id) {
      throw new AppError("Access denied: You do not have permission to view this document.", 403);
    }

    return doc;
  }
}

