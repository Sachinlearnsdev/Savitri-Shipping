/**
 * Loader Component
 * Loading spinner
 */

'use client';
import styles from './Loader.module.css';

const Loader = ({
  size = 'md',
  fullScreen = false,
  text = '',
  className = '',
}) => {
  if (fullScreen) {
    return (
      <div className={styles.fullScreenLoader}>
        <div className={styles.loaderContent}>
          <div className={`${styles.spinner} ${styles[size]}`}>
            <div className={styles.spinnerCircle}></div>
          </div>
          {text && <p className={styles.loaderText}>{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.loader} ${className}`}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.spinnerCircle}></div>
      </div>
      {text && <p className={styles.loaderText}>{text}</p>}
    </div>
  );
};

export default Loader;