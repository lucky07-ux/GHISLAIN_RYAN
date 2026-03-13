const axios = require('axios');

// initialize payment and handle webhook for PayUnit

async function createPayment(req, res) {
  const { amount, orderId, customerEmail } = req.body;
  if (!amount || !orderId || !customerEmail) {
    return res.status(400).json({ error: 'amount, orderId and customerEmail are required' });
  }

  const payload = {
    amount,
    currency: process.env.CURRENCY || 'XAF',
    description: `Payment for order ${orderId}`,
    return_url: `${process.env.FRONTEND_URL}/payment-success`,
    notify_url: `${process.env.BACKEND_URL}/api/payunit/webhook`
  };

  try {
    const resp = await axios.post(
      `${process.env.PAYUNIT_BASE_URL}/api/gateway/initialize`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.PAYUNIT_API_KEY
        }
      }
    );

    const redirect_url = resp.data?.data?.redirect_url;
    if (!redirect_url) {
      return res.status(500).json({ error: 'Invalid response from PayUnit' });
    }

    res.json({ redirect_url });
  } catch (err) {
    console.error('PayUnit initialize error', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.message || 'PayUnit error' });
  }
}

async function payunitWebhook(req, res) {
  const payload = req.body;
  // payload structure depends on PayUnit docs
  if (payload?.status === 'SUCCESS') {
    console.log('PayUnit payment successful', payload);
    // TODO: update order status to PAID in database
  }
  res.sendStatus(200);
}

module.exports = { createPayment, payunitWebhook };
