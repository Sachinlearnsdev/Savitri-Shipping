/**
 * Profile Service
 * Handles all profile-related API calls
 * SYNCED WITH BACKEND API DOCUMENTATION
 */

import { apiRequest } from './api';

const profileService = {
  // ==================== PROFILE ====================

  /**
   * Get current customer profile
   * GET /api/profile
   */
  getProfile: async () => {
    return await apiRequest.get('/profile');
  },

  /**
   * Update profile (name only)
   * PUT /api/profile
   * @param {Object} data - { name }
   */
  updateProfile: async (data) => {
    return await apiRequest.put('/profile', data);
  },

  /**
   * Upload profile avatar
   * POST /api/profile/avatar
   * @param {FormData} formData - Form data with 'avatar' file
   */
  uploadAvatar: async (formData) => {
    return await apiRequest.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Change password
   * POST /api/profile/change-password
   * @param {Object} data - { currentPassword, newPassword, confirmPassword }
   */
  changePassword: async (data) => {
    return await apiRequest.post('/profile/change-password', data);
  },

  /**
   * Update email - Step 1 (sends OTP to new email)
   * POST /api/profile/update-email
   * @param {Object} data - { email }
   */
  updateEmail: async (data) => {
    return await apiRequest.post('/profile/update-email', data);
  },

  /**
   * Update email - Step 2 (verify OTP)
   * POST /api/profile/verify-email-change
   * @param {Object} data - { email, otp }
   */
  verifyEmailChange: async (data) => {
    return await apiRequest.post('/profile/verify-email-change', data);
  },

  /**
   * Update phone - Step 1 (sends OTP to new phone)
   * POST /api/profile/update-phone
   * @param {Object} data - { phone }
   */
  updatePhone: async (data) => {
    return await apiRequest.post('/profile/update-phone', data);
  },

  /**
   * Update phone - Step 2 (verify OTP)
   * POST /api/profile/verify-phone-change
   * @param {Object} data - { phone, otp }
   */
  verifyPhoneChange: async (data) => {
    return await apiRequest.post('/profile/verify-phone-change', data);
  },

  /**
   * Update notification preferences
   * PATCH /api/profile/notifications
   * @param {Object} data - { emailNotifications, smsNotifications, promotionalEmails }
   */
  updateNotifications: async (data) => {
    return await apiRequest.patch('/profile/notifications', data);
  },

  // ==================== SESSIONS ====================

  /**
   * Get active sessions
   * GET /api/profile/sessions
   */
  getSessions: async () => {
    return await apiRequest.get('/profile/sessions');
  },

  /**
   * Delete specific session
   * DELETE /api/profile/sessions/:sessionId
   * @param {string} sessionId
   */
  deleteSession: async (sessionId) => {
    return await apiRequest.delete(`/profile/sessions/${sessionId}`);
  },

  /**
   * Logout from all devices
   * DELETE /api/profile/sessions
   */
  logoutAllDevices: async () => {
    return await apiRequest.delete('/profile/sessions');
  },

  /**
   * Get login history (last 10 logins)
   * GET /api/profile/login-history
   */
  getLoginHistory: async () => {
    return await apiRequest.get('/profile/login-history');
  },

  // ==================== SAVED VEHICLES ====================

  /**
   * Get all saved vehicles
   * GET /api/profile/vehicles
   */
  getVehicles: async () => {
    return await apiRequest.get('/profile/vehicles');
  },

  /**
   * Get vehicle by ID
   * GET /api/profile/vehicles/:id
   * @param {string} id
   */
  getVehicle: async (id) => {
    return await apiRequest.get(`/profile/vehicles/${id}`);
  },

  /**
   * Add saved vehicle
   * POST /api/profile/vehicles
   * @param {Object} data - { type, brand, model, registrationNo, nickname, isDefault }
   */
  addVehicle: async (data) => {
    return await apiRequest.post('/profile/vehicles', data);
  },

  /**
   * Update saved vehicle
   * PUT /api/profile/vehicles/:id
   * @param {string} id
   * @param {Object} data - { type, brand, model, registrationNo, nickname, isDefault }
   */
  updateVehicle: async (id, data) => {
    return await apiRequest.put(`/profile/vehicles/${id}`, data);
  },

  /**
   * Delete saved vehicle
   * DELETE /api/profile/vehicles/:id
   * @param {string} id
   */
  deleteVehicle: async (id) => {
    return await apiRequest.delete(`/profile/vehicles/${id}`);
  },

  // ==================== ACCOUNT ====================

  /**
   * Delete account (soft delete)
   * DELETE /api/profile
   */
  deleteAccount: async () => {
    return await apiRequest.delete('/profile');
  },
};

export default profileService;