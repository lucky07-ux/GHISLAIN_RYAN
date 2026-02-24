import { Request, Response } from 'express';
import { Review } from '../models/Review.js';
import { Notification } from '../models/Notification.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * GET /api/reviews
 * Récupérer tous les avis approuvés
 */
export const getApprovedReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt' } = req.query;

    const skip = ((Number(page) || 1) - 1) * (Number(limit) || 10);

    const reviews = await Review.find({ status: 'approved', isPinned: true })
      .sort({ createdAt: -1 })
      .limit(10);

    const otherReviews = await Review.find({ status: 'approved', isPinned: false })
      .sort({ [String(sort)]: -1 })
      .skip(skip)
      .limit(Number(limit) || 10);

    const allReviews = [...reviews, ...otherReviews];

    // Calculer la note moyenne
    const allApproved = await Review.find({ status: 'approved' });
    const averageRating =
      allApproved.length > 0
        ? (allApproved.reduce((sum, r) => sum + r.rating, 0) / allApproved.length).toFixed(1)
        : 0;

    const total = await Review.countDocuments({ status: 'approved' });

    res.json({
      success: true,
      averageRating,
      reviews: allReviews,
      pagination: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * POST /api/reviews
 * Soumettre un nouvel avis
 */
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, rating, comment } = req.body;

    // Validation
    if (!customerName || !rating || !comment) {
      throw new AppError('Données requises manquantes', 400);
    }

    if (rating < 1 || rating > 5) {
      throw new AppError('La note doit être entre 1 et 5', 400);
    }

    const review = new Review({
      customerName,
      rating,
      comment,
      status: 'pending', // En attente de modération
      helpful: 0,
      isPinned: false,
    });

    await review.save();

    // Créer une notification pour l'admin
    const notification = new Notification({
      type: 'new_review',
      title: 'Nouvel avis à modérer',
      message: `${customerName} a laissé un avis`,
      relatedId: review._id?.toString(),
      isRead: false,
    });
    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Avis soumis avec succès. Il sera publié après modération.',
      review,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/admin/reviews
 * Récupérer tous les avis (pour admin)
 */
export const getAllReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, rating, page = 1, limit = 10 } = req.query;

    const skip = ((Number(page) || 1) - 1) * (Number(limit) || 10);

    const filters: any = {};
    if (status) filters.status = status;
    if (rating) filters.rating = Number(rating);

    const reviews = await Review.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit) || 10);

    const total = await Review.countDocuments(filters);

    res.json({
      success: true,
      reviews,
      pagination: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * PATCH /api/admin/reviews/:id/approve
 * Approuver un avis
 */
export const approveReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: req.user?.id,
      },
      { new: true }
    );

    if (!review) {
      throw new AppError('Avis introuvable', 404);
    }

    res.json({
      success: true,
      message: 'Avis approuvé',
      review,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * PATCH /api/admin/reviews/:id/reject
 * Rejeter un avis
 */
export const rejectReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true }
    );

    if (!review) {
      throw new AppError('Avis introuvable', 404);
    }

    res.json({
      success: true,
      message: 'Avis rejeté',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * DELETE /api/admin/reviews/:id
 * Supprimer un avis
 */
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      throw new AppError('Avis introuvable', 404);
    }

    res.json({
      success: true,
      message: 'Avis supprimé',
    });
  } catch (error) {
    throw error;
  }
};

/**
 * PATCH /api/admin/reviews/:id/pin
 * Épingler un avis
 */
export const pinReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { isPinned: true },
      { new: true }
    );

    if (!review) {
      throw new AppError('Avis introuvable', 404);
    }

    res.json({
      success: true,
      message: 'Avis épinglé',
      review,
    });
  } catch (error) {
    throw error;
  }
};
