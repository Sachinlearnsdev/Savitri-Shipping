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
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
    
    set({
      user,
      token,
      isAuthenticated: true,
    });
  },
  
  /**
   * Clear user and token on logout
   */
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
  
  /**
   * Update user data
   * @param {object} updates - User data updates
   */
  updateUser: (updates) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser, ...updates };
    
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(updatedUser));
    
    set({ user: updatedUser });
  },
  
  /**
   * Update token
   * @param {string} token - New JWT token
   */
  updateToken: (token) => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
    set({ token });
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
    if (!user || !user.role || !user.role.permissions) return false;
    
    const [module, action] = permission.split('.');
    const permissions = user.role.permissions;
    
    if (!permissions[module]) return false;
    if (!permissions[module][action]) return false;
    
    return permissions[module][action] === true;
  },
  
  /**
   * Check if user has any of the permissions
   * @param {Array<string>} permissions - Array of permission keys
   * @returns {boolean} True if user has any permission
   */
  hasAnyPermission: (permissions) => {
    const { hasPermission } = get();
    return permissions.some(permission => hasPermission(permission));
  },
  
  /**
   * Check if user has all of the permissions
   * @param {Array<string>} permissions - Array of permission keys
   * @returns {boolean} True if user has all permissions
   */
  hasAllPermissions: (permissions) => {
    const { hasPermission } = get();
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
}));

export default useAuthStore;