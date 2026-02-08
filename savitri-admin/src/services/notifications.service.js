import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getNotificationCounts = async () => {
  const response = await api.get(API_ENDPOINTS.NOTIFICATION_COUNTS);
  return response.data;
};
