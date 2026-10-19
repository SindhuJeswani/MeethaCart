import express from 'express';
import {
  register,
  verifyOtp,
  login,
  verifyLoginOtp,
  resendOtp,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Registration flow
router.post('/register', authLimiter, register);
router.post('/verify-otp', otpLimiter, verifyOtp);

// Login 2FA flow
router.post('/login', authLimiter, login);
router.post('/verify-login-otp', otpLimiter, verifyLoginOtp);

// OTP Resend
router.post('/resend-otp', otpLimiter, resendOtp);

// Password recovery
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', otpLimiter, resetPassword);

export default router;
