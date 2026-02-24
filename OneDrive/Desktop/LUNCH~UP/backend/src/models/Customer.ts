import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerDoc extends Document {
  name: string;
  phone: string;
  email?: string;
  addresses?: {
    type: string;
    address: string;
    isDefault: boolean;
  }[];
  stats: {
    totalOrders: number;
    totalSpent: number;
    lastOrderDate?: Date;
  };
  createdAt: Date;
}

const customerSchema = new Schema<ICustomerDoc>(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: String,
    addresses: [
      {
        type: String,
        address: String,
        isDefault: Boolean,
      },
    ],
    stats: {
      totalOrders: {
        type: Number,
        default: 0,
      },
      totalSpent: {
        type: Number,
        default: 0,
      },
      lastOrderDate: Date,
    },
  },
  { timestamps: true }
);

// Index pour recherche
customerSchema.index({ email: 1 });

export const Customer = mongoose.model<ICustomerDoc>('Customer', customerSchema);
