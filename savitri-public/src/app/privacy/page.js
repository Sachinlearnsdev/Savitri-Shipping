import styles from './privacy.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Privacy Policy</h1>
        <p className={styles.heroSubtitle}>How we collect, use, and protect your information</p>
      </section>

      <div className={styles.container}>
        <p className={styles.lastUpdated}>Last updated: February 2026</p>

        <section className={styles.section}>
          <h2 className={styles.heading}>1. Information We Collect</h2>
          <p className={styles.text}>We collect information that you provide directly to us when you:</p>
          <ul className={styles.list}>
            <li>Create an account (name, email, phone number)</li>
            <li>Make a booking (payment information, event details)</li>
            <li>Contact us (message content, inquiry details)</li>
            <li>Use our website (browsing data, device information via cookies)</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>2. How We Use Your Information</h2>
          <ul className={styles.list}>
            <li>Process your bookings and transactions</li>
            <li>Send booking confirmations and updates via email and SMS</li>
            <li>Provide customer support</li>
            <li>Improve our services and website experience</li>
            <li>Send promotional offers (with your consent)</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>3. Data Protection</h2>
          <p className={styles.text}>
            We implement appropriate security measures to protect your personal information, including
            encryption of sensitive data, secure server infrastructure, and regular security audits.
            However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>4. Cookies</h2>
          <p className={styles.text}>
            We use cookies and similar technologies to enhance your experience on our platform.
            These help us remember your preferences, maintain your login session, and analyze site
            usage. You can control cookie settings through your browser preferences.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>5. Third-Party Services</h2>
          <p className={styles.text}>
            We do not sell your personal information. We may share data with trusted third-party
            service providers who assist in operating our platform (payment processors, email services)
            under strict data protection agreements.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>6. Your Rights</h2>
          <p className={styles.text}>You have the right to:</p>
          <ul className={styles.list}>
            <li>Access your personal data stored with us</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your account and data</li>
            <li>Opt out of marketing communications</li>
            <li>Export your data in a portable format</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>7. Contact Us</h2>
          <p className={styles.text}>
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@savitrishipping.in" className={styles.link}>privacy@savitrishipping.in</a> or
            call <a href="tel:+919876543210" className={styles.link}>+91 98765 43210</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
