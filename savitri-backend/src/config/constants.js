// src/config/constants.js

module.exports = {
  // User Status
  USER_STATUS: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    LOCKED: 'LOCKED',
    DELETED: 'DELETED',
  },

  // OTP Types (Phase 1 Only)
  OTP_TYPE: {
    EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
    PASSWORD_RESET: 'PASSWORD_RESET',
    // PHASE 2: Phone verification and login OTP types
  },

  // OTP Configuration
  OTP: {
    LENGTH: 6,
    EXPIRY_MINUTES: 10,
    MAX_ATTEMPTS: 5,
  },

  // Account Locking
  ACCOUNT_LOCK: {
    MAX_FAILED_ATTEMPTS: 5,
    LOCK_DURATION_MINUTES: 15,
  },

  // Session Configuration
  SESSION: {
    COOKIE_NAME: 'savitri_token',
    ADMIN_COOKIE_NAME: 'savitri_admin_token',
    COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // File Upload (Images Only for Phase 1)
  FILE_UPLOAD: {
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  },

  // Indian Formats
  INDIAN_FORMAT: {
    CURRENCY: '₹',
    DATE_FORMAT: 'DD/MM/YYYY',
    TIME_FORMAT: 'hh:mm A',
    DATETIME_FORMAT: 'DD/MM/YYYY hh:mm A',
    PHONE_PREFIX: '+91',
    PHONE_REGEX: /^[6-9]\d{9}$/,
  },

  // Roles (Phase 1 - Simplified)
  ROLES: {
    ADMIN: 'Admin',
    STAFF: 'Staff',
    // PHASE 2: Additional roles (Operations Manager, Fleet Manager, etc.)
  },

  // Settings Groups (Phase 1)
  SETTINGS_GROUPS: {
    GENERAL: 'general',
    NOTIFICATION: 'notification',
    // PHASE 2: BILLING, BOOKING, CONTENT
  },

  // Email Templates
  EMAIL_TEMPLATES: {
    WELCOME: 'welcome',
    VERIFY_EMAIL: 'verify-email',
    VERIFY_PHONE: 'verify-phone',
    LOGIN_OTP: 'login-otp',
    PASSWORD_RESET: 'password-reset',
    PASSWORD_CHANGED: 'password-changed',
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
  },
};