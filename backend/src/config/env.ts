import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./data/connectly.json',
  JWT_SECRET: process.env.JWT_SECRET || 'connectly_super_secure_jwt_access_secret_2026_key_!',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'connectly_super_secure_jwt_refresh_secret_2026_key_!',
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'connectly_cookie_secret_key_2026',
};
