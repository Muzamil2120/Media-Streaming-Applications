const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';
const DM_BASE_URL = 'https://api.dailymotion.com';

// Add this line for debugging
console.log('🔗 Using API URL:', API_BASE_URL);

// Helper function to make API requests
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`📡 Making request to: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const bodyText = await response.text();

    if (!response.ok) {
      let parsed;
      try {
        parsed = bodyText ? JSON.parse(bodyText) : {};
      } catch (e) {
        parsed = { message: bodyText };
      }
      console.error('❌ API Error:', parsed);
      throw new Error(parsed.message || 'API error');
    }

    return bodyText ? JSON.parse(bodyText) : {};
  } catch (error) {
    console.error('🚨 API call error:', error);
    throw error;
  }
};

// Test connection function
export const testConnection = async () => {
  try {
    console.log('🔍 Testing API connection...');
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) throw new Error('Health check failed');
    const data = await response.json();
    console.log('✅ Connection test successful:', data);
    return data;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  register: async (data) => {
    try {
      console.log('👤 Registering user:', data);
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Registration error:', error);
        throw new Error(error.message || 'Registration failed');
      }
      
      const result = await response.json();
      console.log('✅ Registration successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  },

  signin: async (data) => {
    try {
      console.log('🔐 Signing in user:', data);
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Signin error:', error);
        throw new Error(error.message || 'Signin failed');
      }
      
      const result = await response.json();
      console.log('✅ Signin successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Signin error:', error);
      throw error;
    }
  },

  getProfile: () =>
    apiCall('/api/auth/me', {
      method: 'GET',
    }),

  updateProfile: (data) =>
    apiCall('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  logout: () => {
    localStorage.removeItem('token');
    console.log('🚪 User logged out');
  },
};

// Media API
export const mediaAPI = {
  getAllMedia: (page = 1, limit = 12) =>
    apiCall(`/api/media?page=${page}&limit=${limit}`, {
      method: 'GET',
    }),

  getMyMedia: () =>
    apiCall('/api/media/my-media', {
      method: 'GET',
    }),

  getMediaById: (id) =>
    apiCall(`/api/media/${id}`, {
      method: 'GET',
    }),

  uploadMedia: (formData) => {
    const token = localStorage.getItem('token');
    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}/api/media/upload`, {
      method: 'POST',
      headers,
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      return response.json();
    });
  },

  updateMedia: (id, data) =>
    apiCall(`/api/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteMedia: (id) =>
    apiCall(`/api/media/${id}`, {
      method: 'DELETE',
    }),

  searchMedia: (query) =>
    apiCall(`/api/media/search/${encodeURIComponent(query)}`, {
      method: 'GET',
    }),

  getTrending: () =>
    apiCall('/api/media/trending/all', {
      method: 'GET',
    }),

  getByCategory: (category, page = 1, limit = 12) =>
    apiCall(`/api/media/category/${category}?page=${page}&limit=${limit}`, {
      method: 'GET',
    }),

  likeMedia: (id) =>
    apiCall(`/api/media/${id}/like`, {
      method: 'POST',
    }),

  unlikeMedia: (id) =>
    apiCall(`/api/media/${id}/unlike`, {
      method: 'POST',
    }),

  getRecommendations: (id) =>
    apiCall(`/api/media/recommendations/${id}`, {
      method: 'GET',
    }),
};

// Comment API
export const commentAPI = {
  getComments: (mediaId, page = 1, limit = 20) =>
    apiCall(`/api/comments/${mediaId}?page=${page}&limit=${limit}`, {
      method: 'GET',
    }),

  createComment: (mediaId, text) =>
    apiCall(`/api/comments/${mediaId}`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  updateComment: (commentId, text) =>
    apiCall(`/api/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ text }),
    }),

  deleteComment: (commentId) =>
    apiCall(`/api/comments/${commentId}`, {
      method: 'DELETE',
    }),

  likeComment: (commentId) =>
    apiCall(`/api/comments/${commentId}/like`, {
      method: 'POST',
    }),

  unlikeComment: (commentId) =>
    apiCall(`/api/comments/${commentId}/unlike`, {
      method: 'POST',
    }),

  replyToComment: (commentId, text) =>
    apiCall(`/api/comments/${commentId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
};

// User API
export const userAPI = {
  getUserProfile: (userId) =>
    apiCall(`/api/users/${userId}`, {
      method: 'GET',
    }),

  getUserUploads: (userId, page = 1, limit = 12) =>
    apiCall(`/api/users/${userId}/uploads?page=${page}&limit=${limit}`, {
      method: 'GET',
    }),

  subscribe: (userId) =>
    apiCall(`/api/users/${userId}/subscribe`, {
      method: 'POST', 
    }),

  unsubscribe: (userId) =>
    apiCall(`/api/users/${userId}/unsubscribe`, {
      method: 'POST',
    }),

  getSubscriptions: (userId) =>
    apiCall(`/api/users/${userId}/subscriptions`, {
      method: 'GET',
    }),

  addToWatchHistory: (mediaId) =>
    apiCall(`/api/users/watch-history/${mediaId}`, {
      method: 'POST',
    }),

  getWatchHistory: () =>
    apiCall('/api/users/watch-history', {
      method: 'GET',
    }),

  addToWatchLater: (mediaId) =>
    apiCall(`/api/users/watch-later/${mediaId}`, {
      method: 'POST',
    }),

  removeFromWatchLater: (mediaId) =>
    apiCall(`/api/users/watch-later/${mediaId}`, {
      method: 'DELETE',
    }),

  getWatchLater: () =>
    apiCall('/api/users/watch-later', {
      method: 'GET',
    }),
  
  // list users for public browsing - UPDATED TO HANDLE BOTH FORMATS
  getAllUsers: async () => {
    try {
      const response = await apiCall('/api/users', {
        method: 'GET'
      });
      
      console.log('🔍 getAllUsers response:', response);
      
      // Handle both array and object with users property
      if (Array.isArray(response)) {
        return response;
      } else if (response && response.users && Array.isArray(response.users)) {
        return response.users;
      } else {
        console.warn('⚠️ Unexpected response format for getAllUsers:', response);
        return [];
      }
    } catch (error) {
      console.error('❌ Error in getAllUsers:', error);
      return [];
    }
  },
};

// Dailymotion API (public)
export const dailymotionAPI = {
  getTrending: async (page = 1, limit = 20) => {
    const url = `${DM_BASE_URL}/videos?fields=id,title,description,thumbnail_url,views_total,duration,url,channel.name&sort=trending&page=${page}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load Dailymotion trending');
    const data = await res.json();
    return data.list || [];
  },

  search: async (query, page = 1, limit = 20) => {
    const url = `${DM_BASE_URL}/videos?fields=id,title,description,thumbnail_url,views_total,duration,url,channel.name&search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to search Dailymotion');
    const data = await res.json();
    return data.list || [];
  }
};