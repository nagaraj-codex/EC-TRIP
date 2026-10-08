import { apiRequest, ApiResponse } from './api.js';
import { User, SessionInfo } from '../types/auth.types.js';

export const authService = {
  async login(identifier: string, password: string): Promise<ApiResponse<{ user: User; accessToken: string }>> {
    return apiRequest<{ user: User; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  },

  async register(data: {
    firstName: string;
    lastName: string;
    emailOrPhone: string;
    password: string;
    dateOfBirth: string;
    gender: 'female' | 'male' | 'custom';
    pronoun?: string;
    customGender?: string;
  }): Promise<ApiResponse<{ user: User; accessToken: string }>> {
    return apiRequest<{ user: User; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<ApiResponse> {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  async getMe(): Promise<ApiResponse<{ user: User; sessionInfo: SessionInfo }>> {
    return apiRequest<{ user: User; sessionInfo: SessionInfo }>('/auth/me', {
      method: 'GET',
    });
  },

  async findAccount(identifier: string): Promise<ApiResponse<{
    userId: string;
    name: string;
    maskedEmail: string;
    maskedPhone: string;
  }>> {
    return apiRequest('/auth/find-account', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  },

  async sendOtp(userId: string, method: 'email' | 'phone'): Promise<ApiResponse<{
    expiresAt: string;
    previewCode?: string;
  }>> {
    return apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ userId, method }),
    });
  },

  async verifyOtp(userId: string, code: string): Promise<ApiResponse<{ resetToken: string }>> {
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ userId, code }),
    });
  },

  async resetPassword(resetToken: string, newPassword: string, confirmPassword: string): Promise<ApiResponse> {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword, confirmPassword }),
    });
  },

  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    return apiRequest('/auth/refresh-token', {
      method: 'POST',
    });
  },
};
