import { db, User } from './db.js';
import { v4 as uuidv4 } from 'uuid';

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    const user = db.users.find(u => u.id === id);
    return user || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    const user = db.users.find(u => u.email.toLowerCase() === normalized);
    return user || null;
  }

  static async findByPhone(phone: string): Promise<User | null> {
    const clean = phone.replace(/\D/g, '');
    const user = db.users.find(u => u.phone.replace(/\D/g, '') === clean);
    return user || null;
  }

  static async findByEmailOrPhone(identifier: string): Promise<User | null> {
    const trimmed = identifier.trim();
    if (trimmed.includes('@')) {
      return this.findByEmail(trimmed);
    }
    // Try phone first, if not found try email
    const byPhone = await this.findByPhone(trimmed);
    if (byPhone) return byPhone;
    return this.findByEmail(trimmed);
  }

  static async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    passwordHash: string;
    dateOfBirth: string;
    gender: 'female' | 'male' | 'custom';
    pronoun?: string;
    customGender?: string;
  }): Promise<User> {
    const now = new Date().toISOString();
    const newUser: User = {
      id: `usr_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      passwordHash: data.passwordHash,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      pronoun: data.pronoun,
      customGender: data.customGender,
      isEmailVerified: true,
      isPhoneVerified: false,
      createdAt: now,
      updatedAt: now,
      lastLogin: null,
    };

    db.users.push(newUser);
    db.save();
    return newUser;
  }

  static async updatePassword(userId: string, newPasswordHash: string): Promise<boolean> {
    const user = db.users.find(u => u.id === userId);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    user.updatedAt = new Date().toISOString();
    db.save();
    return true;
  }

  static async updateLastLogin(userId: string): Promise<void> {
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.lastLogin = new Date().toISOString();
      db.save();
    }
  }

  static sanitize(user: User): Omit<User, 'passwordHash'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
