import mongoose, { Schema, Document } from 'mongoose';

export interface IPromoCodeDoc extends Document {
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number; // Pourcentage ou montant fixe
  minOrderValue: number; // Montant minimum de commande
  maxDiscount?: number; // Réduction max (pour pourcentage)
  usageLimit?: number; // Nombre total d'utilisations
  usageCount: number; // Nombre actuel d'utilisations
  expiresAt?: Date;
  isActive: boolean;
  createdBy: string; // Admin user ID
  createdAt: Date;
  updatedAt: Date;
}

const promoCodeSchema = new Schema<IPromoCodeDoc>(
  {
    code: {
      type: String,
      required: [true, 'Code promo requis'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    value: {
      type: Number,
      required: [true, 'Valeur requise'],
      min: [0, 'La valeur ne peut pas être négative'],
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, 'Montant minimum ne peut pas être négatif'],
    },
    maxDiscount: Number,
    usageLimit: Number,
    usageCount: {
      type: Number,
      default: 0,
    },
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const PromoCode = mongoose.model<IPromoCodeDoc>('PromoCode', promoCodeSchema);
