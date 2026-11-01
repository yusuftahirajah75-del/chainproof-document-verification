import { registerSchema, loginSchema } from "../../src/validators/authValidator.js";
import { uploadDocumentSchema } from "../../src/validators/documentValidator.js";
import { verifyByHashSchema } from "../../src/validators/verificationValidator.js";

describe("Validator Unit Tests", () => {
  describe("Registration Schema", () => {
    it("should accept valid registration payloads", () => {
      const valid = {
        email: "alice@university.edu",
        password: "StrongPassword123!",
        fullName: "Alice Researcher",
        organization: "Computer Science Faculty",
      };
      const res = registerSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it("should reject weak passwords lacking numbers or symbols", () => {
      const weak = {
        email: "alice@university.edu",
        password: "weakpassword",
        fullName: "Alice Researcher",
      };
      const res = registerSchema.safeParse(weak);
      expect(res.success).toBe(false);
    });

    it("should reject invalid email formats", () => {
      const invalid = {
        email: "not-an-email",
        password: "StrongPassword123!",
        fullName: "Alice Researcher",
      };
      const res = registerSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });
  });

  describe("Document Upload Schema", () => {
    it("should reject document without title", () => {
      const res = uploadDocumentSchema.safeParse({});
      expect(res.success).toBe(false);
    });

    it("should accept valid document metadata", () => {
      const res = uploadDocumentSchema.safeParse({
        title: "BSc Thesis Final Report",
        description: "Official copy submitted for seminar presentation",
      });
      expect(res.success).toBe(true);
      expect(res.data.title).toBe("BSc Thesis Final Report");
    });
  });

  describe("Verification Schema", () => {
    it("should accept 64-char SHA-256 and strip 0x prefix", () => {
      const raw = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      const res = verifyByHashSchema.safeParse({ hash: `0x${raw}` });
      expect(res.success).toBe(true);
      expect(res.data.hash).toBe(raw);
    });

    it("should reject malformed hashes", () => {
      const res = verifyByHashSchema.safeParse({ hash: "invalid-hash-string" });
      expect(res.success).toBe(false);
    });
  });
});

