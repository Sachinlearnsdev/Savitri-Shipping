/**
 * Profile Service
 * Handles all profile-related API calls
 */

import api, { apiRequest } from './api';

const profileService = {
  /**
   * Get current user profile
   */
  getProfile: async () => {
    return await apiRequest.get('/profile');
  },

  /**
   * Update profile
   * @param {Object} data - { name, email, phone, avatar }
   */
  updateProfile: async (data) => {
    return await apiRequest.put('/profile', data);
  },

  /**
   * Change password
   * @param {Object} data - { currentPassword, newPassword }
   */
  changePassword: async (data) => {
    return await apiRequest.post('/profile/change-password', data);
  },

  /**
   * Update email (sends OTP)
   * @param {Object} data - { newEmail }
   */
  updateEmail: async (data) => {
    return await apiRequest.post('/profile/update-email', data);
  },

  /**
   * Verify email change with OTP
   * @param {Object} data - { newEmail, otp }
   */
  verifyEmailChange: async (data) => {
    return await apiRequest.post('/profile/verify-email-change', data);
  },

  /**
   * Update phone (sends OTP)
   * @param {Object} data - { newPhone }
   */
  updatePhone: async (data) => {
    return await apiRequest.post('/profile/update-phone', data);
  },

  /**
   * Verify phone change with OTP
   * @param {Object} data - { newPhone, otp }
   */
  verifyPhoneChange: async (data) => {
    return await apiRequest.post('/profile/verify-phone-change', data);
  },

  /**
   * Upload profile avatar
   * @param {File} file - Image file
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return await apiRequest.post('/profile/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get login history
   */
  getLoginHistory: async () => {
    return await apiRequest.get('/profile/login-history');
  },

  /**
   * Get active sessions
   */
  getSessions: async () => {
    return await apiRequest.get('/profile/sessions');
  },

  /**
   * Delete a specific session
   * @param {string} sessionId
   */
  deleteSession: async (sessionId) => {
    return await apiRequest.delete(`/profile/sessions/${sessionId}`);
  },

  /**
   * Logout from all devices
   */
  logoutAllDevices: async () => {
    return await apiRequest.delete('/profile/sessions');
  },

  /**
   * Update notification preferences
   * @param {Object} data - { emailNotifications, smsNotifications, promotionalEmails }
   */
  updateNotificationPreferences: async (data) => {
    return await apiRequest.put('/profile/notification-preferences', data);
  },

  /**
   * Delete account (soft delete)
   * @param {Object} data - { password, reason }
   */
  deleteAccount: async (data) => {
    return await apiRequest.delete('/profile', { data });
  },

  // ==================== SAVED VEHICLES ====================

  /**
   * Get all saved vehicles
   */
  getSavedVehicles: async () => {
    return await apiRequest.get('/profile/vehicles');
  },

  /**
   * Add a saved vehicle
   * @param {Object} data - { type, brand, model, registrationNo, nickname }
   */
  addSavedVehicle: async (data) => {
    return await apiRequest.post('/profile/vehicles', data);
  },

  /**
   * Update a saved vehicle
   * @param {string} vehicleId
   * @param {Object} data
   */
  updateSavedVehicle: async (vehicleId, data) => {
    return await apiRequest.put(`/profile/vehicles/${vehicleId}`, data);
  },

  /**
   * Delete a saved vehicle
   * @param {string} vehicleId
   */
  deleteSavedVehicle: async (vehicleId) => {
    return await apiRequest.delete(`/profile/vehicles/${vehicleId}`);
  },

  /**
   * Set vehicle as default
   * @param {string} vehicleId
   */
  setDefaultVehicle: async (vehicleId) => {
    return await apiRequest.patch(`/profile/vehicles/${vehicleId}/set-default`);
  },

  // ==================== BOOKINGS (For Account Page) ====================

  /**
   * Get user bookings
   * @param {Object} params - { status, type, page, limit }
   */
  getBookings: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest.get(`/profile/bookings?${queryString}`);
  },

  /**
   * Get booking details
   * @param {string} bookingId
   */
  getBookingDetails: async (bookingId) => {
    return await apiRequest.get(`/profile/bookings/${bookingId}`);
  },

  /**
   * Cancel booking
   * @param {string} bookingId
   * @param {Object} data - { reason }
   */
  cancelBooking: async (bookingId, data) => {
    return await apiRequest.post(`/profile/bookings/${bookingId}/cancel`, data);
  },

  // ==================== REVIEWS ====================

  /**
   * Get user reviews
   */
  getReviews: async () => {
    return await apiRequest.get('/profile/reviews');
  },

  /**
   * Add review
   * @param {Object} data - { bookingId, rating, comment }
   */
  addReview: async (data) => {
    return await apiRequest.post('/profile/reviews', data);
  },

  /**
   * Update review
   * @param {string} reviewId
   * @param {Object} data - { rating, comment }
   */
  updateReview: async (reviewId, data) => {
    return await apiRequest.put(`/profile/reviews/${reviewId}`, data);
  },

  /**
   * Delete review
   * @param {string} reviewId
   */
  deleteReview: async (reviewId) => {
    return await apiRequest.delete(`/profile/reviews/${reviewId}`);
  },
};

export default profileService;