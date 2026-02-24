import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderDoc extends Document {
  orderNumber: string;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  deliveryInfo: {
    type: 'campus' | 'office' | 'residence' | 'other';
    address: string;
    instructions?: string;
  };
  items: {
    menuItemId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
  }[];
  pricing: {
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
  payment: {
    method: 'orange_money' | 'mtn_momo' | 'card' | 'cash';
    phoneNumber?: string;
    status: 'pending' | 'paid' | 'failed';
    paidAt?: Date;
    reference?: string;
    channel?: string;
  };
  specialInstructions?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusHistory: {
    status: string;
    timestamp: Date;
    updatedBy?: string;
  }[];
  assignedDriver?: {
    driverId: mongoose.Types.ObjectId;
    name: string;
    phone: string;
    assignedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrderDoc>(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customerInfo: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: String,
    },
    deliveryInfo: {
      type: {
        type: String,
        enum: ['campus', 'office', 'residence', 'other'],
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      instructions: String,
    },
    items: [
      {
        menuItemId: mongoose.Schema.Types.ObjectId,
        name: String,
        price: Number,
        quantity: {
          type: Number,
          min: 1,
        },
      },
    ],
    pricing: {
      subtotal: Number,
      deliveryFee: Number,
      total: Number,
    },
    payment: {
      method: {
        type: String,
        enum: ['orange_money', 'mtn_momo', 'card', 'cash'],
        required: true,
      },
      phoneNumber: String,
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
      },
      paidAt: Date,
      reference: String,
      channel: String,
    },
    specialInstructions: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: String,
      },
    ],
  },
  { timestamps: true }
);

// Index pour recherche rapide
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrderDoc>('Order', orderSchema);
