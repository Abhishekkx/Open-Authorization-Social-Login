import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add correlation ID to requests
api.interceptors.request.use((config) => {
  config.headers['X-Correlation-ID'] = crypto.randomUUID();
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if it's already a retry, or if it's the refresh endpoint itself
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;

      try {
        await api.post('/api/auth/refresh');
        return api(originalRequest);
      } catch (refreshError) {
        // Silently fail - user just isn't logged in
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  getCurrentUser: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
  initiateGoogleLogin: (returnTo = '/') => {
    window.location.href = `${API_URL}/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
  },
  initiateFacebookLogin: (returnTo = '/') => {
    window.location.href = `${API_URL}/api/auth/facebook?returnTo=${encodeURIComponent(returnTo)}`;
  }
};

export const userAPI = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data) => api.put('/api/user/profile', data),
  linkProvider: (provider) => api.post(`/api/user/link/${provider}`),
  unlinkProvider: (provider) => api.delete(`/api/user/unlink/${provider}`),
  getAuthLogs: () => api.get('/api/user/auth-logs')
};

export default api;
