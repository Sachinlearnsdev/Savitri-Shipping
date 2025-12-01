/**
 * Formatters
 * Functions to format data for display (Indian format)
 */

import { CURRENCY } from './constants';

/**
 * Format currency (Indian Rupee)
 * @param {number} amount - Amount to format
 * @param {boolean} showSymbol - Show currency symbol
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? `${CURRENCY.SYMBOL}0.00` : '0.00';
  }

  // Indian number format with commas
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return showSymbol ? `${CURRENCY.SYMBOL}${formatted}` : formatted;
};

/**
 * Format date (DD/MM/YYYY)
 * @param {Date|string} date - Date to format
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Format date and time (DD/MM/YYYY hh:mm AM/PM)
 * @param {Date|string} date - Date to format
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const dateStr = formatDate(date);
  const timeStr = formatTime(date);

  return `${dateStr} ${timeStr}`;
};

/**
 * Format time (hh:mm AM/PM)
 * @param {Date|string} date - Date to format
 */
export const formatTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  
  return `${hours}:${minutes} ${ampm}`;
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
  return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
};

/**
 * Format phone number (Indian format)
 * @param {string} phone - Phone number
 * @param {boolean} withCountryCode - Include +91
 */
export const formatPhone = (phone, withCountryCode = true) => {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Remove country code if present
  let number = cleaned;
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    number = cleaned.slice(2);
  }
  
  // Format: +91 XXXXX XXXXX
  if (number.length === 10) {
    const formatted = `${number.slice(0, 5)} ${number.slice(5)}`;
    return withCountryCode ? `+91 ${formatted}` : formatted;
  }
  
  return phone;
};

/**
 * Format duration in minutes to hours and minutes
 * @param {number} minutes - Duration in minutes
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '0 minutes';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} minute${mins !== 1 ? 's' : ''}`;
  if (mins === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
};

/**
 * Format capacity (e.g., "10 persons")
 * @param {number} capacity - Capacity number
 */
export const formatCapacity = (capacity) => {
  if (!capacity || capacity < 0) return '0 persons';
  return `${capacity} person${capacity !== 1 ? 's' : ''}`;
};

/**
 * Format distance (km)
 * @param {number} distance - Distance in kilometers
 */
export const formatDistance = (distance) => {
  if (!distance || distance < 0) return '0 km';
  return `${distance.toFixed(1)} km`;
};

/**
 * Format booking ID
 * @param {string} id - Booking ID
 * @param {string} type - Booking type (SPEED_BOAT, PARTY_BOAT, FERRY)
 */
export const formatBookingId = (id, type) => {
  const prefixes = {
    SPEED_BOAT: 'SB',
    PARTY_BOAT: 'PB',
    FERRY: 'FR',
  };
  
  const prefix = prefixes[type] || 'BK';
  return `${prefix}-${id.slice(0, 8).toUpperCase()}`;
};

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Format percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @param {number} decimals - Decimal places
 */
export const formatPercentage = (value, total, decimals = 0) => {
  if (total === 0) return '0%';
  const percent = ((value / total) * 100).toFixed(decimals);
  return `${percent}%`;
};

/**
 * Format name (capitalize first letter of each word)
 * @param {string} name - Name to format
 */
export const formatName = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format email (lowercase)
 * @param {string} email - Email to format
 */
export const formatEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

/**
 * Mask email (e.g., j***@example.com)
 * @param {string} email - Email to mask
 */
export const maskEmail = (email) => {
  if (!email) return '';
  
  const [username, domain] = email.split('@');
  if (!username || !domain) return email;
  
  const masked = username.charAt(0) + '***';
  return `${masked}@${domain}`;
};

/**
 * Mask phone (e.g., +91 XXXXX XX123)
 * @param {string} phone - Phone to mask
 */
export const maskPhone = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  let number = cleaned;
  
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    number = cleaned.slice(2);
  }
  
  if (number.length === 10) {
    const masked = 'XXXXX' + number.slice(5);
    return `+91 ${masked.slice(0, 5)} ${masked.slice(5)}`;
  }
  
  return phone;
};

/**
 * Format credit card number (mask middle digits)
 * @param {string} cardNumber - Card number
 */
export const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length < 12) return cardNumber;
  
  const first4 = cleaned.slice(0, 4);
  const last4 = cleaned.slice(-4);
  
  return `${first4} **** **** ${last4}`;
};

/**
 * Format rating (e.g., "4.5/5")
 * @param {number} rating - Rating value
 * @param {number} maxRating - Maximum rating
 */
export const formatRating = (rating, maxRating = 5) => {
  if (!rating || rating < 0) return '0.0';
  return `${rating.toFixed(1)}/${maxRating}`;
};

/**
 * Format Indian number (with lakhs and crores)
 * @param {number} num - Number to format
 */
export const formatIndianNumber = (num) => {
  if (!num) return '0';
  
  return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Parse date from DD/MM/YYYY format
 * @param {string} dateStr - Date string
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);
  
  return new Date(year, month, day);
};

/**
 * Get day name from date
 * @param {Date|string} date - Date
 */
export const getDayName = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[d.getDay()];
};

/**
 * Get month name from date
 * @param {Date|string} date - Date
 */
export const getMonthName = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[d.getMonth()];
};

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatPhone,
  formatDuration,
  formatCapacity,
  formatDistance,
  formatBookingId,
  formatFileSize,
  formatPercentage,
  formatName,
  formatEmail,
  maskEmail,
  maskPhone,
  maskCardNumber,
  formatRating,
  formatIndianNumber,
  parseDate,
  getDayName,
  getMonthName,
};