import { create } from 'zustand';
import type { AdminUser } from '../types/index';
import { authService } from '../services/authService';

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: AdminUser | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(email, password);
      set({
        user: response.user,
        token: response.token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Erreur de connexion',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
      localStorage.removeItem('token');
      set({ user: null, token: null });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  loadUser: async () => {
    if (!localStorage.getItem('token')) {
      return;
    }

    set({ isLoading: true });
    try {
      const response = await authService.getCurrentUser();
      set({
        user: response.user,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      localStorage.removeItem('token');
    }
  },

  setUser: (user: AdminUser | null) => {
    set({ user });
  },
}));
