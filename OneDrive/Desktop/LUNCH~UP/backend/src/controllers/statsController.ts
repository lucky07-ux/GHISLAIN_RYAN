import { Request, Response } from 'express';
import { Order } from '../models/Order.js';
import { MenuItem } from '../models/MenuItem.js';
import { Review } from '../models/Review.js';
import { Notification } from '../models/Notification.js';

/**
 * GET /api/admin/stats/overview
 * Récupérer les statistiques du dashboard
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Revenue today
    const ordersToday = await Order.find({
      createdAt: { $gte: today },
      'payment.status': 'paid',
    });
    const revenueToday = ordersToday.reduce((sum, o) => sum + o.pricing.total, 0);

    // Revenue this week
    const ordersThisWeek = await Order.find({
      createdAt: { $gte: thisWeekStart },
      'payment.status': 'paid',
    });
    const revenueThisWeek = ordersThisWeek.reduce((sum, o) => sum + o.pricing.total, 0);

    // Revenue this month
    const ordersThisMonth = await Order.find({
      createdAt: { $gte: thisMonthStart },
      'payment.status': 'paid',
    });
    const revenueThisMonth = ordersThisMonth.reduce((sum, o) => sum + o.pricing.total, 0);

    // Count orders by status
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Unread notifications
    const unreadNotifications = await Notification.countDocuments({ isRead: false });

    res.json({
      success: true,
      stats: {
        revenueToday,
        revenueThisWeek,
        revenueThisMonth,
        ordersToday: ordersToday.length,
        orderStats: orderStats.reduce((acc: any, curr: any) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        unreadNotifications,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/admin/stats/revenue
 * Récupérer les données de revenus (graphique 7 jours)
 */
export const getRevenueStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const days = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const orders = await Order.find({
        createdAt: { $gte: date, $lt: nextDate },
        'payment.status': 'paid',
      });

      const revenue = orders.reduce((sum, o) => sum + o.pricing.total, 0);

      days.push(date.toLocaleDateString('fr-FR', { weekday: 'short' }));
      data.push(revenue);
    }

    res.json({
      success: true,
      days,
      data,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/admin/stats/orders
 * Récupérer les statistiques des commandes
 */
export const getOrdersStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalOrders = await Order.countDocuments();

    const statusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const paymentMethodStats = await Order.aggregate([
      {
        $group: {
          _id: '$payment.method',
          count: { $sum: 1 },
          total: { $sum: '$pricing.total' },
        },
      },
    ]);

    // Most ordered items
    const topItems = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          count: { $sum: '$items.quantity' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      totalOrders,
      statusStats,
      paymentMethodStats,
      topItems,
    });
  } catch (error) {
    throw error;
  }
};
