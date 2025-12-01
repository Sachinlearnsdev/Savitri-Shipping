/**
 * Card Component
 * Reusable card container
 */

'use client';
import styles from './Card.module.css';

const Card = ({
  children,
  hover = false,
  padding = 'md',
  shadow = 'md',
  onClick,
  className = '',
  ...props
}) => {
  const cardClass = [
    styles.card,
    hover && styles.hover,
    styles[`padding-${padding}`],
    styles[`shadow-${shadow}`],
    onClick && styles.clickable,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClass} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default Card;