/**
 * Formatting utility functions
 * Handles currency, date, phone, and other formatting for Indian context
 */

import { CURRENCY, PHONE_PREFIX } from './constants';

// ==================== CURRENCY FORMATTING ====================

/**
 * Format amount as Indian currency (₹)
 * @param {number} amount - Amount to format
 * @param {boolean} showSymbol - Whether to show currency symbol
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined) return showSymbol ? '₹0.00' : '0.00';
  
  const formatted = new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: 'currency',
    currency: CURRENCY.CODE,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return showSymbol ? formatted : formatted.replace(CURRENCY.SYMBOL, '').trim();
};

/**
 * Format amount in Indian numbering system (lakhs/crores)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount
 */
export const formatIndianNumber = (amount) => {
  if (amount === null || amount === undefined) return '0';
  
  const num = parseFloat(amount);
  
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `${(num / 100000).toFixed(2)} L`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)} K`;
  }
  
  return num.toFixed(2);
};

// ==================== DATE FORMATTING ====================

/**
 * Format date to DD/MM/YYYY
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
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
 * Format date to DD MMM YYYY (e.g., 20 Nov 2025)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDateShort = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day} ${month} ${year}`;
};

/**
 * Format date to DD MMMM YYYY (e.g., 20 November 2025)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDateLong = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day} ${month} ${year}`;
};

/**
 * Format time to HH:MM
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time
 */
export const formatTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Format time to 12-hour format (e.g., 10:30 AM)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time
 */
export const formatTime12Hour = (date) => {
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
 * Format datetime to DD/MM/YYYY HH:MM
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted datetime
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  return `${formatDate(date)} ${formatTime(date)}`;
};

/**
 * Format datetime to DD/MM/YYYY hh:mm AM/PM
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted datetime
 */
export const formatDateTimeFull = (date) => {
  if (!date) return '';
  
  return `${formatDate(date)} ${formatTime12Hour(date)}`;
};

/**
 * Get relative time (e.g., "2 hours ago", "just now")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const seconds = Math.floor((now - d) / 1000);
  
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

// ==================== PHONE FORMATTING ====================

/**
 * Format Indian phone number
 * @param {string} phone - Phone number
 * @param {boolean} withPrefix - Whether to include +91 prefix
 * @returns {string} Formatted phone
 */
export const formatPhone = (phone, withPrefix = true) => {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle 10-digit Indian numbers
  if (cleaned.length === 10) {
    const formatted = `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    return withPrefix ? `${PHONE_PREFIX} ${formatted}` : formatted;
  }
  
  // Handle numbers with country code
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    const number = cleaned.slice(2);
    const formatted = `${number.slice(0, 5)} ${number.slice(5)}`;
    return withPrefix ? `${PHONE_PREFIX} ${formatted}` : formatted;
  }
  
  return phone;
};

// ==================== NUMBER FORMATTING ====================

/**
 * Format number with commas (Indian style)
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat(CURRENCY.LOCALE).format(num);
};

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals)}%`;
};

// ==================== TEXT FORMATTING ====================

/**
 * Format name (capitalize each word)
 * @param {string} name - Name to format
 * @returns {string} Formatted name
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
 * @returns {string} Formatted email
 */
export const formatEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

/**
 * Mask email (show first 3 chars and domain)
 * @param {string} email - Email to mask
 * @returns {string} Masked email
 */
export const maskEmail = (email) => {
  if (!email) return '';
  
  const [username, domain] = email.split('@');
  if (!domain) return email;
  
  const visibleChars = Math.min(3, username.length);
  const masked = username.slice(0, visibleChars) + '***';
  
  return `${masked}@${domain}`;
};

/**
 * Mask phone number (show last 4 digits)
 * @param {string} phone - Phone to mask
 * @returns {string} Masked phone
 */
export const maskPhone = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return phone;
  
  const lastFour = cleaned.slice(-4);
  const masked = '*'.repeat(cleaned.length - 4);
  
  return `${masked}${lastFour}`;
};

// ==================== ID/CODE FORMATTING ====================

/**
 * Format booking ID
 * @param {string} type - Booking type (SB, PB, FR)
 * @param {string|number} id - Booking ID
 * @returns {string} Formatted booking ID
 */
export const formatBookingId = (type, id) => {
  if (!id) return '';
  return `${type}-${String(id).padStart(5, '0')}`;
};

/**
 * Format invoice number
 * @param {string} prefix - Invoice prefix
 * @param {string|number} number - Invoice number
 * @returns {string} Formatted invoice number
 */
export const formatInvoiceNumber = (prefix, number) => {
  if (!number) return '';
  return `${prefix}${String(number).padStart(4, '0')}`;
};

// ==================== FILE SIZE FORMATTING ====================

/**
 * Format bytes to human readable size
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted size
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};