import api from './api';

export const studentService = {
  async getSavedHostels() {
    try {
      const response = await api.get('/favourites');
      return response.data;
    } catch (err) {
      console.warn('Backend favourites fetch failed, using fallback:', err.message);
      return { data: [] };
    }
  },

  async saveHostel(hostelId) {
    try {
      const response = await api.post(`/favourites/${hostelId}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to save favourite');
    }
  },

  async unsaveHostel(hostelId) {
    try {
      const response = await api.delete(`/favourites/${hostelId}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to remove favourite');
    }
  },

  async getRecentSearches() {
    try {
      const response = await api.get('/students/searches');
      return response.data;
    } catch (err) {
      console.warn('Backend searches query failed, using fallback:', err.message);
      return { data: [] };
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.put('/students/profile', profileData);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update student profile');
    }
  },
};

export default studentService;
