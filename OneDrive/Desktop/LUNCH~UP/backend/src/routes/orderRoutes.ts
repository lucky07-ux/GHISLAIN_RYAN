import express from 'express';
import { createOrder, getAllOrders, getOrderById, updateOrderStatus, deleteOrder, initiatePayment, verifyPayment, handleNotchPayWebhook } from '../controllers/orderController';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

// Routes publiques
router.post('/', createOrder);

// Routes protégées (admin)
router.get('/', authenticate, authorize(['admin']), getAllOrders);
router.get('/:id', authenticate, authorize(['admin']), getOrderById);
router.put('/:id/status', authenticate, authorize(['admin']), updateOrderStatus);
router.delete('/:id', authenticate, authorize(['admin']), deleteOrder);

// Payment routes
router.post('/:orderId/payment/initiate', initiatePayment);
router.post('/webhooks/notchpay', handleNotchPayWebhook);
router.get('/:orderId/payment/verify', verifyPayment);

export default router;
