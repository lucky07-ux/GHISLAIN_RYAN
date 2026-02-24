import apiClient from './api';
import type { MenuItem } from '../types/index';

export const menuService = {
  // Récupérer le menu actuel
  getCurrentMenu: async () => {
    const response = await apiClient.get('/menu/current');
    return response.data;
  },

  // Récupérer le menu d'un jour
  getMenuByDay: async (day: string) => {
    const response = await apiClient.get(`/menu/${day}`);
    return response.data;
  },

  // Admin: Créer un plat
  createMenuItem: async (data: Partial<MenuItem> | FormData) => {
    const isFormData = data instanceof FormData;
    const response = await apiClient.post('/menu', data, {
      headers: isFormData ? {
        'Content-Type': 'multipart/form-data',
      } : undefined,
    });
    return response.data;
  },

  // Admin: Modifier un plat
  updateMenuItem: async (id: string, data: Partial<MenuItem>) => {
    const response = await apiClient.put(`/menu/${id}`, data);
    return response.data;
  },

  // Admin: Supprimer un plat
  deleteMenuItem: async (id: string) => {
    const response = await apiClient.delete(`/menu/${id}`);
    return response.data;
  },

  // Admin: Mettre à jour le stock
  updateStock: async (id: string, quantity: number) => {
    const response = await apiClient.patch(`/menu/${id}/stock`, { quantityAvailable: quantity });
    return response.data;
  },
};
