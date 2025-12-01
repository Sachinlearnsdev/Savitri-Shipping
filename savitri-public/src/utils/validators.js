/**
 * Validators
 * Client-side validation functions
 */

import { VALIDATION, FILE_UPLOAD } from './constants';

/**
 * Validate email
 * @param {string} email - Email to validate
 */
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  
  if (!VALIDATION.EMAIL.REGEX.test(email)) {
    return { valid: false, message: VALIDATION.EMAIL.MESSAGE };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate password
 * @param {string} password - Password to validate
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < VALIDATION.PASSWORD.MIN_LENGTH) {
    return { 
      valid: false, 
      message: `Password must be at least ${VALIDATION.PASSWORD.MIN_LENGTH} characters` 
    };
  }
  
  if (!VALIDATION.PASSWORD.REGEX.test(password)) {
    return { valid: false, message: VALIDATION.PASSWORD.MESSAGE };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate confirm password
 * @param {string} password - Password
 * @param {string} confirmPassword - Confirm password
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { valid: false, message: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate phone number (Indian)
 * @param {string} phone - Phone number to validate
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }
  
  // Remove spaces and country code
  const cleaned = phone.replace(/\s/g, '').replace('+91', '');
  
  if (!VALIDATION.PHONE.REGEX.test(cleaned)) {
    return { valid: false, message: VALIDATION.PHONE.MESSAGE };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate OTP
 * @param {string} otp - OTP to validate
 */
export const validateOTP = (otp) => {
  if (!otp) {
    return { valid: false, message: 'OTP is required' };
  }
  
  if (!VALIDATION.OTP.REGEX.test(otp)) {
    return { valid: false, message: VALIDATION.OTP.MESSAGE };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate name
 * @param {string} name - Name to validate
 */
export const validateName = (name) => {
  if (!name) {
    return { valid: false, message: 'Name is required' };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < VALIDATION.NAME.MIN_LENGTH) {
    return { 
      valid: false, 
      message: `Name must be at least ${VALIDATION.NAME.MIN_LENGTH} characters` 
    };
  }
  
  if (trimmed.length > VALIDATION.NAME.MAX_LENGTH) {
    return { 
      valid: false, 
      message: `Name must not exceed ${VALIDATION.NAME.MAX_LENGTH} characters` 
    };
  }
  
  if (!VALIDATION.NAME.REGEX.test(trimmed)) {
    return { valid: false, message: VALIDATION.NAME.MESSAGE };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} min - Minimum length
 * @param {string} fieldName - Field name for error message
 */
export const validateMinLength = (value, min, fieldName = 'This field') => {
  if (!value || value.length < min) {
    return { 
      valid: false, 
      message: `${fieldName} must be at least ${min} characters` 
    };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} max - Maximum length
 * @param {string} fieldName - Field name for error message
 */
export const validateMaxLength = (value, max, fieldName = 'This field') => {
  if (value && value.length > max) {
    return { 
      valid: false, 
      message: `${fieldName} must not exceed ${max} characters` 
    };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Field name for error message
 */
export const validateRange = (value, min, max, fieldName = 'This field') => {
  const num = Number(value);
  
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} must be a number` };
  }
  
  if (num < min || num > max) {
    return { 
      valid: false, 
      message: `${fieldName} must be between ${min} and ${max}` 
    };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate file
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = FILE_UPLOAD.MAX_SIZE,
    allowedTypes = FILE_UPLOAD.ALLOWED_TYPES.IMAGE,
  } = options;
  
  if (!file) {
    return { valid: false, message: 'Please select a file' };
  }
  
  // Check file size
  if (file.size > maxSize) {
    return { valid: false, message: FILE_UPLOAD.MESSAGES.TOO_LARGE };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: FILE_UPLOAD.MESSAGES.INVALID_TYPE };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate date
 * @param {string|Date} date - Date to validate
 */
export const validateDate = (date) => {
  if (!date) {
    return { valid: false, message: 'Date is required' };
  }
  
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return { valid: false, message: 'Invalid date' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate future date
 * @param {string|Date} date - Date to validate
 */
export const validateFutureDate = (date) => {
  const validation = validateDate(date);
  if (!validation.valid) return validation;
  
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (d < today) {
    return { valid: false, message: 'Date must be in the future' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate time
 * @param {string} time - Time in HH:MM format
 */
export const validateTime = (time) => {
  if (!time) {
    return { valid: false, message: 'Time is required' };
  }
  
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timeRegex.test(time)) {
    return { valid: false, message: 'Invalid time format (HH:MM)' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate vehicle registration number (Indian)
 * @param {string} regNo - Registration number
 */
export const validateRegistrationNumber = (regNo) => {
  if (!regNo) {
    return { valid: false, message: 'Registration number is required' };
  }
  
  const cleaned = regNo.replace(/\s/g, '').toUpperCase();
  
  if (!VALIDATION.REGISTRATION_NO.REGEX.test(cleaned)) {
    return { valid: false, message: VALIDATION.REGISTRATION_NO.MESSAGE };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate rating
 * @param {number} rating - Rating value
 * @param {number} max - Maximum rating (default 5)
 */
export const validateRating = (rating, max = 5) => {
  if (rating === null || rating === undefined) {
    return { valid: false, message: 'Rating is required' };
  }
  
  const num = Number(rating);
  
  if (isNaN(num)) {
    return { valid: false, message: 'Invalid rating' };
  }
  
  if (num < 1 || num > max) {
    return { valid: false, message: `Rating must be between 1 and ${max}` };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 */
export const validateURL = (url) => {
  if (!url) {
    return { valid: false, message: 'URL is required' };
  }
  
  try {
    new URL(url);
    return { valid: true, message: '' };
  } catch {
    return { valid: false, message: 'Invalid URL' };
  }
};

/**
 * Validate form fields
 * @param {Object} fields - Object with field values
 * @param {Object} rules - Validation rules
 * @returns {Object} - { valid: boolean, errors: {} }
 */
export const validateForm = (fields, rules) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(rules).forEach((fieldName) => {
    const value = fields[fieldName];
    const fieldRules = rules[fieldName];
    
    // Required
    if (fieldRules.required) {
      const validation = validateRequired(value, fieldRules.label || fieldName);
      if (!validation.valid) {
        errors[fieldName] = validation.message;
        isValid = false;
        return;
      }
    }
    
    // Skip other validations if field is empty and not required
    if (!value && !fieldRules.required) return;
    
    // Email
    if (fieldRules.email) {
      const validation = validateEmail(value);
      if (!validation.valid) {
        errors[fieldName] = validation.message;
        isValid = false;
        return;
      }
    }
    
    // Phone
    if (fieldRules.phone) {
      const validation = validatePhone(value);
      if (!validation.valid) {
        errors[fieldName] = validation.message;
        isValid = false;
        return;
      }
    }
    
    // Password
    if (fieldRules.password) {
      const validation = validatePassword(value);
      if (!validation.valid) {
        errors[fieldName] = validation.message;
        isValid = false;
        return;
      }
    }
    
    // Min length
    if (fieldRules.minLength) {
      const validation = validateMinLength(value, fieldRules.minLength, fieldRules.label);
      if (!validation.valid) {
        errors[fieldName] = validation.message;
        isValid = false;
        return;
      }
    }
    
    // Max length
    if (fieldRules.maxLength) {
      const validation = validateMaxLength(value, fieldRules.maxLength, fieldRules.label);
      if (!validation.valid) {
        errors[fieldName] = validation.message;
        isValid = false;
        return;
      }
    }
    
    // Custom validator
    if (fieldRules.custom) {
      const validation = fieldRules.custom(value);
      if (!validation.valid) {
        errors[fieldName] = validation.message;
        isValid = false;
        return;
      }
    }
  });
  
  return { valid: isValid, errors };
};

export default {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validatePhone,
  validateOTP,
  validateName,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateRange,
  validateFile,
  validateDate,
  validateFutureDate,
  validateTime,
  validateRegistrationNumber,
  validateRating,
  validateURL,
  validateForm,
};