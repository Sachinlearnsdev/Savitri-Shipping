// src/utils/helpers.js

const bcrypt = require('bcryptjs');
const { PAGINATION, INDIAN_FORMAT } = require('../config/constants');

/**
 * Hash password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate random string
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Paginate query
 */
const paginate = (page, limit) => {
  const currentPage = parseInt(page) || PAGINATION.DEFAULT_PAGE;
  const currentLimit = Math.min(
    parseInt(limit) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  
  return {
    skip: (currentPage - 1) * currentLimit,
    take: currentLimit,
    page: currentPage,
    limit: currentLimit,
  };
};

/**
 * Format currency (Indian Rupees)
 */
const formatCurrency = (amount) => {
  return `${INDIAN_FORMAT.CURRENCY}${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format date (DD/MM/YYYY)
 */
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format time (hh:mm AM/PM)
 */
const formatTime = (date) => {
  const d = new Date(date);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

/**
 * Format date time (DD/MM/YYYY hh:mm AM/PM)
 */
const formatDateTime = (date) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

/**
 * Format phone number (Indian)
 */
const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remove any existing formatting
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it starts with 91 (country code)
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    const number = cleaned.substring(2);
    return `+91 ${number.substring(0, 5)} ${number.substring(5)}`;
  }
  
  // If it's just 10 digits
  if (cleaned.length === 10) {
    return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
  }
  
  return phone;
};

/**
 * Calculate GST
 */
const calculateGST = (amount, gstPercentage = 18, isInclusive = false) => {
  if (isInclusive) {
    // GST is already included in the amount
    const baseAmount = amount / (1 + gstPercentage / 100);
    const gstAmount = amount - baseAmount;
    return {
      baseAmount: parseFloat(baseAmount.toFixed(2)),
      gstAmount: parseFloat(gstAmount.toFixed(2)),
      cgst: parseFloat((gstAmount / 2).toFixed(2)),
      sgst: parseFloat((gstAmount / 2).toFixed(2)),
      totalAmount: parseFloat(amount.toFixed(2)),
    };
  } else {
    // GST needs to be added to the amount
    const gstAmount = (amount * gstPercentage) / 100;
    const totalAmount = amount + gstAmount;
    return {
      baseAmount: parseFloat(amount.toFixed(2)),
      gstAmount: parseFloat(gstAmount.toFixed(2)),
      cgst: parseFloat((gstAmount / 2).toFixed(2)),
      sgst: parseFloat((gstAmount / 2).toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    };
  }
};

/**
 * Sanitize user object (remove sensitive fields)
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  
  const { password, ...sanitized } = user;
  return sanitized;
};

/**
 * Get client IP address
 */
const getClientIP = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip
  );
};

/**
 * Get user agent
 */
const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'Unknown';
};

/**
 * Sleep function (for testing/delays)
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Check if date is in the past
 */
const isDateInPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Check if date is in the future
 */
const isDateInFuture = (date) => {
  return new Date(date) > new Date();
};

/**
 * Add days to date
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Add hours to date
 */
const addHours = (date, hours) => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateRandomString,
  paginate,
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatPhone,
  calculateGST,
  sanitizeUser,
  getClientIP,
  getUserAgent,
  sleep,
  isDateInPast,
  isDateInFuture,
  addDays,
  addHours,
};