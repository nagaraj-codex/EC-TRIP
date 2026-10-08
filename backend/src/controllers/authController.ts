import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { TokenService } from '../services/tokenService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { SessionModel } from '../models/sessionModel.js';
import { UserModel } from '../models/userModel.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown Browser';

      const { user, accessToken, refreshToken } = await AuthService.register({
        ...req.body,
        ipAddress,
        userAgent,
      });

      TokenService.setAuthCookies(res, accessToken, refreshToken);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        user,
        accessToken,
      });
    } catch (err: unknown) {
      return res.status(400).json({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create account.',
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown Browser';

      const { user, accessToken, refreshToken } = await AuthService.login({
        identifier: req.body.identifier,
        password: req.body.password,
        ipAddress,
        userAgent,
      });

      TokenService.setAuthCookies(res, accessToken, refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        user,
        accessToken,
      });
    } catch (err: unknown) {
      return res.status(401).json({
        success: false,
        error: err instanceof Error ? err.message : 'Invalid credentials.',
      });
    }
  }

  static async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated.' });
      }

      // Fetch user's active sessions for security dashboard overview
      const activeSessions = await SessionModel.findActiveByUserId(req.user.id);

      return res.status(200).json({
        success: true,
        user: req.user,
        sessionInfo: {
          currentIp: req.ip || '127.0.0.1',
          currentUserAgent: req.headers['user-agent'] || 'Unknown Browser',
          totalActiveSessions: activeSessions.length,
          activeSessions: activeSessions.map(s => ({
            id: s.id,
            ipAddress: s.ipAddress,
            userAgent: s.userAgent,
            createdAt: s.createdAt,
            isCurrent: s.token === req.token,
          })),
        },
      });
    } catch (err: unknown) {
      return res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to retrieve user profile.',
      });
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response) {
    try {
      const token = req.cookies?.connectly_access_token || req.headers.authorization?.replace('Bearer ', '');
      await AuthService.logout(token);
      TokenService.clearAuthCookies(res);

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (err: unknown) {
      TokenService.clearAuthCookies(res);
      return res.status(200).json({
        success: true,
        message: 'Logged out.',
      });
    }
  }

  static async findAccount(req: Request, res: Response) {
    try {
      const result = await AuthService.findAccount(req.body.identifier);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: unknown) {
      return res.status(404).json({
        success: false,
        error: err instanceof Error ? err.message : 'Account not found.',
      });
    }
  }

  static async sendOtp(req: Request, res: Response) {
    try {
      const { userId, method } = req.body;
      const result = await AuthService.sendRecoveryOtp(userId, method || 'email');

      return res.status(200).json({
        success: true,
        message: 'Confirmation code sent successfully.',
        data: result,
      });
    } catch (err: unknown) {
      return res.status(400).json({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to send confirmation code.',
      });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { userId, code } = req.body;
      const { resetToken } = await AuthService.verifyRecoveryOtp(userId, code);

      return res.status(200).json({
        success: true,
        message: 'Code verified successfully.',
        resetToken,
      });
    } catch (err: unknown) {
      return res.status(400).json({
        success: false,
        error: err instanceof Error ? err.message : 'Invalid code.',
      });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { resetToken, newPassword } = req.body;
      await AuthService.resetPassword(resetToken, newPassword);

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully.',
      });
    } catch (err: unknown) {
      return res.status(400).json({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to reset password.',
      });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const token = req.cookies?.connectly_refresh_token || req.body.refreshToken;
      if (!token) {
        return res.status(401).json({ success: false, error: 'No refresh token provided.' });
      }

      const payload = TokenService.verifyRefreshToken(token);
      const user = await UserModel.findById(payload.userId);
      if (!user) {
        return res.status(401).json({ success: false, error: 'User no longer exists.' });
      }

      const newAccessToken = TokenService.generateAccessToken({ userId: user.id, email: user.email });
      TokenService.setAuthCookies(res, newAccessToken, token);

      return res.status(200).json({
        success: true,
        accessToken: newAccessToken,
      });
    } catch (err: unknown) {
      TokenService.clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token. Please log in again.',
      });
    }
  }
}
