import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Destinations API
export const destinationsApi = {
  getAll: (params = {}) => api.get('/destinations', { params }),
  getPopular: () => api.get('/destinations/popular'),
  search: (query) => api.get(`/destinations/search?q=${encodeURIComponent(query)}`),
  getById: (id) => api.get(`/destinations/${id}`),
};

// Trips API
export const tripsApi = {
  getTrips: (params = {}) => api.get('/trips', { params }),
  getPackages: (params = {}) => api.get('/packages', { params }),
  getTrip: (id) => api.get(`/trips/${id}`),
  createTrip: (data) => api.post('/trips', data),
  updateTrip: (id, data) => api.put(`/trips/${id}`, data),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
  getTripStops: (tripId) => api.get(`/trips/${tripId}/stops`),
  getRecentTrips: () => api.get('/trips/recent'),
  bookPackage: (data) => api.post('/trips/user/book', data),
};

// User API
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getSavedDestinations: () => api.get('/user/saved-destinations'),
  saveDestination: (destinationId) => api.post(`/user/saved-destinations/${destinationId}`),
  removeSavedDestination: (destinationId) => api.delete(`/user/saved-destinations/${destinationId}`),
};

export default api;
