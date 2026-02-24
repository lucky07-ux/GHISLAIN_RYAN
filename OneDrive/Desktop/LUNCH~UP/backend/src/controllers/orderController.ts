import { Request, Response } from 'express';
import { sendWhatsApp, templates } from '../services/whatsapp.service';
import { Order, IOrderDoc } from '../models/Order';
import { MenuItem } from '../models/MenuItem';
import crypto from 'crypto';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerInfo, deliveryInfo, items, payment, specialInstructions } = req.body;

    // Validate required fields
    if (!customerInfo || !deliveryInfo || !items || !payment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique orderNumber
    const orderNumber = `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Calculate pricing
    let subtotal = 0;
    const populatedItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item ${item.menuItemId} not found` });
      }
      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;
      populatedItems.push({
        menuItemId: item.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      });
    }

    // Assume fixed delivery fee for now
    const deliveryFee = 1000;
    const total = subtotal + deliveryFee;

    // Create order
    const order = new Order({
      orderNumber,
      customerInfo,
      deliveryInfo,
      items: populatedItems,
      pricing: { subtotal, deliveryFee, total },
      payment,
      specialInstructions,
      status: 'pending',
      statusHistory: [{ status: 'pending', timestamp: new Date() }],
    });

    await order.save();

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber }).populate('items.menuItemId', 'name price');

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json({ success: true, status: order.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus } = req.query;

    const query: Record<string, any> = {};
    if (status) query.status = status;
    if (paymentStatus) query['payment.status'] = paymentStatus;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('items.menuItemId', 'name price');

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('items.menuItemId', 'name price');

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('items.menuItemId', 'name price');

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
};

export const confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: 'confirmed' },
      { new: true }
    );

    // 🚀 ENVOYER WHATSAPP
    const message = templates.orderConfirmed(order);
    await sendWhatsApp(order.customerInfo.phone, message);

    res.json({
      success: true,
      order,
      notification: 'WhatsApp envoyé'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Route: PATCH /api/admin/orders/:orderId/payment/confirm
export const confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { 'payment.status': 'paid', 'payment.paidAt': new Date() },
      { new: true }
    );

    // 🚀 ENVOYER WHATSAPP
    const message = templates.paymentConfirmed(order);
    await sendWhatsApp(order.customerInfo.phone, message);

    res.json({
      success: true,
      order,
      notification: 'Confirmation envoyée'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Payment functions
export const initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    const { initiatePayment: initiate } = await import('../services/notchpay.service');
    const paymentResult = await initiate(order);

    if (paymentResult.success) {
      // Sauvegarder référence
      order.payment.reference = paymentResult.reference;
      order.payment.status = 'pending';
      await order.save();

      res.json({
        success: true,
        paymentUrl: paymentResult.paymentUrl
      });
    } else {
      res.status(400).json({ error: paymentResult.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const handleNotchPayWebhook = async (req, res) => {
  try {
    const { event, data } = req.body;

    if (event === 'payment.complete') {
      // Trouver commande
      const order = await Order.findOne({
        'payment.reference': data.reference
      });

      if (order) {
        // Mettre à jour statut
        order.payment.status = 'paid';
        order.payment.paidAt = new Date();
        order.payment.channel = data.channel; // orange_money, mtn_momo, card
        await order.save();

        // Envoyer notification client
        const message = templates.paymentConfirmed(order);
        await sendWhatsApp(order.customerInfo.phone, message);
      }
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order || !order.payment.reference) {
      return res.status(400).json({ error: 'Pas de référence paiement' });
    }

    const { verifyPayment: verify } = await import('../services/notchpay.service');
    const result = await verify(order.payment.reference);

    if (result.success && result.status === 'complete') {
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
      await order.save();
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
