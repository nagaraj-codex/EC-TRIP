import { db, PasswordReset } from './db.js';
import { v4 as uuidv4 } from 'uuid';
import { hashToken } from '../utils/security.js';

export class PasswordResetModel {
  static async create(userId: string, token: string): Promise<PasswordReset> {
    const tokenHash = hashToken(token);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 mins

    // Invalidate existing unused tokens for this user
    for (const pr of db.passwordResets.filter(p => p.userId === userId && !p.used)) {
      pr.used = true;
    }

    const newRecord: PasswordReset = {
      id: `pr_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
      userId,
      tokenHash,
      expiresAt,
      used: false,
      createdAt: now.toISOString(),
    };

    db.passwordResets.push(newRecord);
    db.save();
    return newRecord;
  }

  static async findValidToken(token: string): Promise<PasswordReset | null> {
    const tokenHash = hashToken(token);
    const now = new Date().toISOString();
    const record = db.passwordResets.find(
      p => p.tokenHash === tokenHash && !p.used && p.expiresAt > now
    );
    return record || null;
  }

  static async markUsed(id: string): Promise<void> {
    const record = db.passwordResets.find(p => p.id === id);
    if (record) {
      record.used = true;
      db.save();
    }
  }
}
