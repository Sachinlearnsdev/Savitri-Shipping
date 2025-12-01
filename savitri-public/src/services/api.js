/**
 * API Service with Codespaces Auto-Detection
 * Handles all HTTP requests to the backend
 */

'use client';
import axios from 'axios';

/**
 * Get the API base URL
 * Auto-detects Codespaces environment
 */
const getApiBaseUrl = () => {
  // Server-side: Use environment variable
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }
  
  // Client-side: Check if explicitly set
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Auto-detect Codespaces
  const currentHost = window.location.hostname;
  
  if (currentHost.includes('.app.github.dev')) {
    // We're in Codespaces
    // Current URL: https://username-projectname-abc123-3000.app.github.dev
    // Backend URL: https://username-projectname-abc123-5000.app.github.dev
    
    const parts = currentHost.split('-');
    // Replace the port part (last segment before .app.github.dev)
    parts[parts.length - 1] = '5000';
    const backendHost = parts.join('-');
    
    return `https://${backendHost}/api`;
  }
  
  // Default to localhost
  return 'http://localhost:5000/api';
};

// Create axios instance with dynamic base URL
const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Log the API URL in development (client-side only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔗 API Base URL:', getApiBaseUrl());
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available (client-side)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('customerToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized (client-side only)
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerUser');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      }
    }
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Generic request handlers with error handling
 */
export const apiRequest = {
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },

  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error.message };
    }
  },
};

export default api;

// Export the URL getter for other uses
export { getApiBaseUrl };