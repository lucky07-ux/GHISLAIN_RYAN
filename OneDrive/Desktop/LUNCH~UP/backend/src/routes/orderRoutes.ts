import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  deleteOrder,
  initiatePayment,
  verifyPayment,
  handleNotchPayWebhook,
} from '../controllers/orderController';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

// Public route to create an order
router.post('/', createOrder);

// Public route to track an order by its public orderNumber
router.get('/track/:orderNumber', getOrderByNumber);

// Protected routes (admin, super_admin & vendor for viewing)
router.get('/', authenticate, authorize(['admin', 'super_admin', 'vendor']), getAllOrders);
router.get('/:id', authenticate, authorize(['admin', 'super_admin', 'vendor']), getOrderById);

// Allow admin, super_admin and vendor to move orders through the workflow
router.put('/:id/status', authenticate, authorize(['admin', 'super_admin', 'vendor']), updateOrderStatus);

// Only admin & super_admin can delete orders
router.delete('/:id', authenticate, authorize(['admin', 'super_admin']), deleteOrder);

// Payment routes
router.post('/:orderId/payment/initiate', initiatePayment);
router.post('/webhooks/notchpay', handleNotchPayWebhook);
router.get('/:orderId/payment/verify', verifyPayment);

export default router;
