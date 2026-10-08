import { UserModel } from '../models/userModel.js';
import { SessionModel } from '../models/sessionModel.js';
import { PasswordResetModel } from '../models/passwordResetModel.js';
import { OTPService } from './otpService.js';
import { TokenService } from './tokenService.js';
import { hashPassword, comparePassword, maskEmail, maskPhone } from '../utils/security.js';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/db.js';

export class AuthService {
  static async register(data: {
    firstName: string;
    lastName: string;
    emailOrPhone: string;
    password: string;
    dateOfBirth: string;
    gender: 'female' | 'male' | 'custom';
    pronoun?: string;
    customGender?: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<{ user: Omit<User, 'passwordHash'>; accessToken: string; refreshToken: string }> {
    const isEmail = data.emailOrPhone.includes('@');
    const email = isEmail ? data.emailOrPhone.toLowerCase().trim() : '';
    const phone = !isEmail ? data.emailOrPhone.trim() : '';

    // Check if account exists
    if (email) {
      const existing = await UserModel.findByEmail(email);
      if (existing) {
        throw new Error('An account with this email address already exists.');
      }
    }
    if (phone) {
      const existing = await UserModel.findByPhone(phone);
      if (existing) {
        throw new Error('An account with this phone number already exists.');
      }
    }

    const passwordHash = await hashPassword(data.password);
    const user = await UserModel.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: email || `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@connectly.local`,
      phone: phone || '+1 555-0100',
      passwordHash,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      pronoun: data.pronoun,
      customGender: data.customGender,
    });

    const accessToken = TokenService.generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = TokenService.generateRefreshToken({ userId: user.id, email: user.email });

    await SessionModel.create(user.id, accessToken, data.ipAddress, data.userAgent);
    await UserModel.updateLastLogin(user.id);

    return {
      user: UserModel.sanitize(user),
      accessToken,
      refreshToken,
    };
  }

  static async login(data: {
    identifier: string;
    password: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<{ user: Omit<User, 'passwordHash'>; accessToken: string; refreshToken: string }> {
    const user = await UserModel.findByEmailOrPhone(data.identifier);

    // Timing-attack safe generic rejection
    if (!user) {
      throw new Error('Incorrect email, phone number or password.');
    }

    const isMatch = await comparePassword(data.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Incorrect email, phone number or password.');
    }

    const accessToken = TokenService.generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = TokenService.generateRefreshToken({ userId: user.id, email: user.email });

    await SessionModel.create(user.id, accessToken, data.ipAddress, data.userAgent);
    await UserModel.updateLastLogin(user.id);

    return {
      user: UserModel.sanitize(user),
      accessToken,
      refreshToken,
    };
  }

  static async findAccount(identifier: string): Promise<{
    userId: string;
    name: string;
    maskedEmail: string;
    maskedPhone: string;
  }> {
    const user = await UserModel.findByEmailOrPhone(identifier);
    if (!user) {
      throw new Error("We couldn't find an account matching that email or mobile number.");
    }

    return {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      maskedEmail: maskEmail(user.email),
      maskedPhone: maskPhone(user.phone),
    };
  }

  static async sendRecoveryOtp(userId: string, method: 'email' | 'phone'): Promise<{
    expiresAt: string;
    previewCode?: string;
  }> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('Account not found.');
    }

    const destination = method === 'email' ? user.email : user.phone;
    const { code, expiresAt } = await OTPService.generateAndSend(userId, 'account_recovery', destination);

    return {
      expiresAt,
      previewCode: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  }

  static async verifyRecoveryOtp(userId: string, code: string): Promise<{ resetToken: string }> {
    const result = await OTPService.verifyCode(userId, code, 'account_recovery');
    if (!result.success) {
      throw new Error(result.error || 'Invalid confirmation code.');
    }

    // Create password reset token
    const rawResetToken = uuidv4() + '-' + uuidv4();
    await PasswordResetModel.create(userId, rawResetToken);

    return { resetToken: rawResetToken };
  }

  static async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    const record = await PasswordResetModel.findValidToken(resetToken);
    if (!record) {
      throw new Error('Password reset link has expired or is invalid. Please request a new one.');
    }

    const passwordHash = await hashPassword(newPassword);
    await UserModel.updatePassword(record.userId, passwordHash);
    await PasswordResetModel.markUsed(record.id);
  }

  static async logout(token?: string): Promise<void> {
    if (token) {
      await SessionModel.deleteByToken(token);
    }
  }
}
