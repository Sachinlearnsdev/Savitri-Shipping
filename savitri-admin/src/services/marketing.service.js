import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getCampaigns = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.MARKETING, { params });
  return response.data;
};

export const getCampaignById = async (id) => {
  const response = await api.get(API_ENDPOINTS.MARKETING_BY_ID(id));
  return response.data;
};

export const sendCampaign = async (data) => {
  const response = await api.post(API_ENDPOINTS.MARKETING_SEND, data);
  return response.data;
};

export const sendTestEmail = async (data) => {
  const response = await api.post(API_ENDPOINTS.MARKETING_TEST, data);
  return response.data;
};
