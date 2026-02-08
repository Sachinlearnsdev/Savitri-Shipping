import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getCoupons = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.COUPONS, { params });
  return response.data;
};

export const getCouponById = async (id) => {
  const response = await api.get(API_ENDPOINTS.COUPON_BY_ID(id));
  return response.data;
};

export const createCoupon = async (data) => {
  const response = await api.post(API_ENDPOINTS.COUPONS, data);
  return response.data;
};

export const updateCoupon = async (id, data) => {
  const response = await api.put(API_ENDPOINTS.COUPON_BY_ID(id), data);
  return response.data;
};

export const deleteCoupon = async (id) => {
  const response = await api.delete(API_ENDPOINTS.COUPON_BY_ID(id));
  return response.data;
};

export const toggleCouponActive = async (id) => {
  const response = await api.patch(API_ENDPOINTS.COUPON_TOGGLE_ACTIVE(id));
  return response.data;
};
