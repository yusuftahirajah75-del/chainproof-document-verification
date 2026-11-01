import { apiClient } from "./apiClient";

export const documentApi = {
  /**
   * Upload document PDF
   */
  upload: (formData, onUploadProgress) =>
    apiClient.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    }),

  /**
   * Register uploaded document on blockchain
   */
  registerOnBlockchain: (documentId) =>
    apiClient.post(`/documents/${documentId}/register`),

  /**
   * Atomic Upload & Blockchain Registration
   */
  uploadAndRegister: (formData, onUploadProgress) =>
    apiClient.post("/documents/upload-and-register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    }),

  /**
   * List documents with pagination and query filters
   */
  list: (params = {}) => apiClient.get("/documents", { params }),

  /**
   * Get single document details
   */
  getById: (id) => apiClient.get(`/documents/${id}`),
};

