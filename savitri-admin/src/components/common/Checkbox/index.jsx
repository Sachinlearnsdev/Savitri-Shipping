import { forwardRef } from 'react';
import styles from './Checkbox.module.css';

/**
 * Checkbox Component
 * 
 * @param {object} props - Component props
 * @param {string} props.label - Checkbox label
 * @param {boolean} props.checked - Whether checkbox is checked
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.disabled - Whether checkbox is disabled
 * @param {boolean} props.indeterminate - Indeterminate state (partial selection)
 * @param {string} props.error - Error message
 * @param {string} props.size - Checkbox size ('sm', 'md', 'lg')
 */
const Checkbox = forwardRef(({
  label,
  checked = false,
  onChange,
  disabled = false,
  indeterminate = false,
  error,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const wrapperClasses = [
    styles.wrapper,
    disabled && styles.disabled,
    error && styles.hasError,
    className,
  ].filter(Boolean).join(' ');
  
  const checkboxClasses = [
    styles.checkbox,
    styles[size],
    checked && styles.checked,
    indeterminate && styles.indeterminate,
  ].filter(Boolean).join(' ');
  
  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(e.target.checked);
    }
  };
  
  return (
    <div className={wrapperClasses}>
      <label className={styles.label}>
        <input
          ref={ref}
          type="checkbox"
          className={styles.input}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
        
        <span className={checkboxClasses}>
          {indeterminate ? (
            <span className={styles.indeterminateIcon}>−</span>
          ) : checked ? (
            <span className={styles.checkIcon}>✓</span>
          ) : null}
        </span>
        
        {label && (
          <span className={styles.labelText}>{label}</span>
        )}
      </label>
      
      {error && (
        <span className={styles.error}>{error}</span>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;