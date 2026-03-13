import { Router, Request, Response } from 'express';
import { authenticate, authorize, checkVendorSubscription } from '../middlewares/auth';
import { vendorController } from '../controllers/vendorController';

interface AuthRequest extends Request {
  userId?: any;
  userRole?: string;
}

const router = Router();

// Middlewares
router.use(authenticate);
router.use(authorize(['admin', 'super_admin']));

// Routes pour admin
router.get('/', vendorController.getAllVendors);
router.get('/public', vendorController.getPublicVendors);
router.get('/:id', vendorController.getVendor);
router.get('/:id/stats', vendorController.getVendorStats);
router.get('/:id/subscription', vendorController.checkSubscriptionStatus);

router.post('/', vendorController.createVendor);
router.post('/:id/renew-subscription', vendorController.renewSubscription);
router.put('/:id', vendorController.updateVendor);
router.patch('/:id/toggle-status', vendorController.toggleVendorStatus);
router.delete('/:id', vendorController.deleteVendor);

export default router;
