// UPDATED - 2024-12-11
// CHANGES:
// 1. Token is now stored in localStorage AND sent to backend via header
// 2. Backend also sets HTTP-only cookie automatically (handled by browser)
// 3. Added token validation
// 4. Improved permission checking with null safety
// 5. Added role-based helper methods

import { create } from 'zustand';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Authentication Store
 * Manages admin user authentication state
 */
const useAuthStore = create((set, get) => ({
  // State
  user: JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USER)) || null,
  token: localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN) || null,
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN),
  isLoading: false,
  
  // Actions
  
  /**
   * Set user and token after successful login
   * @param {object} user - User object
   * @param {string} token - JWT token
   */
  login: (user, token) => {
    // Store both user and token
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
    
    set({
      user,
      token,
      isAuthenticated: true,
    });
    
    if (import.meta.env.DEV) {
      console.log('✅ User logged in:', user.email);
    }
  },
  
  /**
   * Clear user and token on logout
   */
  logout: () => {
    // Clear all auth data
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    
    if (import.meta.env.DEV) {
      console.log('👋 User logged out');
    }
  },
  
  /**
   * Update user data
   * @param {object} updates - User data updates
   */
  updateUser: (updates) => {
    const currentUser = get().user;
    
    if (!currentUser) {
      console.warn('⚠️  Cannot update user: No user logged in');
      return;
    }
    
    const updatedUser = { ...currentUser, ...updates };
    
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(updatedUser));
    
    set({ user: updatedUser });
    
    if (import.meta.env.DEV) {
      console.log('✅ User updated:', updatedUser.email);
    }
  },
  
  /**
   * Update token
   * @param {string} token - New JWT token
   */
  updateToken: (token) => {
    if (!token) {
      console.warn('⚠️  Cannot update token: Token is empty');
      return;
    }
    
    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
    set({ token });
    
    if (import.meta.env.DEV) {
      console.log('✅ Token refreshed');
    }
  },
  
  /**
   * Set loading state
   * @param {boolean} isLoading - Loading state
   */
  setLoading: (isLoading) => {
    set({ isLoading });
  },
  
  /**
   * Check if user has permission
   * @param {string} permission - Permission key (e.g., 'adminUsers.create')
   * @returns {boolean} True if user has permission
   */
  hasPermission: (permission) => {
    const { user } = get();
    
    // No user or no role
    if (!user || !user.role) {
      return false;
    }
    
    // Admin and Super Admin have all permissions
    if (user.role.name === 'Admin' || user.role.name === 'Super Admin') {
      return true;
    }
    
    // No permissions defined
    if (!user.role.permissions) {
      return false;
    }
    
    // Split permission string (e.g., 'adminUsers.create' -> ['adminUsers', 'create'])
    const [module, action] = permission.split('.');
    
    // Check if module exists
    if (!user.role.permissions[module]) {
      return false;
    }
    
    // Check if action exists and is true
    if (!user.role.permissions[module][action]) {
      return false;
    }
    
    return user.role.permissions[module][action] === true;
  },
  
  /**
   * Check if user has any of the permissions
   * @param {Array<string>} permissions - Array of permission keys
   * @returns {boolean} True if user has any permission
   */
  hasAnyPermission: (permissions) => {
    const { hasPermission } = get();
    
    if (!Array.isArray(permissions)) {
      console.warn('⚠️  hasAnyPermission expects an array');
      return false;
    }
    
    return permissions.some(permission => hasPermission(permission));
  },
  
  /**
   * Check if user has all of the permissions
   * @param {Array<string>} permissions - Array of permission keys
   * @returns {boolean} True if user has all permissions
   */
  hasAllPermissions: (permissions) => {
    const { hasPermission } = get();
    
    if (!Array.isArray(permissions)) {
      console.warn('⚠️  hasAllPermissions expects an array');
      return false;
    }
    
    return permissions.every(permission => hasPermission(permission));
  },
  
  /**
   * Get user's full name
   * @returns {string} User's full name
   */
  getUserName: () => {
    const { user } = get();
    return user?.name || 'Admin User';
  },
  
  /**
   * Get user's email
   * @returns {string} User's email
   */
  getUserEmail: () => {
    const { user } = get();
    return user?.email || '';
  },
  
  /**
   * Get user's role name
   * @returns {string} Role name
   */
  getRoleName: () => {
    const { user } = get();
    return user?.role?.name || 'User';
  },
  
  /**
   * Check if user is super admin
   * @returns {boolean} True if super admin
   */
  isSuperAdmin: () => {
    const { user } = get();
    return user?.role?.name === 'Super Admin';
  },
  
  /**
   * Get user's avatar URL
   * @returns {string|null} Avatar URL or null
   */
  getAvatar: () => {
    const { user } = get();
    return user?.avatar || null;
  },
  
  /**
   * Get user's phone
   * @returns {string|null} Phone or null
   */
  getPhone: () => {
    const { user } = get();
    return user?.phone || null;
  },
  
  /**
   * Check if token exists
   * @returns {boolean} True if token exists
   */
  hasToken: () => {
    return !!get().token;
  },
}));

export default useAuthStore;