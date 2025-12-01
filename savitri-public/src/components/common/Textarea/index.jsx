/**
 * Textarea Component
 * Reusable textarea field
 */

'use client';
import { forwardRef } from 'react';
import styles from './Textarea.module.css';

const Textarea = forwardRef(({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  hint,
  disabled = false,
  required = false,
  rows = 4,
  maxLength,
  showCount = false,
  className = '',
  ...props
}, ref) => {
  const textareaWrapperClass = [
    styles.textareaWrapper,
    error && styles.hasError,
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const currentLength = value?.length || 0;

  return (
    <div className={textareaWrapperClass}>
      {label && (
        <div className={styles.labelRow}>
          <label className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
          {showCount && maxLength && (
            <span className={styles.count}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}

      <textarea
        ref={ref}
        className={styles.textarea}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        {...props}
      />

      {error && <span className={styles.error}>{error}</span>}
      {!error && hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;