import api from './api';
import type { ApiResponse, AuthResponse } from '@/types';

export const authApi = {
  register: (payload: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', payload),

  login: (payload: { email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', payload),

  // Send refreshToken in body as fallback — cookie not reliably sent cross-port on localhost
  refresh: (refreshToken?: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/refresh', refreshToken ? { refreshToken } : {}),

  logout: (refreshToken?: string) =>
    api.post<ApiResponse<null>>('/auth/logout', refreshToken ? { refreshToken } : {})
};