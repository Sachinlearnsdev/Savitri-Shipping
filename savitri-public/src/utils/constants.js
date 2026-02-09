// API Base URL - Auto-detect for Codespaces/Local
// FIXED:
export const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const currentHost = window.location.hostname;

    if (currentHost.includes(".app.github.dev")) {
      // Extract everything before the port number
      const baseUrl = currentHost.replace(/-\d+\.app\.github\.dev$/, "");
      return `https://${baseUrl}-5000.app.github.dev/api`;
    }
  }

  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
};

export const API_BASE_URL = getApiBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGIN_PHONE: "/auth/login-phone",
    VERIFY_LOGIN_OTP: "/auth/verify-login-otp",
    LOGOUT: "/auth/logout",
    VERIFY_EMAIL: "/auth/verify-email",
    VERIFY_PHONE: "/auth/verify-phone",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    RESEND_OTP: "/auth/resend-otp",
  },

  // Profile
  PROFILE: {
    GET: "/profile",
    UPDATE: "/profile",
    AVATAR: "/profile/avatar",
    CHANGE_PASSWORD: "/profile/change-password",
    UPDATE_EMAIL: "/profile/update-email",
    VERIFY_EMAIL_CHANGE: "/profile/verify-email-change",
    UPDATE_PHONE: "/profile/update-phone",
    VERIFY_PHONE_CHANGE: "/profile/verify-phone-change",
    NOTIFICATIONS: "/profile/notifications",
    SESSIONS: "/profile/sessions",
    LOGIN_HISTORY: "/profile/login-history",
    DELETE_ACCOUNT: "/profile",
  },

  // Vehicles
  VEHICLES: {
    LIST: "/profile/vehicles",
    CREATE: "/profile/vehicles",
    UPDATE: (id) => `/profile/vehicles/${id}`,
    DELETE: (id) => `/profile/vehicles/${id}`,
  },

  // Bookings (Public)
  BOOKINGS: {
    BOATS: '/bookings/boats',
    BOAT_BY_ID: (id) => `/bookings/boats/${id}`,
    PARTY_BOATS: '/bookings/party-boats',
    PARTY_BOAT_BY_ID: (id) => `/bookings/party-boats/${id}`,
    CALENDAR_STATUS: '/bookings/calendar-status',
    CHECK_AVAILABILITY: '/bookings/check-availability',
    CALCULATE_PRICE: '/bookings/calculate-price',
    AVAILABLE_SLOTS: '/bookings/available-slots',
    AVAILABLE_BOATS: '/bookings/available-boats',
    CREATE: '/bookings/create',
    MY_BOOKINGS: '/bookings/my-bookings',
    CANCEL: (id) => `/bookings/${id}/cancel`,
    MODIFY_DATE: (id) => `/bookings/${id}/modify-date`,
    MODIFY_SEND_OTP: (id) => `/bookings/${id}/modify/send-otp`,
    MODIFY_CONFIRM: (id) => `/bookings/${id}/modify/confirm`,
    APPLY_COUPON: '/bookings/apply-coupon',
  },

  // Reviews
  REVIEWS: {
    LIST: '/reviews',
    CREATE: '/reviews',
  },

  // Inquiries (Public)
  INQUIRIES: {
    CREATE: '/inquiries',
    MY_INQUIRIES: '/inquiries/my-inquiries',
    BY_ID: (id) => `/inquiries/${id}`,
    RESPOND: (id) => `/inquiries/${id}/respond`,
  },

  // Public Stats (no auth)
  PUBLIC: {
    STATS: '/public/stats',
  },
};

// App Config
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Savitri Shipping";
export const COMPANY_PHONE =
  process.env.NEXT_PUBLIC_COMPANY_PHONE || "+91 98765 43210";
export const COMPANY_EMAIL =
  process.env.NEXT_PUBLIC_COMPANY_EMAIL || "info@savitrishipping.in";
export const COMPANY_ADDRESS =
  process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Mumbai, Maharashtra, India";

// Vehicle Types
export const VEHICLE_TYPES = {
  CAR: "CAR",
  BIKE: "BIKE",
  CYCLE: "CYCLE",
};

export const VEHICLE_TYPE_LABELS = {
  CAR: "Car",
  BIKE: "Bike",
  CYCLE: "Cycle",
};

// User Status
export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  LOCKED: "LOCKED",
  DELETED: "DELETED",
};

// OTP Types
export const OTP_TYPES = {
  EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
  PHONE_VERIFICATION: "PHONE_VERIFICATION",
  LOGIN: "LOGIN",
  PASSWORD_RESET: "PASSWORD_RESET",
  EMAIL_CHANGE: "EMAIL_CHANGE",
  PHONE_CHANGE: "PHONE_CHANGE",
};

// Master OTP for phone verification (testing only)
export const MASTER_OTP = "123456";

// Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  MAX_LOGIN_ATTEMPTS: 5,
  ACCOUNT_LOCK_MINUTES: 15,
  PHONE_LENGTH: 10,
};

// Toast Duration
export const TOAST_DURATION = 5000; // 5 seconds

// OTP Resend Timeout
export const OTP_RESEND_TIMEOUT = 60; // 60 seconds

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "savitri_auth_token",
  USER: "savitri_user",
  REMEMBER_EMAIL: "savitri_remember_email",
};

// Cookie Names
export const COOKIE_NAMES = {
  AUTH_TOKEN: "savitri_token",
};

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-email",
  VERIFY_PHONE: "/verify-phone",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  ACCOUNT: "/account",
  ACCOUNT_PROFILE: "/account/profile",
  ACCOUNT_SECURITY: "/account/security",
  ACCOUNT_VEHICLES: "/account/vehicles",
  ACCOUNT_BOOKINGS: "/account/bookings",
  ACCOUNT_REVIEWS: "/account/reviews",
  ACCOUNT_SETTINGS: "/account/settings",
  ACCOUNT_SESSIONS: "/account/sessions",
  ACCOUNT_HISTORY: "/account/history",
  ABOUT: "/about",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  REFUND: "/refund",
  CONTACT: "/contact",
  BOATS: "/boats",
  BOOK: "/book",
};

// Protected Routes (require authentication)
export const PROTECTED_ROUTES = [
  "/account",
  "/account/dashboard",
  "/account/profile",
  "/account/security",
  "/account/vehicles",
  "/account/bookings",
  "/account/reviews",
  "/account/settings",
  "/account/sessions",
  "/account/history",
];

// Public Routes (redirect to account if logged in)
export const AUTH_ROUTES = [
  "/login",
  "/register",
  "/verify-email",
  "/verify-phone",
  "/forgot-password",
  "/reset-password",
];
