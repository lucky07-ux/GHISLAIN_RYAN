import { Router } from 'express';
import {
  getAllCustomers,
  getCustomerById,
  getCustomerOrders,
} from '../controllers/customerController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Admin routes
router.get('/', authenticate, authorize(['admin', 'super_admin']), getAllCustomers);
router.get('/:id', authenticate, authorize(['admin', 'super_admin']), getCustomerById);
router.get('/:id/orders', authenticate, authorize(['admin', 'super_admin']), getCustomerOrders);

export default router;
