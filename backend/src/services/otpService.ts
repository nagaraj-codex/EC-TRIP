import { OTPModel } from '../models/otpModel.js';
import { generateOTP, hashToken } from '../utils/security.js';
import { logger } from '../utils/logger.js';
import { OTPRecord } from '../models/db.js';

export class OTPService {
  static async generateAndSend(
    userId: string,
    purpose: OTPRecord['purpose'],
    destination: string
  ): Promise<{ code: string; expiresAt: string }> {
    const code = generateOTP(6);
    const record = await OTPModel.create(userId, code, purpose);

    // In a real production deployment, this calls Twilio/SendGrid.
    // For development and local review, we log it with maximum clarity!
    logger.info(`====================================================`);
    logger.info(`🔐 CONNECTLY OTP GENERATED for User [${userId}]`);
    logger.info(`   Destination: ${destination}`);
    logger.info(`   6-Digit Code: >>> ${code} <<<`);
    logger.info(`   Valid for 5 minutes (Expires: ${record.expiresAt})`);
    logger.info(`====================================================`);

    return { code, expiresAt: record.expiresAt };
  }

  static async verifyCode(
    userId: string,
    code: string,
    purpose: OTPRecord['purpose']
  ): Promise<{ success: boolean; error?: string }> {
    const activeOtp = await OTPModel.findActiveByUserId(userId, purpose);

    if (!activeOtp) {
      return {
        success: false,
        error: 'Confirmation code expired or not found. Please request a new one.',
      };
    }

    if (activeOtp.attemptCount >= 5) {
      await OTPModel.markVerified(activeOtp.id); // Invalidate due to abuse
      return {
        success: false,
        error: 'Too many incorrect attempts. For security, please request a new code.',
      };
    }

    const inputHash = hashToken(code.trim());
    if (inputHash !== activeOtp.codeHash) {
      const attempts = await OTPModel.incrementAttempts(activeOtp.id);
      const remaining = 5 - attempts;
      return {
        success: false,
        error: `Incorrect code. You have ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining.`,
      };
    }

    // Correct code
    await OTPModel.markVerified(activeOtp.id);
    return { success: true };
  }
}
