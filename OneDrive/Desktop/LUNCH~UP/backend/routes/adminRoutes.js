const router = require('express').Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/requireRole');
const {
  getDashboardStats,
  getAllVendors,
  updateVendorStatus,
} = require('../controllers/adminController');

// protect admin endpoints
router.use(verifyToken);
router.use(requireRole('ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/vendors', getAllVendors);
router.patch('/vendors/:id/status', updateVendorStatus);

module.exports = router;