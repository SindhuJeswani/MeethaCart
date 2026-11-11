import express from 'express';
import {
  createOrder,
  getOrderById,
  getBuyerOrders,
  getSellerOrders,
  acceptOrder,
  rejectOrder,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

// Buyer order creation
router.post('/', authorize('buyer'), createOrder);

// Buyer order history (M6)
router.get('/my-orders', authorize('buyer'), getBuyerOrders);

// Seller incoming orders list
router.get('/seller/my-orders', authorize('seller', 'admin'), getSellerOrders);

// Single order tracking details
router.get('/:id', getOrderById);

// Seller order status actions
router.patch('/:id/accept', authorize('seller', 'admin'), acceptOrder);
router.patch('/:id/reject', authorize('seller', 'admin'), rejectOrder);
router.patch('/:id/status', authorize('seller', 'admin'), updateOrderStatus);

export default router;
