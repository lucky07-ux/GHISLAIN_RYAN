import apiClient from './api';

export const adminService = {
  // Récupérer les statistiques du dashboard
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/stats/overview');
    return response.data;
  },

  // Récupérer les données de revenus
  getRevenueStats: async () => {
    const response = await apiClient.get('/admin/stats/revenue');
    return response.data;
  },

  // Récupérer les statistiques des commandes
  getOrdersStats: async () => {
    const response = await apiClient.get('/admin/stats/orders');
    return response.data;
  },

  // Récupérer tous les clients
  getCustomers: async (filters?: any) => {
    const response = await apiClient.get('/admin/customers', { params: filters });
    return response.data;
  },

  // Récupérer les détails d'un client
  getCustomer: async (id: string) => {
    const response = await apiClient.get(`/admin/customers/${id}`);
    return response.data;
  },

  // Récupérer les commandes d'un client
  getCustomerOrders: async (id: string) => {
    const response = await apiClient.get(`/admin/customers/${id}/orders`);
    return response.data;
  },

  // Récupérer les notifications
  getNotifications: async (filters?: any) => {
    const response = await apiClient.get('/admin/notifications', { params: filters });
    return response.data;
  },

  // Marquer une notification comme lue
  markNotificationAsRead: async (id: string) => {
    const response = await apiClient.patch(`/admin/notifications/${id}/read`);
    return response.data;
  },

  // Supprimer une notification
  deleteNotification: async (id: string) => {
    const response = await apiClient.delete(`/admin/notifications/${id}`);
    return response.data;
  },

  // Récupérer les paramètres
  getSettings: async () => {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  // Mettre à jour les paramètres
  updateSettings: async (settings: any) => {
    const response = await apiClient.put('/settings', settings);
    return response.data;
  },
};
