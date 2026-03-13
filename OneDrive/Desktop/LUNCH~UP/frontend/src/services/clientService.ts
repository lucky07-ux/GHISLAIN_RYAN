import apiClient from './api';

export const clientService = {
  getVendors: async () => {
    const response = await apiClient.get('/client/vendors');
    return response.data;
  },

  getVendor: async (vendorId: string) => {
    const response = await apiClient.get(`/client/vendors/${vendorId}`);
    return response.data;
  },

  getVendorMenu: async (vendorId: string) => {
    const response = await apiClient.get(`/client/vendors/${vendorId}/menu`);
    return response.data;
  },

  getProfile: async (phone: string) => {
    const response = await apiClient.get('/client/profile', { params: { phone } });
    return response.data;
  },

  createOrder: async (payload: any) => {
    const response = await apiClient.post('/client/orders', payload);
    return response.data;
  },

  getMyOrders: async (phone: string) => {
    const response = await apiClient.get('/client/orders', { params: { phone } });
    return response.data;
  },
};
