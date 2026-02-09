// UPDATED - 2024-12-11
// CHANGES:
// 1. Fixed login flow to match backend API response structure
// 2. Added proper error handling with backend error messages
// 3. Improved token refresh logic
// 4. Added better logging in development mode
// 5. Fixed response data extraction from backend

import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useUIStore from "../store/uiStore";
import useNotificationStore from "../store/notificationStore";
import { disconnectSocket } from "../utils/socket";
import api from "../services/api";
import { API_ENDPOINTS } from "../utils/constants";

/**
 * Custom hook for authentication operations
 * @returns {object} Auth methods and state
 */
const useAuth = () => {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const { showSuccess, showError } = useUIStore();

  /**
   * Login with email and password (Step 1 - sends OTP)
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} Response data
   */
  const login = async (email, password) => {
    try {
      authStore.setLoading(true);

      const response = await api.post(API_ENDPOINTS.ADMIN_LOGIN, {
        email,
        password,
      });

      // Check if request was successful
      if (response.data.success) {
        showSuccess(response.data.message || "OTP sent to your email");

        // Return success with email for next step
        return {
          success: true,
          message: response.data.message,
          email: response.data.data.email || email,
        };
      }

      return {
        success: false,
        message: response.data.message || "Login failed",
      };
    } catch (error) {
      const errorMessage = error.message || "Login failed. Please try again.";
      showError(errorMessage);

      return {
        success: false,
        message: errorMessage,
        errors: error.errors || [],
      };
    } finally {
      authStore.setLoading(false);
    }
  };

  /**
   * Verify OTP and complete login (Step 2)
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @returns {Promise<object>} Response data
   */
  const verifyOTP = async (email, otp) => {
    try {
      authStore.setLoading(true);

      const response = await api.post(API_ENDPOINTS.ADMIN_VERIFY_OTP, {
        email,
        otp,
      });

      // Check if verification was successful
      if (response.data.success) {
        // Extract user and token from response
        const { user, token } = response.data.data;

        // Validate that we received both user and token
        if (!user || !token) {
          throw new Error("Invalid response from server");
        }

        // Store user and token in auth store
        authStore.login(user, token);

        showSuccess("Login successful! Welcome back.");

        // Navigate to dashboard
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 100);

        return { success: true, user, token };
      }

      return {
        success: false,
        message: response.data.message || "Invalid OTP",
      };
    } catch (error) {
      const errorMessage =
        error.message || "OTP verification failed. Please try again.";
      showError(errorMessage);

      return {
        success: false,
        message: errorMessage,
        errors: error.errors || [],
      };
    } finally {
      authStore.setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      // Call logout endpoint
      await api.post(API_ENDPOINTS.ADMIN_LOGOUT);
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with logout even if API call fails
    } finally {
      // Disconnect socket
      disconnectSocket();

      // Clear auth state
      authStore.logout();
      useNotificationStore.getState().resetCounts();

      showSuccess("Logged out successfully");

      // Navigate to login
      navigate("/login", { replace: true });
    }
  };

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<object>} Response data
   */
  const forgotPassword = async (email) => {
    try {
      authStore.setLoading(true);

      const response = await api.post(API_ENDPOINTS.ADMIN_FORGOT_PASSWORD, {
        email,
      });

      if (response.data.success) {
        showSuccess(
          response.data.message || "Password reset OTP sent to your email"
        );
        return { success: true, message: response.data.message };
      }

      return {
        success: false,
        message: response.data.message || "Failed to send reset OTP",
      };
    } catch (error) {
      const errorMessage =
        error.message || "Failed to send reset OTP. Please try again.";
      showError(errorMessage);

      return {
        success: false,
        message: errorMessage,
        errors: error.errors || [],
      };
    } finally {
      authStore.setLoading(false);
    }
  };

  /**
   * Reset password with OTP
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @param {string} password - New password
   * @param {string} confirmPassword - Confirm new password
   * @returns {Promise<object>} Response data
   */
  const resetPassword = async (email, otp, password, confirmPassword) => {
    try {
      authStore.setLoading(true);

      const response = await api.post(API_ENDPOINTS.ADMIN_RESET_PASSWORD, {
        email,
        otp,
        password,
        confirmPassword,
      });

      if (response.data.success) {
        showSuccess(
          "Password reset successfully. Please login with your new password."
        );

        // Navigate to login
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1000);

        return { success: true, message: response.data.message };
      }

      return {
        success: false,
        message: response.data.message || "Failed to reset password",
      };
    } catch (error) {
      const errorMessage =
        error.message || "Failed to reset password. Please try again.";
      showError(errorMessage);

      return {
        success: false,
        message: errorMessage,
        errors: error.errors || [],
      };
    } finally {
      authStore.setLoading(false);
    }
  };

  /**
   * Refresh authentication token
   * @returns {Promise<boolean>} Success status
   */
  const refreshToken = async () => {
    try {
      const response = await api.post(API_ENDPOINTS.ADMIN_REFRESH_TOKEN);

      if (response.data.success && response.data.data.token) {
        const { token } = response.data.data;
        authStore.updateToken(token);

        if (import.meta.env.DEV) {
          console.log("✅ Token refreshed successfully");
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);

      // If refresh fails, logout user
      authStore.logout();
      navigate("/login", { replace: true });

      return false;
    }
  };

  /**
   * Get current user info from backend
   * @returns {Promise<object|null>} User object or null
   */
  const getCurrentUser = async () => {
    try {
      const response = await api.get("/auth/admin/me");

      if (response.data.success && response.data.data) {
        const user = response.data.data;

        // Update user in store
        authStore.updateUser(user);

        return user;
      }

      return null;
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  };

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  const isAuthenticated = () => {
    return authStore.isAuthenticated;
  };

  /**
   * Get current user from store
   * @returns {object|null} User object
   */
  const getUser = () => {
    return authStore.user;
  };

  /**
   * Check if user has permission
   * @param {string} permission - Permission key
   * @returns {boolean} Permission status
   */
  const hasPermission = (permission) => {
    return authStore.hasPermission(permission);
  };

  /**
   * Check if user has any of the permissions
   * @param {Array<string>} permissions - Array of permission keys
   * @returns {boolean} Permission status
   */
  const hasAnyPermission = (permissions) => {
    return authStore.hasAnyPermission(permissions);
  };

  /**
   * Check if user has all of the permissions
   * @param {Array<string>} permissions - Array of permission keys
   * @returns {boolean} Permission status
   */
  const hasAllPermissions = (permissions) => {
    return authStore.hasAllPermissions(permissions);
  };

  return {
    // State
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,

    // Methods
    login,
    verifyOTP,
    logout,
    forgotPassword,
    resetPassword,
    refreshToken,
    getCurrentUser,
    getUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // User info helpers
    getUserName: authStore.getUserName,
    getUserEmail: authStore.getUserEmail,
    getRoleName: authStore.getRoleName,
    isSuperAdmin: authStore.isSuperAdmin,
    getAvatar: authStore.getAvatar,
    getPhone: authStore.getPhone,
  };
};

export default useAuth;
