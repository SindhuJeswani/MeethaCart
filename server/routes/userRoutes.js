import express from 'express';
import { getMe, updateProfile, getPublicSellerProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public seller storefront profile
router.get('/seller/:id', getPublicSellerProfile);

// Authenticated user profile routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
