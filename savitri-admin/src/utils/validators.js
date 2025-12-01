/**
 * Validation utility functions
 * Client-side validation for forms and inputs
 */

import {
  EMAIL_REGEX,
  PHONE_REGEX,
  PASSWORD_REGEX,
  PASSWORD_MIN_LENGTH,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
} from './constants';

// ==================== BASIC VALIDATIONS ====================

/**
 * Check if value is empty
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Check if value is required
 * @param {any} value - Value to check
 * @returns {string|null} Error message or null
 */
export const required = (value) => {
  return isEmpty(value) ? 'This field is required' : null;
};

// ==================== EMAIL VALIDATION ====================

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {string|null} Error message or null
 */
export const validateEmail = (email) => {
  if (isEmpty(email)) return 'Email is required';
  
  if (!EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

// ==================== PHONE VALIDATION ====================

/**
 * Validate Indian phone number
 * @param {string} phone - Phone to validate
 * @returns {string|null} Error message or null
 */
export const validatePhone = (phone) => {
  if (isEmpty(phone)) return 'Phone number is required';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (!PHONE_REGEX.test(cleaned)) {
    return 'Please enter a valid 10-digit Indian phone number';
  }
  
  return null;
};

// ==================== PASSWORD VALIDATION ====================

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {string|null} Error message or null
 */
export const validatePassword = (password) => {
  if (isEmpty(password)) return 'Password is required';
  
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
  }
  
  if (!PASSWORD_REGEX.test(password)) {
    return 'Password must contain at least one uppercase letter, one number, and one special character (!@#$%^&*)';
  }
  
  return null;
};

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {string|null} Error message or null
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (isEmpty(confirmPassword)) return 'Please confirm your password';
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
};

// ==================== NAME VALIDATION ====================

/**
 * Validate name
 * @param {string} name - Name to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {string|null} Error message or null
 */
export const validateName = (name, minLength = 2, maxLength = 50) => {
  if (isEmpty(name)) return 'Name is required';
  
  const trimmed = name.trim();
  
  if (trimmed.length < minLength) {
    return `Name must be at least ${minLength} characters long`;
  }
  
  if (trimmed.length > maxLength) {
    return `Name must not exceed ${maxLength} characters`;
  }
  
  if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
    return 'Name can only contain letters and spaces';
  }
  
  return null;
};

// ==================== NUMBER VALIDATION ====================

/**
 * Validate number
 * @param {string|number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {string|null} Error message or null
 */
export const validateNumber = (value, min = null, max = null) => {
  if (isEmpty(value)) return 'This field is required';
  
  const num = Number(value);
  
  if (isNaN(num)) {
    return 'Please enter a valid number';
  }
  
  if (min !== null && num < min) {
    return `Value must be at least ${min}`;
  }
  
  if (max !== null && num > max) {
    return `Value must not exceed ${max}`;
  }
  
  return null;
};

/**
 * Validate positive number
 * @param {string|number} value - Value to validate
 * @returns {string|null} Error message or null
 */
export const validatePositiveNumber = (value) => {
  const error = validateNumber(value, 0);
  if (error) return error;
  
  if (Number(value) <= 0) {
    return 'Value must be greater than 0';
  }
  
  return null;
};

// ==================== URL VALIDATION ====================

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {string|null} Error message or null
 */
export const validateUrl = (url) => {
  if (isEmpty(url)) return null; // URL is optional
  
  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

// ==================== DATE VALIDATION ====================

/**
 * Validate date
 * @param {string|Date} date - Date to validate
 * @param {boolean} futureOnly - Only allow future dates
 * @param {boolean} pastOnly - Only allow past dates
 * @returns {string|null} Error message or null
 */
export const validateDate = (date, futureOnly = false, pastOnly = false) => {
  if (isEmpty(date)) return 'Date is required';
  
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Please enter a valid date';
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (futureOnly && d < today) {
    return 'Date must be in the future';
  }
  
  if (pastOnly && d > today) {
    return 'Date must be in the past';
  }
  
  return null;
};

/**
 * Validate date range
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {string|null} Error message or null
 */
export const validateDateRange = (startDate, endDate) => {
  if (isEmpty(startDate)) return 'Start date is required';
  if (isEmpty(endDate)) return 'End date is required';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Please enter valid dates';
  }
  
  if (end < start) {
    return 'End date must be after start date';
  }
  
  return null;
};

// ==================== FILE VALIDATION ====================

/**
 * Validate file
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {string|null} Error message or null
 */
export const validateFile = (file, allowedTypes = ALLOWED_IMAGE_TYPES, maxSize = MAX_FILE_SIZE) => {
  if (!file) return 'Please select a file';
  
  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed types: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`;
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return `File size must not exceed ${maxSizeMB} MB`;
  }
  
  return null;
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {string|null} Error message or null
 */
export const validateImageFile = (file) => {
  return validateFile(file, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE);
};

/**
 * Validate document file
 * @param {File} file - File to validate
 * @returns {string|null} Error message or null
 */
export const validateDocumentFile = (file) => {
  return validateFile(file, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE);
};

// ==================== INDIAN SPECIFIC VALIDATIONS ====================

/**
 * Validate GSTIN (Goods and Services Tax Identification Number)
 * @param {string} gstin - GSTIN to validate
 * @returns {string|null} Error message or null
 */
export const validateGSTIN = (gstin) => {
  if (isEmpty(gstin)) return null; // GSTIN is optional
  
  // GSTIN format: 15 characters (e.g., 22AAAAA0000A1Z5)
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  
  if (!gstinRegex.test(gstin)) {
    return 'Please enter a valid GSTIN (15 characters)';
  }
  
  return null;
};

/**
 * Validate PAN (Permanent Account Number)
 * @param {string} pan - PAN to validate
 * @returns {string|null} Error message or null
 */
export const validatePAN = (pan) => {
  if (isEmpty(pan)) return null; // PAN is optional
  
  // PAN format: 10 characters (e.g., ABCDE1234F)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  
  if (!panRegex.test(pan)) {
    return 'Please enter a valid PAN (10 characters)';
  }
  
  return null;
};

/**
 * Validate IFSC Code
 * @param {string} ifsc - IFSC code to validate
 * @returns {string|null} Error message or null
 */
export const validateIFSC = (ifsc) => {
  if (isEmpty(ifsc)) return null; // IFSC is optional
  
  // IFSC format: 11 characters (e.g., SBIN0001234)
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  
  if (!ifscRegex.test(ifsc)) {
    return 'Please enter a valid IFSC code (11 characters)';
  }
  
  return null;
};

/**
 * Validate vehicle registration number
 * @param {string} regNo - Registration number to validate
 * @returns {string|null} Error message or null
 */
export const validateVehicleRegNo = (regNo) => {
  if (isEmpty(regNo)) return 'Registration number is required';
  
  // Indian vehicle registration format (flexible)
  // Examples: MH02AB1234, DL1CAB1234, KA05MH1234
  const regNoRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;
  
  const cleaned = regNo.replace(/[\s-]/g, '').toUpperCase();
  
  if (!regNoRegex.test(cleaned)) {
    return 'Please enter a valid vehicle registration number (e.g., MH02AB1234)';
  }
  
  return null;
};

// ==================== FORM VALIDATION ====================

/**
 * Validate entire form
 * @param {object} values - Form values
 * @param {object} rules - Validation rules { fieldName: validationFunction }
 * @returns {object} Errors object { fieldName: errorMessage }
 */
export const validateForm = (values, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const validationFn = rules[field];
    const value = values[field];
    
    if (typeof validationFn === 'function') {
      const error = validationFn(value);
      if (error) {
        errors[field] = error;
      }
    } else if (Array.isArray(validationFn)) {
      // Multiple validation functions for one field
      for (const fn of validationFn) {
        const error = fn(value);
        if (error) {
          errors[field] = error;
          break;
        }
      }
    }
  });
  
  return errors;
};

/**
 * Check if form has errors
 * @param {object} errors - Errors object
 * @returns {boolean} True if form has errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};