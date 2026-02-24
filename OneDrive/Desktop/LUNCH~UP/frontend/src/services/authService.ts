import { HandHeart } from 'lucide-react';
import apiClient from './api';
import { jsxDEV } from 'react/jsx-dev-runtime';

export const authService = {
  // Se connecter
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/admin/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Se déconnecter
  logout: async () => {
    await apiClient.post('/admin/logout');
    localStorage.removeItem('token');
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: async () => {
    const response = await apiClient.get('/admin/me');
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
