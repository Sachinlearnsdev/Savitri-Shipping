import { create } from 'zustand';
import { STORAGE_KEYS, TOAST_DURATION } from '../utils/constants';

/**
 * UI Store
 * Manages UI state (sidebar, modals, toasts, etc.)
 */
const useUIStore = create((set, get) => ({
  // Sidebar State
  sidebarCollapsed: JSON.parse(localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED)) || false,
  mobileSidebarOpen: false,

  // Modal State
  modals: {},
  
  // Toast State
  toasts: [],
  toastIdCounter: 0,
  
  // Loading State
  globalLoading: false,
  
  // Theme
  theme: localStorage.getItem(STORAGE_KEYS.THEME) || 'light',
  
  // ==================== SIDEBAR ACTIONS ====================
  
  /**
   * Toggle sidebar collapse state
   */
  toggleSidebar: () => {
    const newState = !get().sidebarCollapsed;
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, JSON.stringify(newState));
    set({ sidebarCollapsed: newState });
  },
  
  /**
   * Set sidebar collapse state
   * @param {boolean} collapsed - Collapsed state
   */
  setSidebarCollapsed: (collapsed) => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, JSON.stringify(collapsed));
    set({ sidebarCollapsed: collapsed });
  },

  toggleMobileSidebar: () => {
    set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen }));
  },

  closeMobileSidebar: () => {
    set({ mobileSidebarOpen: false });
  },

  // ==================== MODAL ACTIONS ====================
  
  /**
   * Open modal
   * @param {string} modalId - Unique modal identifier
   * @param {object} data - Modal data (optional)
   */
  openModal: (modalId, data = null) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalId]: {
          isOpen: true,
          data,
        },
      },
    }));
  },
  
  /**
   * Close modal
   * @param {string} modalId - Unique modal identifier
   */
  closeModal: (modalId) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalId]: {
          isOpen: false,
          data: null,
        },
      },
    }));
  },
  
  /**
   * Check if modal is open
   * @param {string} modalId - Unique modal identifier
   * @returns {boolean} True if modal is open
   */
  isModalOpen: (modalId) => {
    return get().modals[modalId]?.isOpen || false;
  },
  
  /**
   * Get modal data
   * @param {string} modalId - Unique modal identifier
   * @returns {object|null} Modal data
   */
  getModalData: (modalId) => {
    return get().modals[modalId]?.data || null;
  },
  
  // ==================== TOAST ACTIONS ====================
  
  /**
   * Show toast notification
   * @param {object} options - Toast options
   * @param {string} options.type - Toast type ('success', 'error', 'warning', 'info')
   * @param {string} options.message - Toast message
   * @param {number} options.duration - Toast duration in ms
   * @returns {number} Toast ID
   */
  showToast: ({ type = 'info', message, duration = TOAST_DURATION.MEDIUM }) => {
    const id = get().toastIdCounter + 1;
    
    const toast = {
      id,
      type,
      message,
      duration,
      createdAt: Date.now(),
    };
    
    set((state) => ({
      toasts: [...state.toasts, toast],
      toastIdCounter: id,
    }));
    
    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
    
    return id;
  },
  
  /**
   * Show success toast
   * @param {string} message - Toast message
   * @param {number} duration - Toast duration
   * @returns {number} Toast ID
   */
  showSuccess: (message, duration = TOAST_DURATION.MEDIUM) => {
    return get().showToast({ type: 'success', message, duration });
  },
  
  /**
   * Show error toast
   * @param {string} message - Toast message
   * @param {number} duration - Toast duration
   * @returns {number} Toast ID
   */
  showError: (message, duration = TOAST_DURATION.LONG) => {
    return get().showToast({ type: 'error', message, duration });
  },
  
  /**
   * Show warning toast
   * @param {string} message - Toast message
   * @param {number} duration - Toast duration
   * @returns {number} Toast ID
   */
  showWarning: (message, duration = TOAST_DURATION.MEDIUM) => {
    return get().showToast({ type: 'warning', message, duration });
  },
  
  /**
   * Show info toast
   * @param {string} message - Toast message
   * @param {number} duration - Toast duration
   * @returns {number} Toast ID
   */
  showInfo: (message, duration = TOAST_DURATION.MEDIUM) => {
    return get().showToast({ type: 'info', message, duration });
  },
  
  /**
   * Remove toast by ID
   * @param {number} id - Toast ID
   */
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  
  /**
   * Clear all toasts
   */
  clearToasts: () => {
    set({ toasts: [] });
  },
  
  // ==================== LOADING ACTIONS ====================
  
  /**
   * Set global loading state
   * @param {boolean} loading - Loading state
   */
  setGlobalLoading: (loading) => {
    set({ globalLoading: loading });
  },
  
  /**
   * Show global loading
   */
  showLoading: () => {
    set({ globalLoading: true });
  },
  
  /**
   * Hide global loading
   */
  hideLoading: () => {
    set({ globalLoading: false });
  },
  
  // ==================== THEME ACTIONS ====================
  
  /**
   * Set theme
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  
  /**
   * Toggle theme
   */
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },
}));

export default useUIStore;