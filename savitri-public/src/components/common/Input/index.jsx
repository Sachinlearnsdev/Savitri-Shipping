/**
 * Input Component
 * Reusable input field with label, error, and icons
 */

'use client';
import { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  hint,
  disabled = false,
  required = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  const inputWrapperClass = [
    styles.inputWrapper,
    error && styles.hasError,
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inputClass = [
    styles.input,
    leftIcon && styles.hasLeftIcon,
    rightIcon && styles.hasRightIcon,
    inputClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={inputWrapperClass}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={styles.inputContainer}>
        {leftIcon && (
          <span className={styles.leftIcon}>{leftIcon}</span>
        )}

        <input
          ref={ref}
          type={type}
          className={inputClass}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          {...props}
        />

        {rightIcon && (
          <span className={styles.rightIcon}>{rightIcon}</span>
        )}
      </div>

      {error && <span className={styles.error}>{error}</span>}
      {!error && hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;