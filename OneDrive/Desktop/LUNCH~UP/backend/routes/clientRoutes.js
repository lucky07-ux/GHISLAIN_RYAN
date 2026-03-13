const router = require('express').Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const {
  getVendors,
  getVendorMenu,
  createOrder,
  getMyOrders,
} = require('../controllers/clientController');

// all client routes require a valid JWT and client role
router.use(verifyToken);
router.use(requireRole('CLIENT'));

router.get('/vendors', getVendors);
router.get('/vendors/:vendorId/menu', getVendorMenu);
router.post(
  '/orders',
  [
    body('vendorId').isInt().withMessage('vendorId must be an integer'),
    body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('quantity must be at least 1'),
  ],
  validateRequest,
  createOrder
);
router.get('/orders', getMyOrders);

module.exports = router;
