import { useUIStore } from '@/store/uiStore';

/**
 * useToast Hook
 * Provides toast notification methods
 */
export const useToast = () => {
  const {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearToasts,
  } = useUIStore();

  return {
    // State
    toasts,
    
    // Methods
    toast: addToast,
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    remove: removeToast,
    clear: clearToasts,
  };
};

export default useToast;