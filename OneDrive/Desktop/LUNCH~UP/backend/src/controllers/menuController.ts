import { Request, Response } from 'express';
import { MenuItem } from '../models/MenuItem.js';
import { generateOrderNumber, getCurrentWeek } from '../utils/helpers.js';
import { AppError } from '../middlewares/errorHandler.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Configuration stockage local pour les images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Images seulement (jpeg, jpg, png, webp, gif)!'));
    }
  }
});

export { upload };

// Mock menu data for testing
const mockMenuItems = [
  {
    _id: 'mock_1',
    name: 'Poulet DG avec Plantain',
    description: 'Délicieux poulet DG accompagné de plantain mûr et de légumes frais',
    price: 1500,
    dayOfWeek: 'lundi',
    weekNumber: 45,
    year: 2024,
    quantityAvailable: 25,
    category: 'Poulet',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'mock_2',
    name: 'Poisson Braisé',
    description: 'Poisson frais braisé avec une sauce spéciale et accompagnements',
    price: 1800,
    dayOfWeek: 'mardi',
    weekNumber: 45,
    year: 2024,
    quantityAvailable: 20,
    category: 'Poisson',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'mock_3',
    name: 'Viande de Bœuf Grillé',
    description: 'Tendre viande de bœuf grillée avec légumes et sauce maison',
    price: 2000,
    dayOfWeek: 'mercredi',
    weekNumber: 45,
    year: 2024,
    quantityAvailable: 18,
    category: 'Viande',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'mock_4',
    name: 'Sauté de Légumes',
    description: 'Mélange de légumes frais sautés avec une touche épicée',
    price: 1200,
    dayOfWeek: 'jeudi',
    weekNumber: 45,
    year: 2024,
    quantityAvailable: 22,
    category: 'Végétarien',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'mock_5',
    name: 'Riz Cantonais Spécial',
    description: 'Riz cantonais avec crevettes, légumes et œufs',
    price: 1400,
    dayOfWeek: 'vendredi',
    weekNumber: 45,
    year: 2024,
    quantityAvailable: 30,
    category: 'Asiatique',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * GET /api/menu/current
 * Récupérer le menu de la semaine actuelle
 */
export const getCurrentMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { weekNumber, year } = getCurrentWeek();

    // Fetch menu items from database
    const menuItems = await MenuItem.find({
      weekNumber,
      year,
      isActive: true
    }).sort({ dayOfWeek: 1 });

    // Images are served via static files at /uploads route

    res.json({
      success: true,
      weekNumber,
      year,
      menuItems,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/menu/:day
 * Récupérer le menu d'un jour spécifique
 */
export const getMenuByDay = async (req: Request, res: Response): Promise<void> => {
  try {
    const { day } = req.params;
    const { weekNumber, year } = getCurrentWeek();

    const validDays = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];
    if (!validDays.includes(day.toLowerCase())) {
      throw new AppError('Jour invalide', 400);
    }

    // Filter mock menu items for specific day
    const menuItems = mockMenuItems.filter(item =>
      item.dayOfWeek === day.toLowerCase() &&
      item.weekNumber === weekNumber &&
      item.year === year &&
      item.isActive
    );

    res.json({
      success: true,
      day,
      menuItems,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * POST /api/admin/menu
 * Créer un nouveau plat de menu
 */
export const createMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, dayOfWeek, quantityAvailable, category } = req.body;

    // Validation
    if (!name || !price || !dayOfWeek || quantityAvailable === undefined) {
      throw new AppError('Champs requis manquants', 400);
    }

    const { weekNumber, year } = getCurrentWeek();

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    // Create menu item in database
    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      imageUrl,
      dayOfWeek: dayOfWeek.toLowerCase(),
      weekNumber,
      year,
      quantityAvailable,
      category,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Plat créé avec succès',
      menuItem,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * PUT /api/admin/menu/:id
 * Modifier un plat de menu
 */
export const updateMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const menuItem = await MenuItem.findByIdAndUpdate(id, updates, { new: true });

    if (!menuItem) {
      throw new AppError('Plat introuvable', 404);
    }

    res.json({
      success: true,
      message: 'Plat mis à jour avec succès',
      menuItem,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * DELETE /api/admin/menu/:id
 * Supprimer un plat de menu
 */
export const deleteMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findByIdAndDelete(id);

    if (!menuItem) {
      throw new AppError('Plat introuvable', 404);
    }

    res.json({
      success: true,
      message: 'Plat supprimé avec succès',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * PATCH /api/admin/menu/:id/stock
 * Mettre à jour le stock d'un plat
 */
export const updateMenuItemStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantityAvailable } = req.body;

    if (quantityAvailable === undefined) {
      throw new AppError('Quantité requise', 400);
    }

    const menuItem = await MenuItem.findByIdAndUpdate(
      id,
      { quantityAvailable },
      { new: true }
    );

    if (!menuItem) {
      throw new AppError('Plat introuvable', 404);
    }

    res.json({
      success: true,
      message: 'Stock mis à jour',
      menuItem,
    });
  } catch (error) {
    throw error;
  }
};
