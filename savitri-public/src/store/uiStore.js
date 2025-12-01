/**
 * UI Store (Zustand)
 * Global state management for UI elements
 */

'use client';
import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  // ==================== MODALS ====================
  modals: {},

  openModal: (modalId, data = null) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalId]: { isOpen: true, data },
      },
    }));
  },

  closeModal: (modalId) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalId]: { isOpen: false, data: null },
      },
    }));
  },

  isModalOpen: (modalId) => {
    const modals = get().modals;
    return modals[modalId]?.isOpen || false;
  },

  getModalData: (modalId) => {
    const modals = get().modals;
    return modals[modalId]?.data || null;
  },

  // ==================== TOASTS ====================
  toasts: [],
  toastId: 0,

  showToast: (message, type = 'info', duration = 5000) => {
    const id = get().toastId + 1;
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
    };

    set((state) => ({
      toasts: [...state.toasts, toast],
      toastId: id,
    }));

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },

  // Shorthand methods for toast types
  showSuccess: (message, duration) => get().showToast(message, 'success', duration),
  showError: (message, duration) => get().showToast(message, 'error', duration),
  showWarning: (message, duration) => get().showToast(message, 'warning', duration),
  showInfo: (message, duration) => get().showToast(message, 'info', duration),

  // ==================== MOBILE MENU ====================
  isMobileMenuOpen: false,

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  // ==================== LOADING ====================
  loadingStates: {},

  setLoading: (key, isLoading) => {
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: isLoading,
      },
    }));
  },

  isLoading: (key) => {
    const loadingStates = get().loadingStates;
    return loadingStates[key] || false;
  },

  // ==================== SIDEBAR (For Account Layout) ====================
  isSidebarCollapsed: false,

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  collapseSidebar: () => set({ isSidebarCollapsed: true }),
  expandSidebar: () => set({ isSidebarCollapsed: false }),

  // ==================== SEARCH ====================
  searchQuery: '',
  searchResults: [],
  isSearching: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsSearching: (isSearching) => set({ isSearching }),
  clearSearch: () => set({ searchQuery: '', searchResults: [], isSearching: false }),

  // ==================== FILTERS (For Listings) ====================
  filters: {
    speedBoats: {},
    partyBoats: {},
    ferries: {},
  },

  setFilter: (category, filterKey, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [category]: {
          ...state.filters[category],
          [filterKey]: value,
        },
      },
    }));
  },

  clearFilters: (category) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [category]: {},
      },
    }));
  },

  clearAllFilters: () => {
    set({
      filters: {
        speedBoats: {},
        partyBoats: {},
        ferries: {},
      },
    });
  },

  // ==================== THEME (OPTIONAL - FUTURE) ====================
  theme: 'light',

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  initTheme: () => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'light';
      get().setTheme(savedTheme);
    }
  },
}));

export default useUIStore;