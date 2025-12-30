import api from './api';

const userService = {
  getByPhoneNumber: (phoneNumber) => {
    return api.get('/user/get-by-phonenumber', {
      params: { phonenumber: phoneNumber },
    });
  },

  upsertUserWithImage: (userPayload, imageFile) => {
    const formData = new FormData();

    formData.append('data', JSON.stringify(userPayload || {}));

    if (imageFile) {
      formData.append('image', imageFile);
    }

    return api.post('/user/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getProfile: (userId) => {
    return api.get(`/users/${userId || 'profile'}`);
  },

  updateProfile: (profileData) => {
    return api.put('/users/profile', profileData);
  },

  getFavorites: (params) => {
    return api.get('/api/favorites/get-favorite', { params });
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