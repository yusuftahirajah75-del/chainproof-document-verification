import crypto from "crypto";
import fs from "fs";

export class HashService {
  /**
   * Compute SHA-256 from a Buffer
   * @param {Buffer} buffer
   * @returns {string} 64-character lowercase hex string
   */
  static calculateHashFromBuffer(buffer) {
    if (!Buffer.isBuffer(buffer)) {
      throw new TypeError("Expected buffer for hash calculation");
    }
    return crypto.createHash("sha256").update(buffer).digest("hex").toLowerCase();
  }

  /**
   * Compute SHA-256 from a file on disk
   * @param {string} filePath
   * @returns {Promise<string>} 64-character lowercase hex string
   */
  static async calculateHashFromFile(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash("sha256");
      const stream = fs.createReadStream(filePath);

      stream.on("data", (chunk) => hash.update(chunk));
      stream.on("end", () => resolve(hash.digest("hex").toLowerCase()));
      stream.on("error", (err) => reject(err));
    });
  }

  /**
   * Convert standard 64-char hex SHA-256 to Solidity bytes32 format (0x prefixed)
   * @param {string} hash
   * @returns {string} 0x prefixed 66-character string
   */
  static toBytes32(hash) {
    const cleanHash = hash.startsWith("0x") ? hash.slice(2) : hash;
    if (cleanHash.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(cleanHash)) {
      throw new Error(`Invalid SHA-256 hash format for bytes32 conversion: ${hash}`);
    }
    return `0x${cleanHash.toLowerCase()}`;
  }

  /**
   * Convert Solidity bytes32 to standard 64-char hex string
   * @param {string} bytes32Hash
   * @returns {string} 64-character hex string without 0x
   */
  static fromBytes32(bytes32Hash) {
    if (bytes32Hash.startsWith("0x")) {
      return bytes32Hash.slice(2).toLowerCase();
    }
    return bytes32Hash.toLowerCase();
  }

  /**
   * Validate whether a string is a valid SHA-256 hex string
   * @param {string} hash
   * @returns {boolean}
   */
  static isValidSha256(hash) {
    if (!hash || typeof hash !== "string") return false;
    const clean = hash.startsWith("0x") ? hash.slice(2) : hash;
    return /^[a-fA-F0-9]{64}$/.test(clean);
  }
}

