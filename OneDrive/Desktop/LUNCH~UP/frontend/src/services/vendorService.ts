import apiClient from './api';

export const vendorService = {
  addMenuItem: async (data: any) => {
    const response = await apiClient.post('/vendor/menu', data);
    return response.data;
  },
  updateMenuItem: async (id: string, data: any) => {
    const response = await apiClient.put(`/vendor/menu/${id}`, data);
    return response.data;
  },
  getVendorOrders: async () => {
    const response = await apiClient.get('/vendor/orders');
    return response.data;
  },
  updateOrderStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/vendor/orders/${id}/status`, { status });
    return response.data;
  },
  // Promotions (uses /api/loyalty endpoints)
  getPromotions: async () => {
    const response = await apiClient.get('/loyalty/promo-codes');
    return response.data;
  },
  createPromotion: async (data: any) => {
    const response = await apiClient.post('/loyalty/promo-codes', data);
    return response.data;
  },
  updatePromotion: async (id: string, data: any) => {
    const response = await apiClient.put(`/loyalty/promo-codes/${id}`, data);
    return response.data;
  },
  deletePromotion: async (id: string) => {
    const response = await apiClient.delete(`/loyalty/promo-codes/${id}`);
    return response.data;
  },

  // Customers
  getCustomers: async () => {
    const response = await apiClient.get('/vendor/customers');
    return response.data;
  },
};
