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

  // ========== VENDEURS ==========

  // Récupérer tous les vendeurs
  getVendors: async () => {
    const response = await apiClient.get('/admin/vendors');
    return response.data;
  },

  // Créer un vendeur
  createVendor: async (data: any) => {
    const response = await apiClient.post('/admin/vendors', data);
    return response.data;
  },

  // Mettre à jour un vendeur
  updateVendor: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/vendors/${id}`, data);
    return response.data;
  },

  // Supprimer un vendeur
  deleteVendor: async (id: string) => {
    const response = await apiClient.delete(`/admin/vendors/${id}`);
    return response.data;
  },

  // Activer/Désactiver un vendeur
  toggleVendorStatus: async (id: string) => {
    const response = await apiClient.patch(`/admin/vendors/${id}/toggle-status`);
    return response.data;
  },

  // Obtenir les statistiques d'un vendeur
  getVendorStats: async (id: string) => {
    const response = await apiClient.get(`/admin/vendors/${id}/stats`);
    return response.data;
  },

  // Renouveler l'abonnement d'un vendeur
  renewVendorSubscription: async (id: string, data: any) => {
    const response = await apiClient.post(`/admin/vendors/${id}/renew-subscription`, data);
    return response.data;
  },

  // Vérifier l'état de l'abonnement d'un vendeur
  checkVendorSubscription: async (id: string) => {
    const response = await apiClient.get(`/admin/vendors/${id}/subscription`);
    return response.data;
  },

  // ========== CODES PROMO ==========

  // Récupérer tous les codes promo
  getPromoCodes: async () => {
    const response = await apiClient.get('/admin/loyalty/promo-codes');
    return response.data;
  },

  // Créer un code promo
  createPromoCode: async (data: any) => {
    const response = await apiClient.post('/admin/loyalty/promo-codes', data);
    return response.data;
  },

  // Mettre à jour un code promo
  updatePromoCode: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/loyalty/promo-codes/${id}`, data);
    return response.data;
  },

  // Supprimer un code promo
  deletePromoCode: async (id: string) => {
    const response = await apiClient.delete(`/admin/loyalty/promo-codes/${id}`);
    return response.data;
  },

  // Valider un code promo
  validatePromoCode: async (code: string, orderAmount: number) => {
    const response = await apiClient.post('/loyalty/validate', { code, orderAmount });
    return response.data;
  },

  // ========== FIDÉLITÉ ==========

  // Récupérer les paramètres de fidélité
  getLoyaltySettings: async () => {
    const response = await apiClient.get('/admin/loyalty/settings');
    return response.data;
  },

  // Mettre à jour le pourcentage de cashback
  updateCashbackPercentage: async (cashbackPercentage: number) => {
    const response = await apiClient.put('/admin/loyalty/cashback', { cashbackPercentage });
    return response.data;
  },
};
