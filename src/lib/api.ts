import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const AUTH_TOKEN_KEY = "lextracker_access_token";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});

// --- REQUEST INTERCEPTOR: Clean Token Only ---
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(AUTH_TOKEN_KEY)
        : null;

    if (token && config.headers) {
      const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }

    // CRITICAL: NEVER set Content-Type for FormData requests
    // Axios + browser will automatically set the correct multipart/form-data with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// --- RESPONSE INTERCEPTOR: Terminal Messenger ---
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const responseData = error.response?.data as any;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();

    if (
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined"
    ) {
      const errorPayload = {
        status,
        url: `${method} ${url}`,
        message:
          responseData?.message ||
          responseData?.error ||
          "Full Auth Required / Backend Reject",
        tokenPresent: !!(typeof window !== "undefined"
          ? localStorage.getItem(AUTH_TOKEN_KEY)
          : null),
        sentHeader:
          String(error.config?.headers?.Authorization || "").substring(0, 30) +
          "...",
        timestamp: new Date().toLocaleTimeString(),
      };

      try {
        await fetch("/api/debug-logger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(errorPayload),
        });
      } catch (e) {
        console.error("Debug logger failed:", e);
      }
    }

    const cleanError = {
      status,
      message: responseData?.error || responseData?.message || "Protocol Error",
      originalError: error,
    };

    return Promise.reject(cleanError);
  },
);

export default api;
