import { FEATURES } from '../config/features.js';
import express from 'express';
import {
  getMetrics,
  getSellers,
  getSellerDetails,
  updateSellerStatus,
  getUsers,
  blockUser,
  unblockUser,
  getAdminOrders,
  deleteUser,
  updateUserRole,
  getItemReviews,
  acceptItem,
  rejectItem
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All admin routes require authentication and 'admin' role
router.use(protect);
router.use(authorize('admin'));

// Platform KPIs
router.get('/metrics', getMetrics);

// Seller approval and blocking
router.get('/sellers', getSellers);
router.get('/sellers/:id', getSellerDetails);
router.patch('/sellers/:id/status', updateSellerStatus);

// Bakery item reviews & moderation
router.get('/items', getItemReviews);
router.patch('/items/:id/accept', acceptItem);
router.patch('/items/:id/reject', rejectItem);

// User management directory
router.get('/users', getUsers);
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/unblock', unblockUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);

// Orders monitoring (Milestone 2 marketplace monitoring)
router.get('/orders', getAdminOrders);

export default router;
