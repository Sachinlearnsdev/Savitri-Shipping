// src/utils/validators.js

const { z } = require('zod');

/**
 * Password validation schema
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)');

/**
 * Email validation schema
 */
const emailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase();

/**
 * Phone validation schema (Indian)
 */
const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number (must be 10 digits starting with 6-9)');

/**
 * OTP validation schema
 */
const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only numbers');

/**
 * GSTIN validation schema
 */
const gstinSchema = z
  .string()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    'Invalid GSTIN format'
  );

/**
 * PAN validation schema
 */
const panSchema = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format');

/**
 * Validate email
 */
const isValidEmail = (email) => {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate phone
 */
const isValidPhone = (phone) => {
  try {
    phoneSchema.parse(phone);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate password
 */
const isValidPassword = (password) => {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate GSTIN
 */
const isValidGSTIN = (gstin) => {
  try {
    gstinSchema.parse(gstin);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate PAN
 */
const isValidPAN = (pan) => {
  try {
    panSchema.parse(pan);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get validation errors from Zod error
 */
const getValidationErrors = (error) => {
  if (error instanceof z.ZodError) {
    return error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  }
  return [];
};

module.exports = {
  passwordSchema,
  emailSchema,
  phoneSchema,
  otpSchema,
  gstinSchema,
  panSchema,
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidGSTIN,
  isValidPAN,
  getValidationErrors,
};