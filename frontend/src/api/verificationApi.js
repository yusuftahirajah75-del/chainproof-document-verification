import { apiClient } from "./apiClient";

export const verificationApi = {
  /**
   * Verify by uploading PDF
   */
  verifyFile: (formData) =>
    apiClient.post("/verification/verify-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /**
   * Verify by SHA-256 hash string directly
   */
  verifyHash: (payload) =>
    apiClient.post("/verification/verify-hash", payload),

  /**
   * Get verification history (authenticated)
   */
  getHistory: (params = {}) =>
    apiClient.get("/verification/history", { params }),
};

