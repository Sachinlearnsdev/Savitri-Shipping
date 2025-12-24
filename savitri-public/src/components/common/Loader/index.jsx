import React from 'react';
import styles from './Loader.module.css';

/**
 * Loader Component
 * @param {object} props
 * @param {string} props.size - Loader size (sm, md, lg)
 * @param {string} props.variant - Loader variant (spinner, dots, pulse)
 * @param {boolean} props.fullScreen - Full screen overlay loader
 * @param {string} props.text - Loading text
 */
const Loader = ({
  size = 'md',
  variant = 'spinner',
  fullScreen = false,
  text = '',
}) => {
  if (fullScreen) {
    return (
      <div className={styles.fullScreenOverlay}>
        <div className={styles.fullScreenContent}>
          <LoaderVariant variant={variant} size={size} />
          {text && <p className={styles.text}>{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LoaderVariant variant={variant} size={size} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

/**
 * Loader Variant Component
 */
const LoaderVariant = ({ variant, size }) => {
  if (variant === 'dots') {
    return (
      <div className={`${styles.dots} ${styles[size]}`}>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </div>
    );
  }

  if (variant === 'pulse') {
    return <div className={`${styles.pulse} ${styles[size]}`}></div>;
  }

  // Default: spinner
  return <div className={`${styles.spinner} ${styles[size]}`}></div>;
};

export default Loader;