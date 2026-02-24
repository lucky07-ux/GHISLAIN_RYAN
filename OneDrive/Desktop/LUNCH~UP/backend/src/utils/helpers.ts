import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import type { JWTPayload } from '../types/index.js';

export const generateToken = (id: string, email: string, role: string): string => {
  const secret = (config.jwtSecret || 'default_secret') as string;
  return jwt.sign(
    { id, email, role },
    secret,
    { expiresIn: config.jwtExpire }
  );
};

export const verifyToken = (token: string): JWTPayload => {
  const secret = (config.jwtSecret || 'default_secret') as string;
  return jwt.verify(token, secret) as JWTPayload;
};

/**
 * Génère un numéro de commande unique
 */
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CMD-${timestamp}${random}`;
};

/**
 * Obtient le numéro de semaine actuelle
 */
export const getCurrentWeek = (): { weekNumber: number; year: number } => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNumber = Math.floor(diff / oneWeek) + 1;
  const year = now.getFullYear();
  return { weekNumber, year };
};

/**
 * Formatte une date en format français
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Formate un montant en FCFA
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
  }).format(amount);
};

/**
 * Valide un numéro de téléphone camerounais
 */
export const validateCameroonPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  // Cameroun: +237 ou 237 ou 6XX/2XX
  return /^(237|\+237)?[2367]\d{8}$/.test(cleanPhone);
};

/**
 * Normalise un numéro de téléphone camerounais
 */
export const normalizeCameroonPhone = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  
  // Enlever le code pays si présent
  if (cleaned.startsWith('237')) {
    cleaned = cleaned.substring(3);
  }
  
  // Ajouter le code pays
  return '+237' + cleaned;
};
