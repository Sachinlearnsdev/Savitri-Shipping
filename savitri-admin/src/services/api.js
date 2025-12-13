// UPDATED - 2024-12-11
// CHANGES:
// 1. Fixed token handling - stores in localStorage AND sends via header
// 2. Added proper cookie support with withCredentials: true
// 3. Improved error handling with specific status codes
// 4. Added request/response logging in development
// 5. Fixed 401 redirect to clear state properly

import axios from "axios";

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

  if (currentHost.includes(".app.github.dev")) {
    // We're in Codespaces
    // Current URL: https://username-projectname-abc123-5173.app.github.dev
    // Backend URL: https://username-projectname-abc123-5000.app.github.dev

    // Replace the port number in the hostname
    const backendHost = currentHost.replace(
      /-(\d+)(\.app\.github\.dev)$/,
      "-5000$2"
    );

    return `https://${backendHost}/api`;
  }

  // Default to localhost
  return "http://localhost:5000/api";
};

// Create axios instance with dynamic base URL
const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // ← CRITICAL: Allows cookies to be sent/received
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Log the API URL in development
if (import.meta.env.DEV) {
  console.log("🔗 API Base URL:", getApiBaseUrl());
}

/**
 * Request interceptor
 * Adds authentication token to requests
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("adminToken");

    // Send token in Authorization header if available
    // Backend supports both cookie AND header authentication
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`➡️  ${config.method.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
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
      console.log(
        `✅ ${response.config.method.toUpperCase()} ${response.config.url}`,
        response.data
      );
    }

    return response;
  },
  (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error("❌ Response Error:", {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized - Token expired or invalid
      if (status === 401) {
        // Clear auth data
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        // Only redirect if not already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }

      // Handle 403 Forbidden - Insufficient permissions
      if (status === 403) {
        console.error("❌ Access denied: Insufficient permissions");
      }

      // Handle 404 Not Found
      if (status === 404) {
        console.error("❌ Resource not found");
      }

      // Handle 429 Too Many Requests
      if (status === 429) {
        console.error("❌ Too many requests. Please try again later.");
      }

      // Handle 500 Internal Server Error
      if (status === 500) {
        console.error("❌ Server error. Please try again later.");
      }

      // Return formatted error with backend error message
      return Promise.reject({
        message: data.message || "An error occurred",
        errors: data.errors || [],
        status,
      });
    }

    // Network error or timeout
    if (error.request) {
      return Promise.reject({
        message: "Network error. Please check your connection.",
        errors: [],
        status: 0,
      });
    }

    // Other errors
    return Promise.reject({
      message: error.message || "An unexpected error occurred",
      errors: [],
      status: 0,
    });
  }
);

export default api;

// Export the URL getter for other uses
export { getApiBaseUrl };
