import Button from '../Button';
import styles from './EmptyState.module.css';

/**
 * EmptyState Component
 * 
 * @param {object} props - Component props
 * @param {string} props.icon - Icon/emoji to display
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @param {string} props.actionLabel - Action button label
 * @param {Function} props.onAction - Action button click handler
 */
const EmptyState = ({
  icon = '📭',
  title = 'No data found',
  description,
  actionLabel,
  onAction,
  className = '',
  ...props
}) => {
  const wrapperClasses = [
    styles.wrapper,
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={wrapperClasses} {...props}>
      <div className={styles.content}>
        {icon && (
          <div className={styles.icon}>{icon}</div>
        )}
        
        {title && (
          <h3 className={styles.title}>{title}</h3>
        )}
        
        {description && (
          <p className={styles.description}>{description}</p>
        )}
        
        {actionLabel && onAction && (
          <Button
            variant="primary"
            onClick={onAction}
            className={styles.action}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;