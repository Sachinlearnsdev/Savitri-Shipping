import { create } from 'zustand';
import { generateUniqueId } from '@/utils/helpers';

/**
 * UI Store
 * Manages UI state (toasts, modals, mobile menu, etc.)
 */
export const useUIStore = create((set, get) => ({
  // Toast notifications
  toasts: [],
  
  addToast: (toast) => {
    const id = generateUniqueId();
    const newToast = {
      id,
      type: toast.type || 'info',
      message: toast.message,
      duration: toast.duration || 5000,
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    if (newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }
    
    return id;
  },
  
  showSuccess: (message) => {
    get().addToast({ type: 'success', message });
  },
  
  showError: (message) => {
    get().addToast({ type: 'error', message });
  },
  
  showWarning: (message) => {
    get().addToast({ type: 'warning', message });
  },
  
  showInfo: (message) => {
    get().addToast({ type: 'info', message });
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  
  clearToasts: () => {
    set({ toasts: [] });
  },
  
  // Modals
  modals: {},
  
  openModal: (name) => {
    set((state) => ({
      modals: { ...state.modals, [name]: true },
    }));
  },
  
  closeModal: (name) => {
    set((state) => ({
      modals: { ...state.modals, [name]: false },
    }));
  },
  
  toggleModal: (name) => {
    set((state) => ({
      modals: { ...state.modals, [name]: !state.modals[name] },
    }));
  },
  
  isModalOpen: (name) => {
    return get().modals[name] || false;
  },
  
  // Mobile menu
  isMobileMenuOpen: false,
  
  openMobileMenu: () => {
    set({ isMobileMenuOpen: true });
  },
  
  closeMobileMenu: () => {
    set({ isMobileMenuOpen: false });
  },
  
  toggleMobileMenu: () => {
    set((state) => ({
      isMobileMenuOpen: !state.isMobileMenuOpen,
    }));
  },
  
  // Global loading state
  isGlobalLoading: false,
  
  setGlobalLoading: (isLoading) => {
    set({ isGlobalLoading: isLoading });
  },
}));