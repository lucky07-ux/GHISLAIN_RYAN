import apiClient from './api';
import type { Order } from '../types/index';

export const orderService = {
  // Créer une commande
  createOrder: async (orderData: Order) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  // Suivre une commande par orderNumber (public)
  trackOrder: async (orderNumber: string) => {
    const response = await apiClient.get(`/orders/track/${orderNumber}`);
    return response.data;
  },

  // Admin: Récupérer toutes les commandes
  getAllOrders: async (filters?: any) => {
    const response = await apiClient.get('/orders', { params: filters });
    return response.data;
  },

  // Admin: Récupérer les détails d'une commande
  getOrderById: async (id: string) => {
    const response = await apiClient.get(`/orders/details/${id}`);
    return response.data;
  },

  // Admin: Mettre à jour le statut
  updateOrderStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Admin: Supprimer une commande
  deleteOrder: async (id: string) => {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
  },

  // Admin: Confirmer une commande
  confirmOrder: async (id: string) => {
    const response = await apiClient.patch(`/orders/${id}/confirm`);
    return response.data;
  },

  // Admin: Confirmer le paiement
  confirmPayment: async (id: string) => {
    const response = await apiClient.patch(`/orders/${id}/payment/confirm`);
    return response.data;
  },

  // Initier le paiement
  initiatePayment: async (orderId: string) => {
    const response = await apiClient.post(`/orders/${orderId}/payment/initiate`);
    return response.data;
  },
};
