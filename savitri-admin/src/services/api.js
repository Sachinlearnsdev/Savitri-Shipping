import axios from 'axios';

/**
 * Get the API base URL
 * Auto-detects Codespaces environment
 * 
 * @returns {string} API base URL
 */
const getApiBaseUrl = () => {
  // Check if explicitly set in env
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Auto-detect Codespaces
  const currentHost = window.location.hostname;
  
  if (currentHost.includes('.app.github.dev')) {
    // We're in Codespaces
    // Extract the codespace name and construct backend URL
    // Current URL: https://username-projectname-abc123-5173.app.github.dev
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

// Log the API URL in development
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', getApiBaseUrl());
}

/**
 * Request interceptor
 * Adds authentication token to requests
 */
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`➡️ ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles common response scenarios
 */
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('❌ Response Error:', error.response?.data || error.message);
    }
    
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle 401 Unauthorized - Token expired or invalid
      if (status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
      }
      
      // Handle 403 Forbidden - Insufficient permissions
      if (status === 403) {
        console.error('Access denied: Insufficient permissions');
      }
      
      // Handle 404 Not Found
      if (status === 404) {
        console.error('Resource not found');
      }
      
      // Handle 500 Internal Server Error
      if (status === 500) {
        console.error('Server error. Please try again later.');
      }
      
      // Return formatted error
      return Promise.reject({
        message: data.message || 'An error occurred',
        errors: data.errors || [],
        status,
      });
    }
    
    // Network error or timeout
    if (error.request) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 0,
      });
    }
    
    // Other errors
    return Promise.reject({
      message: error.message || 'An unexpected error occurred',
      status: 0,
    });
  }
);

export default api;

// Export the URL getter for other uses
export { getApiBaseUrl };