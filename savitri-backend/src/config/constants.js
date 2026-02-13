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
    BOOKING_MODIFICATION: 'BOOKING_MODIFICATION',
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
    COOKIE_MAX_AGE: 1 * 24 * 60 * 60 * 1000, // 1 day
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

  // Gender
  GENDER: {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
    OTHER: 'OTHER',
    PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY',
  },

  // Roles
  ROLES: {
    ADMIN: 'Admin',
    STAFF: 'Staff',
  },

  // Settings Groups
  SETTINGS_GROUPS: {
    GENERAL: 'general',
    NOTIFICATION: 'notification',
    BILLING: 'billing',
    BOOKING: 'booking',
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
    BOOKING_CONFIRMATION: 'booking-confirmation',
    BOOKING_CANCELLATION: 'booking-cancellation',
    BOOKING_MODIFICATION: 'booking-modification',
    BOOKING_MODIFICATION_OTP: 'booking-modification-otp',
    BOOKING_REMINDER: 'booking-reminder',
    PAYMENT_PENDING: 'payment-pending',
    PAYMENT_CONFIRMED: 'payment-confirmed',
    AT_VENUE_BOOKING: 'at-venue-booking',
    INQUIRY_CONFIRMATION: 'inquiry-confirmation',
    INQUIRY_QUOTE: 'inquiry-quote',
    INQUIRY_ACCEPTED: 'inquiry-accepted',
  },

  // Boat Status (Speed + Party)
  BOAT_STATUS: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    MAINTENANCE: 'MAINTENANCE',
  },

  // Party Boat - Location Types
  LOCATION_TYPE: {
    HARBOR: 'HARBOR',
    CRUISE: 'CRUISE',
  },

  // Party Boat - Time Slots
  TIME_SLOT: {
    MORNING: 'MORNING',
    AFTERNOON: 'AFTERNOON',
    EVENING: 'EVENING',
    FULL_DAY: 'FULL_DAY',
  },

  // Party Boat - Event Types
  EVENT_TYPE: {
    WEDDING: 'WEDDING',
    BIRTHDAY: 'BIRTHDAY',
    CORPORATE: 'CORPORATE',
    COLLEGE_FAREWELL: 'COLLEGE_FAREWELL',
    OTHER: 'OTHER',
  },

  // Party Boat - Add-on Types
  ADD_ON_TYPE: {
    CATERING_VEG: 'CATERING_VEG',
    CATERING_NONVEG: 'CATERING_NONVEG',
    LIVE_BAND: 'LIVE_BAND',
    PHOTOGRAPHER: 'PHOTOGRAPHER',
    DECORATION_STANDARD: 'DECORATION_STANDARD',
  },

  // Party Boat - Price Types (for add-ons)
  PRICE_TYPE: {
    FIXED: 'FIXED',
    PER_PERSON: 'PER_PERSON',
  },

  // Booking Status
  BOOKING_STATUS: {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    NO_SHOW: 'NO_SHOW',
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'PENDING',
    PAID: 'PAID',
    ADVANCE_PAID: 'ADVANCE_PAID',
    PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
    REFUNDED: 'REFUNDED',
  },

  // Payment Mode
  PAYMENT_MODE: {
    ONLINE: 'ONLINE',
    AT_VENUE: 'AT_VENUE',
  },

  // Operating Calendar Status
  CALENDAR_STATUS: {
    OPEN: 'OPEN',
    PARTIAL_CLOSED: 'PARTIAL_CLOSED',
    CLOSED: 'CLOSED',
  },

  // Reasons for closing a day
  CLOSE_REASON: {
    TIDE: 'TIDE',
    WEATHER: 'WEATHER',
    MAINTENANCE: 'MAINTENANCE',
    HOLIDAY: 'HOLIDAY',
    OTHER: 'OTHER',
  },

  // Pricing Rule Types
  PRICING_RULE_TYPE: {
    PEAK_HOURS: 'PEAK_HOURS',
    OFF_PEAK_HOURS: 'OFF_PEAK_HOURS',
    WEEKEND: 'WEEKEND',
    SEASONAL: 'SEASONAL',
    HOLIDAY: 'HOLIDAY',
    SPECIAL: 'SPECIAL',
  },

  // Booking Number Prefixes
  SPEED_BOOKING_PREFIX: 'SB',
  PARTY_BOOKING_PREFIX: 'PB',
  INQUIRY_PREFIX: 'INQ',

  // Inquiry Status
  INQUIRY_STATUS: {
    PENDING: 'PENDING',
    QUOTED: 'QUOTED',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    CONVERTED: 'CONVERTED',
    EXPIRED: 'EXPIRED',
  },

  // Party Boat Cancellation Policy (different from speed boats)
  PARTY_CANCELLATION_POLICY: {
    FULL_REFUND_DAYS: 7,        // 7d+ before = 100% refund
    PARTIAL_REFUND_DAYS: 3,     // 3-7d before = 50% refund
    PARTIAL_REFUND_PERCENT: 50,
  },

  // Booking Limits (defaults, configurable via settings)
  BOOKING_LIMITS: {
    MAX_ADVANCE_DAYS: 45,
    MIN_NOTICE_HOURS: 2,
    BUFFER_MINUTES: 30,
    MIN_DURATION_HOURS: 1,
    MAX_DURATION_HOURS: 8,
  },

  // Cancellation Policy (defaults, configurable via settings)
  CANCELLATION_POLICY: {
    FULL_REFUND_HOURS: 24,       // 24h+ before = 100% refund
    PARTIAL_REFUND_HOURS: 12,    // 12-24h before = 50% refund
    PARTIAL_REFUND_PERCENT: 50,
    NO_REFUND_HOURS: 12,         // <12h = 0% refund
  },

  // GST
  GST: {
    PERCENTAGE: 18,
    IS_INCLUSIVE: false, // GST is exclusive (added on top)
  },

  // Cancelled By
  CANCELLED_BY: {
    CUSTOMER: 'CUSTOMER',
    ADMIN: 'ADMIN',
  },

  // Created By Type
  CREATED_BY_TYPE: {
    CUSTOMER: 'CUSTOMER',
    ADMIN: 'ADMIN',
  },

  // Coupon Discount Types
  DISCOUNT_TYPE: {
    PERCENTAGE: 'PERCENTAGE',
    FIXED: 'FIXED',
  },

  // Coupon Applicable To
  COUPON_APPLICABLE_TO: {
    ALL: 'ALL',
    SPEED_BOAT: 'SPEED_BOAT',
    PARTY_BOAT: 'PARTY_BOAT',
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