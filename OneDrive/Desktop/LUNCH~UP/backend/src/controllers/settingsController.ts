import { Request, Response } from 'express';
import { Settings } from '../models/Settings.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * GET /api/settings/public
 * Récupérer les paramètres publics
 */
export const getPublicSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await Settings.findOne();

    if (!settings) {
      res.json({
        success: true,
        settings: {
          businessInfo: {
            name: 'LunchUp',
            phone: '+237 6 91 71 02 89',
            hours: 'Lundi-Vendredi: 8H-15H',
          },
        },
      });
      return;
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/admin/settings
 * Récupérer tous les paramètres (admin)
 */
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      // Créer les paramètres par défaut
      settings = new Settings({
        businessInfo: {
          name: 'LunchUp',
          phone: '+237 6 91 71 02 89',
          email: 'contact@lunchup.cm',
          address: 'Yaoundé, Cameroun',
          hours: 'Lundi-Vendredi: 8H-15H',
        },
        pricing: {
          deliveryFee: 1000,
        },
        payment: {
          orangeMoneyNumber: '',
          mtnMomoNumber: '',
        },
        notifications: {
          emailEnabled: true,
          smsEnabled: false,
        },
      });
      await settings.save();
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * PUT /api/admin/settings
 * Mettre à jour les paramètres (admin)
 */
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Paramètres mis à jour',
      settings,
    });
  } catch (error) {
    throw error;
  }
};
