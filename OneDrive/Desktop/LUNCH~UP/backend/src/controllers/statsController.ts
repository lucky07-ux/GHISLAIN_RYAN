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

    // build base query depending on role
    const baseQuery: any = { 'payment.status': 'paid' };
    if (req.user && req.user.role === 'vendor') {
      // restrict to orders containing vendor's items
      const vendorMenuItems = await MenuItem.find({ vendor: req.user.id }).select('_id');
      const ids = vendorMenuItems.map(m => m._id);
      baseQuery['items.menuItemId'] = { $in: ids };
    }

    // Revenue today
    const ordersToday = await Order.find({
      ...baseQuery,
      createdAt: { $gte: today },
    });
    const revenueToday = ordersToday.reduce((sum, o) => sum + o.pricing.total, 0);

    // Revenue this week
    const ordersThisWeek = await Order.find({
      ...baseQuery,
      createdAt: { $gte: thisWeekStart },
    });
    const revenueThisWeek = ordersThisWeek.reduce((sum, o) => sum + o.pricing.total, 0);

    // Revenue this month
    const ordersThisMonth = await Order.find({
      ...baseQuery,
      createdAt: { $gte: thisMonthStart },
    });
    const revenueThisMonth = ordersThisMonth.reduce((sum, o) => sum + o.pricing.total, 0);

    // Count orders by status (apply vendor filter too)
    const statusMatch: any = {};
    if (req.user && req.user.role === 'vendor') {
      statusMatch['items.menuItemId'] = baseQuery['items.menuItemId'];
    }
    const orderStats = await Order.aggregate([
      { $match: statusMatch },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Unread notifications (admins only)
    let unreadNotifications = 0;
    if (!req.user || req.user.role !== 'vendor') {
      unreadNotifications = await Notification.countDocuments({ isRead: false });
    }

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
    const days: string[] = [];
    const data: number[] = [];

    // if vendor, need to gather their menu item ids once
    let vendorIds: any[] | null = null;
    if (req.user && req.user.role === 'vendor') {
      const vendorMenuItems = await MenuItem.find({ vendor: req.user.id }).select('_id');
      vendorIds = vendorMenuItems.map(m => m._id);
    }

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const query: any = {
        createdAt: { $gte: date, $lt: nextDate },
        'payment.status': 'paid',
      };
      if (vendorIds) {
        query['items.menuItemId'] = { $in: vendorIds };
      }

      const orders = await Order.find(query);

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
