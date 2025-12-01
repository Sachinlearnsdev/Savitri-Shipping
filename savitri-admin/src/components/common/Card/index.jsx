import styles from './Card.module.css';

/**
 * Card Component
 * 
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {React.ReactNode} props.header - Card header content
 * @param {React.ReactNode} props.footer - Card footer content
 * @param {string} props.title - Card title
 * @param {boolean} props.hoverable - Whether card has hover effect
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.noPadding - Remove default padding
 */
const Card = ({
  children,
  header,
  footer,
  title,
  hoverable = false,
  onClick,
  noPadding = false,
  className = '',
  ...props
}) => {
  const cardClasses = [
    styles.card,
    hoverable && styles.hoverable,
    onClick && styles.clickable,
    className,
  ].filter(Boolean).join(' ');
  
  const contentClasses = [
    styles.content,
    noPadding && styles.noPadding,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      {/* Header */}
      {(title || header) && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {header}
        </div>
      )}
      
      {/* Content */}
      <div className={contentClasses}>
        {children}
      </div>
      
      {/* Footer */}
      {footer && (
        <div className={styles.footer}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;