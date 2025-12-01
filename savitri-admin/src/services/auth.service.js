import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Authentication Service
 * Handles all auth-related API calls
 */

/**
 * Admin login - Send OTP
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<object>} Response data
 */
export const adminLogin = async (email, password) => {
  const response = await api.post(API_ENDPOINTS.ADMIN_LOGIN, {
    email,
    password,
  });
  return response.data;
};

/**
 * Verify OTP and complete login
 * @param {string} email - Admin email
 * @param {string} otp - OTP code
 * @returns {Promise<object>} Response data with user and token
 */
export const verifyOTP = async (email, otp) => {
  const response = await api.post(API_ENDPOINTS.ADMIN_VERIFY_OTP, {
    email,
    otp,
  });
  return response.data;
};

/**
 * Logout admin user
 * @returns {Promise<object>} Response data
 */
export const adminLogout = async () => {
  const response = await api.post(API_ENDPOINTS.ADMIN_LOGOUT);
  return response.data;
};

/**
 * Request password reset
 * @param {string} email - Admin email
 * @returns {Promise<object>} Response data
 */
export const forgotPassword = async (email) => {
  const response = await api.post(API_ENDPOINTS.ADMIN_FORGOT_PASSWORD, {
    email,
  });
  return response.data;
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} password - New password
 * @param {string} confirmPassword - Confirm new password
 * @returns {Promise<object>} Response data
 */
export const resetPassword = async (token, password, confirmPassword) => {
  const response = await api.post(API_ENDPOINTS.ADMIN_RESET_PASSWORD, {
    token,
    password,
    confirmPassword,
  });
  return response.data;
};

/**
 * Refresh authentication token
 * @returns {Promise<object>} Response data with new token
 */
export const refreshToken = async () => {
  const response = await api.post(API_ENDPOINTS.ADMIN_REFRESH_TOKEN);
  return response.data;
};