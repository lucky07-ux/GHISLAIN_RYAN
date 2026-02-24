import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewDoc extends Document {
  customerName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  isPinned: boolean;
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

const reviewSchema = new Schema<IReviewDoc>(
  {
    customerName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    helpful: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    approvedAt: Date,
    approvedBy: String,
  },
  { timestamps: true }
);

// Index pour recherche
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ rating: 1 });

export const Review = mongoose.model<IReviewDoc>('Review', reviewSchema);
