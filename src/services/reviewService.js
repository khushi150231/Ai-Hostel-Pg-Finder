import api from './api';
import { MOCK_REVIEWS } from '../data/mockData';

export const reviewService = {
  async getReviews(hostelId) {
    try {
      const response = await api.get(`/reviews/${hostelId}`);
      return response.data;
    } catch (err) {
      console.warn('Backend reviews query failed, using fallback:', err.message);
      const reviews = MOCK_REVIEWS.filter((r) => r.hostelId === Number(hostelId) || r.hostelId === hostelId);
      return { data: reviews };
    }
  },

  async addReview(hostelId, reviewData) {
    try {
      const response = await api.post('/reviews', { hostelId, ...reviewData });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to submit review');
    }
  },

  async updateReview(reviewId, updateData) {
    try {
      const response = await api.put(`/reviews/${reviewId}`, updateData);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update review');
    }
  },

  async deleteReview(reviewId) {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete review');
    }
  },
};

export default reviewService;
