/**
 * useToast Hook
 * Custom hook for toast notifications
 */

'use client';
import useUIStore from '@/store/uiStore';
import { TOAST_DURATION } from '@/utils/constants';

const useToast = () => {
  const {
    toasts,
    showToast,
    removeToast,
    clearToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  } = useUIStore();

  /**
   * Show success toast
   * @param {string} message - Toast message
   * @param {number} duration - Duration in ms
   */
  const success = (message, duration = TOAST_DURATION.NORMAL) => {
    return showSuccess(message, duration);
  };

  /**
   * Show error toast
   * @param {string} message - Toast message
   * @param {number} duration - Duration in ms
   */
  const error = (message, duration = TOAST_DURATION.NORMAL) => {
    return showError(message, duration);
  };

  /**
   * Show warning toast
   * @param {string} message - Toast message
   * @param {number} duration - Duration in ms
   */
  const warning = (message, duration = TOAST_DURATION.NORMAL) => {
    return showWarning(message, duration);
  };

  /**
   * Show info toast
   * @param {string} message - Toast message
   * @param {number} duration - Duration in ms
   */
  const info = (message, duration = TOAST_DURATION.NORMAL) => {
    return showInfo(message, duration);
  };

  /**
   * Show promise-based toast (for async operations)
   * @param {Promise} promise - Promise to track
   * @param {Object} messages - { loading, success, error }
   */
  const promise = async (promiseFunc, messages = {}) => {
    const {
      loading = 'Loading...',
      success: successMsg = 'Success!',
      error: errorMsg = 'Something went wrong',
    } = messages;

    const loadingToastId = info(loading, 0); // 0 = don't auto-dismiss

    try {
      const result = await promiseFunc;
      removeToast(loadingToastId);
      success(successMsg);
      return result;
    } catch (err) {
      removeToast(loadingToastId);
      error(err.message || errorMsg);
      throw err;
    }
  };

  /**
   * Dismiss a specific toast
   * @param {number} id - Toast ID
   */
  const dismiss = (id) => {
    removeToast(id);
  };

  /**
   * Dismiss all toasts
   */
  const dismissAll = () => {
    clearToasts();
  };

  return {
    toasts,
    success,
    error,
    warning,
    info,
    promise,
    dismiss,
    dismissAll,
    show: showToast, // Generic show function
  };
};

export default useToast;