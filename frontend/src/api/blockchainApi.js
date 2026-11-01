import { apiClient } from "./apiClient";

export const blockchainApi = {
  /**
   * Get blockchain node and smart contract status
   */
  getStatus: () => apiClient.get("/blockchain/status"),

  /**
   * Lookup transaction receipt
   */
  getTransaction: (txHash) => apiClient.get(`/blockchain/tx/${txHash}`),

  /**
   * Direct on-chain hash lookup
   */
  verifyOnChain: (hash) => apiClient.get(`/blockchain/verify/${hash}`),
};

