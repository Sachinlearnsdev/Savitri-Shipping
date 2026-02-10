/**
 * Application Constants
 * Centralized configuration for the admin panel
 */

// ==================== APP INFO ====================

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Savitri Shipping Admin';
export const APP_VERSION = '1.0.0';

// ==================== API ENDPOINTS ====================

export const API_ENDPOINTS = {
  // Admin Auth
  ADMIN_LOGIN: '/auth/admin/login',
  ADMIN_VERIFY_OTP: '/auth/admin/verify-otp',
  ADMIN_LOGOUT: '/auth/admin/logout',
  ADMIN_FORGOT_PASSWORD: '/auth/admin/forgot-password',
  ADMIN_RESET_PASSWORD: '/auth/admin/reset-password',
  ADMIN_REFRESH_TOKEN: '/auth/admin/refresh-token',
  
  // Admin Users
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_BY_ID: (id) => `/admin/users/${id}`,
  ADMIN_USER_STATUS: (id) => `/admin/users/${id}/status`,
  ADMIN_USER_ACTIVITY: (id) => `/admin/users/${id}/activity`,
  
  // Roles
  ROLES: '/admin/roles',
  ROLE_BY_ID: (id) => `/admin/roles/${id}`,
  
  // Customers
  CUSTOMERS: '/admin/customers',
  CUSTOMER_BY_ID: (id) => `/admin/customers/${id}`,
  CUSTOMER_BOOKINGS: (id) => `/admin/customers/${id}/bookings`,
  CUSTOMER_STATUS: (id) => `/admin/customers/${id}/status`,
  CUSTOMER_VENUE_PAYMENT: (id) => `/admin/customers/${id}/venue-payment`,
  
  // Admin Profile
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_PROFILE_AVATAR: '/admin/profile/avatar',
  ADMIN_PROFILE_PASSWORD: '/admin/profile/password',

  // Customer Profile
  PROFILE: '/profile',
  PROFILE_CHANGE_PASSWORD: '/profile/change-password',
  PROFILE_UPDATE_EMAIL: '/profile/update-email',
  PROFILE_VERIFY_EMAIL_CHANGE: '/profile/verify-email-change',
  PROFILE_UPDATE_PHONE: '/profile/update-phone',
  PROFILE_VERIFY_PHONE_CHANGE: '/profile/verify-phone-change',
  PROFILE_UPLOAD_AVATAR: '/profile/upload-avatar',
  PROFILE_SESSIONS: '/profile/sessions',
  PROFILE_SESSION_BY_ID: (id) => `/profile/sessions/${id}`,
  PROFILE_DELETE_ACCOUNT: '/profile',
  
  // Settings
  SETTINGS: '/admin/settings',
  SETTINGS_BY_GROUP: (group) => `/admin/settings/${group}`,
  SETTINGS_UPLOAD_LOGO: '/admin/settings/logo',

  // Speed Boats
  SPEED_BOATS: '/admin/speed-boats',
  SPEED_BOAT_BY_ID: (id) => `/admin/speed-boats/${id}`,
  SPEED_BOAT_IMAGES: (id) => `/admin/speed-boats/${id}/images`,

  // Party Boats
  PARTY_BOATS: '/admin/party-boats',
  PARTY_BOAT_BY_ID: (id) => `/admin/party-boats/${id}`,
  PARTY_BOAT_IMAGES: (id) => `/admin/party-boats/${id}/images`,

  // Operating Calendar
  CALENDAR: '/admin/calendar',
  CALENDAR_BULK: '/admin/calendar/bulk',

  // Pricing Rules
  PRICING_RULES: '/admin/pricing-rules',
  PRICING_RULE_BY_ID: (id) => `/admin/pricing-rules/${id}`,

  // Bookings (Admin - Speed Boats)
  BOOKINGS: '/admin/bookings',
  BOOKING_BY_ID: (id) => `/admin/bookings/${id}`,
  BOOKING_STATUS: (id) => `/admin/bookings/${id}/status`,
  BOOKING_PAYMENT: (id) => `/admin/bookings/${id}/payment`,
  BOOKING_CANCEL: (id) => `/admin/bookings/${id}/cancel`,

  // Party Bookings (Admin)
  PARTY_BOOKINGS: '/admin/party-bookings',
  PARTY_BOOKING_BY_ID: (id) => `/admin/party-bookings/${id}`,
  PARTY_BOOKING_STATUS: (id) => `/admin/party-bookings/${id}/status`,
  PARTY_BOOKING_PAYMENT: (id) => `/admin/party-bookings/${id}/payment`,
  PARTY_BOOKING_CANCEL: (id) => `/admin/party-bookings/${id}/cancel`,

  // Reviews (Admin)
  REVIEWS: '/admin/reviews',
  REVIEW_STATS: '/admin/reviews/stats',
  REVIEW_BOAT_AGGREGATION: '/admin/reviews/boat-aggregation',
  REVIEW_BY_ID: (id) => `/admin/reviews/${id}`,
  REVIEW_APPROVE: (id) => `/admin/reviews/${id}/approve`,

  // Coupons (Admin)
  COUPONS: '/admin/coupons',
  COUPON_BY_ID: (id) => `/admin/coupons/${id}`,
  COUPON_TOGGLE_ACTIVE: (id) => `/admin/coupons/${id}/toggle-active`,

  // Notifications (Admin)
  NOTIFICATION_COUNTS: '/admin/notifications/counts',

  // Calendar Weather
  CALENDAR_WEATHER: '/admin/calendar/weather',
  CALENDAR_CURRENT_WEATHER: '/admin/calendar/current-weather',

  // Marketing
  MARKETING: '/admin/marketing',
  MARKETING_BY_ID: (id) => `/admin/marketing/${id}`,
  MARKETING_SEND: '/admin/marketing/send',
  MARKETING_TEST: '/admin/marketing/test',

  // Inquiries (Admin)
  INQUIRIES: '/admin/inquiries',
  INQUIRY_BY_ID: (id) => `/admin/inquiries/${id}`,
  INQUIRY_QUOTE: (id) => `/admin/inquiries/${id}/quote`,
  INQUIRY_CONVERT: (id) => `/admin/inquiries/${id}/convert`,

  // Reports (backend path is /admin/analytics but frontend uses "reports" to avoid ad blockers)
  REPORTS_OVERVIEW: '/admin/analytics/overview',
  REPORTS_REVENUE: '/admin/analytics/revenue',
  REPORTS_BOOKINGS: '/admin/analytics/bookings',
  REPORTS_TOP_BOATS: '/admin/analytics/top-boats',
  REPORTS_EXPORT_CSV: '/admin/analytics/export/csv',
  REPORTS_EXPORT_PDF: '/admin/analytics/export/pdf',
};

// ==================== USER STATUS ====================

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  LOCKED: 'LOCKED',
  DELETED: 'DELETED',
};

export const USER_STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: 'Active',
  [USER_STATUS.INACTIVE]: 'Inactive',
  [USER_STATUS.LOCKED]: 'Locked',
  [USER_STATUS.DELETED]: 'Deleted',
};

export const USER_STATUS_COLORS = {
  [USER_STATUS.ACTIVE]: 'success',
  [USER_STATUS.INACTIVE]: 'warning',
  [USER_STATUS.LOCKED]: 'error',
  [USER_STATUS.DELETED]: 'error',
};

// ==================== BOAT STATUS ====================

export const BOAT_STATUS = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE', MAINTENANCE: 'MAINTENANCE' };
export const BOAT_STATUS_LABELS = { ACTIVE: 'Active', INACTIVE: 'Inactive', MAINTENANCE: 'Maintenance' };
export const BOAT_STATUS_COLORS = { ACTIVE: 'success', INACTIVE: 'warning', MAINTENANCE: 'error' };

// ==================== PARTY BOAT ENUMS ====================

export const LOCATION_TYPE = { HARBOR: 'HARBOR', CRUISE: 'CRUISE' };
export const LOCATION_TYPE_LABELS = { HARBOR: 'Harbor (Docked)', CRUISE: 'Cruise (Sailing)' };

export const TIME_SLOT = { MORNING: 'MORNING', AFTERNOON: 'AFTERNOON', EVENING: 'EVENING', FULL_DAY: 'FULL_DAY' };
export const TIME_SLOT_LABELS = { MORNING: 'Morning', AFTERNOON: 'Afternoon', EVENING: 'Evening', FULL_DAY: 'Full Day' };

export const EVENT_TYPE = { WEDDING: 'WEDDING', BIRTHDAY: 'BIRTHDAY', CORPORATE: 'CORPORATE', COLLEGE_FAREWELL: 'COLLEGE_FAREWELL', OTHER: 'OTHER' };
export const EVENT_TYPE_LABELS = { WEDDING: 'Wedding', BIRTHDAY: 'Birthday', CORPORATE: 'Corporate', COLLEGE_FAREWELL: 'College Farewell', OTHER: 'Other' };

export const ADD_ON_TYPE = { CATERING_VEG: 'CATERING_VEG', CATERING_NONVEG: 'CATERING_NONVEG', LIVE_BAND: 'LIVE_BAND', PHOTOGRAPHER: 'PHOTOGRAPHER', DECORATION_STANDARD: 'DECORATION_STANDARD' };
export const ADD_ON_TYPE_LABELS = { CATERING_VEG: 'Veg Catering', CATERING_NONVEG: 'Non-Veg Catering', LIVE_BAND: 'Live Band', PHOTOGRAPHER: 'Photographer', DECORATION_STANDARD: 'Standard Decoration' };

export const PRICE_TYPE = { FIXED: 'FIXED', PER_PERSON: 'PER_PERSON' };
export const PRICE_TYPE_LABELS = { FIXED: 'Fixed Price', PER_PERSON: 'Per Person' };

// ==================== INQUIRY STATUS ====================

export const INQUIRY_STATUS = { PENDING: 'PENDING', QUOTED: 'QUOTED', ACCEPTED: 'ACCEPTED', REJECTED: 'REJECTED', CONVERTED: 'CONVERTED', EXPIRED: 'EXPIRED' };
export const INQUIRY_STATUS_LABELS = { PENDING: 'Pending', QUOTED: 'Quoted', ACCEPTED: 'Accepted', REJECTED: 'Rejected', CONVERTED: 'Converted', EXPIRED: 'Expired' };
export const INQUIRY_STATUS_COLORS = { PENDING: 'warning', QUOTED: 'info', ACCEPTED: 'success', REJECTED: 'error', CONVERTED: 'success', EXPIRED: 'secondary' };

// ==================== REVIEW TYPE ====================

export const REVIEW_TYPE = { COMPANY: 'COMPANY', SPEED_BOAT: 'SPEED_BOAT', PARTY_BOAT: 'PARTY_BOAT' };
export const REVIEW_TYPE_LABELS = { COMPANY: 'Company', SPEED_BOAT: 'Speed Boat', PARTY_BOAT: 'Party Boat' };
export const REVIEW_TYPE_COLORS = { COMPANY: 'info', SPEED_BOAT: 'success', PARTY_BOAT: 'warning' };

// ==================== COUPON ENUMS ====================

export const DISCOUNT_TYPE = { PERCENTAGE: 'PERCENTAGE', FIXED: 'FIXED' };
export const DISCOUNT_TYPE_LABELS = { PERCENTAGE: 'Percentage', FIXED: 'Fixed Amount' };

export const APPLICABLE_TO = { ALL: 'ALL', SPEED_BOAT: 'SPEED_BOAT', PARTY_BOAT: 'PARTY_BOAT' };
export const APPLICABLE_TO_LABELS = { ALL: 'All Services', SPEED_BOAT: 'Speed Boats', PARTY_BOAT: 'Party Boats' };

// ==================== BOOKING STATUS ====================

export const BOOKING_STATUS = { PENDING: 'PENDING', CONFIRMED: 'CONFIRMED', COMPLETED: 'COMPLETED', CANCELLED: 'CANCELLED', NO_SHOW: 'NO_SHOW' };
export const BOOKING_STATUS_LABELS = { PENDING: 'Pending', CONFIRMED: 'Confirmed', COMPLETED: 'Completed', CANCELLED: 'Cancelled', NO_SHOW: 'No Show' };
export const BOOKING_STATUS_COLORS = { PENDING: 'warning', CONFIRMED: 'success', COMPLETED: 'success', CANCELLED: 'error', NO_SHOW: 'error' };

// ==================== PAYMENT STATUS ====================

export const PAYMENT_STATUS = { PENDING: 'PENDING', PAID: 'PAID', PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED', REFUNDED: 'REFUNDED' };
export const PAYMENT_STATUS_LABELS = { PENDING: 'Pending', PAID: 'Paid', PARTIALLY_REFUNDED: 'Partial Refund', REFUNDED: 'Refunded' };
export const PAYMENT_STATUS_COLORS = { PENDING: 'warning', PAID: 'success', PARTIALLY_REFUNDED: 'warning', REFUNDED: 'error' };

// ==================== PAYMENT MODE ====================

export const PAYMENT_MODE = { ONLINE: 'ONLINE', AT_VENUE: 'AT_VENUE' };
export const PAYMENT_MODE_LABELS = { ONLINE: 'Online', AT_VENUE: 'At Venue' };

// ==================== CALENDAR STATUS ====================

export const CALENDAR_STATUS = { OPEN: 'OPEN', PARTIAL_CLOSED: 'PARTIAL_CLOSED', CLOSED: 'CLOSED' };
export const CALENDAR_STATUS_LABELS = { OPEN: 'Open', PARTIAL_CLOSED: 'Partial Close', CLOSED: 'Closed' };
export const CLOSE_REASONS = { TIDE: 'Tide', WEATHER: 'Weather', MAINTENANCE: 'Maintenance', HOLIDAY: 'Holiday', OTHER: 'Other' };

// ==================== ROLES ====================

export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'Super Admin',
  OPERATIONS_MANAGER: 'Operations Manager',
  FLEET_MANAGER: 'Fleet Manager',
  BOOKING_AGENT: 'Booking Agent',
  CONTENT_MANAGER: 'Content Manager',
  SUPPORT_STAFF: 'Support Staff',
};

// ==================== SETTINGS GROUPS ====================

export const SETTINGS_GROUPS = {
  GENERAL: 'general',
  BILLING: 'billing',
  BOOKING: 'booking',
  NOTIFICATION: 'notification',
  CONTENT: 'content',
};

export const SETTINGS_GROUP_LABELS = {
  [SETTINGS_GROUPS.GENERAL]: 'General Settings',
  [SETTINGS_GROUPS.BILLING]: 'Billing Settings',
  [SETTINGS_GROUPS.BOOKING]: 'Booking Settings',
  [SETTINGS_GROUPS.NOTIFICATION]: 'Notification Settings',
  [SETTINGS_GROUPS.CONTENT]: 'Content Settings',
};

// ==================== PAGINATION ====================

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ==================== DATE & TIME ====================

export const DATE_FORMAT = 'DD/MM/YYYY';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const FULL_DATETIME_FORMAT = 'DD/MM/YYYY hh:mm A';

// ==================== CURRENCY ====================

export const CURRENCY = {
  CODE: 'INR',
  SYMBOL: '₹',
  LOCALE: 'en-IN',
};

// ==================== PHONE ====================

export const PHONE_PREFIX = '+91';
export const PHONE_LENGTH = 10;

// ==================== FILE UPLOAD ====================

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// ==================== VALIDATION ====================

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[6-9]\d{9}$/;

// ==================== TOAST DURATION ====================

export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 7000,
};

// ==================== MODAL SIZES ====================

export const MODAL_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
};

// ==================== BUTTON VARIANTS ====================

export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  OUTLINE: 'outline',
  GHOST: 'ghost',
  DANGER: 'danger',
};

// ==================== BUTTON SIZES ====================

export const BUTTON_SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
};

// ==================== SIDEBAR MENU ====================

export const MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    path: '/dashboard',
    permission: 'dashboard.view',
  },
  {
    id: 'users',
    label: 'Users',
    icon: 'users',
    permission: 'adminUsers.view',
    children: [
      {
        id: 'admin-users',
        label: 'Admin Users',
        icon: 'admin-users',
        path: '/users/admins',
        permission: 'adminUsers.view',
      },
      {
        id: 'roles',
        label: 'Roles',
        icon: 'roles-perms',
        path: '/users/roles',
        permission: 'roles.view',
      },
      {
        id: 'customers',
        label: 'Customers',
        icon: 'customers',
        path: '/users/customers',
        permission: 'customers.view',
      },
    ],
  },
  {
    id: 'boats',
    label: 'Boats',
    icon: 'boats',
    permission: 'speedBoats.view',
    children: [
      { id: 'speed-boats', label: 'Speed Boats', icon: 'speed-boats', path: '/speed-boats', permission: 'speedBoats.view' },
      { id: 'party-boats', label: 'Party Boats', icon: 'party-boats', path: '/party-boats', permission: 'partyBoats.view' },
      { id: 'boats-calendar', label: 'Calendar & Weather', icon: 'calendar-weather', path: '/speed-boats/calendar', permission: 'calendar.view' },
      { id: 'boats-pricing', label: 'Pricing Rules', icon: 'pricing-rules', path: '/speed-boats/pricing', permission: 'pricingRules.view' },
    ],
  },
  {
    id: 'bookings',
    label: 'Bookings',
    icon: 'bookings',
    permission: 'bookings.view',
    children: [
      { id: 'speed-bookings', label: 'Speed Boat Bookings', icon: 'speed-bookings', path: '/bookings', permission: 'bookings.view', countKey: 'pendingBookings' },
      { id: 'party-bookings', label: 'Party Boat Bookings', icon: 'party-bookings', path: '/party-bookings', permission: 'bookings.view', countKey: 'pendingPartyBookings' },
      { id: 'inquiries', label: 'Inquiries', icon: 'inquiries', path: '/inquiries', permission: 'inquiries.view' },
    ],
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: 'reviews',
    permission: 'reviews.view',
    children: [
      { id: 'company-reviews', label: 'Company Reviews', icon: 'company-reviews', path: '/reviews/company', permission: 'reviews.view', countKey: 'pendingReviews' },
      { id: 'boat-reviews', label: 'Boat Reviews', icon: 'boat-reviews', path: '/reviews/product', permission: 'reviews.view', countKey: 'pendingReviews' },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: 'marketing',
    permission: 'coupons.view',
    children: [
      { id: 'coupons', label: 'Coupons', icon: 'coupon-list', path: '/coupons', permission: 'coupons.view' },
      { id: 'email-campaigns', label: 'Email Campaigns', icon: 'email-campaigns', path: '/marketing', permission: 'marketing.view' },
      { id: 'campaign-analytics', label: 'Campaign Analytics', icon: 'boat-performance', path: '/marketing/analytics', permission: 'marketing.view' },
      { id: 'customer-segments', label: 'Customer Segments', icon: 'revenue', path: '/marketing/segments', permission: 'marketing.view' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'analytics',
    permission: 'analytics.view',
    children: [
      { id: 'revenue-reports', label: 'Revenue', icon: 'revenue', path: '/reports/revenue', permission: 'analytics.view' },
      { id: 'booking-reports', label: 'Bookings', icon: 'booking-reports', path: '/reports/bookings', permission: 'analytics.view' },
      { id: 'boat-performance', label: 'Boat Performance', icon: 'boat-performance', path: '/reports/boats', permission: 'analytics.view' },
    ],
  },
  {
    id: 'settings',
    label: 'Business Settings',
    icon: 'settings',
    permission: 'settings.view',
    children: [
      {
        id: 'general-settings',
        label: 'General',
        icon: 'general-settings',
        path: '/settings/general',
        permission: 'settings.view',
      },
      {
        id: 'billing-settings',
        label: 'Billing',
        icon: 'billing-settings',
        path: '/settings/billing',
        permission: 'settings.view',
      },
      {
        id: 'booking-settings',
        label: 'Booking',
        icon: 'booking-settings',
        path: '/settings/booking',
        permission: 'settings.view',
      },
      {
        id: 'notification-settings',
        label: 'Notifications',
        icon: 'notification-settings',
        path: '/settings/notifications',
        permission: 'settings.view',
      },
      {
        id: 'content-settings',
        label: 'Content',
        icon: 'content-settings',
        path: '/settings/content',
        permission: 'settings.view',
      },
    ],
  },
];

// ==================== ROUTE TITLES (for breadcrumbs) ====================

export const ROUTE_TITLES = {
  '/dashboard': 'Dashboard',
  '/users/admins': 'Admin Users',
  '/users/roles': 'Roles',
  '/users/customers': 'Customers',
  '/speed-boats': 'Speed Boats',
  '/speed-boats/calendar': 'Calendar & Weather',
  '/speed-boats/pricing': 'Pricing Rules',
  '/party-boats': 'Party Boats',
  '/bookings': 'Speed Boat Bookings',
  '/party-bookings': 'Party Boat Bookings',
  '/inquiries': 'Inquiries',
  '/reviews/company': 'Company Reviews',
  '/reviews/product': 'Boat Reviews',
  '/settings/general': 'General',
  '/settings/billing': 'Billing',
  '/settings/booking': 'Booking',
  '/settings/notifications': 'Notifications',
  '/settings/content': 'Content',
  '/coupons': 'Coupons',
  '/marketing': 'Email Campaigns',
  '/marketing/analytics': 'Campaign Analytics',
  '/marketing/segments': 'Customer Segments',
  '/reports/revenue': 'Revenue Reports',
  '/reports/bookings': 'Booking Reports',
  '/reports/boats': 'Boat Performance',
  '/profile': 'Profile',
  '/preferences': 'Preferences',
};

// Parent labels for breadcrumbs
export const ROUTE_PARENTS = {
  '/users/admins': { label: 'Users', path: '/users/admins' },
  '/users/roles': { label: 'Users', path: '/users/admins' },
  '/users/customers': { label: 'Users', path: '/users/customers' },
  '/speed-boats': { label: 'Boats', path: '/speed-boats' },
  '/speed-boats/calendar': { label: 'Boats', path: '/speed-boats' },
  '/speed-boats/pricing': { label: 'Boats', path: '/speed-boats' },
  '/party-boats': { label: 'Boats', path: '/speed-boats' },
  '/bookings': { label: 'Bookings', path: '/bookings' },
  '/party-bookings': { label: 'Bookings', path: '/bookings' },
  '/inquiries': { label: 'Bookings', path: '/bookings' },
  '/reviews/company': { label: 'Reviews', path: '/reviews/company' },
  '/reviews/product': { label: 'Reviews', path: '/reviews/company' },
  '/coupons': { label: 'Marketing', path: '/coupons' },
  '/marketing': { label: 'Marketing', path: '/coupons' },
  '/marketing/analytics': { label: 'Marketing', path: '/coupons' },
  '/marketing/segments': { label: 'Marketing', path: '/coupons' },
  '/reports/revenue': { label: 'Reports', path: '/reports/revenue' },
  '/reports/bookings': { label: 'Reports', path: '/reports/revenue' },
  '/reports/boats': { label: 'Reports', path: '/reports/revenue' },
  '/settings/general': { label: 'Settings', path: '/settings/general' },
  '/settings/billing': { label: 'Settings', path: '/settings/general' },
  '/settings/booking': { label: 'Settings', path: '/settings/general' },
  '/settings/notifications': { label: 'Settings', path: '/settings/general' },
  '/settings/content': { label: 'Settings', path: '/settings/general' },
};

// ==================== LOCAL STORAGE KEYS ====================

export const STORAGE_KEYS = {
  ADMIN_TOKEN: 'adminToken',
  ADMIN_USER: 'adminUser',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  THEME: 'theme',
};

// ==================== ACTIVITY LOG ACTIONS ====================

export const ACTIVITY_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  EXPORT: 'EXPORT',
};

// ==================== OTP ====================

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 10;
export const MAX_OTP_ATTEMPTS = 3;

// ==================== SESSION ====================

export const SESSION_TIMEOUT_MINUTES = 60;
export const SESSION_WARNING_MINUTES = 5;