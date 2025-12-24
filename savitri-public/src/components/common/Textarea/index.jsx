import React from 'react';
import styles from './Textarea.module.css';

/**
 * Textarea Component
 * @param {object} props
 * @param {string} props.label - Textarea label
 * @param {string} props.value - Textarea value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message
 * @param {string} props.hint - Hint text
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.required - Required field
 * @param {number} props.rows - Number of rows
 * @param {string} props.className - Additional CSS classes
 */
const Textarea = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  disabled = false,
  required = false,
  rows = 4,
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
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <textarea
        className={styles.textarea}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        {...props}
      />

      {error && <span className={styles.error}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
};

export default Textarea;