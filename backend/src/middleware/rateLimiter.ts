import { Request, Response, NextFunction } from 'express';

interface RateRecord {
  count: number;
  resetTime: number;
}

const rateStore = new Map<string, RateRecord>();

// Clean up stale rate records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateStore.entries()) {
    if (record.resetTime < now) {
      rateStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
  keyGenerator?: (req: Request) => string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const customKey = options.keyGenerator ? options.keyGenerator(req) : '';
    const key = `${req.baseUrl}${req.path}_${customKey || ip}`;

    const now = Date.now();
    const record = rateStore.get(key);

    if (!record || record.resetTime < now) {
      rateStore.set(key, { count: 1, resetTime: now + options.windowMs });
      return next();
    }

    if (record.count >= options.max) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        success: false,
        error: options.message,
        retryAfter: retryAfterSec,
      });
    }

    record.count += 1;
    next();
  };
}

// 5 attempts per 15 minutes for login
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10, // Generous for local development testing, strict in production
  message: 'Too many login attempts. Please try again in a few minutes.',
  keyGenerator: req => req.body?.identifier || req.ip || 'global',
});

// 1 OTP send per 45 seconds cooldown
export const otpSendRateLimiter = createRateLimiter({
  windowMs: 45 * 1000,
  max: 2, // 1 per 45s (allow 2 for brief grace)
  message: 'Please wait 45 seconds before requesting another confirmation code.',
  keyGenerator: req => req.body?.userId || req.ip || 'global',
});

// 5 OTP verify attempts per 5 minutes
export const otpVerifyRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: 'Too many invalid attempts. Your code has expired. Please request a new one.',
  keyGenerator: req => req.body?.userId || req.ip || 'global',
});
