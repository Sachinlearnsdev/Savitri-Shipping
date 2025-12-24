import { api } from './api';
import { API_ENDPOINTS } from '@/utils/constants';

/**
 * Profile Service
 * Handles all profile-related API calls
 */
export const profileService = {
  /**
   * Get current customer profile
   * @returns {Promise}
   */
  getProfile: async () => {
    return api.get(API_ENDPOINTS.PROFILE.GET);
  },

  /**
   * Update profile (name only)
   * @param {object} data - Profile data
   * @returns {Promise}
   */
  updateProfile: async (data) => {
    return api.put(API_ENDPOINTS.PROFILE.UPDATE, data);
  },

  /**
   * Upload profile avatar
   * @param {File} file - Image file
   * @returns {Promise}
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return api.post(API_ENDPOINTS.PROFILE.AVATAR, formData);
  },

  /**
   * Change password
   * @param {object} data - Password data (currentPassword, newPassword, confirmPassword)
   * @returns {Promise}
   */
  changePassword: async (data) => {
    return api.post(API_ENDPOINTS.PROFILE.CHANGE_PASSWORD, data);
  },

  /**
   * Update email - Step 1 (sends OTP)
   * @param {string} email - New email address
   * @returns {Promise}
   */
  updateEmail: async (email) => {
    return api.post(API_ENDPOINTS.PROFILE.UPDATE_EMAIL, { email });
  },

  /**
   * Update email - Step 2 (verify OTP)
   * @param {string} email - New email address
   * @param {string} otp - OTP code
   * @returns {Promise}
   */
  verifyEmailChange: async (email, otp) => {
    return api.post(API_ENDPOINTS.PROFILE.VERIFY_EMAIL_CHANGE, { email, otp });
  },

  /**
   * Update phone - Step 1 (sends OTP)
   * @param {string} phone - New phone number
   * @returns {Promise}
   */
  updatePhone: async (phone) => {
    return api.post(API_ENDPOINTS.PROFILE.UPDATE_PHONE, { phone });
  },

  /**
   * Update phone - Step 2 (verify OTP)
   * @param {string} phone - New phone number
   * @param {string} otp - OTP code
   * @returns {Promise}
   */
  verifyPhoneChange: async (phone, otp) => {
    return api.post(API_ENDPOINTS.PROFILE.VERIFY_PHONE_CHANGE, { phone, otp });
  },

  /**
   * Update notification preferences
   * @param {object} preferences - Notification settings
   * @returns {Promise}
   */
  updateNotifications: async (preferences) => {
    return api.patch(API_ENDPOINTS.PROFILE.NOTIFICATIONS, preferences);
  },

  /**
   * Get all active sessions
   * @returns {Promise}
   */
  getSessions: async () => {
    return api.get(API_ENDPOINTS.PROFILE.SESSIONS);
  },

  /**
   * Delete specific session (logout from device)
   * @param {string} sessionId - Session ID
   * @returns {Promise}
   */
  deleteSession: async (sessionId) => {
    return api.delete(`${API_ENDPOINTS.PROFILE.SESSIONS}/${sessionId}`);
  },

  /**
   * Logout from all devices
   * @returns {Promise}
   */
  logoutAllDevices: async () => {
    return api.delete(API_ENDPOINTS.PROFILE.SESSIONS);
  },

  /**
   * Get login history
   * @returns {Promise}
   */
  getLoginHistory: async () => {
    return api.get(API_ENDPOINTS.PROFILE.LOGIN_HISTORY);
  },

  /**
   * Delete account (soft delete)
   * @returns {Promise}
   */
  deleteAccount: async () => {
    return api.delete(API_ENDPOINTS.PROFILE.DELETE_ACCOUNT);
  },
};

export default profileService;