import { Request, Response } from 'express';
import { Notification } from '../models/Notification.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * GET /api/admin/notifications
 * Récupérer les notifications admin
 */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isRead, page = 1, limit = 20 } = req.query;

    const skip = ((Number(page) || 1) - 1) * (Number(limit) || 20);

    const filters: any = {};
    if (isRead !== undefined) filters.isRead = isRead === 'true';

    const notifications = await Notification.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit) || 20);

    const total = await Notification.countDocuments(filters);
    const unread = await Notification.countDocuments({ isRead: false });

    res.json({
      success: true,
      notifications,
      unread,
      pagination: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * PATCH /api/admin/notifications/:id/read
 * Marquer une notification comme lue
 */
export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new AppError('Notification introuvable', 404);
    }

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * DELETE /api/admin/notifications/:id
 * Supprimer une notification
 */
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      throw new AppError('Notification introuvable', 404);
    }

    res.json({
      success: true,
      message: 'Notification supprimée',
    });
  } catch (error) {
    throw error;
  }
};
