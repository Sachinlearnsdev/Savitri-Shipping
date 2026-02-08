import { API_BASE_URL } from "@/utils/constants";
import { STORAGE_KEYS, COOKIE_NAMES } from "@/utils/constants";
import {
  getFromStorage,
  saveToStorage,
  removeFromStorage,
  getCookie,
} from "@/utils/helpers";

/**
 * API Service Class
 * Handles all HTTP requests with auth token management
 */
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get auth token from localStorage or cookie
   * @returns {string|null}
   */
  getAuthToken() {
    // Try localStorage first
    const token = getFromStorage(STORAGE_KEYS.AUTH_TOKEN);
    if (token) return token;

    // Fallback to cookie
    return getCookie(COOKIE_NAMES.AUTH_TOKEN);
  }

  /**
   * Make HTTP request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise}
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      ...options,
      credentials: "include", // Important for cookies
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    try {
      const response = await fetch(url, config);

      // Parse JSON response
      const data = await response.json();

      // Handle 401 Unauthorized
      if (response.status === 401) {
        // Only redirect to login if NOT already on an auth page
        const isAuthPage =
          typeof window !== "undefined" &&
          ["/login", "/register", "/forgot-password", "/reset-password"].some(
            (p) => window.location.pathname.startsWith(p)
          );

        if (!isAuthPage) {
          // Clear auth data
          removeFromStorage(STORAGE_KEYS.AUTH_TOKEN);
          removeFromStorage(STORAGE_KEYS.USER);

          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }

        throw {
          status: 401,
          message: data.message || "Session expired. Please login again.",
          errors: data.errors || [],
        };
      }

      // Handle non-OK responses
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || "Something went wrong",
          errors: data.errors || [],
        };
      }

      return data;
    } catch (error) {
      // Network error or JSON parse error
      if (!error.status) {
        throw {
          status: 0,
          message: "Network error. Please check your internet connection.",
        };
      }

      throw error;
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Additional options
   * @returns {Promise}
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "GET",
    });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {any} body - Request body
   * @param {object} options - Additional options
   * @returns {Promise}
   */
  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {any} body - Request body
   * @param {object} options - Additional options
   * @returns {Promise}
   */
  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {any} body - Request body
   * @param {object} options - Additional options
   * @returns {Promise}
   */
  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Additional options
   * @returns {Promise}
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "DELETE",
    });
  }
}

// Export singleton instance
export const api = new ApiService();

// Export class for testing
export default ApiService;
