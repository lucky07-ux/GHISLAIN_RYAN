const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function generateReference() {
  return 'FLW-' + Date.now() + '-' + Math.random().toString(36).substr(2, 8);
}

async function createPaymentLink(req, res) {
  const { vendor_id, plan_name, amount } = req.body;
  // Fetch vendor info
  const { data: vendor, error } = await supabase.from('vendors').select('*').eq('id', vendor_id).single();
  if (error || !vendor) return res.status(400).json({ error: 'Vendor not found' });

  const tx_ref = generateReference();
  const payload = {
    tx_ref,
    amount,
    currency: 'XAF',
    redirect_url: 'http://localhost:5173/payment-success',
    customer: {
      email: vendor.email,
      name: vendor.owner_name
    },
    customizations: {
      title: 'Launcher Subscription',
      description: 'Subscription payment'
    }
  };

  try {
    const response = await axios.post('https://api.flutterwave.com/v3/payments', payload, {
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const link = response.data.data.link;
    // Optionally, save tx_ref and vendor_id mapping for later verification
    await supabase.from('payments').insert([{ tx_ref, vendor_id, plan_name, amount, status: 'pending' }]);
    res.json({ payment_link: link });
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.message || 'Flutterwave error' });
  }
}

async function flutterwaveWebhook(req, res) {
  try {
    const event = req.body;
    const tx_ref = event.data?.tx_ref;

    // ============================================
    // STEP 1: SIGNATURE VERIFICATION
    // ============================================
    // Validate the webhook signature to ensure the request came from Flutterwave
    // Extract the verif-hash header and compare with our stored secret
    const verificationHash = req.headers['verif-hash'];
    const expectedHash = process.env.FLUTTERWAVE_SECRET_HASH;

    if (!verificationHash || verificationHash !== expectedHash) {
      console.warn(`[Security] Webhook signature mismatch. Expected: ${expectedHash}, Received: ${verificationHash}`);
      return res.status(401).json({ error: 'Unauthorized: Invalid signature' });
    }

    // ============================================
    // STEP 2: FIND PAYMENT RECORD IN DATABASE
    // ============================================
    // Retrieve the pending payment record to compare against webhook data
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('tx_ref', tx_ref)
      .single();

    if (paymentError || !payment) {
      console.warn(`[Security] Payment record not found for tx_ref: ${tx_ref}`);
      return res.status(400).json({ error: 'Payment not found' });
    }

    // ============================================
    // STEP 3: VERIFY TRANSACTION WITH FLUTTERWAVE API
    // ============================================
    // Call the official Flutterwave verify endpoint to prevent spoofed webhook data
    // This ensures the transaction actually exists and has been processed
    const transactionId = event.data?.id;
    if (!transactionId) {
      console.warn('[Security] Transaction ID missing from webhook payload');
      return res.status(400).json({ error: 'Invalid transaction data' });
    }

    let verifiedData;
    try {
      const verifyResponse = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${FLW_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      verifiedData = verifyResponse.data.data;
    } catch (verifyError) {
      console.error(`[Security] Failed to verify transaction ${transactionId}:`, verifyError.response?.data);
      return res.status(400).json({ error: 'Transaction verification failed' });
    }

    // ============================================
    // STEP 4: VALIDATE ALL CRITICAL FIELDS
    // ============================================
    // Ensure the verified transaction matches what we expect:
    // - Status must be successful
    // - Amount must match the stored payment amount
    // - Currency must be XAF (expected currency)
    // - tx_ref must match exactly

    if (verifiedData.status !== 'successful') {
      console.warn(`[Security] Transaction status is not successful: ${verifiedData.status}`);
      return res.status(400).json({ error: 'Transaction not successful' });
    }

    // Amount validation (compare amounts as numbers)
    if (parseFloat(verifiedData.amount) !== parseFloat(payment.amount)) {
      console.warn(
        `[Security] Amount mismatch for tx_ref ${tx_ref}. Expected: ${payment.amount}, Got: ${verifiedData.amount}`
      );
      return res.status(400).json({ error: 'Amount mismatch' });
    }

    // Currency validation (ensure XAF)
    if (verifiedData.currency !== 'XAF') {
      console.warn(
        `[Security] Currency mismatch for tx_ref ${tx_ref}. Expected: XAF, Got: ${verifiedData.currency}`
      );
      return res.status(400).json({ error: 'Currency mismatch' });
    }

    // tx_ref validation (must match exactly)
    if (verifiedData.tx_ref !== payment.tx_ref) {
      console.warn(
        `[Security] Transaction reference mismatch. Expected: ${payment.tx_ref}, Got: ${verifiedData.tx_ref}`
      );
      return res.status(400).json({ error: 'Transaction reference mismatch' });
    }

    // ============================================
    // STEP 5: PREVENT REPLAY ATTACKS
    // ============================================
    // Check if this payment has already been processed
    // If it has, return success without reprocessing to prevent duplicate updates
    if (payment.status === 'completed') {
      console.info(`[Info] Payment ${tx_ref} was already processed. Returning success.`);
      return res.status(200).json({ status: 'already_processed' });
    }

    // ============================================
    // STEP 6: UPDATE VENDOR SUBSCRIPTION
    // ============================================
    // All security checks passed. Now safely update the vendor subscription.
    const now = new Date();
    let months = 1;

    if (payment.plan_name === 'basic') months = 1;
    if (payment.plan_name === 'premium') months = 12;

    const subscriptionEnd = new Date(now);
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + months);

    // Update vendor with new subscription details
    const { error: updateVendorError } = await supabase
      .from('vendors')
      .update({
        subscription_plan: payment.plan_name,
        subscription_start: now.toISOString(),
        subscription_end: subscriptionEnd.toISOString(),
        status: 'active'
      })
      .eq('id', payment.vendor_id);

    if (updateVendorError) {
      console.error('[Database] Failed to update vendor subscription:', updateVendorError);
      return res.status(500).json({ error: 'Failed to update subscription' });
    }

    // Mark payment as completed to prevent future reprocessing
    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({ status: 'completed', verified_at: now.toISOString() })
      .eq('tx_ref', tx_ref);

    if (updatePaymentError) {
      console.error('[Database] Failed to update payment status:', updatePaymentError);
      return res.status(500).json({ error: 'Failed to update payment status' });
    }

    console.info(`[Success] Payment ${tx_ref} verified and processed. Vendor ${payment.vendor_id} subscribed to ${payment.plan_name}.`);
    return res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('[Webhook Error] Unexpected error in Flutterwave webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createPaymentLink, flutterwaveWebhook };
