import { Router } from 'express';
import {
  getPublicSettings,
  getSettings,
  updateSettings,
} from '../controllers/settingsController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Public route
router.get('/public', getPublicSettings);

// Admin routes
router.get('/', authenticate, authorize(['admin', 'super_admin']), getSettings);
router.put('/', authenticate, authorize(['admin', 'super_admin']), updateSettings);

export default router;
