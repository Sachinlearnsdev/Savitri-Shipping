import { APP_VERSION } from '../../../utils/constants';
import styles from './Footer.module.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <span className={styles.copyright}>
        &copy; {year} Savitri Shipping. All rights reserved.
      </span>

      <div className={styles.links}>
        <a href="mailto:support@savitrishipping.in" className={styles.link}>Support</a>
        <span className={styles.separator}>|</span>
        <a href="/docs" className={styles.link}>Documentation</a>
      </div>

      <span className={styles.version}>v{APP_VERSION}</span>
    </footer>
  );
};

export default Footer;
