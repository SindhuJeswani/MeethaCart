import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { otpService } from '../services/otpService.js';
import {
  isValidEmailFormat,
  checkDomainTypo,
  isDisposableDomain,
  verifyDomainCanReceiveMail
} from '../utils/emailValidator.js';

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
  preferredLanguage: user.preferredLanguage || 'English',
  sellerStatus: user.sellerStatus,
  isBlocked: Boolean(user.isBlocked || user.sellerStatus === 'blocked'),
  blockReason: user.blockReason || null,
  rejectionReason: user.rejectionReason || null,
  approvedAt: user.approvedAt || null,
  phone: user.phone || '',
  bakeryName: user.bakeryName || '',
  bakeryCategories: user.bakeryCategories || [],
  bio: user.bio || '',
  address: user.address || '',
  storeAddress: user.storeAddress || '',
  avatar: user.avatar || ''
});

/**
 * @desc    Register a new Buyer or Seller
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      role,
      bakeryName,
      storeName,
      phone,
      preferredLanguage,
      address,
      deliveryAddress,
      storeAddress,
      bio,
      bakeryCategories,
      avatar,
      termsAgreed
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'The password must be at least 8 characters'
      });
    }

    // Admin-only protection: reject admin registration attempts
    if (role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Registration with admin role is prohibited. Only buyer and seller roles are allowed.'
      });
    }

    if (!role || !['buyer', 'seller'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be explicitly chosen as buyer or seller.'
      });
    }

    const effectiveBakeryName = (bakeryName || storeName || '').trim();
    if (role === 'seller' && !effectiveBakeryName) {
      return res.status(400).json({
        success: false,
        message: 'Store name is required'
      });
    }

    // Step 1: Format & syntax check (trim spaces, lowercase, valid syntax)
    const normalizedEmail = email.toLowerCase().trim();
    if (!isValidEmailFormat(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'This is not a valid email address. Please check it and try again.'
      });
    }

    // Step 2: Common typos of popular domains
    const suggestedEmail = checkDomainTypo(normalizedEmail);
    if (suggestedEmail) {
      return res.status(400).json({
        success: false,
        field: 'email',
        suggestedEmail,
        message: `This email looks wrong. Did you mean ${suggestedEmail}?`
      });
    }

    // Step 3: Already registered check
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'An account with this email already exists. Please sign in.'
      });
    }

    // Step 4: Domain check (DNS MX with fallback to A, ~5s timeout)
    const domain = normalizedEmail.split('@')[1];
    const domainCheck = await verifyDomainCanReceiveMail(domain, 5000);
    if (!domainCheck.valid) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'This email does not exist or cannot receive emails. Please enter a correct email address.'
      });
    }

    // Step 5: Disposable domain check
    if (isDisposableDomain(domain)) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'Temporary email addresses are not allowed. Please use your real email.'
      });
    }

    const assignedRole = role;
    const finalLanguage = preferredLanguage === 'Urdu' ? 'Urdu' : 'English';
    const finalAddress = (deliveryAddress || address || '').trim();
    const finalStoreAddress = (storeAddress || address || '').trim();

    // Step 6: Send OTP FIRST before creating / updating any database record
    let otpResult;
    try {
      otpResult = await otpService.createAndSendOtp(normalizedEmail, 'signup_verification');
    } catch (mailErr) {
      console.error('[Register Mail Error]:', mailErr.message);
      const isOutage = mailErr.message?.includes('temporarily unavailable');
      return res.status(400).json({
        success: false,
        field: 'email',
        message: isOutage
          ? 'Email service is temporarily unavailable. Please try again later.'
          : (mailErr.message?.includes('Too many requests')
            ? mailErr.message
            : 'We could not send a code to this email. This email address looks wrong or does not exist.')
      });
    }

    // Step 6: Only persist unverified user AFTER OTP has successfully sent
    if (existingUser) {
      existingUser.name = name.trim();
      existingUser.password = password;
      existingUser.role = assignedRole;
      existingUser.preferredLanguage = finalLanguage;
      existingUser.bakeryName = assignedRole === 'seller' ? effectiveBakeryName : '';
      existingUser.phone = phone ? phone.trim() : '';
      if (finalAddress) existingUser.address = finalAddress;
      if (finalStoreAddress) existingUser.storeAddress = finalStoreAddress;
      if (bio) existingUser.bio = bio.trim();
      if (avatar) existingUser.avatar = avatar;
      if (Array.isArray(bakeryCategories)) existingUser.bakeryCategories = bakeryCategories;
      await existingUser.save();
    } else {
      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: assignedRole,
        preferredLanguage: finalLanguage,
        bakeryName: assignedRole === 'seller' ? effectiveBakeryName : '',
        phone: phone ? phone.trim() : '',
        address: finalAddress,
        storeAddress: finalStoreAddress,
        bio: bio ? bio.trim() : '',
        avatar: avatar || '',
        bakeryCategories: Array.isArray(bakeryCategories) ? bakeryCategories : [],
        isVerified: false,
        sellerStatus: assignedRole === 'seller' ? 'pending' : 'approved'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Registration initiated. A 6-digit verification code has been sent to your email. Please check your Inbox as well as your Spam / Junk folder.',
      email: normalizedEmail,
      cooldownSeconds: otpResult.cooldownSeconds,
      devOtp: otpResult.devOtp
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
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

    // 1. Format check
    if (!isValidEmailFormat(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'This is not a valid email address. Please check it and try again.'
      });
    }

    // 2. Domain typo check
    const typoSuggestion = checkDomainTypo(normalizedEmail);
    if (typoSuggestion) {
      return res.status(400).json({
        success: false,
        field: 'email',
        suggestedEmail: typoSuggestion,
        message: `This email looks wrong. Did you mean ${typoSuggestion}?`
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        field: 'email',
        message: 'This email is not registered. Please check your email or create an account.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is blocked (for both buyers and sellers)
    if (user.isBlocked || user.sellerStatus === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact the admin'
      });
    }

    // Check if seller account status
    if (user.role === 'seller') {
      if (user.sellerStatus === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Your seller account is awaiting admin approval'
        });
      }
      if (user.sellerStatus === 'rejected') {
        return res.status(403).json({
          success: false,
          message: 'Your seller registration was rejected'
        });
      }
    }

    // Check account verification
    if (!user.isVerified) {
      // Re-send verification OTP
      const unverifiedOtp = await otpService.createAndSendOtp(normalizedEmail, 'signup_verification');
      return res.status(403).json({
        success: false,
        needsVerification: true,
        email: normalizedEmail,
        message: 'Your account is not verified yet. A fresh verification OTP has been sent to your email.',
        cooldownSeconds: unverifiedOtp.cooldownSeconds,
        devOtp: unverifiedOtp.devOtp
      });
    }

    // Direct Login without OTP: issue JWT token immediately
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
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
      cooldownSeconds: result.cooldownSeconds,
      devOtp: result.devOtp
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
        field: 'email',
        message: 'Email is required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Format check
    if (!isValidEmailFormat(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'This is not a valid email address. Please check it and try again.'
      });
    }

    // 2. Domain typo check
    const typoSuggestion = checkDomainTypo(normalizedEmail);
    if (typoSuggestion) {
      return res.status(400).json({
        success: false,
        field: 'email',
        suggestedEmail: typoSuggestion,
        message: `This email looks wrong. Did you mean ${typoSuggestion}?`
      });
    }

    // 3. Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        field: 'email',
        message: 'This email is not registered. Please enter the email you used to sign up.'
      });
    }

    // 3. Check if seller is blocked
    if (user.role === 'seller' && user.sellerStatus === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your seller account has been suspended by the Admin. Please contact support.'
      });
    }

    const result = await otpService.createAndSendOtp(normalizedEmail, 'password_reset');

    return res.status(200).json({
      success: true,
      message: 'A 6-digit verification code has been sent to your email. Please check your Inbox as well as your Spam / Junk folder.',
      email: normalizedEmail,
      cooldownSeconds: result.cooldownSeconds,
      devOtp: result.devOtp
    });
  } catch (error) {
    const isOutage = error.message?.includes('temporarily unavailable');
    return res.status(400).json({
      success: false,
      field: 'email',
      message: isOutage
        ? 'Email service is temporarily unavailable. Please try again later.'
        : (error.message?.includes('Too many requests')
          ? error.message
          : 'We could not send a code to this email. This email address looks wrong or does not exist.')
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
