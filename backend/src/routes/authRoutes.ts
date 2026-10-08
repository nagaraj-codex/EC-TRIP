import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  loginRateLimiter,
  otpSendRateLimiter,
  otpVerifyRateLimiter,
} from '../middleware/rateLimiter.js';
import {
  loginSchema,
  registerSchema,
  findAccountSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from '../schemas/authValidation.js';

const router = Router();

// Registration
router.post(
  '/register',
  validateRequest(registerSchema),
  AuthController.register
);

// Login
router.post(
  '/login',
  loginRateLimiter,
  validateRequest(loginSchema),
  AuthController.login
);

// Session details (Protected)
router.get(
  '/me',
  requireAuth,
  AuthController.me
);

// Logout
router.post(
  '/logout',
  AuthController.logout
);

// Account Recovery - Step 1: Find Account
router.post(
  '/find-account',
  validateRequest(findAccountSchema),
  AuthController.findAccount
);

// Account Recovery - Step 2: Send OTP
router.post(
  '/send-otp',
  otpSendRateLimiter,
  validateRequest(sendOtpSchema),
  AuthController.sendOtp
);

// Account Recovery - Step 3: Verify OTP
router.post(
  '/verify-otp',
  otpVerifyRateLimiter,
  validateRequest(verifyOtpSchema),
  AuthController.verifyOtp
);

// Account Recovery - Step 4: Reset Password
router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  AuthController.resetPassword
);

// Refresh Token
router.post(
  '/refresh-token',
  AuthController.refreshToken
);

export default router;
