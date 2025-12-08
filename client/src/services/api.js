import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token
API.interceptors.request.use(
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
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const mediaAPI = {
  // Get all videos
  getAllVideos: (params) => API.get('/media', { params }),
  
  // Get single video
  getVideoById: (id) => API.get(`/media/${id}`),
  
  // Upload video
  uploadVideo: (formData, onUploadProgress) => 
    API.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  
  // Update video
  updateVideo: (id, data) => API.put(`/media/${id}`, data),
  
  // Delete video
  deleteVideo: (id) => API.delete(`/media/${id}`),
  
  // Like/Unlike video
  toggleLike: (id) => API.post(`/media/${id}/like`),
  
  // Add comment
  addComment: (id, comment) => API.post(`/media/${id}/comment`, { comment }),
  
  // Get video analytics
  getAnalytics: (id) => API.get(`/media/${id}/analytics`),
};

export const authAPI = {
  // Login
  login: (credentials) => API.post('/auth/login', credentials),
  
  // Register
  register: (userData) => API.post('/auth/register', userData),
  
  // Get current user
  getCurrentUser: () => API.get('/auth/me'),
  
  // Update profile
  updateProfile: (userData) => API.put('/auth/profile', userData),
  
  // Change password
  changePassword: (passwords) => API.put('/auth/change-password', passwords),
};

export const userAPI = {
  // Get user profile
  getUserProfile: (id) => API.get(`/users/${id}`),
  
  // Get user videos
  getUserVideos: (id) => API.get(`/users/${id}/videos`),
  
  // Subscribe/Unsubscribe
  toggleSubscription: (id) => API.post(`/users/${id}/subscribe`),
  
  // Get subscriptions
  getSubscriptions: () => API.get('/users/subscriptions'),
};

export default API;