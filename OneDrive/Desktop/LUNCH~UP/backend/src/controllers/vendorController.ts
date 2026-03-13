import { Request, Response } from 'express';
import { Vendor } from '../models/Vendor';
import { MenuItem } from '../models/MenuItem';
import { Order } from '../models/Order';
import { Review } from '../models/Review';

interface AuthRequest extends Request {
  userId?: any;
  userRole?: string;
}

export const vendorController = {
  // Obtenir tous les vendeurs (admin seulement)
  getAllVendors: async (req: AuthRequest, res: Response) => {
    try {
      const vendors = await Vendor.find({})
        .select('-password')
        .exec();

      // Trier par pack: premium > boost > standard
      const packOrder = { premium: 0, boost: 1, standard: 2 };
      vendors.sort((a, b) => {
        return packOrder[a.packType as keyof typeof packOrder] - 
               packOrder[b.packType as keyof typeof packOrder];
      });

      res.json({ vendors });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Obtenir un vendeur spécifique
  getVendor: async (req: AuthRequest, res: Response) => {
    try {
      const vendor = await Vendor.findById(req.params.id).select('-password');
      if (!vendor) {
        return res.status(404).json({ error: 'Vendeur non trouvé' });
      }
      res.json({ vendor });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Créer un vendeur (admin seulement)
  createVendor: async (req: AuthRequest, res: Response) => {
    try {
      const { name, phone, email, packType } = req.body;

      if (!name || !phone || !email) {
        return res.status(400).json({ error: 'Champs requis manquants' });
      }

      const existingVendor = await Vendor.findOne({ email });
      if (existingVendor) {
        return res.status(400).json({ error: 'Email déjà utilisé' });
      }

      const password = Math.random().toString(36).substring(2, 12);

      const vendor = new Vendor({
        name,
        phone,
        email,
        password,
        packType: packType || 'standard',
        isActive: true,
      });

      await vendor.save();

      res.status(201).json({
        message: 'Vendeur créé avec succès',
        vendor: vendor.toObject(),
        tempPassword: password, // À envoyer au vendeur
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erreur serveur' });
    }
  },

  // Mettre à jour un vendeur (admin seulement)
  updateVendor: async (req: AuthRequest, res: Response) => {
    try {
      const { name, phone, email, packType, isActive } = req.body;

      const vendor = await Vendor.findById(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: 'Vendeur non trouvé' });
      }

      if (name) vendor.name = name;
      if (phone) vendor.phone = phone;
      if (email) vendor.email = email;
      if (packType) vendor.packType = packType;
      if (isActive !== undefined) vendor.isActive = isActive;

      await vendor.save();

      res.json({ message: 'Vendeur mis à jour', vendor: vendor.toObject() });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erreur serveur' });
    }
  },

  // Supprimer un vendeur (admin seulement)
  deleteVendor: async (req: AuthRequest, res: Response) => {
    try {
      const vendor = await Vendor.findByIdAndDelete(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: 'Vendeur non trouvé' });
      }

      // Supprimer aussi ses menus
      await MenuItem.deleteMany({ vendor: req.params.id });

      res.json({ message: 'Vendeur supprimé' });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Activer/Désactiver un vendeur
  toggleVendorStatus: async (req: AuthRequest, res: Response) => {
    try {
      const vendor = await Vendor.findById(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: 'Vendeur non trouvé' });
      }

      vendor.isActive = !vendor.isActive;
      await vendor.save();

      res.json({
        message: `Vendeur ${vendor.isActive ? 'activé' : 'désactivé'}`,
        vendor: vendor.toObject(),
      });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Obtenir les statistiques d'un vendeur
  getVendorStats: async (req: AuthRequest, res: Response) => {
    try {
      const vendorId = req.params.id;

      // Nombre de produits actifs
      const activeMenuItems = await MenuItem.countDocuments({
        vendor: vendorId,
        isActive: true,
      });

      // Nombre total de produits
      const totalMenuItems = await MenuItem.countDocuments({
        vendor: vendorId,
      });

      res.json({
        stats: {
          activeMenuItems,
          totalMenuItems,
        },
      });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Renouveler l'abonnement d'un vendeur
  renewSubscription: async (req: AuthRequest, res: Response) => {
    try {
      const { durationDays = 30, packType } = req.body;

      const vendor = await Vendor.findById(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: 'Vendeur non trouvé' });
      }

      // Calculer la nouvelle date d'expiration
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + durationDays);

      vendor.subscriptionEndDate = subscriptionEndDate;
      if (packType) vendor.packType = packType;

      await vendor.save();

      res.json({
        message: 'Abonnement renouvelé',
        vendor: vendor.toObject(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erreur serveur' });
    }
  },

  // Vérifier l'état de l'abonnement
  checkSubscriptionStatus: async (req: AuthRequest, res: Response) => {
    try {
      const vendor = await Vendor.findById(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: 'Vendeur non trouvé' });
      }

      const isSubscriptionActive = vendor.isSubscriptionActive?.();
      const daysRemaining = vendor.subscriptionEndDate 
        ? Math.ceil((vendor.subscriptionEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

      res.json({
        subscriptionStatus: {
          isActive: isSubscriptionActive,
          endDate: vendor.subscriptionEndDate,
          packType: vendor.packType,
          daysRemaining: daysRemaining,
        },
      });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Obtenir la liste des vendeurs publics (pour le menu client)
  getPublicVendors: async (req: AuthRequest, res: Response) => {
    try {
      const vendors = await Vendor.find({
        isActive: true,
      })
        .select('-password')
        .exec();

      // Filtrer et trier: seulement les vendeurs avec abonnement actif
      const activeVendors = vendors.filter(v => v.isSubscriptionActive?.());

      // Trier par pack: premium > boost > standard
      const packOrder = { premium: 0, boost: 1, standard: 2 };
      activeVendors.sort((a, b) => {
        return packOrder[a.packType as keyof typeof packOrder] - 
               packOrder[b.packType as keyof typeof packOrder];
      });

      res.json({ vendors: activeVendors });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // ========== Vendor self endpoints ==========
  // Récupérer le profil du vendeur connecté
  getMyProfile: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || !req.user.id) return res.status(401).json({ error: 'Non authentifié' });
      const vendor = await Vendor.findById(req.user.id).select('-password');
      if (!vendor) return res.status(404).json({ error: 'Vendeur non trouvé' });
      res.json({ vendor });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Mettre à jour le profil du vendeur connecté
  updateMyProfile: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || !req.user.id) return res.status(401).json({ error: 'Non authentifié' });
      const vendor = await Vendor.findById(req.user.id);
      if (!vendor) return res.status(404).json({ error: 'Vendeur non trouvé' });

      const { name, phone, email, latitude, longitude } = req.body;
      if (name) vendor.name = name;
      if (phone) vendor.phone = phone;
      if (email) vendor.email = email;
      if (latitude !== undefined) vendor.latitude = latitude;
      if (longitude !== undefined) vendor.longitude = longitude;

      await vendor.save();
      res.json({ message: 'Profil mis à jour', vendor: vendor.toObject() });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erreur serveur' });
    }
  },

  // Dashboard pour le vendeur connecté
  getDashboard: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || !req.user.id) return res.status(401).json({ error: 'Non authentifié' });
      const vendorId = req.user.id;

      // Menu items owned by vendor
      const items = await MenuItem.find({ vendor: vendorId }).select('_id name');
      const itemIds = items.map(i => i._id);

      // Dates
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0,0,0,0);

      // Daily orders count and revenue
      const dailyOrders = await Order.countDocuments({
        createdAt: { $gte: startOfDay },
        'items.menuItemId': { $in: itemIds },
      });

      const dailyRevenueAgg = await Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay }, 'items.menuItemId': { $in: itemIds } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } },
      ]);

      const monthRevenueAgg = await Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, 'items.menuItemId': { $in: itemIds } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } },
      ]);

      const revenueToday = (dailyRevenueAgg[0] && dailyRevenueAgg[0].total) || 0;
      const revenueThisMonth = (monthRevenueAgg[0] && monthRevenueAgg[0].total) || 0;

      // Popular items (by quantity)
      const popular = await Order.aggregate([
        { $unwind: '$items' },
        { $match: { 'items.menuItemId': { $in: itemIds } } },
        { $group: { _id: '$items.menuItemId', qty: { $sum: '$items.quantity' } } },
        { $sort: { qty: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'menuitems', localField: '_id', foreignField: '_id', as: 'menu' } },
        { $unwind: { path: '$menu', preserveNullAndEmptyArrays: true } },
        { $project: { id: '$_id', name: '$menu.name', qty: 1 } },
      ]);

      // Recent approved reviews (global, since Review isn't tied to vendor in model)
      const reviews = await Review.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(5).lean();

      res.json({
        stats: {
          dailyOrders,
          revenueToday,
          revenueThisMonth,
          popularItems: popular,
          recentReviews: reviews,
        },
      });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Customers derived from orders containing vendor items
  getCustomers: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user || !req.user.id) return res.status(401).json({ error: 'Non authentifié' });
      const vendorId = req.user.id;
      const items = await MenuItem.find({ vendor: vendorId }).select('_id');
      const itemIds = items.map(i => i._id);

      const customers = await Order.aggregate([
        { $match: { 'items.menuItemId': { $in: itemIds } } },
        { $group: { _id: '$customerInfo.phone', name: { $first: '$customerInfo.name' }, phone: { $first: '$customerInfo.phone' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      res.json({ customers });
    } catch (err) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },
};
