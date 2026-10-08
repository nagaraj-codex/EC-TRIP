export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'female' | 'male' | 'custom';
  pronoun?: string;
  customGender?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

export interface SessionInfo {
  currentIp: string;
  currentUserAgent: string;
  totalActiveSessions: number;
  activeSessions: Array<{
    id: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    isCurrent: boolean;
  }>;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  accessToken?: string;
  error?: string;
  errors?: Record<string, string>;
}

export interface FindAccountResponse {
  success: boolean;
  data?: {
    userId: string;
    name: string;
    maskedEmail: string;
    maskedPhone: string;
  };
  error?: string;
}

export interface SendOtpResponse {
  success: boolean;
  message?: string;
  data?: {
    expiresAt: string;
    previewCode?: string;
  };
  error?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  resetToken?: string;
  error?: string;
}
