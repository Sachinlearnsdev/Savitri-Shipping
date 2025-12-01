/**
 * Badge Component
 * Status/label badge
 */

'use client';
import styles from './Badge.module.css';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const badgeClass = [
    styles.badge,
    styles[variant],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={badgeClass}>
      {children}
    </span>
  );
};

export default Badge;