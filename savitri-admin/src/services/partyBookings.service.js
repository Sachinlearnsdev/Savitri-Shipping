import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getAllPartyBookings = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.PARTY_BOOKINGS, { params });
  return response.data;
};

export const getPartyBookingById = async (id) => {
  const response = await api.get(API_ENDPOINTS.PARTY_BOOKING_BY_ID(id));
  return response.data;
};

export const createPartyBooking = async (data) => {
  const response = await api.post(API_ENDPOINTS.PARTY_BOOKINGS, data);
  return response.data;
};

export const updatePartyBookingStatus = async (id, status) => {
  const response = await api.patch(API_ENDPOINTS.PARTY_BOOKING_STATUS(id), { status });
  return response.data;
};

export const markPartyBookingPaid = async (id, data) => {
  const response = await api.patch(API_ENDPOINTS.PARTY_BOOKING_PAYMENT(id), data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

export const cancelPartyBooking = async (id, reason) => {
  const response = await api.post(API_ENDPOINTS.PARTY_BOOKING_CANCEL(id), { reason });
  return response.data;
};
