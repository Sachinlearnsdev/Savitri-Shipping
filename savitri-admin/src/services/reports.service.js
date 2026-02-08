import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getOverview = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.REPORTS_OVERVIEW, { params });
  return response.data;
};

export const getRevenueChart = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.REPORTS_REVENUE, { params });
  return response.data;
};

export const getBookingStats = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.REPORTS_BOOKINGS, { params });
  return response.data;
};

export const getTopBoats = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.REPORTS_TOP_BOATS, { params });
  return response.data;
};
