// src/config/constants.js

module.exports = {
  // User Status
  USER_STATUS: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    LOCKED: 'LOCKED',
    DELETED: 'DELETED',
  },

  // OTP Types
  OTP_TYPE: {
    EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
    PHONE_VERIFICATION: 'PHONE_VERIFICATION',
    LOGIN: 'LOGIN',
    PASSWORD_RESET: 'PASSWORD_RESET',
    EMAIL_CHANGE: 'EMAIL_CHANGE',
    PHONE_CHANGE: 'PHONE_CHANGE',
  },

  // Vehicle Types
  VEHICLE_TYPE: {
    CAR: 'CAR',
    BIKE: 'BIKE',
    CYCLE: 'CYCLE',
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

  // File Upload
  FILE_UPLOAD: {
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
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

  // GST Configuration
  GST: {
    DEFAULT_PERCENTAGE: 18,
    HSN_SAC_CODE: '996722', // Water transport service
  },

  // Default Roles
  ROLES: {
    SUPER_ADMIN: 'Super Admin',
    OPERATIONS_MANAGER: 'Operations Manager',
    FLEET_MANAGER: 'Fleet Manager',
    BOOKING_AGENT: 'Booking Agent',
    CONTENT_MANAGER: 'Content Manager',
    SUPPORT_STAFF: 'Support Staff',
  },

  // Activity Log Actions
  ACTIVITY_ACTIONS: {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    VIEW: 'VIEW',
    EXPORT: 'EXPORT',
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    CANCEL: 'CANCEL',
  },

  // Settings Groups
  SETTINGS_GROUPS: {
    GENERAL: 'general',
    BILLING: 'billing',
    BOOKING: 'booking',
    NOTIFICATION: 'notification',
    CONTENT: 'content',
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

  // Default Operating Hours
  OPERATING_HOURS: {
    SPEED_BOAT: { from: '06:00', to: '18:00' },
    PARTY_BOAT: { from: '06:00', to: '00:00' },
    FERRY: { from: '06:00', to: '18:00' },
  },

  // Cancellation Policy Defaults
  CANCELLATION_POLICY: {
    SPEED_BOAT: {
      freeHours: 24,
      partialRefundHours: 12,
      partialRefundPercent: 50,
    },
    PARTY_BOAT: {
      freeDays: 7,
      partialRefundDays: 3,
      partialRefundPercent: 50,
    },
    FERRY: {
      freeHours: 24,
      partialRefundHours: 6,
      partialRefundPercent: 50,
    },
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