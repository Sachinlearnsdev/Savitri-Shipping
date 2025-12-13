/**
 * Authentication Service
 * Handles all authentication-related API calls
 * SYNCED WITH BACKEND API DOCUMENTATION
 */

import { apiRequest } from './api';

const authService = {
  /**
   * Register new customer
   * POST /api/auth/register
   * @param {Object} data - { name, email, phone, password, confirmPassword }
   */
  register: async (data) => {
    return await apiRequest.post('/auth/register', data);
  },

  /**
   * Verify email with OTP
   * POST /api/auth/verify-email
   * @param {Object} data - { email, otp }
   */
  verifyEmail: async (data) => {
    return await apiRequest.post('/auth/verify-email', data);
  },

  /**
   * Verify phone with OTP
   * POST /api/auth/verify-phone
   * @param {Object} data - { phone, otp }
   */
  verifyPhone: async (data) => {
    return await apiRequest.post('/auth/verify-phone', data);
  },

  /**
   * Resend OTP for email or phone verification
   * POST /api/auth/resend-otp
   * @param {Object} data - { identifier: email/phone, type: 'email'/'phone' }
   */
  resendOTP: async (data) => {
    return await apiRequest.post('/auth/resend-otp', data);
  },

  /**
   * Login with email and password
   * POST /api/auth/login
   * @param {Object} data - { email, password }
   * Returns: { token, customer } - Token is also set in HTTP-only cookie
   */
  login: async (data) => {
    return await apiRequest.post('/auth/login', data);
  },

  /**
   * Login with phone - Step 1 (sends OTP)
   * POST /api/auth/login-phone
   * @param {Object} data - { phone }
   */
  loginWithPhone: async (data) => {
    return await apiRequest.post('/auth/login-phone', data);
  },

  /**
   * Login with phone - Step 2 (verify OTP)
   * POST /api/auth/verify-login-otp
   * @param {Object} data - { phone, otp }
   * Returns: { token, customer } - Token is also set in HTTP-only cookie
   */
  verifyPhoneLoginOTP: async (data) => {
    return await apiRequest.post('/auth/verify-login-otp', data);
  },

  /**
   * Forgot password - send reset OTP to email
   * POST /api/auth/forgot-password
   * @param {Object} data - { email }
   */
  forgotPassword: async (data) => {
    return await apiRequest.post('/auth/forgot-password', data);
  },

  /**
   * Reset password with OTP
   * POST /api/auth/reset-password
   * @param {Object} data - { email, otp, password, confirmPassword }
   */
  resetPassword: async (data) => {
    return await apiRequest.post('/auth/reset-password', data);
  },

  /**
   * Logout current session
   * POST /api/auth/logout
   */
  logout: async () => {
    return await apiRequest.post('/auth/logout');
  },

  /**
   * Get current user profile
   * GET /api/profile
   */
  getCurrentUser: async () => {
    return await apiRequest.get('/profile');
  },

  /**
   * Refresh token (if implemented by backend)
   * Note: Backend documentation doesn't explicitly mention this endpoint
   * But it's common practice. Check with backend team.
   */
  refreshToken: async () => {
    return await apiRequest.post('/auth/refresh-token');
  },
};

export default authService;