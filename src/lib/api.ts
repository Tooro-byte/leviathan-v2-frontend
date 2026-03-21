import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

/**
 * LexTracker Production Constants
 * Using a specific key prevents "Token Pollution" from other localhost apps.
 */
const AUTH_TOKEN_KEY = "lextracker_access_token";

const api = axios.create({
  // Fallback to localhost, but prioritize environment variables for deployment
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  timeout: 15000, // Increased to 15s for stability on mobile networks
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

/**
 * Logic: Get token safely without breaking Server-Side Rendering (SSR).
 */
const getSafeToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
};

// --- REQUEST INTERCEPTOR: The Digital Handshake ---
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getSafeToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Audit Log for Development Tracking
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🛡️ [API REQUEST] ${config.method?.toUpperCase()} -> ${config.url}`,
      );
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// --- RESPONSE INTERCEPTOR: The Integrity Check ---
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    // 401: Unauthorized - The session has expired or the vault key is invalid
    if (status === 401) {
      console.error("🔒 Session Expired. Purging local credentials...");
      if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem("userName");
        localStorage.removeItem("roles");

        // Only redirect if we aren't already on the login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login?error=session_expired";
        }
      }
    }

    // 403: Forbidden - Persona lacks permissions
    if (status === 403) {
      console.error("🚫 Access Denied: Insufficient Clearance.");
    }

    // Standardize the error object so the UI (LoginPage) can display clean messages
    const cleanError = {
      status,
      message:
        (error.response?.data as any)?.message ||
        "A network error occurred. Please check your connection.",
      originalError: error,
    };

    return Promise.reject(cleanError);
  },
);

export default api;
