import { Request, Response } from 'express';
import { Customer } from '../models/Customer.js';
import { Order } from '../models/Order.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * GET /api/admin/customers
 * Récupérer tous les clients
 */
export const getAllCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const skip = ((Number(page) || 1) - 1) * (Number(limit) || 10);

    const filters: any = {};
    if (search) {
      filters.$or = [
        { name: { $regex: String(search), $options: 'i' } },
        { phone: { $regex: String(search), $options: 'i' } },
      ];
    }

    const customers = await Customer.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit) || 10);

    const total = await Customer.countDocuments(filters);

    res.json({
      success: true,
      customers,
      pagination: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/admin/customers/:id
 * Récupérer les détails d'un client
 */
export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);

    if (!customer) {
      throw new AppError('Client introuvable', 404);
    }

    res.json({
      success: true,
      customer,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/admin/customers/:id/orders
 * Récupérer l'historique des commandes d'un client
 */
export const getCustomerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);

    if (!customer) {
      throw new AppError('Client introuvable', 404);
    }

    const orders = await Order.find({ 'customerInfo.phone': customer.phone }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      customer,
      orders,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/customer/wallet
 * Récupérer la balance du portefeuille cashback
 */
export const getWalletBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.userId;
    if (!customerId) {
      throw new AppError('Non authentifié', 401);
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new AppError('Client introuvable', 404);
    }

    res.json({
      success: true,
      walletBalance: customer.walletBalance,
      currency: 'FCFA',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/customer/cashback-history
 * Récupérer l'historique des transactions cashback
 */
export const getCashbackHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.userId;
    if (!customerId) {
      throw new AppError('Non authentifié', 401);
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new AppError('Client introuvable', 404);
    }

    // Trier l'historique par date décroissante
    const sortedHistory = customer.cashbackHistory.sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    res.json({
      success: true,
      cashbackHistory: sortedHistory,
      totalEarned: customer.cashbackHistory
        .filter((t) => t.type === 'earned')
        .reduce((sum, t) => sum + t.amount, 0),
      totalUsed: customer.cashbackHistory
        .filter((t) => t.type === 'used')
        .reduce((sum, t) => sum + t.amount, 0),
      currentBalance: customer.walletBalance,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * POST /api/customer/use-cashback
 * Utiliser du cashback
 */
export const useCashback = async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.userId;
    if (!customerId) {
      throw new AppError('Non authentifié', 401);
    }

    const { amount, orderId } = req.body;

    if (!amount || amount <= 0) {
      throw new AppError('Le montant doit être supérieur à 0', 400);
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new AppError('Client introuvable', 404);
    }

    if (customer.walletBalance < amount) {
      throw new AppError(
        `Solde insuffisant. Vous avez ${customer.walletBalance} FCFA disponible.`,
        400
      );
    }

    await customer.useCashback(amount, orderId);

    res.json({
      success: true,
      message: 'Cashback utilisé avec succès',
      walletBalance: customer.walletBalance,
    });
  } catch (error) {
    throw error;
  }
};
