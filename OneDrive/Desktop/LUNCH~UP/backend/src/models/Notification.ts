import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDoc extends Document {
  type: 'new_order' | 'payment_received' | 'new_review' | 'low_stock';
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotificationDoc>(
  {
    type: {
      type: String,
      enum: ['new_order', 'payment_received', 'new_review', 'low_stock', 'order_status_update', 'customer_notification'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: String,
    isRead: {
      type: Boolean,
      default: false,
    },
    recipientType: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'admin',
    },
    recipientId: String,
  },
  { timestamps: true }
);

// Index pour recherche rapide
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotificationDoc>('Notification', notificationSchema);
