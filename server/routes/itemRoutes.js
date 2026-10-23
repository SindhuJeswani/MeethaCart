import express from 'express';
import {
  getItems,
  getItemById,
  getMyItems,
  createItem,
  updateItem,
  deleteItem,
  toggleAvailability
} from '../controllers/itemController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, requireApprovedSeller } from '../middleware/roleMiddleware.js';
import { uploadItemImages, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Seller my-items MUST be before /:id to avoid Express matching "seller" as an item ID
router.get('/seller/me', protect, authorize('seller', 'admin'), getMyItems);
router.get('/seller/my-items', protect, authorize('seller', 'admin'), getMyItems);

// Public catalog routes
router.get('/', getItems);
router.get('/:id', getItemById);

router.post(
  '/',
  protect,
  authorize('seller', 'admin'),
  requireApprovedSeller,
  uploadItemImages.array('images', 5),
  handleUploadError,
  createItem
);

router.put(
  '/:id',
  protect,
  authorize('seller', 'admin'),
  requireApprovedSeller,
  uploadItemImages.array('images', 5),
  handleUploadError,
  updateItem
);

router.delete(
  '/:id',
  protect,
  authorize('seller', 'admin'),
  requireApprovedSeller,
  deleteItem
);

router.patch(
  '/:id/availability',
  protect,
  authorize('seller', 'admin'),
  requireApprovedSeller,
  toggleAvailability
);

export default router;
