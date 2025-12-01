import styles from './Loader.module.css';

/**
 * Loader/Spinner Component
 * 
 * @param {object} props - Component props
 * @param {'sm' | 'md' | 'lg' | 'xl'} props.size - Loader size
 * @param {'primary' | 'secondary' | 'white'} props.color - Loader color
 * @param {boolean} props.fullScreen - Show as full screen loader
 * @param {string} props.text - Loading text
 */
const Loader = ({
  size = 'md',
  color = 'primary',
  fullScreen = false,
  text,
  className = '',
  ...props
}) => {
  const loaderClasses = [
    styles.loader,
    styles[size],
    styles[color],
    className,
  ].filter(Boolean).join(' ');
  
  if (fullScreen) {
    return (
      <div className={styles.fullScreen} {...props}>
        <div className={styles.content}>
          <span className={loaderClasses}></span>
          {text && <p className={styles.text}>{text}</p>}
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.container} {...props}>
      <span className={loaderClasses}></span>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

export default Loader;