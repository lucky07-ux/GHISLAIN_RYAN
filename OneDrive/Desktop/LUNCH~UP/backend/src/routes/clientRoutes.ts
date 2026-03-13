import express from 'express';
import { Vendor } from '../models/Vendor.js';
import { MenuItem } from '../models/MenuItem.js';
import { Order } from '../models/Order.js';
import { Customer } from '../models/Customer.js';

const router = express.Router();

// GET /api/client/vendors
// Liste publique des vendeurs visibles côté client
router.get('/vendors', async (req, res) => {
  try {
    const vendors = await Vendor.find({ isActive: true }).select('-password').exec();

    // Ne garder que les vendeurs avec abonnement actif et trier par pack
    const activeVendors = vendors.filter((v: any) => v.isSubscriptionActive?.());
    const packOrder: Record<string, number> = { premium: 0, boost: 1, standard: 2 };

    activeVendors.sort(
      (a: any, b: any) =>
        packOrder[a.packType as keyof typeof packOrder] -
        packOrder[b.packType as keyof typeof packOrder]
    );

    const formatted = activeVendors.map((v: any) => ({
      id: v._id.toString(),
      business_name: v.name,
      owner_name: v.name,
      phone: v.phone,
      latitude: typeof v.latitude === 'number' ? v.latitude : null,
      longitude: typeof v.longitude === 'number' ? v.longitude : null,
    }));

    res.json({ vendors: formatted });
  } catch (err) {
    console.error('Error fetching client vendors', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/client/vendors/:vendorId
// Détails publics d'un vendeur (pour la page vendeur)
router.get('/vendors/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId).select('-password').exec();
    if (!vendor || !vendor.isActive || !vendor.isSubscriptionActive?.()) {
      return res.status(404).json({ error: 'Vendeur introuvable' });
    }

    res.json({
      vendor: {
        id: vendor._id.toString(),
        name: vendor.name,
        phone: vendor.phone,
        packType: vendor.packType,
        latitude: typeof (vendor as any).latitude === 'number' ? (vendor as any).latitude : null,
        longitude: typeof (vendor as any).longitude === 'number' ? (vendor as any).longitude : null,
      },
    });
  } catch (err) {
    console.error('Error fetching vendor details for client', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/client/vendors/:vendorId/menu
// Menu public pour un vendeur donné
router.get('/vendors/:vendorId/menu', async (req, res) => {
  try {
    const { vendorId } = req.params;

    const items = await MenuItem.find({
      vendor: vendorId,
      isActive: true,
    })
      .sort({ dayOfWeek: 1, createdAt: -1 })
      .exec();

    const formatted = items.map((item: any) => ({
      id: item._id.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category || null,
      imageUrl: item.imageUrl || null,
    }));

    res.json({ menu: formatted });
  } catch (err) {
    console.error('Error fetching vendor menu for client', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/client/orders?phone=...
// Historique des commandes d'un client à partir de son téléphone
router.get('/orders', async (req, res) => {
  try {
    const phone = (req.query.phone as string | undefined)?.trim();
    if (!phone) {
      return res.status(400).json({ error: 'Téléphone requis' });
    }

    const orders = await Order.find({
      'customerInfo.phone': phone,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
      .exec();

    res.json({
      orders: orders.map((o: any) => ({
        id: o._id.toString(),
        orderNumber: o.orderNumber,
        status: o.status,
        total: o.pricing?.total ?? 0,
        createdAt: o.createdAt,
        items: o.items?.map((it: any) => ({
          name: it.name,
          quantity: it.quantity,
          price: it.price,
        })) ?? [],
      })),
    });
  } catch (err) {
    console.error('Error fetching client orders', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/client/profile?phone=...
// Profil client simple (wallet, adresses, stats)
router.get('/profile', async (req, res) => {
  try {
    const phone = (req.query.phone as string | undefined)?.trim();
    if (!phone) {
      return res.status(400).json({ error: 'Téléphone requis' });
    }

    const customer = await Customer.findOne({ phone }).lean().exec();

    if (!customer) {
      return res.json({
        profile: {
          name: null,
          phone,
          email: null,
          walletBalance: 0,
          addresses: [],
          stats: {
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: null,
          },
        },
      });
    }

    res.json({
      profile: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email ?? null,
        walletBalance: customer.walletBalance ?? 0,
        addresses: customer.addresses ?? [],
        stats: customer.stats ?? {
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: null,
        },
      },
    });
  } catch (err) {
    console.error('Error fetching client profile', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

