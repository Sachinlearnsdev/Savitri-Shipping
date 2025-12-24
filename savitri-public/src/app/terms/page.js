import styles from './terms.module.css';

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Terms & Conditions</h1>
        
        <div className={styles.content}>
          <p className={styles.lastUpdated}>Last updated: December 2024</p>

          <section className={styles.section}>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Savitri Shipping's services, you accept and agree to be bound
              by the terms and provision of this agreement.
            </p>
          </section>

          <section className={styles.section}>
            <h2>2. Use of Services</h2>
            <p>
              Our services are available to individuals who are at least 18 years old. You are
              responsible for maintaining the confidentiality of your account information.
            </p>
          </section>

          <section className={styles.section}>
            <h2>3. Booking and Payment</h2>
            <p>
              All bookings are subject to availability. Payment must be made in full at the time
              of booking unless otherwise agreed.
            </p>
          </section>

          <section className={styles.section}>
            <h2>4. Cancellation Policy</h2>
            <p>
              Cancellation policies vary by service type. Please refer to our Refund Policy for
              detailed information.
            </p>
          </section>

          <section className={styles.section}>
            <h2>5. Liability</h2>
            <p>
              While we strive to provide safe and reliable services, Savitri Shipping shall not be
              liable for any indirect, incidental, or consequential damages.
            </p>
          </section>

          <section className={styles.section}>
            <h2>6. Contact Us</h2>
            <p>
              For questions about these Terms & Conditions, please contact us at
              info@savitrishipping.in
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}