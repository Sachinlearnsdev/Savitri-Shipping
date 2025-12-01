import { forwardRef } from 'react';
import Input from '../Input';
import styles from './DatePicker.module.css';

/**
 * DatePicker Component
 * Simple wrapper around native date input with consistent styling
 * 
 * @param {object} props - Component props
 * @param {string} props.label - Date picker label
 * @param {string} props.value - Date value (YYYY-MM-DD format)
 * @param {Function} props.onChange - Change handler
 * @param {string} props.min - Minimum date (YYYY-MM-DD)
 * @param {string} props.max - Maximum date (YYYY-MM-DD)
 * @param {string} props.error - Error message
 * @param {boolean} props.disabled - Whether date picker is disabled
 * @param {boolean} props.required - Whether date picker is required
 */
const DatePicker = forwardRef(({
  label,
  value,
  onChange,
  min,
  max,
  error,
  disabled = false,
  required = false,
  className = '',
  ...props
}, ref) => {
  return (
    <Input
      ref={ref}
      type="date"
      label={label}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      error={error}
      disabled={disabled}
      required={required}
      className={className}
      {...props}
    />
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;