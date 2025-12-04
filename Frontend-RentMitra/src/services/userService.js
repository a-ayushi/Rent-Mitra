import api from './api';

const userService = {
  getProfile: (userId) => {
    return api.get(`/users/${userId || 'profile'}`);
  },

  updateProfile: (profileData) => {
    return api.put('/users/profile', profileData);
  },

  getFavorites: (params) => {
    return api.get('/users/favorites', { params });
  },

  getReviews: (userId, params) => {
    return api.get(`/users/${userId || ''}/reviews`, { params });
  },

  updatePreferences: (preferences) => {
    return api.put('/users/preferences', preferences);
  },

  verifyIdentity: (formData) => {
    return api.post('/users/verify-identity', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  getDashboard: () => {
    return api.get('/users/dashboard');
  },

  deleteAccount: (password) => {
    return api.delete('/users/account', { data: { password } });
  },

  incrementProfileViews: (userId) => {
    return api.post(`/users/${userId}/view`);
  }
};

export default userService;