import { apiClient } from "./apiClient";

export const adminApi = {
  /**
   * System overview metrics
   */
  getStats: () => apiClient.get("/admin/stats"),

  /**
   * List system users with pagination & role filtering
   */
  listUsers: (params = {}) => apiClient.get("/admin/users", { params }),

  /**
   * Update user active state or role
   */
  updateUser: (id, payload) => apiClient.patch(`/admin/users/${id}`, payload),

  /**
   * Get system audit logs
   */
  getAuditLogs: (params = {}) => apiClient.get("/admin/audit-logs", { params }),
};

