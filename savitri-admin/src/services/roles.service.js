// NEW FILE - 2024-12-11
// Roles Service
// Handles all API calls for role management

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get all roles
 * @returns {Promise<object>} Response data
 */
export const getAllRoles = async () => {
  const response = await api.get(API_ENDPOINTS.ROLES);
  return response.data;
};

/**
 * Get role by ID
 * @param {string} id - Role ID
 * @returns {Promise<object>} Response data
 */
export const getRoleById = async (id) => {
  const response = await api.get(API_ENDPOINTS.ROLE_BY_ID(id));
  return response.data;
};

/**
 * Create new role
 * @param {object} data - Role data
 * @param {string} data.name - Role name
 * @param {string} data.description - Role description
 * @param {object} data.permissions - Permissions object
 * @returns {Promise<object>} Response data
 */
export const createRole = async (data) => {
  const response = await api.post(API_ENDPOINTS.ROLES, data);
  return response.data;
};

/**
 * Update role
 * @param {string} id - Role ID
 * @param {object} data - Updated data
 * @param {string} data.name - Role name
 * @param {string} data.description - Role description
 * @param {object} data.permissions - Permissions object
 * @returns {Promise<object>} Response data
 */
export const updateRole = async (id, data) => {
  const response = await api.put(API_ENDPOINTS.ROLE_BY_ID(id), data);
  return response.data;
};

/**
 * Delete role
 * @param {string} id - Role ID
 * @returns {Promise<object>} Response data
 */
export const deleteRole = async (id) => {
  const response = await api.delete(API_ENDPOINTS.ROLE_BY_ID(id));
  return response.data;
};

/**
 * Get default permissions structure
 * Helper function to get the default permissions object
 * @returns {object} Default permissions structure
 */
export const getDefaultPermissions = () => {
  return {
    dashboard: { view: false },
    adminUsers: { view: false, create: false, edit: false, delete: false },
    roles: { view: false, create: false, edit: false, delete: false },
    customers: { view: false, edit: false, delete: false },
    ports: { view: false, create: false, edit: false, delete: false },
    passengerTypes: { view: false, create: false, edit: false, delete: false },
    vehicleBrands: { view: false, create: false, edit: false, delete: false },
    vehicleModels: { view: false, create: false, edit: false, delete: false },
    categories: { view: false, create: false, edit: false, delete: false },
    operators: { view: false, create: false, edit: false, delete: false },
    ferries: { view: false, create: false, edit: false, delete: false },
    routes: { view: false, create: false, edit: false, delete: false },
    trips: { view: false, create: false, edit: false, delete: false, cancel: false },
    speedBoats: { view: false, create: false, edit: false, delete: false },
    partyBoats: { view: false, create: false, edit: false, delete: false },
    packages: { view: false, create: false, edit: false, delete: false },
    addons: { view: false, create: false, edit: false, delete: false },
    inquiries: { view: false, respond: false, convert: false },
    bookings: { view: false, create: false, edit: false, cancel: false, refund: false, cashPayment: false },
    reviews: { view: false, moderate: false, delete: false },
    faqs: { view: false, create: false, edit: false, delete: false },
    pages: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, edit: false },
    reports: { view: false, export: false },
  };
};