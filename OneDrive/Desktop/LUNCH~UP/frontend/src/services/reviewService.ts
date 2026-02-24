import apiClient from './api';
import type { Review } from '../types/index';

export const reviewService = {
  // Récupérer les avis approuvés
  getApprovedReviews: async () => {
    const response = await apiClient.get('/reviews');
    return response.data;
  },

  // Soumettre un avis
  submitReview: async (review: Partial<Review>) => {
    const response = await apiClient.post('/reviews', review);
    return response.data;
  },

  // Admin: Récupérer tous les avis
  getAllReviews: async (filters?: any) => {
    const response = await apiClient.get('/reviews/all', { params: filters });
    return response.data;
  },

  // Admin: Approuver un avis
  approveReview: async (id: string) => {
    const response = await apiClient.patch(`/reviews/${id}/approve`);
    return response.data;
  },

  // Admin: Rejeter un avis
  rejectReview: async (id: string) => {
    const response = await apiClient.patch(`/reviews/${id}/reject`);
    return response.data;
  },

  // Admin: Supprimer un avis
  deleteReview: async (id: string) => {
    const response = await apiClient.delete(`/reviews/${id}`);
    return response.data;
  },

  // Admin: Épingler un avis
  pinReview: async (id: string) => {
    const response = await apiClient.patch(`/reviews/${id}/pin`);
    return response.data;
  },
};
