import axios from "axios";
import { handleSeminarFallbackRequest } from "./seminarFallbackEngine";

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

// Track when remote backend is unreachable so subsequent requests resolve instantaneously
let backendOfflineUntil = 0;

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 2800,
  withCredentials: true, // Crucial for HTTP-only cookie authentication
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Request interceptor to attach bearer token and short-circuit when in offline seminar mode
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("chainproof_token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If remote backend was recently detected offline or using a seminar session token, resolve immediately
  if (
    Date.now() < backendOfflineUntil ||
    (token && token.startsWith("seminar_jwt_"))
  ) {
    config.adapter = async (reqConfig) => {
      const data = await handleSeminarFallbackRequest(reqConfig);
      return {
        data,
        status: 200,
        statusText: "OK",
        headers: {},
        config: reqConfig,
      };
    };
  }

  return config;
});

// Response interceptor to unwrap data, or seamlessly fall back on Network / Gateway Error
apiClient.interceptors.response.use(
  (response) => {
    // Backend standard structure: { success: true, message: "...", data: ... }
    return response.data;
  },
  async (error) => {
    // If error already came from our fallback engine (e.g., 401 wrong password, 409 duplicate), reject cleanly
    if (error && error.success === false && error.status && !error.config) {
      return Promise.reject(error);
    }

    const isNetworkOrGatewayError =
      !error.response ||
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNABORTED" ||
      error.message === "Network Error" ||
      (error.response && error.response.status >= 502);

    if (isNetworkOrGatewayError && error.config) {
      // Mark backend unreachable for 5 minutes so all subsequent UI actions are instant
      backendOfflineUntil = Date.now() + 5 * 60 * 1000;
      try {
        return await handleSeminarFallbackRequest(error.config);
      } catch (fallbackErr) {
        return Promise.reject(fallbackErr);
      }
    }

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
