const express = require('express');
const router = express.Router();
const { createPayment, payunitWebhook } = require('../controllers/payunitController');

// initialize a payment session
router.post('/create', createPayment);
// webhook endpoint
router.post('/webhook', express.json({ type: '*/*' }), payunitWebhook);

module.exports = router;
