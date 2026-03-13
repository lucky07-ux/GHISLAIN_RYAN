import apiClient from './api';

export const walletService = {
  // Récupérer le solde du portefeuille
  getWalletBalance: async () => {
    const response = await apiClient.get('/admin/customers/wallet');
    return response.data;
  },

  // Récupérer l'historique des transactions cashback
  getCashbackHistory: async () => {
    const response = await apiClient.get('/admin/customers/cashback-history');
    return response.data;
  },

  // Utiliser du cashback
  useCashback: async (amount: number, orderId: string) => {
    const response = await apiClient.post('/admin/customers/use-cashback', {
      amount,
      orderId,
    });
    return response.data;
  },
};
