import mongoose, { Schema, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface ICustomerDoc extends Document {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: 'user';
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
  walletBalance: number;
  cashbackHistory: {
    date: Date;
    amount: number;
    type: 'earned' | 'used';
    orderId?: string;
    description: string;
  }[];
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  addCashback(amount: number, orderId: string): Promise<void>;
  useCashback(amount: number, orderId: string): Promise<void>;
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
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user'],
      default: 'user',
    },
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
    walletBalance: {
      type: Number,
      default: 0,
      min: [0, 'Solde ne peut pas être négatif'],
    },
    cashbackHistory: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        amount: {
          type: Number,
          required: true,
        },
        type: {
          type: String,
          enum: ['earned', 'used'],
          required: true,
        },
        orderId: {
          type: String,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
    points: {
      total: {
        type: Number,
        default: 0,
        min: 0,
      },
      level: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum'],
        default: 'bronze',
      },
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
  },
  { timestamps: true }
);

// Hash password before saving
customerSchema.pre<ICustomerDoc>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as any);
  }
});

// Method to compare passwords
customerSchema.methods.comparePassword = function (candidate: string) {
  return bcryptjs.compare(candidate, this.password);
};

// Method to add cashback
customerSchema.methods.addCashback = async function (amount: number, orderId: string) {
  this.walletBalance += amount;
  this.cashbackHistory.push({
    date: new Date(),
    amount,
    type: 'earned',
    orderId,
    description: `Cashback reçu pour commande #${orderId}`,
  });
  return this.save();
};

// Method to use cashback
customerSchema.methods.useCashback = async function (amount: number, orderId: string) {
  if (this.walletBalance < amount) {
    throw new Error('Solde cashback insuffisant');
  }
  this.walletBalance -= amount;
  this.cashbackHistory.push({
    date: new Date(),
    amount,
    type: 'used',
    orderId,
    description: `Cashback utilisé pour commande #${orderId}`,
  });
  return this.save();
};

// Loyalty methods
customerSchema.methods.updateLevel = async function () {
  const levels = [
    { points: 0, level: 'bronze' },
    { points: 500, level: 'silver' },
    { points: 2000, level: 'gold' },
    { points: 5000, level: 'platinum' },
  ];
  const levelObj = levels.find(l => this.points.total >= l.points) || levels[0];
  this.points.level = levelObj.level;
  return this.save();
};

customerSchema.methods.awardPoints = async function (points: number, type: string, reason: string, orderId?: string) {
  this.points.total += points;
  await this.updateLevel();
  const PointsTransaction = mongoose.models.PointsTransaction as any;
  const transaction = new PointsTransaction({
    userId: this._id,
    points,
    type: type as any,
    reason,
    orderId,
  });
  await transaction.save();
  return this.save();
};

// Index pour recherche
customerSchema.index({ email: 1 });

export const Customer = mongoose.model<ICustomerDoc>('Customer', customerSchema);
