import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Vendor } from '../models/Vendor.js';
import { Customer } from '../models/Customer.js';
import { generateToken } from '../utils/helpers.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * POST /api/auth/login
 * Authentifie un utilisateur selon son rôle (admin, vendor ou user)
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone, password, role } = req.body;

    if (!password || !role) {
      throw new AppError('Role et mot de passe requis', 400);
    }

    let record: any;
    switch (role) {
      case 'admin':
      case 'super_admin':
        if (!email) throw new AppError('Email requis', 400);
        record = await User.findOne({ email }).select('+password');
        break;
      case 'vendor':
        if (!email) throw new AppError('Email requis', 400);
        record = await Vendor.findOne({ email }).select('+password');
        break;
      case 'user':
        if (!phone) throw new AppError('Téléphone requis', 400);
        record = await Customer.findOne({ phone }).select('+password');
        break;
      default:
        throw new AppError('Role invalide', 400);
    }

    if (!record) {
      throw new AppError('Identifiants invalides', 401);
    }

    const isPasswordValid = await record.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Identifiants invalides', 401);
    }

    if (record.role === 'admin' || record.role === 'super_admin') {
      record.lastLogin = new Date();
      await record.save();
    }

    const token = generateToken(record._id!.toString(), record.email || record.phone, record.role);

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: record._id,
        email: record.email,
        phone: record.phone,
        name: record.name || record.email || record.phone,
        role: record.role,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * POST /api/admin/logout
 * Déconnexion (côté client: supprimer le token)
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'Déconnexion réussie',
  });
};

/**
 * GET /api/admin/me
 * Récupérer les informations de l'utilisateur connecté
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Utilisateur non authentifié', 401);
    }

    let user: any;
    switch (req.user.role) {
      case 'admin':
      case 'super_admin':
        user = await User.findById(req.user.id);
        break;
      case 'vendor':
        user = await Vendor.findById(req.user.id);
        break;
      case 'user':
        user = await Customer.findById(req.user.id);
        break;
      default:
        throw new AppError('Rôle inconnu', 400);
    }

    if (!user) {
      throw new AppError('Utilisateur introuvable', 404);
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        name: user.name || user.email || user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    throw error;
  }
};
