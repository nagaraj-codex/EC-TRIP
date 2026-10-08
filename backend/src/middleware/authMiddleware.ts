import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { UserModel } from '../models/userModel.js';
import { User } from '../models/db.js';

export interface AuthenticatedRequest extends Request {
  user?: Omit<User, 'passwordHash'>;
  token?: string;
}

interface JwtPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    let token = req.cookies?.connectly_access_token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Please log in to continue.',
      });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;

    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token type.',
      });
    }

    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found or session invalid.',
      });
    }

    req.user = UserModel.sanitize(user);
    req.token = token;
    next();
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Session expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid or malformed authentication token.',
    });
  }
}
