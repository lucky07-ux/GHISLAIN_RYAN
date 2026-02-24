import axios from 'axios';
import { config } from '../config';

const NOTCHPAY_BASE_URL = 'https://api.notchpay.co';

export const initiatePayment = async (order: any) => {
  try {
    const response = await axios.post(`${NOTCHPAY_BASE_URL}/payments/initialize`, {
      amount: order.pricing.total,
      currency: 'XAF', // FCFA
      email: order.customerInfo.email,
      phone: order.customerInfo.phone,
      reference: order.orderNumber,
      callback_url: `${config.frontendUrl}/payment/callback`,
      description: `Commande LunchUp ${order.orderNumber}`
    }, {
      headers: {
        'Authorization': `Bearer ${config.payment.notchpay.secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      paymentUrl: response.data.authorization_url,
      reference: response.data.reference
    };
  } catch (error: any) {
    console.error('Erreur NotchPay:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const verifyPayment = async (reference: string) => {
  try {
    const response = await axios.get(`${NOTCHPAY_BASE_URL}/payments/${reference}`, {
      headers: {
        'Authorization': `Bearer ${config.payment.notchpay.secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      status: response.data.status, // 'complete', 'pending', 'failed'
      amount: response.data.amount,
      method: response.data.channel // 'orange_money', 'mtn_momo', 'card'
    };
  } catch (error: any) {
    console.error('Erreur vérification NotchPay:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};
