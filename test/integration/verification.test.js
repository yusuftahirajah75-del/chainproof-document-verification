import { jest } from "@jest/globals";
import request from "supertest";
import fs from "fs";
import path from "path";
import os from "os";
import app from "../../src/app.js";
import { cleanDatabase, createTestUser, closeTestDb } from "../helpers/testDb.js";
import { testPool } from "../helpers/testDb.js";
import { HashService } from "../../src/services/hashService.js";
import { BlockchainService } from "../../src/services/blockchainService.js";

describe("Document Verification Integration Tests", () => {
  let authUser;
  let originalPdfPath;
  let modifiedPdfPath;
  let unregisteredPdfPath;
  let originalHash;
  let modifiedHash;
  let unregisteredHash;
  let registeredDocRef = "DOC-20261101-THESIS";

  beforeAll(async () => {
    // 1. Original PDF
    const originalBuffer = Buffer.from("%PDF-1.4\nOriginal Academic Thesis Content 2026\n%%EOF");
    originalHash = HashService.calculateHashFromBuffer(originalBuffer);
    originalPdfPath = path.join(os.tmpdir(), `orig-${Date.now()}.pdf`);
    fs.writeFileSync(originalPdfPath, originalBuffer);

    // 2. Tampered / Modified PDF
    const modifiedBuffer = Buffer.from("%PDF-1.4\nTAMPERED Grade Alteration Content 2026\n%%EOF");
    modifiedHash = HashService.calculateHashFromBuffer(modifiedBuffer);
    modifiedPdfPath = path.join(os.tmpdir(), `mod-${Date.now()}.pdf`);
    fs.writeFileSync(modifiedPdfPath, modifiedBuffer);

    // 3. Unregistered PDF
    const unregisteredBuffer = Buffer.from("%PDF-1.4\nCompletely Unregistered File Content\n%%EOF");
    unregisteredHash = HashService.calculateHashFromBuffer(unregisteredBuffer);
    unregisteredPdfPath = path.join(os.tmpdir(), `unreg-${Date.now()}.pdf`);
    fs.writeFileSync(unregisteredPdfPath, unregisteredBuffer);
  });

  afterAll(async () => {
    if (fs.existsSync(originalPdfPath)) fs.unlinkSync(originalPdfPath);
    if (fs.existsSync(modifiedPdfPath)) fs.unlinkSync(modifiedPdfPath);
    if (fs.existsSync(unregisteredPdfPath)) fs.unlinkSync(unregisteredPdfPath);
    await cleanDatabase();
    await closeTestDb();
  });

  beforeEach(async () => {
    await cleanDatabase();
    authUser = await createTestUser({ email: "verifier@university.edu" });

    // Seed an established registered document in the database
    const docRes = await testPool.query(
      `
      INSERT INTO documents (
        user_id, document_reference, title, description,
        original_filename, stored_filename, file_path,
        mime_type, file_size_bytes, status
      ) VALUES ($1, $2, 'Academic Thesis', 'Degree Verification Thesis', 'thesis.pdf', 'thesis.pdf', '/tmp/thesis.pdf', 'application/pdf', 1024, 'REGISTERED')
      RETURNING id;
      `,
      [authUser.user.id, registeredDocRef]
    );
    const docId = docRes.rows[0].id;

    // Insert baseline original hash
    await testPool.query(
      `
      INSERT INTO document_hashes (document_id, sha256_hash, bytes32_hash, algorithm)
      VALUES ($1, $2, $3, 'SHA-256');
      `,
      [docId, originalHash, HashService.toBytes32(originalHash)]
    );

    // Insert confirmed blockchain tx record
    await testPool.query(
      `
      INSERT INTO blockchain_transactions (
        document_id, transaction_hash, block_number, block_timestamp,
        network_name, chain_id, contract_address, submitter_address,
        gas_used, effective_gas_price, status
      ) VALUES ($1, '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', 100, NOW(), 'hardhat', 31337, '0x5FbDB2315678afecb367f032d93F642f64180aa3', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 21000, '1000000000', 'CONFIRMED');
      `,
      [docId]
    );
  });

  describe("POST /api/verification/verify-hash", () => {
    it("should classify an unregistered hash as NOT_REGISTERED (and never TAMPERED)", async () => {
      // Mock blockchain verification query returning exists=false
      jest.spyOn(BlockchainService, "verifyDocumentOnChain").mockResolvedValueOnce({
        exists: false,
        documentHash: unregisteredHash,
      });

      const res = await request(app)
        .post("/api/verification/verify-hash")
        .send({ hash: unregisteredHash })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("NOT_REGISTERED");
      expect(res.body.data.matchedOnChain).toBe(false);
    });

    it("should classify a registered hash as AUTHENTIC", async () => {
      // Mock blockchain verification returning exists=true
      jest.spyOn(BlockchainService, "verifyDocumentOnChain").mockResolvedValueOnce({
        exists: true,
        documentHash: originalHash,
        submitter: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        registeredAt: new Date(),
        docReference: registeredDocRef,
        blockNumber: 100,
      });

      const res = await request(app)
        .post("/api/verification/verify-hash")
        .send({ hash: originalHash })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("AUTHENTIC");
      expect(res.body.data.details.documentReference).toBe(registeredDocRef);
    });

    it("should classify altered document claiming a registered reference as TAMPERED", async () => {
      // Unaltered modified hash does not exist on blockchain
      jest.spyOn(BlockchainService, "verifyDocumentOnChain").mockResolvedValueOnce({
        exists: false,
        documentHash: modifiedHash,
      });

      // Claiming established registeredDocRef with altered hash
      const res = await request(app)
        .post("/api/verification/verify-hash")
        .send({
          hash: modifiedHash,
          documentReference: registeredDocRef,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("TAMPERED");
      expect(res.body.data.details.expectedHash).toBe(originalHash);
      expect(res.body.data.details.actualHash).toBe(modifiedHash);
      expect(res.body.data.details.message).toMatch(/tampering detected/i);
    });
  });

  describe("POST /api/verification/verify-file", () => {
    it("should verify uploaded authentic PDF file as AUTHENTIC", async () => {
      jest.spyOn(BlockchainService, "verifyDocumentOnChain").mockResolvedValueOnce({
        exists: true,
        documentHash: originalHash,
        submitter: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        registeredAt: new Date(),
        docReference: registeredDocRef,
        blockNumber: 100,
      });

      const res = await request(app)
        .post("/api/verification/verify-file")
        .attach("document", originalPdfPath)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("AUTHENTIC");
    });

    it("should verify uploaded tampered file claiming reference as TAMPERED", async () => {
      jest.spyOn(BlockchainService, "verifyDocumentOnChain").mockResolvedValueOnce({
        exists: false,
        documentHash: modifiedHash,
      });

      const res = await request(app)
        .post("/api/verification/verify-file")
        .field("documentReference", registeredDocRef)
        .attach("document", modifiedPdfPath)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("TAMPERED");
      expect(res.body.data.details.expectedHash).toBe(originalHash);
      expect(res.body.data.details.actualHash).toBe(modifiedHash);
    });
  });

  describe("GET /api/verification/history", () => {
    it("should retrieve recorded verification audits", async () => {
      // Run a verification
      jest.spyOn(BlockchainService, "verifyDocumentOnChain").mockResolvedValueOnce({
        exists: false,
        documentHash: unregisteredHash,
      });

      await request(app)
        .post("/api/verification/verify-hash")
        .set("Authorization", `Bearer ${authUser.token}`)
        .send({ hash: unregisteredHash });

      const historyRes = await request(app)
        .get("/api/verification/history")
        .set("Authorization", `Bearer ${authUser.token}`)
        .expect(200);

      expect(historyRes.body.success).toBe(true);
      expect(historyRes.body.data.length).toBeGreaterThanOrEqual(1);
      expect(historyRes.body.data[0].verification_status).toBe("NOT_REGISTERED");
    });
  });
});
