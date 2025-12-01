import { forwardRef } from 'react';
import styles from './Radio.module.css';

/**
 * Radio Component
 * 
 * @param {object} props - Component props
 * @param {string} props.label - Radio label
 * @param {string|number} props.value - Radio value
 * @param {boolean} props.checked - Whether radio is checked
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.disabled - Whether radio is disabled
 * @param {string} props.name - Radio group name
 * @param {string} props.error - Error message
 * @param {string} props.size - Radio size ('sm', 'md', 'lg')
 */
const Radio = forwardRef(({
  label,
  value,
  checked = false,
  onChange,
  disabled = false,
  name,
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
  
  const radioClasses = [
    styles.radio,
    styles[size],
    checked && styles.checked,
  ].filter(Boolean).join(' ');
  
  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(value);
    }
  };
  
  return (
    <div className={wrapperClasses}>
      <label className={styles.label}>
        <input
          ref={ref}
          type="radio"
          className={styles.input}
          value={value}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          name={name}
          {...props}
        />
        
        <span className={radioClasses}>
          {checked && <span className={styles.dot}></span>}
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

Radio.displayName = 'Radio';

export default Radio;