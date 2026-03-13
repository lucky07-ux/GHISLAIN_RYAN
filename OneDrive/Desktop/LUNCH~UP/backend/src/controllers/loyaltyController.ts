import { Request, Response } from 'express';
import { PromoCode } from '../models/PromoCode';
import { Settings } from '../models/Settings';

interface AuthRequest extends Request {
  userId?: any;
  userRole?: string;
}

export const loyaltyController = {
  // ========== CODES PROMO ==========

  // Obtenir tous les codes promo
  getAllPromoCodes: async (req: AuthRequest, res: Response) => {
    try {
      const query: any = {};
      // If vendor, only return promo codes created by that vendor
      if (req.user && req.user.role === 'vendor') {
        query.createdBy = req.user.id;
      }
      const promoCodes = await PromoCode.find(query).sort({ createdAt: -1 });
      res.json({ promoCodes });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Créer un code promo (admin and vendors)
  createPromoCode: async (req: AuthRequest, res: Response) => {
    try {
      const { code, description, type, value, minOrderValue, maxDiscount, usageLimit, expiresAt } = req.body;

      if (!code || !type || value === undefined) {
        return res.status(400).json({ error: 'Champs requis manquants' });
      }

      const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
      if (existingCode) {
        return res.status(400).json({ error: 'Code promo déjà existant' });
      }

      const createdBy = (req.user && req.user.role === 'vendor') ? req.user.id : (req.userId || 'system');
      const promoCode = new PromoCode({
        code: code.toUpperCase(),
        description,
        type,
        value,
        minOrderValue: minOrderValue || 0,
        maxDiscount,
        usageLimit,
        expiresAt,
        isActive: true,
        createdBy,
      });

      await promoCode.save();

      res.status(201).json({
        message: 'Code promo créé',
        promoCode,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erreur serveur' });
    }
  },

  // Mettre à jour un code promo (admin or owner vendor)
  updatePromoCode: async (req: AuthRequest, res: Response) => {
    try {
      const { description, type, value, minOrderValue, maxDiscount, usageLimit, expiresAt, isActive } = req.body;

      const promoCode = await PromoCode.findById(req.params.id);
      if (!promoCode) {
        return res.status(404).json({ error: 'Code promo non trouvé' });
      }

      // If vendor, ensure they own the promo
      if (req.user && req.user.role === 'vendor') {
        if (promoCode.createdBy !== req.user.id) {
          return res.status(403).json({ error: 'Accès non autorisé' });
        }
      }

      if (description) promoCode.description = description;
      if (type) promoCode.type = type;
      if (value !== undefined) promoCode.value = value;
      if (minOrderValue !== undefined) promoCode.minOrderValue = minOrderValue;
      if (maxDiscount !== undefined) promoCode.maxDiscount = maxDiscount;
      if (usageLimit !== undefined) promoCode.usageLimit = usageLimit;
      if (expiresAt) promoCode.expiresAt = expiresAt;
      if (isActive !== undefined) promoCode.isActive = isActive;

      await promoCode.save();

      res.json({
        message: 'Code promo mis à jour',
        promoCode,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erreur serveur' });
    }
  },

  // Supprimer un code promo (admin or owner vendor)
  deletePromoCode: async (req: AuthRequest, res: Response) => {
    try {
      const promoCode = await PromoCode.findById(req.params.id);
      if (!promoCode) {
        return res.status(404).json({ error: 'Code promo non trouvé' });
      }

      if (req.user && req.user.role === 'vendor') {
        if (promoCode.createdBy !== req.user.id) {
          return res.status(403).json({ error: 'Accès non autorisé' });
        }
      }

      await PromoCode.findByIdAndDelete(req.params.id);

      res.json({ message: 'Code promo supprimé' });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Valider un code promo
  validatePromoCode: async (req: AuthRequest, res: Response) => {
    try {
      const { code, orderAmount } = req.body;

      const promoCode = await PromoCode.findOne({
        code: code.toUpperCase(),
        isActive: true,
      });

      if (!promoCode) {
        return res.status(404).json({ error: 'Code promo invalide ou expiré' });
      }

      // Vérifier expiration
      if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
        return res.status(400).json({ error: 'Code promo expiré' });
      }

      // Vérifier montant minimum
      if (orderAmount && orderAmount < promoCode.minOrderValue) {
        return res.status(400).json({
          error: `Montant minimum requis: ${promoCode.minOrderValue}`,
        });
      }

      // Vérifier limite d'utilisation
      if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
        return res.status(400).json({ error: 'Code promo limite atteinte' });
      }

      // Calculer la réduction
      let discount = 0;
      if (promoCode.type === 'percentage') {
        discount = (orderAmount * promoCode.value) / 100;
        if (promoCode.maxDiscount) {
          discount = Math.min(discount, promoCode.maxDiscount);
        }
      } else {
        discount = promoCode.value;
      }

      res.json({
        valid: true,
        discount,
        promoCode: promoCode.toObject(),
      });
    } catch (err) {
      res.status(500).json({ error: 'Erreur validation' });
    }
  },

  // ========== CASHBACK ==========

  // Obtenir les paramètres de fidélité
  getLoyaltySettings: async (req: AuthRequest, res: Response) => {
    try {
      const settings = await Settings.findOne({});
      const loyalty = settings?.toObject()?.loyalty || { cashbackPercentage: 2 };

      res.json({ loyalty });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Mettre à jour le pourcentage de cashback (admin seulement)
  updateCashbackPercentage: async (req: AuthRequest, res: Response) => {
    try {
      const { cashbackPercentage } = req.body;

      if (cashbackPercentage === undefined || cashbackPercentage < 0 || cashbackPercentage > 100) {
        return res.status(400).json({ error: 'Pourcentage invalide' });
      }

      let settings = await Settings.findOne({});
      if (!settings) {
        settings = new Settings({} as any);
      }

      (settings as any).loyalty = { cashbackPercentage };
      await settings.save();

      res.json({
        message: 'Paramètres de fidélité mis à jour',
        loyalty: { cashbackPercentage },
      });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },
};
