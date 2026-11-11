import rateLimit from 'express-rate-limit';

/**
 * General authentication rate limiter
 * Prevents automated brute-force attacks against login/signup endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' ? 500 : 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

/**
 * Strict OTP request & verification limiter
 * Prevents rapid-fire OTP spamming and brute-force guessing
 */
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' ? 200 : 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP attempts from this IP. Please wait 10 minutes before trying again.'
  }
});
