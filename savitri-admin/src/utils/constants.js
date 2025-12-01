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
  
  // Profile
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
    icon: '📊',
    path: '/dashboard',
    permission: 'dashboard.view',
  },
  {
    id: 'users',
    label: 'Users',
    icon: '👥',
    permission: 'adminUsers.view',
    children: [
      {
        id: 'admin-users',
        label: 'Admin Users',
        path: '/users/admins',
        permission: 'adminUsers.view',
      },
      {
        id: 'roles',
        label: 'Roles',
        path: '/users/roles',
        permission: 'roles.view',
      },
      {
        id: 'customers',
        label: 'Customers',
        path: '/users/customers',
        permission: 'customers.view',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    permission: 'settings.view',
    children: [
      {
        id: 'general-settings',
        label: 'General',
        path: '/settings/general',
        permission: 'settings.view',
      },
      {
        id: 'billing-settings',
        label: 'Billing',
        path: '/settings/billing',
        permission: 'settings.view',
      },
      {
        id: 'booking-settings',
        label: 'Booking',
        path: '/settings/booking',
        permission: 'settings.view',
      },
      {
        id: 'notification-settings',
        label: 'Notifications',
        path: '/settings/notifications',
        permission: 'settings.view',
      },
      {
        id: 'content-settings',
        label: 'Content',
        path: '/settings/content',
        permission: 'settings.view',
      },
    ],
  },
];

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