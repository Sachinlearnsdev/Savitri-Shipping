import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getAllPartyBoats = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.PARTY_BOATS, { params });
  return response.data;
};

export const getPartyBoatById = async (id) => {
  const response = await api.get(API_ENDPOINTS.PARTY_BOAT_BY_ID(id));
  return response.data;
};

export const createPartyBoat = async (data) => {
  const response = await api.post(API_ENDPOINTS.PARTY_BOATS, data);
  return response.data;
};

export const updatePartyBoat = async (id, data) => {
  const response = await api.put(API_ENDPOINTS.PARTY_BOAT_BY_ID(id), data);
  return response.data;
};

export const deletePartyBoat = async (id) => {
  const response = await api.delete(API_ENDPOINTS.PARTY_BOAT_BY_ID(id));
  return response.data;
};

export const uploadPartyBoatImages = async (id, formData) => {
  const response = await api.post(API_ENDPOINTS.PARTY_BOAT_IMAGES(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const removePartyBoatImage = async (id, imageUrl) => {
  const response = await api.delete(API_ENDPOINTS.PARTY_BOAT_IMAGES(id), {
    data: { imageUrl },
  });
  return response.data;
};
