// Types globaux pour l'application backend

export interface IUser {
  _id?: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'super_admin' | 'vendor' | 'user';
  createdAt?: Date;
  lastLogin?: Date;
}

export interface IMenuItem {
  _id?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder {
  _id?: string;
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
  items: IOrderItem[];
  pricing: {
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
  payment: {
    method: 'orange_money' | 'mtn_momo' | 'cash';
    phoneNumber?: string;
    status: 'pending' | 'paid' | 'failed';
    paidAt?: Date;
  };
  specialInstructions?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusHistory: {
    status: string;
    timestamp: Date;
    updatedBy?: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICustomer {
  _id?: string;
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
  walletBalance: number;
  cashbackHistory: {
    date: Date;
    amount: number;
    type: 'earned' | 'used';
    orderId?: string;
    description: string;
  }[];
  points: {
    total: number;
    level: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
  referralCode: string;
  referredBy?: string;
  createdAt?: Date;
}

export interface IUserCustomer extends ICustomer {
  role: 'user';
  password: string;
}

export interface IReview {
  _id?: string;
  customerName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  isPinned: boolean;
  createdAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface INotification {
  _id?: string;
  type: 'new_order' | 'payment_received' | 'new_review' | 'low_stock';
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt?: Date;
}

export interface ISettings {
  _id?: string;
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
  updatedAt?: Date;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: 'admin' | 'super_admin' | 'vendor' | 'user';
}

export interface AuthRequest {
  email?: string;
  phone?: string;
  password: string;
  role: 'admin' | 'super_admin' | 'vendor' | 'user';
}
