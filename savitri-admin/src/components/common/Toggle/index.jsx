import { forwardRef } from 'react';
import styles from './Toggle.module.css';

/**
 * Toggle/Switch Component
 * 
 * @param {object} props - Component props
 * @param {string} props.label - Toggle label
 * @param {boolean} props.checked - Whether toggle is on
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.disabled - Whether toggle is disabled
 * @param {string} props.size - Toggle size ('sm', 'md', 'lg')
 * @param {string} props.labelPosition - Label position ('left', 'right')
 */
const Toggle = forwardRef(({
  label,
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  labelPosition = 'right',
  className = '',
  ...props
}, ref) => {
  const wrapperClasses = [
    styles.wrapper,
    disabled && styles.disabled,
    styles[`label${labelPosition.charAt(0).toUpperCase()}${labelPosition.slice(1)}`],
    className,
  ].filter(Boolean).join(' ');
  
  const toggleClasses = [
    styles.toggle,
    styles[size],
    checked && styles.checked,
  ].filter(Boolean).join(' ');
  
  const handleChange = (e) => {
    if (!disabled && onChange) {
      onChange(e.target.checked);
    }
  };
  
  return (
    <label className={wrapperClasses}>
      {label && labelPosition === 'left' && (
        <span className={styles.labelText}>{label}</span>
      )}
      
      <div className={styles.toggleContainer}>
        <input
          ref={ref}
          type="checkbox"
          className={styles.input}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
        
        <span className={toggleClasses}>
          <span className={styles.slider}></span>
        </span>
      </div>
      
      {label && labelPosition === 'right' && (
        <span className={styles.labelText}>{label}</span>
      )}
    </label>
  );
});

Toggle.displayName = 'Toggle';

export default Toggle;