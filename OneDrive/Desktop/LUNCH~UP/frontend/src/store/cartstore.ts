import { create } from 'zustand';
import type { CartItem } from '../types/index';

export interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: JSON.parse(localStorage.getItem('cart') || '[]'),

  addItem: (item: CartItem) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.menuItemId === item.menuItemId);
      let newItems: CartItem[];

      if (existingItem) {
        newItems = state.items.map((i) =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        newItems = [...state.items, item];
      }

      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  removeItem: (menuItemId: string) => {
    set((state) => {
      const newItems = state.items.filter((i) => i.menuItemId !== menuItemId);
      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  updateQuantity: (menuItemId: string, quantity: number) => {
    set((state) => {
      let newItems: CartItem[];

      if (quantity <= 0) {
        newItems = state.items.filter((i) => i.menuItemId !== menuItemId);
      } else {
        newItems = state.items.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity } : i
        );
      }

      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  clearCart: () => {
    set(() => {
      localStorage.removeItem('cart');
      return { items: [] };
    });
  },

  getSubtotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const deliveryFee = subtotal > 0 ? 1000 : 0;
    return subtotal + deliveryFee;
  },
}));
