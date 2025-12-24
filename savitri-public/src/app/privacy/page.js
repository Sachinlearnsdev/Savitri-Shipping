import styles from './privacy.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Privacy Policy</h1>
        
        <div className={styles.content}>
          <p className={styles.lastUpdated}>Last updated: December 2024</p>

          <section className={styles.section}>
            <h2>1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, including name, email address, 
              phone number, and payment information when you register or book our services.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Process your bookings and transactions</li>
              <li>Send you confirmations and updates</li>
              <li>Improve our services</li>
              <li>Communicate with you about promotions and offers</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share your information with service 
              providers who assist us in operating our platform and conducting our business.
            </p>
          </section>

          <section className={styles.section}>
            <h2>4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. 
              However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information. You can 
              update your information in your account settings or contact us for assistance.
            </p>
          </section>

          <section className={styles.section}>
            <h2>6. Cookies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience on our platform. 
              You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section className={styles.section}>
            <h2>7. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at 
              privacy@savitrishipping.in
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}