import styles from './refund.module.css';

export default function RefundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Refund Policy</h1>
        
        <div className={styles.content}>
          <p className={styles.lastUpdated}>Last updated: December 2024</p>

          <section className={styles.section}>
            <h2>1. Cancellation & Refund Eligibility</h2>
            <p>
              Refunds are available based on the timing of your cancellation:
            </p>
            <ul>
              <li><strong>48+ hours before departure:</strong> Full refund minus processing fee (5%)</li>
              <li><strong>24-48 hours before departure:</strong> 50% refund</li>
              <li><strong>Less than 24 hours:</strong> No refund</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>2. Processing Time</h2>
            <p>
              Approved refunds will be processed within 7-10 business days. The refund will be 
              credited to your original payment method.
            </p>
          </section>

          <section className={styles.section}>
            <h2>3. Weather-Related Cancellations</h2>
            <p>
              If we cancel your booking due to unsafe weather conditions, you will receive a full 
              refund or the option to reschedule without any penalty.
            </p>
          </section>

          <section className={styles.section}>
            <h2>4. Non-Refundable Items</h2>
            <p>
              The following are non-refundable:
            </p>
            <ul>
              <li>No-shows without prior cancellation</li>
              <li>Special event bookings (holidays, festivals)</li>
              <li>Promotional or discounted fares</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>5. How to Request a Refund</h2>
            <p>
              To request a refund:
            </p>
            <ul>
              <li>Log in to your account</li>
              <li>Go to "My Bookings"</li>
              <li>Select the booking and click "Cancel & Request Refund"</li>
              <li>Provide reason for cancellation</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>6. Partial Refunds</h2>
            <p>
              In certain situations, partial refunds may be granted at our discretion, such as 
              service disruptions or quality issues.
            </p>
          </section>

          <section className={styles.section}>
            <h2>7. Contact Us</h2>
            <p>
              For refund inquiries, contact us at refunds@savitrishipping.in or call our support 
              team at +91-1234567890.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}