import { Request, Response } from 'express';
import { Customer } from '../models/Customer';
import { PointsTransaction } from '../models/PointsTransaction';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const pointsController = {
  /**
   * GET /api/points/balance
   * Récupère le solde de points de l'utilisateur connecté
   */
  getBalance: async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== 'user') {
        return res.status(403).json({ message: 'Accès réservé aux clients' });
      }

      const customer = await Customer.findById(req.user.id).select('points');
      if (!customer) {
        return res.status(404).json({ message: 'Client non trouvé' });
      }

      res.json({
        success: true,
        balance: customer.points.total,
        level: customer.points.level,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  /**
   * GET /api/points/transactions
   * Liste les transactions de points
   */
  getTransactions: async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== 'user') {
        return res.status(403).json({ message: 'Accès réservé aux clients' });
      }

      const { page = 1, limit = 20 } = req.query;
      const transactions = await PointsTransaction.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(limit as number)
        .skip((page as number - 1) * limit)
        .populate('orderId', 'orderNumber');

      const total = await PointsTransaction.countDocuments({ userId: req.user.id });

      res.json({
        success: true,
        transactions,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / (limit as number)),
        },
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
};

