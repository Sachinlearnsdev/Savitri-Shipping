/**
 * Centralized Routes Configuration
 * Single source of truth for all application routes
 */

// ==================== PUBLIC ROUTES ====================
export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  REFUND: '/refund',
};

// ==================== AUTH ROUTES ====================
export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_PHONE: '/verify-phone',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
};

// ==================== ACCOUNT ROUTES (PROTECTED) ====================
export const ACCOUNT_ROUTES = {
  DASHBOARD: '/account/dashboard',
  PROFILE: '/account/profile',
  SECURITY: '/account/security',
  VEHICLES: '/account/vehicles',
  BOOKINGS: '/account/bookings',
  REVIEWS: '/account/reviews',
  SETTINGS: '/account/settings',
  SESSIONS: '/account/sessions',
  HISTORY: '/account/history',
};

// ==================== ALL ROUTES (FLAT) ====================
export const ROUTES = {
  // Public
  HOME: PUBLIC_ROUTES.HOME,
  ABOUT: PUBLIC_ROUTES.ABOUT,
  CONTACT: PUBLIC_ROUTES.CONTACT,
  TERMS: PUBLIC_ROUTES.TERMS,
  PRIVACY: PUBLIC_ROUTES.PRIVACY,
  REFUND: PUBLIC_ROUTES.REFUND,
  
  // Auth
  LOGIN: AUTH_ROUTES.LOGIN,
  REGISTER: AUTH_ROUTES.REGISTER,
  VERIFY_EMAIL: AUTH_ROUTES.VERIFY_EMAIL,
  VERIFY_PHONE: AUTH_ROUTES.VERIFY_PHONE,
  FORGOT_PASSWORD: AUTH_ROUTES.FORGOT_PASSWORD,
  RESET_PASSWORD: AUTH_ROUTES.RESET_PASSWORD,
  
  // Account
  DASHBOARD: ACCOUNT_ROUTES.DASHBOARD,
  PROFILE: ACCOUNT_ROUTES.PROFILE,
  SECURITY: ACCOUNT_ROUTES.SECURITY,
  VEHICLES: ACCOUNT_ROUTES.VEHICLES,
  BOOKINGS: ACCOUNT_ROUTES.BOOKINGS,
  REVIEWS: ACCOUNT_ROUTES.REVIEWS,
  SETTINGS: ACCOUNT_ROUTES.SETTINGS,
  SESSIONS: ACCOUNT_ROUTES.SESSIONS,
  HISTORY: ACCOUNT_ROUTES.HISTORY,
};

// ==================== ROUTE ARRAYS FOR MIDDLEWARE ====================

/**
 * Routes that require authentication
 */
export const PROTECTED_ROUTES = [
  ACCOUNT_ROUTES.DASHBOARD,
  ACCOUNT_ROUTES.PROFILE,
  ACCOUNT_ROUTES.SECURITY,
  ACCOUNT_ROUTES.VEHICLES,
  ACCOUNT_ROUTES.BOOKINGS,
  ACCOUNT_ROUTES.REVIEWS,
  ACCOUNT_ROUTES.SETTINGS,
  ACCOUNT_ROUTES.SESSIONS,
  ACCOUNT_ROUTES.HISTORY,
];

/**
 * Routes that should redirect to dashboard if already authenticated
 */
export const GUEST_ONLY_ROUTES = [
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.REGISTER,
  AUTH_ROUTES.FORGOT_PASSWORD,
  AUTH_ROUTES.RESET_PASSWORD,
];

/**
 * Routes accessible to everyone (no redirect)
 */
export const PUBLIC_ONLY_ROUTES = [
  PUBLIC_ROUTES.HOME,
  PUBLIC_ROUTES.ABOUT,
  PUBLIC_ROUTES.CONTACT,
  PUBLIC_ROUTES.TERMS,
  PUBLIC_ROUTES.PRIVACY,
  PUBLIC_ROUTES.REFUND,
];

// ==================== DEFAULT REDIRECTS ====================

/**
 * Default redirect after successful login
 */
export const DEFAULT_LOGIN_REDIRECT = PUBLIC_ROUTES.HOME;

/**
 * Default redirect after logout
 */
export const DEFAULT_LOGOUT_REDIRECT = PUBLIC_ROUTES.HOME;

/**
 * Default redirect when unauthorized
 */
export const DEFAULT_UNAUTHORIZED_REDIRECT = AUTH_ROUTES.LOGIN;

/**
 * Default redirect when already authenticated
 */
export const DEFAULT_AUTHENTICATED_REDIRECT = PUBLIC_ROUTES.HOME;

// ==================== ROUTE HELPERS ====================

/**
 * Check if route is protected
 * @param {string} path - Route path
 * @returns {boolean}
 */
export const isProtectedRoute = (path) => {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
};

/**
 * Check if route is guest only
 * @param {string} path - Route path
 * @returns {boolean}
 */
export const isGuestOnlyRoute = (path) => {
  return GUEST_ONLY_ROUTES.includes(path);
};

/**
 * Check if route is public
 * @param {string} path - Route path
 * @returns {boolean}
 */
export const isPublicRoute = (path) => {
  return PUBLIC_ONLY_ROUTES.includes(path);
};

/**
 * Build route with query params
 * @param {string} path - Base path
 * @param {object} params - Query parameters
 * @returns {string}
 */
export const buildRoute = (path, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return query ? `${path}?${query}` : path;
};

/**
 * Build login route with redirect
 * @param {string} redirectTo - Redirect path after login
 * @returns {string}
 */
export const buildLoginRoute = (redirectTo = DEFAULT_LOGIN_REDIRECT) => {
  return buildRoute(AUTH_ROUTES.LOGIN, { redirect: redirectTo });
};

// ==================== EXPORTS ====================

export default {
  // Route objects
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  ACCOUNT_ROUTES,
  ROUTES,
  
  // Route arrays
  PROTECTED_ROUTES,
  GUEST_ONLY_ROUTES,
  PUBLIC_ONLY_ROUTES,
  
  // Default redirects
  DEFAULT_LOGIN_REDIRECT,
  DEFAULT_LOGOUT_REDIRECT,
  DEFAULT_UNAUTHORIZED_REDIRECT,
  DEFAULT_AUTHENTICATED_REDIRECT,
  
  // Helpers
  isProtectedRoute,
  isGuestOnlyRoute,
  isPublicRoute,
  buildRoute,
  buildLoginRoute,
};