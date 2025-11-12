import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Use access_token / refresh_token keys in localStorage
// Request interceptor - attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with refresh-token handling
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (err: any) => void;
  config: any;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      if (p.config.headers) {
        p.config.headers.Authorization = `Bearer ${token}`;
      }
      p.resolve(api(p.config));
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const message =
      error.response?.data?.message || error.message || "Erro desconhecido";

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Try to refresh
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
          // No refresh token - force logout
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
          toast.error("Sessão expirada. Faça login novamente.");
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Update storage and defaults
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", newRefreshToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        // Keep zustand auth store in sync if available
        try {
          useAuthStore.getState().setTokens(accessToken, newRefreshToken);
        } catch (e) {
          // ignore if store isn't available for some reason
        }

        processQueue(null, accessToken);

        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        toast.error("Sessão expirada. Faça login novamente.");
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Other errors show toast
    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);
