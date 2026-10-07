import api from './api';

export const authService = {
  async login(credentials) {
    const { email, password } = credentials;
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (err) {
      // If backend network error / offline, provide fallback for demo accounts
      if (!err.response || err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        console.warn('[Auth Service] Backend offline, applying demo fallback credentials');
        const cleanEmail = (email || '').toLowerCase().trim();

        if (cleanEmail === 'student@test.com' && password === 'password') {
          return {
            success: true,
            token: 'demo_jwt_token_student_vadodara_2026',
            user: {
              id: 'demo_student_id',
              name: 'Arjun Patel',
              email: 'student@test.com',
              role: 'STUDENT',
              college: 'Parul University',
              course: 'B.Tech Computer Science',
              year: '2nd Year',
              budget: 7000,
            },
          };
        } else if (cleanEmail === 'admin@test.com' && password === 'admin123') {
          return {
            success: true,
            token: 'demo_jwt_token_admin_vadodara_2026',
            user: {
              id: 'demo_admin_id',
              name: 'StayNear Administrator',
              email: 'admin@test.com',
              role: 'ADMIN',
            },
          };
        }
      }

      const errorMsg =
        err.response?.data?.message || err.message || 'Invalid email or password';
      throw new Error(errorMsg);
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        return {
          success: true,
          token: `demo_jwt_token_${Date.now()}`,
          user: {
            id: `student_${Date.now()}`,
            name: userData.fullName || userData.name || 'New Student',
            email: userData.email,
            role: userData.role?.toUpperCase() || 'STUDENT',
            college: userData.college || 'Parul University',
            course: userData.course || 'B.Tech',
            year: userData.year || '1st Year',
            budget: userData.budgetMax || 7000,
          },
        };
      }
      const errorMsg =
        err.response?.data?.message || err.message || 'Registration failed';
      throw new Error(errorMsg);
    }
  },

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    return { success: true };
  },

  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        return {
          success: true,
          message: 'Password reset link dispatched to email (Demo Mode).',
        };
      }
      throw new Error(err.response?.data?.message || 'Failed to send reset link');
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        return {
          success: true,
          message: 'Password updated successfully.',
        };
      }
      throw new Error(err.response?.data?.message || 'Password reset failed');
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (err) {
      const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (saved) return JSON.parse(saved);
      throw new Error(err.response?.data?.message || 'Failed to fetch user profile');
    }
  },
};

export default authService;
