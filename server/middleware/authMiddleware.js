import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Authentication Middleware
 * Validates JWT in Authorization header and attaches the authenticated user to req.user
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'meethacart_jwt_secret');

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The account associated with this token no longer exists.'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Account not verified. Please verify your account via OTP first.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token.'
    });
  }
};
