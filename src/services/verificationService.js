import fs from "fs";
import { query } from "../config/database.js";
import { HashService } from "./hashService.js";
import { BlockchainService } from "./blockchainService.js";
import { AuditService } from "./auditService.js";
import { VERIFICATION_STATUS } from "../constants/verificationStatus.js";
import { logger } from "../utils/logger.js";

export class VerificationService {
  /**
   * Core verification engine implementing the 3 strict outcomes
   * @param {object} params
   * @param {string} params.calculatedHash
   * @param {string|null} [params.documentReference=null]
   * @param {string|null} [params.submittedFilename=null]
   * @param {object|null} [params.user=null]
   * @param {string|null} [params.ipAddress=null]
   * @param {string|null} [params.userAgent=null]
   */
  static async verify({
    calculatedHash,
    documentReference = null,
    submittedFilename = null,
    user = null,
    ipAddress = null,
    userAgent = null,
  }) {
    logger.info(`[Verification] Verifying hash: ${calculatedHash} (Ref: ${documentReference || "None"})`);

    let status = VERIFICATION_STATUS.NOT_REGISTERED;
    let matchedOnChain = false;
    let blockchainRecord = null;
    let localDocument = null;
    let referenceCheck = null;
    let details = {};

    // 1. Check Blockchain Record
    try {
      blockchainRecord = await BlockchainService.verifyDocumentOnChain(calculatedHash);
      if (blockchainRecord.exists) {
        matchedOnChain = true;
      }
    } catch (bcErr) {
      logger.warn(`[Verification] Blockchain query notice: ${bcErr.message}`);
    }

    // 2. Fetch local database details by hash (if registered in our system)
    const dbHashRes = await query(
      `
      SELECT 
        d.id as document_id, d.document_reference, d.title, d.status as doc_status,
        d.created_at as uploaded_at, dh.sha256_hash, dh.bytes32_hash,
        bt.transaction_hash, bt.block_number, bt.block_timestamp, bt.submitter_address,
        u.email as owner_email, u.full_name as owner_name, u.organization as owner_org
      FROM document_hashes dh
      JOIN documents d ON dh.document_id = d.id
      LEFT JOIN blockchain_transactions bt ON d.id = bt.document_id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE dh.sha256_hash = $1
      `,
      [calculatedHash]
    );

    if (dbHashRes.rows.length > 0) {
      localDocument = dbHashRes.rows[0];
    }

    // 3. Evaluate Status
    if (matchedOnChain || (localDocument && localDocument.doc_status === "REGISTERED")) {
      // OUTCOME A: AUTHENTIC
      // Hash matches an active blockchain registration record
      status = VERIFICATION_STATUS.AUTHENTIC;
      details = {
        message: "Document is authentic. The cryptographic SHA-256 digest matches the verified blockchain ledger entry.",
        documentReference: localDocument?.document_reference || blockchainRecord?.docReference || null,
        title: localDocument?.title || "Registered Document",
        registeredAt: blockchainRecord?.registeredAt || localDocument?.block_timestamp || null,
        blockNumber: blockchainRecord?.blockNumber || localDocument?.block_number || null,
        submitterAddress: blockchainRecord?.submitter || localDocument?.submitter_address || null,
        transactionHash: localDocument?.transaction_hash || null,
        ownerOrganization: localDocument?.owner_org || null,
      };
    } else if (documentReference) {
      // OUTCOME B or C with Claimed Identity
      // A specific document reference or identity was asserted. Let's inspect the baseline record.
      const refRes = await query(
        `
        SELECT 
          d.id as document_id, d.document_reference, d.title, d.status as doc_status,
          dh.sha256_hash as original_hash,
          bt.transaction_hash, bt.block_number, bt.block_timestamp, bt.submitter_address
        FROM documents d
        JOIN document_hashes dh ON d.id = dh.document_id
        LEFT JOIN blockchain_transactions bt ON d.id = bt.document_id
        WHERE d.document_reference = $1
        `,
        [documentReference]
      );

      if (refRes.rows.length > 0) {
        referenceCheck = refRes.rows[0];

        // The claimed reference exists as an established registration, but calculated hash differs
        if (referenceCheck.original_hash !== calculatedHash) {
          status = VERIFICATION_STATUS.TAMPERED;
          details = {
            message: "Tampering detected. The document is associated with an established registration reference, but its byte contents have been altered.",
            documentReference: referenceCheck.document_reference,
            registeredTitle: referenceCheck.title,
            expectedHash: referenceCheck.original_hash,
            actualHash: calculatedHash,
            originalRegisteredAt: referenceCheck.block_timestamp,
            transactionHash: referenceCheck.transaction_hash,
          };
        }
      } else {
        // Claimed reference does not exist, and hash is not registered
        status = VERIFICATION_STATUS.NOT_REGISTERED;
        details = {
          message: "No matching blockchain or registration record found for this document or reference.",
          calculatedHash,
          claimedReference: documentReference,
        };
      }
    } else {
      // OUTCOME C: NOT REGISTERED
      // No match on blockchain, and no reference claimed.
      // Strict rule: "Never classify an unrelated, previously unregistered file as TAMPERED merely because its hash is unknown."
      status = VERIFICATION_STATUS.NOT_REGISTERED;
      details = {
        message: "No matching blockchain record exists for this document hash. The document is not registered on this ledger.",
        calculatedHash,
      };
    }

    // 4. Record Verification Attempt in Database
    const docId = localDocument?.document_id || referenceCheck?.document_id || null;
    const insertVerificationSql = `
      INSERT INTO verification_records (
        document_id, verified_by_user_id, submitted_filename,
        calculated_hash, verification_status, matched_on_chain,
        document_reference_claimed, blockchain_timestamp,
        ip_address, user_agent, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const verificationRecordRes = await query(insertVerificationSql, [
      docId,
      user?.id || null,
      submittedFilename || null,
      calculatedHash,
      status,
      matchedOnChain,
      documentReference,
      blockchainRecord?.registeredAt || null,
      ipAddress,
      userAgent,
      JSON.stringify(details),
    ]);

    const record = verificationRecordRes.rows[0];

    // 5. Audit Log
    await AuditService.log({
      userId: user?.id || null,
      action: "DOCUMENT_VERIFY",
      entityType: "VERIFICATION",
      entityId: record.id,
      ipAddress,
      userAgent,
      details: {
        status,
        calculatedHash,
        documentReference,
        matchedOnChain,
      },
    });

    return {
      verificationId: record.id,
      status,
      calculatedHash,
      matchedOnChain,
      verifiedAt: record.created_at,
      details,
    };
  }

  /**
   * Verify by uploaded file
   */
  static async verifyFile({ file, documentReference = null, user = null, ipAddress = null, userAgent = null }) {
    if (!file) {
      throw new Error("No file was uploaded for verification.");
    }

    const filePath = file.path;
    try {
      const calculatedHash = await HashService.calculateHashFromFile(filePath);
      return await this.verify({
        calculatedHash,
        documentReference,
        submittedFilename: file.originalname,
        user,
        ipAddress,
        userAgent,
      });
    } finally {
      // Verification uploads are temporary inspection files and should be unlinked
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // ignore
        }
      }
    }
  }

  /**
   * Retrieve verification history
   */
  static async getVerificationHistory({ page = 1, limit = 10, status, userId, role }) {
    const offset = (page - 1) * limit;
    const values = [];
    const whereClauses = [];

    if (role !== "ADMIN" && userId) {
      values.push(userId);
      whereClauses.push(`vr.verified_by_user_id = $${values.length}`);
    }

    if (status) {
      values.push(status);
      whereClauses.push(`vr.verification_status = $${values.length}`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countRes = await query(
      `SELECT COUNT(*) AS total FROM verification_records vr ${whereSql}`,
      values
    );
    const total = parseInt(countRes.rows[0].total, 10);

    const queryValues = [...values, limit, offset];
    const dataSql = `
      SELECT 
        vr.id, vr.submitted_filename, vr.calculated_hash,
        vr.verification_status, vr.matched_on_chain,
        vr.document_reference_claimed, vr.blockchain_timestamp,
        vr.details, vr.created_at,
        u.email as verifier_email, u.full_name as verifier_name,
        d.title as document_title, d.document_reference
      FROM verification_records vr
      LEFT JOIN users u ON vr.verified_by_user_id = u.id
      LEFT JOIN documents d ON vr.document_id = d.id
      ${whereSql}
      ORDER BY vr.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2};
    `;

    const dataRes = await query(dataSql, queryValues);

    return {
      history: dataRes.rows,
      total,
      page,
      limit,
    };
  }
}

