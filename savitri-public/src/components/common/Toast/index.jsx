/**
 * Toast Component
 * Toast notifications container
 */

'use client';
import { createPortal } from 'react-dom';
import useUIStore from '@/store/uiStore';
import styles from './Toast.module.css';

const Toast = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-2 15l-5-5 1.41-1.41L8 12.17l7.59-7.59L17 6l-9 9z"
              fill="currentColor"
            />
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"
              fill="currentColor"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M1 17h18L10 1 1 17zm9-2h2v2h-2v-2zm0-6h2v4h-2V9z"
              fill="currentColor"
            />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9V9h2v6zm0-8H9V5h2v2z"
              fill="currentColor"
            />
          </svg>
        );
    }
  };

  const toastContent = (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
        >
          <div className={styles.toastIcon}>
            {getIcon(toast.type)}
          </div>
          
          <div className={styles.toastMessage}>
            {toast.message}
          </div>
          
          <button
            type="button"
            className={styles.toastClose}
            onClick={() => removeToast(toast.id)}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(toastContent, document.body);
  }

  return null;
};

export default Toast;