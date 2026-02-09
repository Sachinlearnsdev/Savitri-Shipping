// NEW FILE - 2024-12-11
// Customers Service
// Handles all API calls for customer management (admin view only)

import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Get all customers with pagination and filters
 * @param {object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 * @param {string} params.status - Filter by status
 * @param {boolean} params.emailVerified - Filter by email verification
 * @param {boolean} params.phoneVerified - Filter by phone verification
 * @returns {Promise<object>} Response data
 */
export const getAllCustomers = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.CUSTOMERS, { params });
  return response.data;
};

/**
 * Get customer by ID
 * @param {string} id - Customer ID
 * @returns {Promise<object>} Response data (includes saved vehicles and login history)
 */
export const getCustomerById = async (id) => {
  const response = await api.get(API_ENDPOINTS.CUSTOMER_BY_ID(id));
  return response.data;
};

/**
 * Get customer bookings
 * @param {string} id - Customer ID
 * @param {object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<object>} Response data
 */
export const getCustomerBookings = async (id, params = {}) => {
  const response = await api.get(API_ENDPOINTS.CUSTOMER_BOOKINGS(id), { params });
  return response.data;
};

/**
 * Update customer status
 * @param {string} id - Customer ID
 * @param {string} status - New status (ACTIVE, INACTIVE, LOCKED)
 * @returns {Promise<object>} Response data
 */
export const updateCustomerStatus = async (id, status) => {
  const response = await api.patch(API_ENDPOINTS.CUSTOMER_STATUS(id), { status });
  return response.data;
};

/**
 * Toggle venue payment allowed
 * @param {string} id - Customer ID
 * @param {boolean} venuePaymentAllowed - Whether venue payment is allowed
 * @returns {Promise<object>} Response data
 */
export const toggleVenuePayment = async (id, venuePaymentAllowed) => {
  const response = await api.patch(API_ENDPOINTS.CUSTOMER_VENUE_PAYMENT(id), { venuePaymentAllowed });
  return response.data;
};