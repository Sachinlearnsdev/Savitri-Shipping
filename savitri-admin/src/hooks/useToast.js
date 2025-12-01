import useUIStore from '../store/uiStore';

/**
 * Custom hook for toast notifications
 * @returns {object} Toast methods
 */
const useToast = () => {
  const {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearToasts,
  } = useUIStore();
  
  return {
    /**
     * Show toast notification
     * @param {object} options - Toast options
     * @param {string} options.type - Toast type ('success', 'error', 'warning', 'info')
     * @param {string} options.message - Toast message
     * @param {number} options.duration - Toast duration in ms
     * @returns {number} Toast ID
     */
    toast: showToast,
    
    /**
     * Show success toast
     * @param {string} message - Toast message
     * @param {number} duration - Toast duration
     * @returns {number} Toast ID
     */
    success: showSuccess,
    
    /**
     * Show error toast
     * @param {string} message - Toast message
     * @param {number} duration - Toast duration
     * @returns {number} Toast ID
     */
    error: showError,
    
    /**
     * Show warning toast
     * @param {string} message - Toast message
     * @param {number} duration - Toast duration
     * @returns {number} Toast ID
     */
    warning: showWarning,
    
    /**
     * Show info toast
     * @param {string} message - Toast message
     * @param {number} duration - Toast duration
     * @returns {number} Toast ID
     */
    info: showInfo,
    
    /**
     * Remove toast by ID
     * @param {number} id - Toast ID
     */
    remove: removeToast,
    
    /**
     * Clear all toasts
     */
    clear: clearToasts,
  };
};

export default useToast;