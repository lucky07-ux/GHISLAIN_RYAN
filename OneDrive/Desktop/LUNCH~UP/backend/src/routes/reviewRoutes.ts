import { Router } from 'express';
import {
  getApprovedReviews,
  createReview,
  getAllReviews,
  approveReview,
  rejectReview,
  deleteReview,
  pinReview,
} from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Public routes
router.get('/', getApprovedReviews);
router.post('/', createReview);

// Admin routes
router.get('/all', authenticate, authorize(['admin', 'super_admin']), getAllReviews);
router.patch('/:id/approve', authenticate, authorize(['admin', 'super_admin']), approveReview);
router.patch('/:id/reject', authenticate, authorize(['admin', 'super_admin']), rejectReview);
router.delete('/:id', authenticate, authorize(['admin', 'super_admin']), deleteReview);
router.patch('/:id/pin', authenticate, authorize(['admin', 'super_admin']), pinReview);

export default router;
