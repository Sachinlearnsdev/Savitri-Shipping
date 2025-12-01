import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';
import api from '../services/api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Custom hook for authentication operations
 * @returns {object} Auth methods and state
 */
const useAuth = () => {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const { showSuccess, showError } = useUIStore();
  
  /**
   * Login with email and password
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
      
      if (response.data.success) {
        // OTP sent, redirect to verify OTP page
        return {
          success: true,
          message: response.data.message,
          email,
        };
      }
      
      return { success: false, message: 'Login failed' };
    } catch (error) {
      showError(error.message || 'Login failed');
      return { success: false, message: error.message };
    } finally {
      authStore.setLoading(false);
    }
  };
  
  /**
   * Verify OTP and complete login
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
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        authStore.login(user, token);
        showSuccess('Login successful!');
        navigate('/dashboard');
        return { success: true };
      }
      
      return { success: false, message: 'Invalid OTP' };
    } catch (error) {
      showError(error.message || 'OTP verification failed');
      return { success: false, message: error.message };
    } finally {
      authStore.setLoading(false);
    }
  };
  
  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await api.post(API_ENDPOINTS.ADMIN_LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authStore.logout();
      showSuccess('Logged out successfully');
      navigate('/login');
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
        showSuccess('Password reset link sent to your email');
        return { success: true };
      }
      
      return { success: false, message: 'Failed to send reset link' };
    } catch (error) {
      showError(error.message || 'Failed to send reset link');
      return { success: false, message: error.message };
    } finally {
      authStore.setLoading(false);
    }
  };
  
  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @param {string} confirmPassword - Confirm new password
   * @returns {Promise<object>} Response data
   */
  const resetPassword = async (token, password, confirmPassword) => {
    try {
      authStore.setLoading(true);
      
      const response = await api.post(API_ENDPOINTS.ADMIN_RESET_PASSWORD, {
        token,
        password,
        confirmPassword,
      });
      
      if (response.data.success) {
        showSuccess('Password reset successfully. Please login.');
        navigate('/login');
        return { success: true };
      }
      
      return { success: false, message: 'Failed to reset password' };
    } catch (error) {
      showError(error.message || 'Failed to reset password');
      return { success: false, message: error.message };
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
      
      if (response.data.success) {
        const { token } = response.data.data;
        authStore.updateToken(token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      authStore.logout();
      navigate('/login');
      return false;
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
   * Get current user
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
    getUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // User info helpers
    getUserName: authStore.getUserName,
    getUserEmail: authStore.getUserEmail,
    getRoleName: authStore.getRoleName,
    isSuperAdmin: authStore.isSuperAdmin,
  };
};

export default useAuth;