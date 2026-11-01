import fs from "fs";
import path from "path";
import os from "os";
import { HashService } from "../../src/services/hashService.js";

describe("HashService Unit Tests", () => {
  let tempFilePath;
  const testContent = "Blockchain Document Integrity Verification System 2026";
  // Expected SHA-256 for the string above:
  // calculated via crypto.createHash('sha256').update(testContent).digest('hex')

  beforeAll(() => {
    tempFilePath = path.join(os.tmpdir(), `test-doc-${Date.now()}.pdf`);
    fs.writeFileSync(tempFilePath, testContent);
  });

  afterAll(() => {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  });

  it("should calculate deterministic SHA-256 hash from a Buffer", () => {
    const buffer = Buffer.from(testContent);
    const hash1 = HashService.calculateHashFromBuffer(buffer);
    const hash2 = HashService.calculateHashFromBuffer(buffer);

    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2);
    expect(/^[a-f0-9]{64}$/.test(hash1)).toBe(true);
  });

  it("should calculate identical SHA-256 hash from file bytes as buffer", async () => {
    const buffer = Buffer.from(testContent);
    const bufferHash = HashService.calculateHashFromBuffer(buffer);
    const fileHash = await HashService.calculateHashFromFile(tempFilePath);

    expect(fileHash).toBe(bufferHash);
  });

  it("should convert 64-character hex hash to 66-character bytes32 format", () => {
    const hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const bytes32 = HashService.toBytes32(hash);

    expect(bytes32).toBe(`0x${hash}`);
    expect(bytes32).toHaveLength(66);
  });

  it("should convert bytes32 back to clean 64-character hex string", () => {
    const raw = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const bytes32 = `0x${raw}`;
    const clean = HashService.fromBytes32(bytes32);

    expect(clean).toBe(raw);
  });

  it("should reject invalid hash inputs for bytes32 conversion", () => {
    expect(() => HashService.toBytes32("invalid-short-hash")).toThrow();
    expect(() => HashService.toBytes32("12345")).toThrow();
  });

  it("should correctly validate valid and invalid SHA-256 strings", () => {
    const valid = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const valid0x = "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const invalid = "not-a-hash";

    expect(HashService.isValidSha256(valid)).toBe(true);
    expect(HashService.isValidSha256(valid0x)).toBe(true);
    expect(HashService.isValidSha256(invalid)).toBe(false);
    expect(HashService.isValidSha256(null)).toBe(false);
  });
});

