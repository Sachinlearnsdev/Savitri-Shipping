import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getAllBookings = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.BOOKINGS, { params });
  return response.data;
};

export const getBookingById = async (id) => {
  const response = await api.get(API_ENDPOINTS.BOOKING_BY_ID(id));
  return response.data;
};

export const createBooking = async (data) => {
  const response = await api.post(API_ENDPOINTS.BOOKINGS, data);
  return response.data;
};

export const updateBookingStatus = async (id, status) => {
  const response = await api.patch(API_ENDPOINTS.BOOKING_STATUS(id), { status });
  return response.data;
};

export const markBookingPaid = async (id, data) => {
  const response = await api.patch(API_ENDPOINTS.BOOKING_PAYMENT(id), data);
  return response.data;
};

export const cancelBooking = async (id, reason) => {
  const response = await api.post(API_ENDPOINTS.BOOKING_CANCEL(id), { reason });
  return response.data;
};

export const calculatePrice = async (data) => {
  const response = await api.post('/bookings/calculate-price', data);
  return response.data;
};
