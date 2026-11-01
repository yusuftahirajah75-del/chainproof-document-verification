import axios from "axios";

/**
 * Normalizes backend API base URL for production Render deployment and local dev
 */
function resolveApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.trim() === "") {
    return "/api";
  }

  let formatted = envUrl.trim();
  if (
    !formatted.startsWith("http://") &&
    !formatted.startsWith("https://") &&
    !formatted.startsWith("/")
  ) {
    formatted = `https://${formatted}`;
  }

  // Ensure it points to /api endpoint root if full host given
  if (
    formatted.startsWith("http") &&
    !formatted.endsWith("/api") &&
    !formatted.includes("/api/")
  ) {
    formatted = `${formatted.replace(/\/+$/, "")}/api`;
  }

  return formatted;
}

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true, // Crucial for HTTP-only cookie authentication
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Request interceptor to attach bearer token fallback when available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("chainproof_token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to unwrap data and normalize backend errors
apiClient.interceptors.response.use(
  (response) => {
    // Backend standard structure: { success: true, message: "...", data: ... }
    return response.data;
  },
  (error) => {
    const errorResponse = {
      success: false,
      message: "An unexpected network or server error occurred.",
      status: error.response?.status || 500,
      details: null,
    };

    if (error.response?.data) {
      errorResponse.message =
        error.response.data.message || errorResponse.message;
      errorResponse.details = error.response.data.details || null;
    } else if (error.message) {
      errorResponse.message = error.message;
    }

    return Promise.reject(errorResponse);
  }
);

