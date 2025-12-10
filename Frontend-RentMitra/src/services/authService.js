import api from './api';

const authService = {
  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  // Send OTP to phone
  sendOtp: (phone) => {
    return api.get(`/api/client/auth/requestOtp/${phone}`);
  },

  // Verify OTP for phone login
  verifyOtp: (phone, otp) => {
    return api.post('/api/client/auth/verifyOtp/', { otp, phoneNo: phone });
  },

  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  logout: (refreshToken) => {
    return api.post('/auth/logout', { refreshToken });
  },

  forgotPassword: (emailOrPhone) => {
    return api.post('/auth/forgot-password', { emailOrPhone });
  },

  resetPassword: (userId, otp, newPassword) => {
    return api.post('/auth/reset-password', { userId, otp, newPassword });
  },

  refreshToken: (refreshToken) => {
    return api.post('/auth/refresh-token', { refreshToken });
  },

  getProfile: () => {
    return api.get('/users/profile');
  }
};

export default authService;