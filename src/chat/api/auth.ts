import { api } from './client';
import type { ApiResponse, AuthResponse } from '../types';

export const authApi = {
  register: async (payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return res.data.data!;
  },

  login: async (payload: {
    identifier: string;
    password: string;
  }): Promise<AuthResponse> => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return res.data.data!;
  },

  logout: async (refreshToken?: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },

  forgotPassword: async (email: string): Promise<string> => {
    const res = await api.post<ApiResponse>('/auth/forgot-password', { email });
    return res.data.message || 'OTP sent';
  },

  verifyOtp: async (email: string, otp: string): Promise<boolean> => {
    const res = await api.post<ApiResponse>('/auth/verify-otp', { email, otp });
    return res.data.success;
  },

  resetPassword: async (payload: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<void> => {
    await api.post('/auth/reset-password', payload);
  },
};
