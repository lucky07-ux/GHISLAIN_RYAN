import { Router } from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticate, authorize(['admin', 'super_admin']), getNotifications);
router.patch('/:id/read', authenticate, authorize(['admin', 'super_admin']), markNotificationAsRead);
router.delete('/:id', authenticate, authorize(['admin', 'super_admin']), deleteNotification);

export default router;
