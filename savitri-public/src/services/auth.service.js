/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import api, { apiRequest } from './api';

const authService = {
  /**
   * Register new customer
   * @param {Object} data - { name, email, phone, password }
   */
  register: async (data) => {
    return await apiRequest.post('/auth/register', data);
  },

  /**
   * Verify email with OTP
   * @param {Object} data - { email, otp }
   */
  verifyEmail: async (data) => {
    return await apiRequest.post('/auth/verify-email', data);
  },

  /**
   * Resend email verification OTP
   * @param {Object} data - { email }
   */
  resendEmailOTP: async (data) => {
    return await apiRequest.post('/auth/resend-email-otp', data);
  },

  /**
   * Verify phone with OTP
   * @param {Object} data - { phone, otp }
   */
  verifyPhone: async (data) => {
    return await apiRequest.post('/auth/verify-phone', data);
  },

  /**
   * Resend phone verification OTP
   * @param {Object} data - { phone }
   */
  resendPhoneOTP: async (data) => {
    return await apiRequest.post('/auth/resend-phone-otp', data);
  },

  /**
   * Login with email and password
   * @param {Object} data - { email, password }
   */
  login: async (data) => {
    return await apiRequest.post('/auth/login', data);
  },

  /**
   * Verify login OTP (2FA)
   * @param {Object} data - { email, otp }
   */
  verifyLoginOTP: async (data) => {
    return await apiRequest.post('/auth/verify-login-otp', data);
  },

  /**
   * Login with phone and OTP only
   * @param {Object} data - { phone }
   */
  loginWithPhone: async (data) => {
    return await apiRequest.post('/auth/login-phone', data);
  },

  /**
   * Verify phone login OTP
   * @param {Object} data - { phone, otp }
   */
  verifyPhoneLoginOTP: async (data) => {
    return await apiRequest.post('/auth/verify-phone-login-otp', data);
  },

  /**
   * Logout current session
   */
  logout: async () => {
    return await apiRequest.post('/auth/logout');
  },

  /**
   * Logout from all devices
   */
  logoutAll: async () => {
    return await apiRequest.post('/auth/logout-all');
  },

  /**
   * Forgot password - send reset OTP
   * @param {Object} data - { email }
   */
  forgotPassword: async (data) => {
    return await apiRequest.post('/auth/forgot-password', data);
  },

  /**
   * Reset password with OTP
   * @param {Object} data - { email, otp, newPassword }
   */
  resetPassword: async (data) => {
    return await apiRequest.post('/auth/reset-password', data);
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    return await apiRequest.post('/auth/refresh-token');
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    return await apiRequest.get('/auth/me');
  },

  /**
   * Check if email exists
   * @param {string} email
   */
  checkEmail: async (email) => {
    return await apiRequest.get(`/auth/check-email?email=${email}`);
  },

  /**
   * Check if phone exists
   * @param {string} phone
   */
  checkPhone: async (phone) => {
    return await apiRequest.get(`/auth/check-phone?phone=${phone}`);
  },
};

export default authService;