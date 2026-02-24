import { Router } from 'express';
import {
  getDashboardStats,
  getRevenueStats,
  getOrdersStats,
} from '../controllers/statsController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/overview', authenticate, authorize(['admin', 'super_admin']), getDashboardStats);
router.get('/revenue', authenticate, authorize(['admin', 'super_admin']), getRevenueStats);
router.get('/orders', authenticate, authorize(['admin', 'super_admin']), getOrdersStats);

export default router;
