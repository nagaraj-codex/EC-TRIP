import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { ENV } from '../config/env.js';

export interface TokenPayload {
  userId: string;
  email: string;
}

export class TokenService {
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(
      { ...payload, type: 'access' },
      ENV.JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(
      { ...payload, type: 'refresh' },
      ENV.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }

  static verifyAccessToken(token: string): TokenPayload & { type: string } {
    return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload & { type: string };
  }

  static verifyRefreshToken(token: string): TokenPayload & { type: string } {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as TokenPayload & { type: string };
  }

  static setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProd = ENV.NODE_ENV === 'production';

    res.cookie('connectly_access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    res.cookie('connectly_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }

  static clearAuthCookies(res: Response): void {
    const isProd = ENV.NODE_ENV === 'production';
    res.clearCookie('connectly_access_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie('connectly_refresh_token', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    });
  }
}
