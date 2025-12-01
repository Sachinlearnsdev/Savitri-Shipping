import { forwardRef } from 'react';
import styles from './Button.module.css';

/**
 * Button Component
 * 
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'} props.variant - Button style variant
 * @param {'sm' | 'md' | 'lg'} props.size - Button size
 * @param {'button' | 'submit' | 'reset'} props.type - Button type
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {React.ReactNode} props.leftIcon - Icon to display on left side
 * @param {React.ReactNode} props.rightIcon - Icon to display on right side
 * @param {Function} props.onClick - Click handler
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  onClick,
  className = '',
  ...props
}, ref) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className={styles.loader}></span>
      )}
      
      {!loading && leftIcon && (
        <span className={styles.leftIcon}>{leftIcon}</span>
      )}
      
      <span className={styles.content}>{children}</span>
      
      {!loading && rightIcon && (
        <span className={styles.rightIcon}>{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;