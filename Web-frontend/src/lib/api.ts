import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, AuthResponse } from '@/types';
import { storage } from './storage';

const apiBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseURL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = storage.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let queuedRequests: Array<(token: string | null) => void> = [];

const flushQueue = (token: string | null) => {
  queuedRequests.forEach((cb) => cb(token));
  queuedRequests = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/logout');
    if (isAuthRoute) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queuedRequests.push((token) => {
          if (!token || !originalRequest.headers) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Send refresh token in body as fallback for cross-port cookie issues
      const storedRefreshToken = storage.getRefreshToken();

      const response = await axios.post<ApiResponse<AuthResponse>>(
        `${apiBaseURL}/auth/refresh`,
        storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
        { withCredentials: true }
      );

      const newToken = response.data.data.accessToken;
      const user = response.data.data.user;
      const newRefreshToken = response.data.data.refreshToken;

      storage.setAccessToken(newToken);
      storage.setUser(user);
      if (newRefreshToken) {
        storage.setRefreshToken(newRefreshToken);
      }

      flushQueue(newToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }

      return api(originalRequest);
    } catch (refreshError) {
      storage.clearAll();
      flushQueue(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;