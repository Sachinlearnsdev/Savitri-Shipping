import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getInquiries = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.INQUIRIES, { params });
  return response.data;
};

export const getInquiryById = async (id) => {
  const response = await api.get(API_ENDPOINTS.INQUIRY_BY_ID(id));
  return response.data;
};

export const sendQuote = async (id, data) => {
  const response = await api.patch(API_ENDPOINTS.INQUIRY_QUOTE(id), data);
  return response.data;
};

export const convertToBooking = async (id) => {
  const response = await api.patch(API_ENDPOINTS.INQUIRY_CONVERT(id));
  return response.data;
};

export const deleteInquiry = async (id) => {
  const response = await api.delete(API_ENDPOINTS.INQUIRY_BY_ID(id));
  return response.data;
};
