import Link from 'next/link';
import styles from './refund.module.css';

export default function RefundPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Refund Policy</h1>
        <p className={styles.heroSubtitle}>Our cancellation and refund guidelines</p>
      </section>

      <div className={styles.container}>
        <p className={styles.lastUpdated}>Last updated: February 2026</p>

        <section className={styles.section}>
          <h2 className={styles.heading}>Speed Boat Cancellations</h2>
          <p className={styles.text}>
            Cancellation refunds for speed boat rentals are based on the time of cancellation relative
            to your booking date:
          </p>
          <div className={styles.policyTable}>
            <div className={`${styles.policyRow} ${styles.policyRowHeader}`}>
              <span>Cancellation Window</span><span>Refund Amount</span>
            </div>
            <div className={styles.policyRow}>
              <span className={styles.policyTime}>24+ hours before departure</span>
              <span className={styles.policyGood}>100% refund</span>
            </div>
            <div className={styles.policyRow}>
              <span className={styles.policyTime}>12-24 hours before departure</span>
              <span className={styles.policyWarn}>50% refund</span>
            </div>
            <div className={styles.policyRow}>
              <span className={styles.policyTime}>Less than 12 hours</span>
              <span className={styles.policyBad}>No refund</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Party Boat Cancellations</h2>
          <p className={styles.text}>
            Party boat event cancellation refunds follow a different schedule due to the nature
            of event planning and preparation:
          </p>
          <div className={styles.policyTable}>
            <div className={`${styles.policyRow} ${styles.policyRowHeader}`}>
              <span>Cancellation Window</span><span>Refund Amount</span>
            </div>
            <div className={styles.policyRow}>
              <span className={styles.policyTime}>7+ days before event</span>
              <span className={styles.policyGood}>100% refund</span>
            </div>
            <div className={styles.policyRow}>
              <span className={styles.policyTime}>3-7 days before event</span>
              <span className={styles.policyWarn}>50% refund</span>
            </div>
            <div className={styles.policyRow}>
              <span className={styles.policyTime}>Less than 3 days</span>
              <span className={styles.policyBad}>No refund</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Weather-Related Cancellations</h2>
          <p className={styles.text}>
            If we cancel your booking due to unsafe weather conditions, high tides, or operational
            reasons, you will receive a <strong>full refund</strong> or the option to reschedule
            at no additional cost.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>How to Request a Refund</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepItem}>
              <div className={styles.stepNum}>1</div>
              <p className={styles.stepText}>Log in to your account</p>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNum}>2</div>
              <p className={styles.stepText}>Go to <Link href="/account/bookings" className={styles.link}>My Bookings</Link></p>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNum}>3</div>
              <p className={styles.stepText}>Select your booking and click &quot;Cancel Booking&quot;</p>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNum}>4</div>
              <p className={styles.stepText}>Refund processed within 7-10 business days</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Processing Time</h2>
          <p className={styles.text}>
            Approved refunds will be processed within 7-10 business days. The refund will be
            credited to your original payment method. Bank processing times may vary.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Contact Us</h2>
          <p className={styles.text}>
            For refund inquiries, contact us at{' '}
            <a href="mailto:refunds@savitrishipping.in" className={styles.link}>refunds@savitrishipping.in</a> or
            call <a href="tel:+919876543210" className={styles.link}>+91 98765 43210</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
