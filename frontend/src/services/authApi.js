import api from './api';

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/signup', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/me', userData),
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => 
    api.post('/auth/reset-password', { token, new_password: newPassword }),
  logout: () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    return Promise.resolve();
  },
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerificationEmail: () => api.post('/auth/verify-email/resend')
};

export default authApi;
