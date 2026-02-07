import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getAllRules = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.PRICING_RULES, { params });
  return response.data;
};

export const getRuleById = async (id) => {
  const response = await api.get(API_ENDPOINTS.PRICING_RULE_BY_ID(id));
  return response.data;
};

export const createRule = async (data) => {
  const response = await api.post(API_ENDPOINTS.PRICING_RULES, data);
  return response.data;
};

export const updateRule = async (id, data) => {
  const response = await api.put(API_ENDPOINTS.PRICING_RULE_BY_ID(id), data);
  return response.data;
};

export const deleteRule = async (id) => {
  const response = await api.delete(API_ENDPOINTS.PRICING_RULE_BY_ID(id));
  return response.data;
};
