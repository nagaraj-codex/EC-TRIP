import { db, OTPRecord } from './db.js';
import { v4 as uuidv4 } from 'uuid';
import { hashToken } from '../utils/security.js';

export class OTPModel {
  static async create(userId: string, code: string, purpose: OTPRecord['purpose']): Promise<OTPRecord> {
    // Invalidate existing active OTPs for this user & purpose
    const existing = db.otps.filter(o => o.userId === userId && o.purpose === purpose && !o.verified);
    for (const otp of existing) {
      otp.verified = true; // Mark as invalidated
    }

    const codeHash = hashToken(code);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString(); // 5 minutes

    const newRecord: OTPRecord = {
      id: `otp_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
      userId,
      codeHash,
      plainCodeForDev: process.env.NODE_ENV !== 'production' ? code : undefined,
      purpose,
      expiresAt,
      attemptCount: 0,
      verified: false,
      createdAt: now.toISOString(),
    };

    db.otps.push(newRecord);
    db.save();
    return newRecord;
  }

  static async findActiveByUserId(userId: string, purpose: OTPRecord['purpose']): Promise<OTPRecord | null> {
    const now = new Date().toISOString();
    const record = db.otps
      .filter(o => o.userId === userId && o.purpose === purpose && !o.verified && o.expiresAt > now)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    return record || null;
  }

  static async incrementAttempts(otpId: string): Promise<number> {
    const record = db.otps.find(o => o.id === otpId);
    if (!record) return 0;
    record.attemptCount += 1;
    db.save();
    return record.attemptCount;
  }

  static async markVerified(otpId: string): Promise<void> {
    const record = db.otps.find(o => o.id === otpId);
    if (record) {
      record.verified = true;
      db.save();
    }
  }

  static async getLastCreatedTime(userId: string, purpose: OTPRecord['purpose']): Promise<Date | null> {
    const records = db.otps.filter(o => o.userId === userId && o.purpose === purpose);
    if (records.length === 0) return null;
    records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return new Date(records[0].createdAt);
  }
}
