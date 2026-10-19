import bcrypt from 'bcryptjs';
import { Otp } from '../models/Otp.js';
import { emailService } from './emailService.js';

const OTP_VALIDITY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;
const MAX_HOURLY_RESENDS = 5;

class OtpService {
  /**
   * Generates a cryptographically strong 6-digit numeric OTP
   */
  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Create, persist hashed OTP and dispatch via email
   * @param {string} email
   * @param {string} purpose - 'signup_verification' | 'login_2fa' | 'password_reset'
   */
  async createAndSendOtp(email, purpose) {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check cooldown and hourly rate limit
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOtpsInHour = await Otp.countDocuments({
      email: normalizedEmail,
      createdAt: { $gte: oneHourAgo }
    });

    if (recentOtpsInHour >= MAX_HOURLY_RESENDS) {
      throw new Error('Hourly OTP request limit reached. Please try again after 1 hour.');
    }

    // Check last active OTP cooldown
    const latestActive = await Otp.findOne({
      email: normalizedEmail,
      purpose,
      consumed: false
    }).sort({ createdAt: -1 });

    if (latestActive && new Date() < latestActive.resendAvailableAt) {
      const waitSeconds = Math.ceil((latestActive.resendAvailableAt.getTime() - Date.now()) / 1000);
      throw new Error(`Please wait ${waitSeconds} seconds before requesting a new OTP.`);
    }

    // Invalidate previous unconsumed OTPs for this purpose
    await Otp.updateMany(
      { email: normalizedEmail, purpose, consumed: false },
      { $set: { consumed: true } }
    );

    // 2. Generate and hash OTP (never stored plain)
    const plainOtp = this.generateOtp();
    const otpHash = await bcrypt.hash(plainOtp, 10);

    const expiresAt = new Date(Date.now() + OTP_VALIDITY_MINUTES * 60 * 1000);
    const resendAvailableAt = new Date(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);

    await Otp.create({
      email: normalizedEmail,
      otpHash,
      purpose,
      expiresAt,
      resendAvailableAt,
      attempts: 0,
      consumed: false
    });

    // 3. Dispatch email
    await emailService.sendOtpEmail(normalizedEmail, plainOtp, purpose);

    return {
      success: true,
      cooldownSeconds: RESEND_COOLDOWN_SECONDS,
      expiresInMinutes: OTP_VALIDITY_MINUTES
    };
  }

  /**
   * Verifies plain OTP against stored hash with attempt locking
   * @param {string} email
   * @param {string} plainOtp
   * @param {string} purpose
   */
  async verifyOtp(email, plainOtp, purpose) {
    const normalizedEmail = email.toLowerCase().trim();

    const otpDoc = await Otp.findOne({
      email: normalizedEmail,
      purpose,
      consumed: false
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return {
        valid: false,
        message: 'No active OTP found. Please request a new code.'
      };
    }

    // Check expiration
    if (new Date() > otpDoc.expiresAt) {
      otpDoc.consumed = true;
      await otpDoc.save();
      return {
        valid: false,
        message: 'This OTP has expired. Please request a new one.'
      };
    }

    // Check maximum attempts lock
    if (otpDoc.attempts >= MAX_ATTEMPTS) {
      otpDoc.consumed = true;
      await otpDoc.save();
      return {
        valid: false,
        message: 'Too many incorrect attempts. This OTP is now locked. Please request a new one.'
      };
    }

    // Verify hash
    const isMatch = await bcrypt.compare(String(plainOtp).trim(), otpDoc.otpHash);

    if (!isMatch) {
      otpDoc.attempts += 1;
      const remaining = MAX_ATTEMPTS - otpDoc.attempts;

      if (remaining <= 0) {
        otpDoc.consumed = true;
      }
      await otpDoc.save();

      return {
        valid: false,
        message: remaining > 0
          ? `Incorrect OTP. ${remaining} attempts remaining.`
          : 'Too many incorrect attempts. This OTP has been invalidated.'
      };
    }

    // Success: mark as consumed (single-use enforcement)
    otpDoc.consumed = true;
    await otpDoc.save();

    return {
      valid: true,
      message: 'OTP verified successfully.'
    };
  }
}

export const otpService = new OtpService();
