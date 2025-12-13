// NEW FILE - 2024-12-11
// Admin Users Service
// Handles all API calls for admin user management

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get all admin users with pagination and filters
 * @param {object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 * @param {string} params.status - Filter by status
 * @param {string} params.roleId - Filter by role ID
 * @returns {Promise<object>} Response data
 */
export const getAllAdminUsers = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.ADMIN_USERS, { params });
  return response.data;
};

/**
 * Get admin user by ID
 * @param {string} id - Admin user ID
 * @returns {Promise<object>} Response data
 */
export const getAdminUserById = async (id) => {
  const response = await api.get(API_ENDPOINTS.ADMIN_USER_BY_ID(id));
  return response.data;
};

/**
 * Create new admin user
 * @param {object} data - Admin user data
 * @param {string} data.name - Full name
 * @param {string} data.email - Email address
 * @param {string} data.phone - Phone number (optional)
 * @param {string} data.password - Password
 * @param {string} data.roleId - Role ID
 * @returns {Promise<object>} Response data
 */
export const createAdminUser = async (data) => {
  const response = await api.post(API_ENDPOINTS.ADMIN_USERS, data);
  return response.data;
};

/**
 * Update admin user
 * @param {string} id - Admin user ID
 * @param {object} data - Updated data
 * @param {string} data.name - Full name
 * @param {string} data.email - Email address
 * @param {string} data.phone - Phone number
 * @param {string} data.roleId - Role ID
 * @returns {Promise<object>} Response data
 */
export const updateAdminUser = async (id, data) => {
  const response = await api.put(API_ENDPOINTS.ADMIN_USER_BY_ID(id), data);
  return response.data;
};

/**
 * Update admin user status
 * @param {string} id - Admin user ID
 * @param {string} status - New status (ACTIVE, INACTIVE, LOCKED)
 * @returns {Promise<object>} Response data
 */
export const updateAdminUserStatus = async (id, status) => {
  const response = await api.patch(API_ENDPOINTS.ADMIN_USER_STATUS(id), { status });
  return response.data;
};

/**
 * Delete admin user (Super Admin only)
 * @param {string} id - Admin user ID
 * @returns {Promise<object>} Response data
 */
export const deleteAdminUser = async (id) => {
  const response = await api.delete(API_ENDPOINTS.ADMIN_USER_BY_ID(id));
  return response.data;
};

/**
 * Get admin user activity log
 * @param {string} id - Admin user ID
 * @param {object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<object>} Response data
 */
export const getAdminUserActivity = async (id, params = {}) => {
  const response = await api.get(API_ENDPOINTS.ADMIN_USER_ACTIVITY(id), { params });
  return response.data;
};