import { apiClient } from "./apiClient";

export const authApi = {
  /**
   * User Registration
   */
  register: (payload) => apiClient.post("/auth/register", payload),

  /**
   * User Login
   */
  login: (payload) => apiClient.post("/auth/login", payload),

  /**
   * User Logout
   */
  logout: () => apiClient.post("/auth/logout"),

  /**
   * Get Current Session Profile
   */
  getMe: () => apiClient.get("/auth/me"),
};

