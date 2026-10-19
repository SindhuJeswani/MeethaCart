import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { otpService } from '../services/otpService.js';

// Helper to sign JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'meethacart_jwt_secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Format user payload for client
const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  sellerStatus: user.sellerStatus,
  preferredLanguage: user.preferredLanguage,
  phone: user.phone || '',
  bakeryName: user.bakeryName || '',
  bio: user.bio || '',
  address: user.address || '',
  avatar: user.avatar || ''
});

/**
 * @desc    Register a new Buyer or Seller
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, preferredLanguage, bakeryName, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const assignedRole = role === 'seller' ? 'seller' : 'buyer';

    if (assignedRole === 'seller' && (!bakeryName || !bakeryName.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Bakery name is required for sellers.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.'
        });
      }

      // If user exists but is not verified, update unverified record
      existingUser.name = name.trim();
      existingUser.password = password;
      existingUser.role = assignedRole;
      existingUser.preferredLanguage = preferredLanguage === 'ur' ? 'ur' : 'en';
      existingUser.bakeryName = bakeryName ? bakeryName.trim() : '';
      existingUser.phone = phone ? phone.trim() : '';
      await existingUser.save();
    } else {
      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: assignedRole,
        preferredLanguage: preferredLanguage === 'ur' ? 'ur' : 'en',
        bakeryName: bakeryName ? bakeryName.trim() : '',
        phone: phone ? phone.trim() : '',
        isVerified: false,
        sellerStatus: assignedRole === 'seller' ? 'pending' : 'approved'
      });
    }

    // Send 6-digit verification OTP
    const otpResult = await otpService.createAndSendOtp(normalizedEmail, 'signup_verification');

    return res.status(201).json({
      success: true,
      message: 'Registration initiated. A 6-digit verification code has been sent to your email.',
      email: normalizedEmail,
      cooldownSeconds: otpResult.cooldownSeconds
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.'
    });
  }
};

/**
 * @desc    Verify Registration OTP and activate account
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit OTP code are required.'
      });
    }

    const verification = await otpService.verifyOtp(email, otp, 'signup_verification');

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    user.isVerified = true;
    await user.save();

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully! Welcome to MeethaCart.',
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('[VerifyOtp Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error verifying OTP.'
    });
  }
};

/**
 * @desc    Step 1 of Login (Email + Password -> 2FA OTP)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check account verification
    if (!user.isVerified) {
      // Re-send verification OTP
      await otpService.createAndSendOtp(normalizedEmail, 'signup_verification');
      return res.status(403).json({
        success: false,
        needsVerification: true,
        email: normalizedEmail,
        message: 'Your account is not verified yet. A fresh verification OTP has been sent to your email.'
      });
    }

    // Check if seller is blocked
    if (user.role === 'seller' && user.sellerStatus === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your seller account has been suspended by the Admin. Please contact support.'
      });
    }

    // Send 2FA Login OTP
    const otpResult = await otpService.createAndSendOtp(normalizedEmail, 'login_2fa');

    return res.status(200).json({
      success: true,
      message: 'Credentials verified. A 6-digit login code has been sent to your email.',
      email: normalizedEmail,
      role: user.role,
      cooldownSeconds: otpResult.cooldownSeconds
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.'
    });
  }
};

/**
 * @desc    Step 2 of Login (Verify 2FA OTP -> Issue JWT)
 * @route   POST /api/auth/verify-login-otp
 * @access  Public
 */
export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit OTP code are required.'
      });
    }

    const verification = await otpService.verifyOtp(email, otp, 'login_2fa');

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('[VerifyLoginOtp Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error verifying login OTP.'
    });
  }
};

/**
 * @desc    Resend OTP (with 60-second cooldown and hourly limit enforcement)
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Email and purpose are required.'
      });
    }

    const validPurposes = ['signup_verification', 'login_2fa', 'password_reset'];
    if (!validPurposes.includes(purpose)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP purpose.'
      });
    }

    const result = await otpService.createAndSendOtp(email, purpose);

    return res.status(200).json({
      success: true,
      message: 'A fresh OTP code has been sent to your email.',
      cooldownSeconds: result.cooldownSeconds
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Initiate Forgot Password (sends OTP)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // For defense against email enumeration, respond with consistent message even if not found
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset code has been sent.',
        email: normalizedEmail,
        cooldownSeconds: 60
      });
    }

    const result = await otpService.createAndSendOtp(normalizedEmail, 'password_reset');

    return res.status(200).json({
      success: true,
      message: 'A 6-digit password reset code has been sent to your email.',
      email: normalizedEmail,
      cooldownSeconds: result.cooldownSeconds
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Reset Password with verified OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.'
      });
    }

    const verification = await otpService.verifyOtp(email, otp, 'password_reset');

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. You may now log in with your new password.'
    });
  } catch (error) {
    console.error('[ResetPassword Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error resetting password.'
    });
  }
};
