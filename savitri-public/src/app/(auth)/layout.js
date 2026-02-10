import styles from './layout.module.css';

export default function AuthLayout({ children }) {
  return (
    <div className={styles.authLayout}>
      {/* Brand Panel (Left Side) */}
      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <div className={styles.brandLogo}>Savitri Shipping</div>
          <h2 className={styles.brandTagline}>Your Gateway to the Arabian Sea</h2>
          <p className={styles.brandDescription}>
            Premium boat rentals for speed adventures and unforgettable celebrations on the waters of Mumbai.
          </p>
          <div className={styles.brandFeatures}>
            <div className={styles.brandFeature}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Speed Boats &amp; Party Boats</span>
            </div>
            <div className={styles.brandFeature}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Professional Captains</span>
            </div>
            <div className={styles.brandFeature}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Easy Online Booking</span>
            </div>
          </div>
        </div>
        {/* Wave decoration at bottom */}
        <svg className={styles.brandWave} viewBox="0 0 400 60" preserveAspectRatio="none">
          <path d="M0,30 C100,60 200,0 300,30 C350,45 380,15 400,30 L400,60 L0,60 Z" fill="rgba(255,255,255,0.08)" />
        </svg>
      </div>

      {/* Form Panel (Right Side) */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          {children}
        </div>
      </div>
    </div>
  );
}
