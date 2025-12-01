import { forwardRef, useState } from 'react';
import styles from './Input.module.css';

/**
 * Input Component
 * 
 * @param {object} props - Component props
 * @param {string} props.label - Input label
 * @param {'text' | 'email' | 'password' | 'number' | 'tel' | 'url'} props.type - Input type
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onBlur - Blur handler
 * @param {string} props.error - Error message
 * @param {string} props.hint - Hint text
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {boolean} props.required - Whether input is required
 * @param {React.ReactNode} props.leftIcon - Icon to display on left side
 * @param {React.ReactNode} props.rightIcon - Icon to display on right side
 * @param {string} props.size - Input size ('sm', 'md', 'lg')
 */
const Input = forwardRef(({
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
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  const wrapperClasses = [
    styles.wrapper,
    error && styles.hasError,
    disabled && styles.disabled,
    isFocused && styles.focused,
    className,
  ].filter(Boolean).join(' ');
  
  const inputClasses = [
    styles.input,
    styles[size],
    leftIcon && styles.hasLeftIcon,
    (rightIcon || type === 'password') && styles.hasRightIcon,
  ].filter(Boolean).join(' ');
  
  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };
  
  return (
    <div className={wrapperClasses}>
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
          ref={ref}
          type={inputType}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
        
        {rightIcon && type !== 'password' && (
          <span className={styles.rightIcon}>{rightIcon}</span>
        )}
      </div>
      
      {hint && !error && (
        <span className={styles.hint}>{hint}</span>
      )}
      
      {error && (
        <span className={styles.error}>{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;