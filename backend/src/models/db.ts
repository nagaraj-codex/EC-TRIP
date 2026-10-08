import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from '../utils/security.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'connectly.json');

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
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

export interface PasswordReset {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface OTPRecord {
  id: string;
  userId: string;
  codeHash: string;
  plainCodeForDev?: string;
  purpose: 'password_reset' | 'account_recovery' | 'email_verify' | 'phone_verify';
  expiresAt: string;
  attemptCount: number;
  verified: boolean;
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
}

export interface DatabaseSchema {
  users: User[];
  passwordResets: PasswordReset[];
  otps: OTPRecord[];
  sessions: SessionRecord[];
}

class Database {
  private data: DatabaseSchema = {
    users: [],
    passwordResets: [],
    otps: [],
    sessions: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        logger.info(`Loaded existing database from ${DB_FILE}`);
      } else {
        logger.info(`Initializing new database at ${DB_FILE}`);
        this.seedDemoUser();
        this.save();
      }
    } catch (err) {
      logger.error('Failed to initialize database, creating fresh structure', err);
      this.seedDemoUser();
      this.save();
    }
  }

  private async seedDemoUser() {
    const existing = this.data.users.find(u => u.email === 'alex.morgan@example.com');
    if (!existing) {
      const passwordHash = await hashPassword('Password123!');
      const demoUser: User = {
        id: 'usr_demo_connectly_01',
        firstName: 'Alex',
        lastName: 'Morgan',
        email: 'alex.morgan@example.com',
        phone: '+1 555-0199',
        passwordHash,
        dateOfBirth: '1995-06-15',
        gender: 'female',
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null,
      };
      this.data.users.push(demoUser);
      this.save();
      logger.info('Demo user seeded: alex.morgan@example.com / Password123!');
    }
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      logger.error('Failed to save database to disk', err);
    }
  }

  get users(): User[] {
    return this.data.users;
  }

  get passwordResets(): PasswordReset[] {
    return this.data.passwordResets;
  }

  get otps(): OTPRecord[] {
    return this.data.otps;
  }

  get sessions(): SessionRecord[] {
    return this.data.sessions;
  }
}

export const db = new Database();
