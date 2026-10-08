import { db, SessionRecord } from './db.js';
import { v4 as uuidv4 } from 'uuid';

export class SessionModel {
  static async create(userId: string, token: string, ipAddress: string, userAgent: string): Promise<SessionRecord> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const record: SessionRecord = {
      id: `sess_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
      userId,
      token,
      ipAddress: ipAddress || '127.0.0.1',
      userAgent: userAgent || 'Unknown Browser',
      createdAt: now.toISOString(),
      expiresAt,
    };

    db.sessions.push(record);
    db.save();
    return record;
  }

  static async findByToken(token: string): Promise<SessionRecord | null> {
    const now = new Date().toISOString();
    const record = db.sessions.find(s => s.token === token && s.expiresAt > now);
    return record || null;
  }

  static async deleteByToken(token: string): Promise<void> {
    const index = db.sessions.findIndex(s => s.token === token);
    if (index !== -1) {
      db.sessions.splice(index, 1);
      db.save();
    }
  }

  static async findActiveByUserId(userId: string): Promise<SessionRecord[]> {
    const now = new Date().toISOString();
    return db.sessions.filter(s => s.userId === userId && s.expiresAt > now);
  }
}
