import styles from './Badge.module.css';

/**
 * Badge Component
 * 
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Badge content
 * @param {'success' | 'error' | 'warning' | 'info' | 'default'} props.variant - Badge color variant
 * @param {'sm' | 'md' | 'lg'} props.size - Badge size
 * @param {boolean} props.dot - Show as dot badge
 * @param {boolean} props.outlined - Outlined style
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  outlined = false,
  className = '',
  ...props
}) => {
  const badgeClasses = [
    styles.badge,
    styles[variant],
    styles[size],
    dot && styles.dot,
    outlined && styles.outlined,
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <span className={badgeClasses} {...props}>
      {!dot && children}
    </span>
  );
};

export default Badge;