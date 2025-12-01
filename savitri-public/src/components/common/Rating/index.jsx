/**
 * Rating Component
 * Star rating display and input
 */

'use client';
import { useState } from 'react';
import styles from './Rating.module.css';

const Rating = ({
  value = 0,
  max = 5,
  size = 'md',
  readonly = false,
  onChange,
  showValue = false,
  className = '',
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  const displayValue = hoverValue || value;

  const ratingClass = [
    styles.rating,
    styles[size],
    !readonly && styles.interactive,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={ratingClass}>
      <div className={styles.stars}>
        {[...Array(max)].map((_, index) => {
          const ratingValue = index + 1;
          const isFilled = ratingValue <= displayValue;
          const isHalf = !isFilled && ratingValue - 0.5 <= displayValue;

          return (
            <button
              key={index}
              type="button"
              className={styles.star}
              onClick={() => handleClick(ratingValue)}
              onMouseEnter={() => handleMouseEnter(ratingValue)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
              aria-label={`Rate ${ratingValue} out of ${max}`}
            >
              <svg
                className={isFilled ? styles.filled : isHalf ? styles.half : styles.empty}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill={isFilled || isHalf ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className={styles.value}>
          {value.toFixed(1)}/{max}
        </span>
      )}
    </div>
  );
};

export default Rating;