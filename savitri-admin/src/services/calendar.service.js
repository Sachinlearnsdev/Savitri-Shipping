import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getCalendar = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.CALENDAR, { params });
  return response.data;
};

export const updateDay = async (data) => {
  const response = await api.put(API_ENDPOINTS.CALENDAR, data);
  return response.data;
};

export const bulkUpdateDays = async (dates) => {
  const response = await api.put(API_ENDPOINTS.CALENDAR_BULK, { dates });
  return response.data;
};
