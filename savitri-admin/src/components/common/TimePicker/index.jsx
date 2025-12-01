import { forwardRef } from 'react';
import Input from '../Input';
import styles from './TimePicker.module.css';

/**
 * TimePicker Component
 * Simple wrapper around native time input with consistent styling
 * 
 * @param {object} props - Component props
 * @param {string} props.label - Time picker label
 * @param {string} props.value - Time value (HH:MM format)
 * @param {Function} props.onChange - Change handler
 * @param {string} props.min - Minimum time (HH:MM)
 * @param {string} props.max - Maximum time (HH:MM)
 * @param {string} props.error - Error message
 * @param {boolean} props.disabled - Whether time picker is disabled
 * @param {boolean} props.required - Whether time picker is required
 */
const TimePicker = forwardRef(({
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
      type="time"
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

TimePicker.displayName = 'TimePicker';

export default TimePicker;