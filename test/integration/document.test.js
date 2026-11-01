import request from "supertest";
import fs from "fs";
import path from "path";
import os from "os";
import app from "../../src/app.js";
import { cleanDatabase, createTestUser, closeTestDb } from "../helpers/testDb.js";
import { HashService } from "../../src/services/hashService.js";

describe("Document Management Integration Tests", () => {
  let authUser;
  let validPdfPath;
  let fakePdfPath;
  let textFilePath;
  let validPdfBuffer;
  let expectedSha256;

  beforeAll(async () => {
    // Construct authentic minimal valid PDF with proper %PDF-1.4 header
    validPdfBuffer = Buffer.from(
      "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n"
    );
    expectedSha256 = HashService.calculateHashFromBuffer(validPdfBuffer);

    validPdfPath = path.join(os.tmpdir(), `valid-doc-${Date.now()}.pdf`);
    fs.writeFileSync(validPdfPath, validPdfBuffer);

    // Fake PDF (has .pdf extension but fake header)
    fakePdfPath = path.join(os.tmpdir(), `fake-doc-${Date.now()}.pdf`);
    fs.writeFileSync(fakePdfPath, "NOT_A_REAL_PDF_HEADER");

    // Plain text file
    textFilePath = path.join(os.tmpdir(), `sample-${Date.now()}.txt`);
    fs.writeFileSync(textFilePath, "Plain text content");
  });

  afterAll(async () => {
    if (fs.existsSync(validPdfPath)) fs.unlinkSync(validPdfPath);
    if (fs.existsSync(fakePdfPath)) fs.unlinkSync(fakePdfPath);
    if (fs.existsSync(textFilePath)) fs.unlinkSync(textFilePath);
    await cleanDatabase();
    await closeTestDb();
  });

  beforeEach(async () => {
    await cleanDatabase();
    authUser = await createTestUser({ email: "docuser@university.edu" });
  });

  describe("POST /api/documents/upload", () => {
    it("should upload a valid PDF, compute SHA-256, and store metadata", async () => {
      const res = await request(app)
        .post("/api/documents/upload")
        .set("Authorization", `Bearer ${authUser.token}`)
        .field("title", "Undergraduate Research Project")
        .field("description", "Final blockchain seminar report")
        .attach("document", validPdfPath)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.document.title).toBe("Undergraduate Research Project");
      expect(res.body.data.document.sha256Hash).toBe(expectedSha256);
      expect(res.body.data.document.status).toBe("PENDING_REGISTRATION");
      expect(res.body.data.document.documentReference).toMatch(/^DOC-\d{8}-[A-F0-9]{6}$/);
    });

    it("should prevent duplicate document upload based on byte-level SHA-256", async () => {
      // First upload
      await request(app)
        .post("/api/documents/upload")
        .set("Authorization", `Bearer ${authUser.token}`)
        .field("title", "Original Submission")
        .attach("document", validPdfPath)
        .expect(201);

      // Attempt duplicate upload with identical content
      const dupRes = await request(app)
        .post("/api/documents/upload")
        .set("Authorization", `Bearer ${authUser.token}`)
        .field("title", "Duplicate Attempt")
        .attach("document", validPdfPath)
        .expect(409);

      expect(dupRes.body.success).toBe(false);
      expect(dupRes.body.message).toMatch(/duplicate document detected/i);
    });

    it("should reject non-PDF file upload", async () => {
      const res = await request(app)
        .post("/api/documents/upload")
        .set("Authorization", `Bearer ${authUser.token}`)
        .field("title", "Text Document")
        .attach("document", textFilePath)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/only pdf documents/i);
    });

    it("should reject file with .pdf extension but invalid magic bytes", async () => {
      const res = await request(app)
        .post("/api/documents/upload")
        .set("Authorization", `Bearer ${authUser.token}`)
        .field("title", "Spoofed Document")
        .attach("document", fakePdfPath)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/genuine pdf structure/i);
    });

    it("should reject unauthorized request without token", async () => {
      const res = await request(app)
        .post("/api/documents/upload")
        .send({ title: "Unauthorized Upload" })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/authentication required/i);
    });
  });

  describe("GET /api/documents", () => {
    it("should list uploaded documents for the user with pagination", async () => {
      // Upload document
      await request(app)
        .post("/api/documents/upload")
        .set("Authorization", `Bearer ${authUser.token}`)
        .field("title", "First Doc")
        .attach("document", validPdfPath);

      const res = await request(app)
        .get("/api/documents?page=1&limit=10")
        .set("Authorization", `Bearer ${authUser.token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.pagination.total).toBe(1);
    });
  });
});
