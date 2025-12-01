import { useEffect } from 'react';
import useUIStore from '../../../store/uiStore';
import styles from './Toast.module.css';

/**
 * Toast Container Component
 * Displays all active toast notifications
 */
const ToastContainer = () => {
  const toasts = useUIStore((state) => state.toasts);
  
  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};

/**
 * Individual Toast Component
 */
const Toast = ({ id, type, message, duration }) => {
  const removeToast = useUIStore((state) => state.removeToast);
  
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [id, duration, removeToast]);
  
  const toastClasses = [
    styles.toast,
    styles[type],
  ].filter(Boolean).join(' ');
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };
  
  return (
    <div className={toastClasses}>
      <span className={styles.icon}>{icons[type]}</span>
      <span className={styles.message}>{message}</span>
      <button
        type="button"
        className={styles.closeButton}
        onClick={() => removeToast(id)}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

export default ToastContainer;