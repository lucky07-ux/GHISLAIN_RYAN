import { Router } from 'express';
import { authenticate, authorize, checkVendorSubscription } from '../middlewares/auth';
import { upload } from '../controllers/menuController';
import { vendorController } from '../controllers/vendorController';
import { getCurrentMenu, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuController';
import { getAllOrders, getOrderById, updateOrderStatus } from '../controllers/orderController';

const router = Router();

// All vendor routes require authentication and vendor role
router.use(authenticate);
router.use(authorize(['vendor']));

// Restaurant profile
router.get('/restaurant', vendorController.getMyProfile);
router.put('/restaurant', vendorController.updateMyProfile);

// Dashboard stats
router.get('/dashboard', vendorController.getDashboard);

// Menu management (reuses menu controller)
router.get('/menu', getCurrentMenu);
router.post('/menu', checkVendorSubscription, upload.single('image'), createMenuItem);
router.put('/menu/:id', checkVendorSubscription, updateMenuItem);
router.delete('/menu/:id', checkVendorSubscription, deleteMenuItem);

// Orders
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', updateOrderStatus);

// Customers (derived from orders)
router.get('/customers', vendorController.getCustomers);

export default router;
