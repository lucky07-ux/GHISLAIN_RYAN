const router = require('express').Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const {
  addMenuItem,
  updateMenuItem,
  getVendorOrders,
  updateOrderStatus,
} = require('../controllers/vendorController');

// ensure the caller is authenticated and has vendor role
router.use(verifyToken);
router.use(requireRole('VENDOR'));

router.post(
  '/menu',
  [
    body('name').notEmpty().withMessage('name is required'),
    body('price').isFloat({ gt: 0 }).withMessage('price must be greater than zero'),
  ],
  validateRequest,
  addMenuItem
);
router.put('/menu/:id', updateMenuItem);
router.get('/orders', getVendorOrders);
router.patch('/orders/:id/status', updateOrderStatus);

module.exports = router;