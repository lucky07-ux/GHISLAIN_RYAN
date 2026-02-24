import mongoose, { Schema, Document } from 'mongoose';

export interface ISettingsDoc extends Document {
  businessInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
    hours: string;
  };
  pricing: {
    deliveryFee: number;
    freeDeliveryThreshold?: number;
  };
  payment: {
    orangeMoneyNumber: string;
    mtnMomoNumber: string;
  };
  notifications: {
    emailEnabled: boolean;
    emailAddress?: string;
    smsEnabled: boolean;
  };
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettingsDoc>(
  {
    businessInfo: {
      name: String,
      phone: String,
      email: String,
      address: String,
      hours: String,
    },
    pricing: {
      deliveryFee: Number,
      freeDeliveryThreshold: Number,
    },
    payment: {
      orangeMoneyNumber: String,
      mtnMomoNumber: String,
    },
    notifications: {
      emailEnabled: Boolean,
      emailAddress: String,
      smsEnabled: Boolean,
    },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettingsDoc>('Settings', settingsSchema);
