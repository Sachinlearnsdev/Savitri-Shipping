import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getSettings = async () => {
  const response = await api.get(API_ENDPOINTS.SETTINGS);
  return response.data;
};

export const getSettingsByGroup = async (group) => {
  const response = await api.get(API_ENDPOINTS.SETTINGS_BY_GROUP(group));
  return response.data;
};

export const updateSettings = async (group, data) => {
  const response = await api.put(API_ENDPOINTS.SETTINGS_BY_GROUP(group), data);
  return response.data;
};
