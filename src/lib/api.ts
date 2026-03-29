import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const AUTH_TOKEN_KEY = "lextracker_access_token";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  timeout: 30000, // Increased from 15000 to 30000 (30 seconds)
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(
      `📤 ${config.method?.toUpperCase()} ${config.url}`,
      config.data,
    );

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(AUTH_TOKEN_KEY)
        : null;

    if (token && config.headers) {
      const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async (error: AxiosError) => {
    if (error.code === "ECONNABORTED") {
      console.error("❌ Request timeout - server not responding");
    }

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

      console.error("API Error:", errorPayload);

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
