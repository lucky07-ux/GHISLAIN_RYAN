import { Router } from 'express';
import {
  getCurrentMenu,
  getMenuByDay,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateMenuItemStock,
  upload,
} from '../controllers/menuController.js';
import { authenticate, authorize, optionalAuthenticate, checkVendorSubscription } from '../middlewares/auth.js';

const router = Router();

// Public routes (parse token if provided to permit vendor filtering)
router.get('/current', optionalAuthenticate, getCurrentMenu);
router.get('/:day', optionalAuthenticate, getMenuByDay);

// Admin routes (with subscription check for vendors)
router.post('/', authenticate, authorize(['admin', 'super_admin', 'vendor']), checkVendorSubscription, upload.single('image'), createMenuItem);
router.put('/:id', authenticate, authorize(['admin', 'super_admin', 'vendor']), checkVendorSubscription, updateMenuItem);
router.delete('/:id', authenticate, authorize(['admin', 'super_admin', 'vendor']), checkVendorSubscription, deleteMenuItem);
router.patch('/:id/stock', authenticate, authorize(['admin', 'super_admin', 'vendor']), checkVendorSubscription, updateMenuItemStock);

export default router;
