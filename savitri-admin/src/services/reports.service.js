import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getOverview = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.REPORTS_OVERVIEW, { params });
  return response.data;
};

export const getRevenueChart = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.REPORTS_REVENUE, { params });
  return response.data;
};

export const getBookingStats = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.REPORTS_BOOKINGS, { params });
  return response.data;
};

export const getTopBoats = async (params = {}) => {
  const response = await api.get(API_ENDPOINTS.REPORTS_TOP_BOATS, { params });
  return response.data;
};

/**
 * Export analytics data as CSV (triggers file download)
 */
export const exportCSV = async (period = '30d') => {
  const response = await api.get(API_ENDPOINTS.REPORTS_EXPORT_CSV, {
    params: { period },
    responseType: 'blob',
  });

  // Create a download link and trigger download
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `savitri-analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Export analytics data as PDF (opens print-friendly HTML in new tab)
 */
export const exportPDF = async (period = '30d') => {
  const response = await api.get(API_ENDPOINTS.REPORTS_EXPORT_PDF, {
    params: { period },
    responseType: 'text',
  });

  // Open HTML in a new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(response.data);
    printWindow.document.close();
  }
};
