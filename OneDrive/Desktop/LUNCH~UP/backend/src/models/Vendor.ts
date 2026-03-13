import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IVendorDoc extends Document {
  name: string;
  phone: string;
  email: string;
  password: string;
  packType: 'standard' | 'boost' | 'premium';
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  subscriptionEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  isSubscriptionActive(): boolean;
}

const vendorSchema = new Schema<IVendorDoc>(
  {
    name: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['vendor'],
      default: 'vendor',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    packType: {
      type: String,
      enum: ['standard', 'boost', 'premium'],
      default: 'standard',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },
    subscriptionEndDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
    },
  },
  { timestamps: true }
);

// hash password before saving
vendorSchema.pre<IVendorDoc>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as any);
  }
});

// method to compare passwords
vendorSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

// method to check if subscription is active
vendorSchema.methods.isSubscriptionActive = function () {
  if (!this.subscriptionEndDate) return true;
  return new Date() < this.subscriptionEndDate;
};

export const Vendor = mongoose.model<IVendorDoc>('Vendor', vendorSchema);
