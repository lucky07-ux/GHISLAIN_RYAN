import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryDriverDoc extends Document {
  name: string;
  phone: string;
  email?: string;
  address: string;
  zones: string[];
  vehicleType: 'moto' | 'vélo' | 'voiture';
  photoUrl?: string;
  isActive: boolean;
  stats: {
    totalDeliveries: number;
    todayDeliveries: number;
    successRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const deliveryDriverSchema = new Schema<IDeliveryDriverDoc>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    zones: {
      type: [String],
      required: true,
      validate: {
        validator: function(v: string[]) {
          return v.length > 0;
        },
        message: 'Au moins une zone doit être spécifiée'
      }
    },
    vehicleType: {
      type: String,
      enum: ['moto', 'vélo', 'voiture'],
      required: true,
    },
    photoUrl: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    stats: {
      totalDeliveries: {
        type: Number,
        default: 0,
      },
      todayDeliveries: {
        type: Number,
        default: 0,
      },
      successRate: {
        type: Number,
        default: 100,
        min: 0,
        max: 100,
      },
    },
  },
  { timestamps: true }
);

// Index pour recherche rapide
deliveryDriverSchema.index({ isActive: 1 });
deliveryDriverSchema.index({ zones: 1 });
deliveryDriverSchema.index({ createdAt: -1 });

export const DeliveryDriver = mongoose.model<IDeliveryDriverDoc>('DeliveryDriver', deliveryDriverSchema);
