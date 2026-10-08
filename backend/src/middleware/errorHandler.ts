import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error(`Unhandled error at ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  const status = (err as { status?: number }).status || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: message,
  });
}
