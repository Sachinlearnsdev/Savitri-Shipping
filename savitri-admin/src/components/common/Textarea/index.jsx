import { forwardRef } from 'react';
import styles from './Textarea.module.css';

/**
 * Textarea Component
 * 
 * @param {object} props - Component props
 * @param {string} props.label - Textarea label
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Textarea value
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onBlur - Blur handler
 * @param {string} props.error - Error message
 * @param {string} props.hint - Hint text
 * @param {boolean} props.disabled - Whether textarea is disabled
 * @param {boolean} props.required - Whether textarea is required
 * @param {number} props.rows - Number of visible rows
 * @param {number} props.maxLength - Maximum character length
 * @param {boolean} props.showCount - Whether to show character count
 * @param {boolean} props.resize - Whether textarea is resizable
 */
const Textarea = forwardRef(({
  label,
  placeholder,
  value = '',
  onChange,
  onBlur,
  error,
  hint,
  disabled = false,
  required = false,
  rows = 4,
  maxLength,
  showCount = false,
  resize = true,
  className = '',
  ...props
}, ref) => {
  const wrapperClasses = [
    styles.wrapper,
    error && styles.hasError,
    disabled && styles.disabled,
    className,
  ].filter(Boolean).join(' ');
  
  const textareaClasses = [
    styles.textarea,
    !resize && styles.noResize,
  ].filter(Boolean).join(' ');
  
  const characterCount = value ? value.length : 0;
  
  return (
    <div className={wrapperClasses}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={textareaClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        {...props}
      />
      
      <div className={styles.footer}>
        <div className={styles.left}>
          {hint && !error && (
            <span className={styles.hint}>{hint}</span>
          )}
          
          {error && (
            <span className={styles.error}>{error}</span>
          )}
        </div>
        
        {showCount && (
          <span className={styles.count}>
            {characterCount}
            {maxLength && ` / ${maxLength}`}
          </span>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;