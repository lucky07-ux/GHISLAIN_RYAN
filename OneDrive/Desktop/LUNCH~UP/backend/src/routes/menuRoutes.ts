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
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Public routes
router.get('/current', getCurrentMenu);
router.get('/:day', getMenuByDay);

// Admin routes
router.post('/', authenticate, authorize(['admin', 'super_admin']), upload.single('image'), createMenuItem);
router.put('/:id', authenticate, authorize(['admin', 'super_admin']), updateMenuItem);
router.delete('/:id', authenticate, authorize(['admin', 'super_admin']), deleteMenuItem);
router.patch('/:id/stock', authenticate, authorize(['admin', 'super_admin']), updateMenuItemStock);

export default router;
