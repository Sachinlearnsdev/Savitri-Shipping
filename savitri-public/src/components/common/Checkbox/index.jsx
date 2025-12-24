import React from 'react';
import styles from './Checkbox.module.css';

/**
 * Checkbox Component
 * @param {object} props
 * @param {string} props.label - Checkbox label
 * @param {boolean} props.checked - Checked state
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.error - Error message
 * @param {string} props.className - Additional CSS classes
 */
const Checkbox = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  error,
  className = '',
  ...props
}) => {
  const containerClasses = [
    styles.container,
    error && styles.hasError,
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      <label className={styles.label}>
        <input
          type="checkbox"
          className={styles.input}
          checked={checked}
          onChange={(e) => onChange && onChange(e.target.checked)}
          disabled={disabled}
          {...props}
        />
        
        <span className={styles.checkmark}>
          {checked && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M11.6667 3.5L5.25 9.91667L2.33333 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        
        {label && <span className={styles.labelText}>{label}</span>}
      </label>

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default Checkbox;