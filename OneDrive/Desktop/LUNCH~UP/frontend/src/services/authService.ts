import { HandHeart } from 'lucide-react';
import apiClient from './api';
import { jsxDEV } from 'react/jsx-dev-runtime';

export interface AuthCredentials {
  email?: string;
  phone?: string;
  password: string;
  role: 'admin' | 'super_admin' | 'vendor' | 'user';
}

export const authService = {
  // Se connecter
  login: async (creds: AuthCredentials) => {
    const response = await apiClient.post('/auth/login', creds);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Se déconnecter
  logout: async () => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('token');
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Récupérer le token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
