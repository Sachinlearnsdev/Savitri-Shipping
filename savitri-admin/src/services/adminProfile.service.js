// Admin Profile Service
// Handles all API calls for admin profile management

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get admin profile
 * @returns {Promise<object>} Response data
 */
export const getAdminProfile = async () => {
  const response = await api.get(API_ENDPOINTS.ADMIN_PROFILE);
  return response.data;
};

/**
 * Update admin profile
 * @param {object} data - Profile data to update
 * @returns {Promise<object>} Response data
 */
export const updateAdminProfile = async (data) => {
  const response = await api.put(API_ENDPOINTS.ADMIN_PROFILE, data);
  return response.data;
};

/**
 * Upload admin avatar
 * @param {File} file - Image file
 * @returns {Promise<object>} Response data
 */
export const uploadAdminAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await api.post(API_ENDPOINTS.ADMIN_PROFILE_AVATAR, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Remove admin avatar
 * @returns {Promise<object>} Response data
 */
export const removeAdminAvatar = async () => {
  const response = await api.delete(API_ENDPOINTS.ADMIN_PROFILE_AVATAR);
  return response.data;
};

/**
 * Change admin password
 * @param {object} data - { currentPassword, newPassword, confirmPassword }
 * @returns {Promise<object>} Response data
 */
export const changeAdminPassword = async (data) => {
  const response = await api.put(API_ENDPOINTS.ADMIN_PROFILE_PASSWORD, data);
  return response.data;
};
