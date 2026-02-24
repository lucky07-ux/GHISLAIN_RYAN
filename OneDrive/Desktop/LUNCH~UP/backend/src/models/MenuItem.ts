import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItemDoc extends Document {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  dayOfWeek: 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi';
  weekNumber: number;
  year: number;
  quantityAvailable: number;
  category?: string;
  accompaniments?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItemDoc>(
  {
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      trim: true,
    },
    description: String,
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    imageUrl: String,
    dayOfWeek: {
      type: String,
      enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
      required: true,
    },
    weekNumber: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    quantityAvailable: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    category: String,
    accompaniments: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index pour recherche rapide par jour et semaine
menuItemSchema.index({ dayOfWeek: 1, weekNumber: 1, year: 1 });

export const MenuItem = mongoose.model<IMenuItemDoc>('MenuItem', menuItemSchema);
