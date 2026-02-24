import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { generateToken } from '../utils/helpers.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * POST /api/admin/login
 * Authentifie un administrateur
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new AppError('Email et mot de passe requis', 400);
    }

    // Rechercher l'utilisateur
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Identifiants invalides', 401);
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Identifiants invalides', 401);
    }

    // Mettre à jour lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Générer le token
    const token = generateToken(user._id!.toString(), user.email, user.role);

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
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

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('Utilisateur introuvable', 404);
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    throw error;
  }
};
