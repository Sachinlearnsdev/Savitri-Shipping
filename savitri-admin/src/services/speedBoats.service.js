import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getAllBoats = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.SPEED_BOATS, { params });
  return response.data;
};

export const getBoatById = async (id) => {
  const response = await api.get(API_ENDPOINTS.SPEED_BOAT_BY_ID(id));
  return response.data;
};

export const createBoat = async (data) => {
  const response = await api.post(API_ENDPOINTS.SPEED_BOATS, data);
  return response.data;
};

export const updateBoat = async (id, data) => {
  const response = await api.put(API_ENDPOINTS.SPEED_BOAT_BY_ID(id), data);
  return response.data;
};

export const deleteBoat = async (id) => {
  const response = await api.delete(API_ENDPOINTS.SPEED_BOAT_BY_ID(id));
  return response.data;
};

export const uploadBoatImages = async (id, formData) => {
  const response = await api.post(API_ENDPOINTS.SPEED_BOAT_IMAGES(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteBoatImage = async (boatId, imageIndex) => {
  const response = await api.delete(`${API_ENDPOINTS.SPEED_BOAT_IMAGES(boatId)}/${imageIndex}`);
  return response.data;
};
