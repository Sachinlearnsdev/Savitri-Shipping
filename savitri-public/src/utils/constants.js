/**
 * Application Constants
 * Centralized constants for the entire application
 */

// ==================== API ENDPOINTS ====================
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email',
    VERIFY_PHONE: '/auth/verify-phone',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH_TOKEN: '/auth/refresh-token',
    ME: '/auth/me',
  },
  
  // Profile
  PROFILE: {
    GET: '/profile',
    UPDATE: '/profile',
    CHANGE_PASSWORD: '/profile/change-password',
    UPLOAD_AVATAR: '/profile/upload-avatar',
    SESSIONS: '/profile/sessions',
    VEHICLES: '/profile/vehicles',
    BOOKINGS: '/profile/bookings',
    REVIEWS: '/profile/reviews',
  },
  
  // Bookings
  BOOKINGS: {
    SPEED_BOAT: '/bookings/speed-boat',
    PARTY_BOAT: '/bookings/party-boat',
    FERRY: '/bookings/ferry',
  },
  
  // Public Data
  PUBLIC: {
    SPEED_BOATS: '/public/speed-boats',
    PARTY_BOATS: '/public/party-boats',
    FERRIES: '/public/ferries',
    ROUTES: '/public/routes',
    PORTS: '/public/ports',
    FAQS: '/public/faqs',
    PAGES: '/public/pages',
  },
};

// ==================== VEHICLE TYPES ====================
export const VEHICLE_TYPES = {
  CAR: 'CAR',
  BIKE: 'BIKE',
  CYCLE: 'CYCLE',
};

export const VEHICLE_TYPE_LABELS = {
  [VEHICLE_TYPES.CAR]: 'Car',
  [VEHICLE_TYPES.BIKE]: 'Bike',
  [VEHICLE_TYPES.CYCLE]: 'Cycle',
};

// ==================== BOOKING STATUSES ====================
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  REFUNDED: 'REFUNDED',
};

export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUS.PENDING]: 'Pending',
  [BOOKING_STATUS.CONFIRMED]: 'Confirmed',
  [BOOKING_STATUS.CANCELLED]: 'Cancelled',
  [BOOKING_STATUS.COMPLETED]: 'Completed',
  [BOOKING_STATUS.REFUNDED]: 'Refunded',
};

export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: 'warning',
  [BOOKING_STATUS.CONFIRMED]: 'success',
  [BOOKING_STATUS.CANCELLED]: 'error',
  [BOOKING_STATUS.COMPLETED]: 'info',
  [BOOKING_STATUS.REFUNDED]: 'secondary',
};

// ==================== BOOKING TYPES ====================
export const BOOKING_TYPES = {
  SPEED_BOAT: 'SPEED_BOAT',
  PARTY_BOAT: 'PARTY_BOAT',
  FERRY: 'FERRY',
};

export const BOOKING_TYPE_LABELS = {
  [BOOKING_TYPES.SPEED_BOAT]: 'Speed Boat',
  [BOOKING_TYPES.PARTY_BOAT]: 'Party Boat',
  [BOOKING_TYPES.FERRY]: 'Ferry',
};

// ==================== PAYMENT STATUS ====================
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.PAID]: 'Paid',
  [PAYMENT_STATUS.FAILED]: 'Failed',
  [PAYMENT_STATUS.REFUNDED]: 'Refunded',
};

// ==================== PASSENGER TYPES ====================
export const PASSENGER_TYPES = {
  ADULT: 'ADULT',
  CHILD: 'CHILD',
  INFANT: 'INFANT',
};

export const PASSENGER_TYPE_LABELS = {
  [PASSENGER_TYPES.ADULT]: 'Adult',
  [PASSENGER_TYPES.CHILD]: 'Child',
  [PASSENGER_TYPES.INFANT]: 'Infant',
};

// ==================== RATING STARS ====================
export const RATING_VALUES = [1, 2, 3, 4, 5];

// ==================== PAGINATION ====================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 20, 50, 100],
};

// ==================== DATE FORMATS ====================
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_TIME: 'DD/MM/YYYY hh:mm A',
  API: 'YYYY-MM-DD',
  TIME: 'hh:mm A',
  FULL: 'dddd, DD MMMM YYYY',
};

// ==================== VALIDATION RULES ====================
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REGEX: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
    MESSAGE: 'Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character',
  },
  PHONE: {
    REGEX: /^[6-9]\d{9}$/,
    MESSAGE: 'Invalid Indian phone number',
  },
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Invalid email address',
  },
  OTP: {
    LENGTH: 6,
    REGEX: /^\d{6}$/,
    MESSAGE: 'OTP must be 6 digits',
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    REGEX: /^[a-zA-Z\s]+$/,
    MESSAGE: 'Name must contain only letters and spaces',
  },
  REGISTRATION_NO: {
    REGEX: /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/,
    MESSAGE: 'Invalid vehicle registration number (e.g., MH01AB1234)',
  },
};

// ==================== FILE UPLOAD ====================
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    DOCUMENT: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  },
  MESSAGES: {
    TOO_LARGE: 'File size must be less than 5MB',
    INVALID_TYPE: 'Invalid file type',
  },
};

// ==================== LOCAL STORAGE KEYS ====================
export const STORAGE_KEYS = {
  TOKEN: 'customerToken',
  USER: 'customerUser',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// ==================== ROUTES ====================
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_PHONE: '/verify-phone',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Account
  ACCOUNT: '/account',
  ACCOUNT_BOOKINGS: '/account/bookings',
  ACCOUNT_VEHICLES: '/account/vehicles',
  ACCOUNT_REVIEWS: '/account/reviews',
  ACCOUNT_SETTINGS: '/account/settings',
  
  // Services
  SPEED_BOATS: '/speed-boats',
  PARTY_BOATS: '/party-boats',
  FERRY: '/ferry',
  
  // Static
  ABOUT: '/about',
  CONTACT: '/contact',
  FAQ: '/faq',
  TERMS: '/terms',
  PRIVACY: '/privacy',
};

// ==================== NAVIGATION MENU ====================
export const NAVIGATION_MENU = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Speed Boats', href: ROUTES.SPEED_BOATS },
  { label: 'Party Boats', href: ROUTES.PARTY_BOATS },
  { label: 'Ferry', href: ROUTES.FERRY },
  { label: 'About', href: ROUTES.ABOUT },
  { label: 'Contact', href: ROUTES.CONTACT },
];

// ==================== FOOTER MENU ====================
export const FOOTER_MENU = {
  SERVICES: [
    { label: 'Speed Boats', href: ROUTES.SPEED_BOATS },
    { label: 'Party Boats', href: ROUTES.PARTY_BOATS },
    { label: 'Ferry Services', href: ROUTES.FERRY },
  ],
  COMPANY: [
    { label: 'About Us', href: ROUTES.ABOUT },
    { label: 'Contact', href: ROUTES.CONTACT },
    { label: 'FAQ', href: ROUTES.FAQ },
  ],
  LEGAL: [
    { label: 'Terms & Conditions', href: ROUTES.TERMS },
    { label: 'Privacy Policy', href: ROUTES.PRIVACY },
  ],
};

// ==================== SOCIAL MEDIA ====================
export const SOCIAL_MEDIA = {
  FACEBOOK: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
  INSTAGRAM: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
  TWITTER: process.env.NEXT_PUBLIC_TWITTER_URL || '',
  LINKEDIN: process.env.NEXT_PUBLIC_LINKEDIN_URL || '',
};

// ==================== COMPANY INFO ====================
export const COMPANY = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Savitri Shipping',
  PHONE: process.env.NEXT_PUBLIC_COMPANY_PHONE || '+91 98765 43210',
  EMAIL: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'info@savitrishipping.in',
  ADDRESS: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'Mumbai, Maharashtra, India',
};

// ==================== FEATURE FLAGS ====================
export const FEATURES = {
  SPEED_BOATS: process.env.NEXT_PUBLIC_ENABLE_SPEED_BOATS === 'true',
  PARTY_BOATS: process.env.NEXT_PUBLIC_ENABLE_PARTY_BOATS === 'true',
  FERRY: process.env.NEXT_PUBLIC_ENABLE_FERRY === 'true',
};

// ==================== TOAST DURATION ====================
export const TOAST_DURATION = {
  SHORT: 3000,
  NORMAL: 5000,
  LONG: 7000,
};

// ==================== CURRENCIES ====================
export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  NAME: 'Indian Rupee',
};

// ==================== TIME SLOTS (Example for Speed Boats) ====================
export const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

export default {
  API_ENDPOINTS,
  VEHICLE_TYPES,
  VEHICLE_TYPE_LABELS,
  BOOKING_STATUS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  BOOKING_TYPES,
  BOOKING_TYPE_LABELS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PASSENGER_TYPES,
  PASSENGER_TYPE_LABELS,
  RATING_VALUES,
  PAGINATION,
  DATE_FORMATS,
  VALIDATION,
  FILE_UPLOAD,
  STORAGE_KEYS,
  ROUTES,
  NAVIGATION_MENU,
  FOOTER_MENU,
  SOCIAL_MEDIA,
  COMPANY,
  FEATURES,
  TOAST_DURATION,
  CURRENCY,
  TIME_SLOTS,
};