import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    otpHash: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      enum: ['signup_verification', 'login_2fa', 'password_reset'],
      required: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // Automatic TTL cleanup after expiration
    },
    resendAvailableAt: {
      type: Date,
      required: true
    },
    resendCountLastHour: {
      type: Number,
      default: 1
    },
    consumed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const Otp = mongoose.model('Otp', otpSchema);
