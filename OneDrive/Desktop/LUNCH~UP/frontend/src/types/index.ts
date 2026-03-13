// Types du frontend

export interface MenuItem {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  imageData?: string;
  dayOfWeek: string;
  quantityAvailable: number;
  category?: string;
  accompaniments?: string;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface DeliveryInfo {
  type: 'campus' | 'office' | 'residence' | 'other';
  address: string;
  instructions?: string;
}

export interface PaymentInfo {
  method: 'orange_money' | 'mtn_momo' | 'card' | 'cash';
  phoneNumber?: string;
}

export interface Order {
  orderNumber?: string;
  customerInfo: CustomerInfo;
  deliveryInfo: DeliveryInfo;
  items: CartItem[];
  payment: PaymentInfo;
  specialInstructions?: string;
}

export interface Review {
  _id?: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt?: string;
  helpful?: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  address?: string;
  image?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
