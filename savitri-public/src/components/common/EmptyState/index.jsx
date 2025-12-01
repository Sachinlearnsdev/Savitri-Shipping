/**
 * EmptyState Component
 * Display when no data is available
 */

'use client';
import styles from './EmptyState.module.css';

const EmptyState = ({
  icon,
  title = 'No data found',
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`${styles.emptyState} ${className}`}>
      {icon && (
        <div className={styles.icon}>
          {icon}
        </div>
      )}

      <h3 className={styles.title}>{title}</h3>

      {description && (
        <p className={styles.description}>{description}</p>
      )}

      {action && (
        <div className={styles.action}>
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;