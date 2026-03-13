import { Router } from 'express';
import {
  getAllCustomers,
  getCustomerById,
  getCustomerOrders,
  getWalletBalance,
  getCashbackHistory,
  useCashback,
} from '../controllers/customerController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Admin routes
router.get('/', authenticate, authorize(['admin', 'super_admin']), getAllCustomers);
router.get('/:id', authenticate, authorize(['admin', 'super_admin']), getCustomerById);
router.get('/:id/orders', authenticate, authorize(['admin', 'super_admin']), getCustomerOrders);

// Customer routes (protected)
router.get('/wallet', authenticate, authorize(['user']), getWalletBalance);
router.get('/cashback-history', authenticate, authorize(['user']), getCashbackHistory);
router.post('/use-cashback', authenticate, authorize(['user']), useCashback);

export default router;
