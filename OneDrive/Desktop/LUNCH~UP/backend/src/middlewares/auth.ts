import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { JWTPayload } from '../types/index.js';
import { Vendor } from '../models/Vendor.js';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Authentification requise' });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

// middleware that tries to authenticate but does not error if no token
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return next();
    }
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    req.user = decoded;
  } catch (err) {
    // ignore invalid token
  }
  next();
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Accès non autorisé' });
      return;
    }
    next();
  };
};

// Middleware pour vérifier l'abonnement des vendeurs
export const checkVendorSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'vendor') {
      return next();
    }

    const vendor = await Vendor.findById(req.user.userId);
    if (!vendor) {
      res.status(401).json({ message: 'Vendeur non trouvé' });
      return;
    }

    // Vérifier si l'abonnement est actif
    if (!vendor.isSubscriptionActive?.()) {
      res.status(403).json({ 
        message: 'Votre abonnement a expiré. Veuillez renouveler votre abonnement.',
        subscriptionExpired: true,
        expiryDate: vendor.subscriptionEndDate,
      });
      return;
    }

    next();
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
