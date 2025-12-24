import { VALIDATION } from './constants';

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  if (!email) return false;
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.toLowerCase());
};

/**
 * Validate Indian phone number (10 digits, starts with 6-9)
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Must be exactly 10 digits and start with 6, 7, 8, or 9
  const regex = /^[6-9]\d{9}$/;
  return regex.test(cleaned);
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      errors: {
        minLength: true,
        uppercase: true,
        number: true,
        special: true,
      },
    };
  }
  
  const hasMinLength = password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  
  return {
    isValid: hasMinLength && hasUppercase && hasNumber && hasSpecial,
    errors: {
      minLength: !hasMinLength,
      uppercase: !hasUppercase,
      number: !hasNumber,
      special: !hasSpecial,
    },
  };
};

/**
 * Get password strength
 * @param {string} password - Password to check
 * @returns {object} { strength: string, score: number }
 */
export const getPasswordStrength = (password) => {
  if (!password) {
    return { strength: 'none', score: 0 };
  }
  
  let score = 0;
  
  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character types
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*]/.test(password)) score++;
  
  // Determine strength
  let strength = 'weak';
  if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  return { strength, score };
};

/**
 * Validate OTP (6 digits)
 * @param {string} otp - OTP to validate
 * @returns {boolean}
 */
export const validateOTP = (otp) => {
  if (!otp) return false;
  
  const regex = /^\d{6}$/;
  return regex.test(otp);
};

/**
 * Validate name (at least 2 characters, letters and spaces only)
 * @param {string} name - Name to validate
 * @returns {boolean}
 */
export const validateName = (name) => {
  if (!name) return false;
  
  const trimmed = name.trim();
  
  // At least 2 characters
  if (trimmed.length < 2) return false;
  
  // Only letters, spaces, and hyphens
  const regex = /^[a-zA-Z\s-]+$/;
  return regex.test(trimmed);
};

/**
 * Validate vehicle registration number (Indian format)
 * @param {string} regNo - Registration number
 * @returns {boolean}
 */
export const validateRegistrationNumber = (regNo) => {
  if (!regNo) return true; // Optional field
  
  // Indian format: MH01AB1234 or MH-01-AB-1234
  const regex = /^[A-Z]{2}[-\s]?[0-9]{2}[-\s]?[A-Z]{1,2}[-\s]?[0-9]{4}$/i;
  return regex.test(regNo.toUpperCase());
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean}
 */
export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return true;
  if (typeof value === 'boolean') return true;
  return false;
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {string[]} allowedTypes - Allowed MIME types
 * @returns {boolean}
 */
export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']) => {
  if (!file) return false;
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeInMB - Maximum size in MB
 * @returns {boolean}
 */
export const validateFileSize = (file, maxSizeInMB = 5) => {
  if (!file) return false;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
export const validateURL = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get validation error message
 * @param {string} field - Field name
 * @param {string} type - Error type
 * @returns {string}
 */
export const getValidationError = (field, type) => {
  const errors = {
    required: `${field} is required`,
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid 10-digit phone number',
    password: 'Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character',
    passwordMatch: 'Passwords do not match',
    otp: 'Please enter a valid 6-digit OTP',
    name: 'Please enter a valid name (at least 2 characters)',
    regNo: 'Please enter a valid registration number (e.g., MH01AB1234)',
    fileType: 'Please select a valid image file (JPG, PNG)',
    fileSize: 'File size must be less than 5 MB',
    url: 'Please enter a valid URL',
  };
  
  return errors[type] || `Invalid ${field}`;
};