import { jest } from "@jest/globals";
import request from "supertest";
import app from "../../src/app.js";
import { BlockchainService } from "../../src/services/blockchainService.js";
import * as bcConfig from "../../src/config/blockchain.js";

describe("Blockchain API Integration Tests", () => {
  describe("GET /api/blockchain/status", () => {
    it("should return blockchain node connectivity status and contract information", async () => {
      const res = await request(app).get("/api/blockchain/status").expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.network).toBeDefined();
      expect(res.body.data.rpcUrl).toBeDefined();
      expect(typeof res.body.data.connected).toBe("boolean");
    });
  });

  describe("GET /api/blockchain/verify/:hash", () => {
    it("should return on-chain registration state for a queried hash", async () => {
      const sampleHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

      jest.spyOn(BlockchainService, "verifyDocumentOnChain").mockResolvedValueOnce({
        exists: false,
        documentHash: sampleHash,
        submitter: null,
      });

      const res = await request(app).get(`/api/blockchain/verify/${sampleHash}`).expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.record.exists).toBe(false);
      expect(res.body.data.record.documentHash).toBe(sampleHash);
    });

    it("should handle blockchain query errors gracefully", async () => {
      jest.spyOn(BlockchainService, "verifyDocumentOnChain").mockRejectedValueOnce(
        new Error("RPC timeout")
      );

      const res = await request(app).get("/api/blockchain/verify/invalid-hash");
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/blockchain/tx/:txHash", () => {
    it("should return transaction receipt details", async () => {
      const mockTxHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

      jest.spyOn(BlockchainService, "getTransactionReceipt").mockResolvedValueOnce({
        transactionHash: mockTxHash,
        blockNumber: 42,
        status: "SUCCESS",
        confirmations: 1,
      });

      const res = await request(app).get(`/api/blockchain/tx/${mockTxHash}`).expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.transaction.blockNumber).toBe(42);
      expect(res.body.data.transaction.status).toBe("SUCCESS");
    });

    it("should return 404 if transaction is not found", async () => {
      jest.spyOn(BlockchainService, "getTransactionReceipt").mockRejectedValueOnce({
        statusCode: 404,
        message: "Transaction receipt not found on blockchain.",
      });

      const res = await request(app).get("/api/blockchain/tx/0xnotfound").expect(404);
      expect(res.body.success).toBe(false);
    });
  });
});
