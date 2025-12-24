import { api } from './api';
import { API_ENDPOINTS } from '@/utils/constants';

/**
 * Authentication Service
 * Handles all auth-related API calls
 */
export const authService = {
  /**
   * Register new customer
   * @param {object} data - Registration data
   * @returns {Promise}
   */
  register: async (data) => {
    return api.post(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  /**
   * Verify email with OTP
   * @param {string} email - Email address
   * @param {string} otp - OTP code
   * @returns {Promise}
   */
  verifyEmail: async (email, otp) => {
    return api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { email, otp });
  },

  /**
   * Verify phone with OTP (Master OTP bypass in frontend)
   * @param {string} phone - Phone number
   * @param {string} otp - OTP code
   * @returns {Promise}
   */
  verifyPhone: async (phone, otp) => {
    return api.post(API_ENDPOINTS.AUTH.VERIFY_PHONE, { phone, otp });
  },

  /**
   * Login with email and password
   * @param {string} email - Email address
   * @param {string} password - Password
   * @returns {Promise}
   */
  login: async (email, password) => {
    return api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  },

  /**
   * Login with phone - Step 1 (sends OTP)
   * @param {string} phone - Phone number
   * @returns {Promise}
   */
  loginPhone: async (phone) => {
    return api.post(API_ENDPOINTS.AUTH.LOGIN_PHONE, { phone });
  },

  /**
   * Login with phone - Step 2 (verify OTP)
   * @param {string} phone - Phone number
   * @param {string} otp - OTP code
   * @returns {Promise}
   */
  verifyLoginOTP: async (phone, otp) => {
    return api.post(API_ENDPOINTS.AUTH.VERIFY_LOGIN_OTP, { phone, otp });
  },

  /**
   * Logout
   * @returns {Promise}
   */
  logout: async () => {
    return api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Forgot password - Send reset OTP
   * @param {string} email - Email address
   * @returns {Promise}
   */
  forgotPassword: async (email) => {
    return api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  /**
   * Reset password with OTP
   * @param {object} data - Reset data (email, otp, password, confirmPassword)
   * @returns {Promise}
   */
  resetPassword: async (data) => {
    return api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },

  /**
   * Resend OTP
   * @param {string} identifier - Email or phone
   * @param {string} type - OTP type (email or phone)
   * @returns {Promise}
   */
  resendOTP: async (identifier, type) => {
    return api.post(API_ENDPOINTS.AUTH.RESEND_OTP, { identifier, type });
  },
};

export default authService;