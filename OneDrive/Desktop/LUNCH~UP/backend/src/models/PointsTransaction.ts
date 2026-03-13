import mongoose, { Schema, Document } from 'mongoose';

export interface IPointsTransactionDoc extends Document {
  userId: mongoose.Types.ObjectId;
  points: number;
  type: 'order_reward' | 'referral_reward' | 'promotion_bonus';
  reason: string;
  orderId?: mongoose.Types.ObjectId;
  refCode?: string;
  createdAt: Date;
}

const pointsTransactionSchema = new Schema<IPointsTransactionDoc>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true,
  },
  points: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['order_reward', 'referral_reward', 'promotion_bonus'],
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  refCode: {
    type: String,
  },
}, { timestamps: true });

pointsTransactionSchema.index({ userId: 1, createdAt: -1 });
pointsTransactionSchema.index({ type: 1 });

export const PointsTransaction = mongoose.model<IPointsTransactionDoc>('PointsTransaction', pointsTransactionSchema);
