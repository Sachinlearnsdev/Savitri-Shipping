/**
 * Checkbox Component
 * Reusable checkbox with label
 */

'use client';
import { forwardRef } from 'react';
import styles from './Checkbox.module.css';

const Checkbox = forwardRef(({
  label,
  checked = false,
  onChange,
  disabled = false,
  error,
  className = '',
  ...props
}, ref) => {
  const checkboxClass = [
    styles.checkboxWrapper,
    disabled && styles.disabled,
    error && styles.hasError,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={checkboxClass}>
      <label className={styles.label}>
        <input
          ref={ref}
          type="checkbox"
          className={styles.checkbox}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
        
        <span className={styles.customCheckbox}>
          {checked && (
            <svg
              className={styles.checkIcon}
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 4L6 11L3 8"
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
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;