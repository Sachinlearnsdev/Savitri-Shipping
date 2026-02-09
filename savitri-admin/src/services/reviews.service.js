import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getReviews = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.REVIEWS, { params });
  return response.data;
};

export const getReviewById = async (id) => {
  const response = await api.get(API_ENDPOINTS.REVIEW_BY_ID(id));
  return response.data;
};

export const approveReview = async (id, approved) => {
  const response = await api.patch(API_ENDPOINTS.REVIEW_APPROVE(id), { approved });
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await api.delete(API_ENDPOINTS.REVIEW_BY_ID(id));
  return response.data;
};

export const getReviewStats = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.REVIEW_STATS, { params });
  return response.data;
};

export const getBoatReviewsAggregation = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.REVIEW_BOAT_AGGREGATION, { params });
  return response.data;
};
