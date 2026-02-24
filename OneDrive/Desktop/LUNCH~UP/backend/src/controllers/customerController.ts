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
