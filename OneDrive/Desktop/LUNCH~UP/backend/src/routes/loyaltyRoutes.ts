import { Router } from 'express';
import { authenticate, authorize, optionalAuthenticate } from '../middlewares/auth';
import { loyaltyController } from '../controllers/loyaltyController';

const router = Router();

// PROMO CODES - Admin and Vendors (vendors see only their codes)
router.get('/promo-codes', authenticate, authorize(['admin', 'super_admin', 'vendor']), loyaltyController.getAllPromoCodes);
router.post('/promo-codes', authenticate, authorize(['admin', 'super_admin', 'vendor']), loyaltyController.createPromoCode);
router.put('/promo-codes/:id', authenticate, authorize(['admin', 'super_admin', 'vendor']), loyaltyController.updatePromoCode);
router.delete('/promo-codes/:id', authenticate, authorize(['admin', 'super_admin', 'vendor']), loyaltyController.deletePromoCode);

// VALIDATE PROMO CODE - Public
router.post('/validate', loyaltyController.validatePromoCode);

// LOYALTY SETTINGS - Admin only
router.get('/settings', authenticate, authorize(['admin', 'super_admin']), loyaltyController.getLoyaltySettings);
router.put('/cashback', authenticate, authorize(['admin', 'super_admin']), loyaltyController.updateCashbackPercentage);

export default router;
