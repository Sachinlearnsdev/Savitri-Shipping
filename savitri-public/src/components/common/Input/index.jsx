import React, { useState } from 'react';
import styles from './Input.module.css';

/**
 * Input Component
 * @param {object} props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onBlur - Blur handler
 * @param {string} props.error - Error message
 * @param {string} props.hint - Hint text
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.required - Required field
 * @param {React.ReactNode} props.leftIcon - Left icon
 * @param {React.ReactNode} props.rightIcon - Right icon
 * @param {string} props.className - Additional CSS classes
 */
const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  hint,
  disabled = false,
  required = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
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
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        {leftIcon && (
          <span className={styles.leftIcon}>{leftIcon}</span>
        )}
        
        <input
          type={inputType}
          className={styles.input}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 10C12.5 11.3807 11.3807 12.5 10 12.5C8.61929 12.5 7.5 11.3807 7.5 10C7.5 8.61929 8.61929 7.5 10 7.5C11.3807 7.5 12.5 8.61929 12.5 10Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2.5 10C2.5 10 5 4.5 10 4.5C15 4.5 17.5 10 17.5 10C17.5 10 15 15.5 10 15.5C5 15.5 2.5 10 2.5 10Z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3.5 3.5L16.5 16.5M8.5 8.5C8.02513 8.97487 7.75 9.65326 7.75 10.4C7.75 11.9259 8.97411 13.15 10.5 13.15C11.2467 13.15 11.9251 12.8749 12.4 12.4M15 10.9C14.3 12.3 12.3 14.5 10 14.5C7.5 14.5 5 12 4 10C4.5 9 6.5 6.5 9 6C9.3 5.9 9.6 5.9 10 5.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        )}
        
        {rightIcon && type !== 'password' && (
          <span className={styles.rightIcon}>{rightIcon}</span>
        )}
      </div>
      
      {error && (
        <span className={styles.error}>{error}</span>
      )}
      
      {hint && !error && (
        <span className={styles.hint}>{hint}</span>
      )}
    </div>
  );
};

export default Input;