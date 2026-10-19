import express from 'express';
import {
  getMetrics,
  getSellers,
  updateSellerStatus,
  getUsers,
  getAdminOrders,
  deleteUser,
  updateUserRole
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
router.patch('/sellers/:id/status', updateSellerStatus);

// User management directory
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);

// Orders monitoring
router.get('/orders', getAdminOrders);

export default router;
