import Link from 'next/link';
import styles from './terms.module.css';

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Terms &amp; Conditions</h1>
        <p className={styles.heroSubtitle}>Please read these terms carefully before using our services</p>
      </section>

      <div className={styles.container}>
        <p className={styles.lastUpdated}>Last updated: February 2026</p>

        <section className={styles.section} id="acceptance">
          <h2 className={styles.heading}>1. Acceptance of Terms</h2>
          <p className={styles.text}>
            By accessing and using Savitri Shipping&apos;s services, you accept and agree to be bound
            by the terms and provision of this agreement. If you do not agree to these terms,
            please do not use our services.
          </p>
        </section>

        <section className={styles.section} id="services">
          <h2 className={styles.heading}>2. Services</h2>
          <p className={styles.text}>
            Savitri Shipping provides boat rental services including speed boat hourly rentals and
            party boat event bookings. All services are subject to availability and may be modified
            at our discretion.
          </p>
          <ul className={styles.list}>
            <li>Speed boat rentals require a minimum 2-hour advance booking</li>
            <li>Party boat events require a minimum 7-day advance booking</li>
            <li>All bookings include a professional captain and safety equipment</li>
            <li>Maximum advance booking window is 45 days</li>
          </ul>
        </section>

        <section className={styles.section} id="booking">
          <h2 className={styles.heading}>3. Booking &amp; Payment</h2>
          <p className={styles.text}>
            All bookings are subject to availability. Payment terms vary by service type:
          </p>
          <ul className={styles.list}>
            <li><strong>Speed Boats:</strong> Full payment at the time of booking (online or at venue)</li>
            <li><strong>Party Boats:</strong> 50% advance payment to confirm, remainder due before the event</li>
            <li>All prices are in INR and include 18% GST</li>
            <li>Payment can be made via online payment or bank transfer</li>
          </ul>
        </section>

        <section className={styles.section} id="cancellation">
          <h2 className={styles.heading}>4. Cancellation Policy</h2>
          <p className={styles.text}><strong>Speed Boat Rentals:</strong></p>
          <div className={styles.policyTable}>
            <div className={styles.policyRow}><span className={styles.policyTime}>24+ hours before</span><span className={styles.policyResult}>100% refund</span></div>
            <div className={styles.policyRow}><span className={styles.policyTime}>12-24 hours before</span><span className={styles.policyResult}>50% refund</span></div>
            <div className={styles.policyRow}><span className={styles.policyTime}>Less than 12 hours</span><span className={styles.policyResult}>No refund</span></div>
          </div>
          <p className={styles.text}><strong>Party Boat Events:</strong></p>
          <div className={styles.policyTable}>
            <div className={styles.policyRow}><span className={styles.policyTime}>7+ days before</span><span className={styles.policyResult}>100% refund</span></div>
            <div className={styles.policyRow}><span className={styles.policyTime}>3-7 days before</span><span className={styles.policyResult}>50% refund</span></div>
            <div className={styles.policyRow}><span className={styles.policyTime}>Less than 3 days</span><span className={styles.policyResult}>No refund</span></div>
          </div>
          <p className={styles.text}>
            For complete refund details, see our <Link href="/refund" className={styles.link}>Refund Policy</Link>.
          </p>
        </section>

        <section className={styles.section} id="liability">
          <h2 className={styles.heading}>5. Liability</h2>
          <p className={styles.text}>
            While we strive to provide safe and reliable services, Savitri Shipping shall not be
            liable for any indirect, incidental, or consequential damages arising from the use of
            our services. All passengers must follow safety instructions provided by the crew.
          </p>
        </section>

        <section className={styles.section} id="governing-law">
          <h2 className={styles.heading}>6. Governing Law</h2>
          <p className={styles.text}>
            These terms shall be governed by and construed in accordance with the laws of India.
            Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai,
            Maharashtra.
          </p>
        </section>

        <section className={styles.section} id="contact">
          <h2 className={styles.heading}>7. Contact Us</h2>
          <p className={styles.text}>
            For questions about these Terms &amp; Conditions, please contact us at{' '}
            <a href="mailto:info@savitrishipping.in" className={styles.link}>info@savitrishipping.in</a> or
            call <a href="tel:+919876543210" className={styles.link}>+91 98765 43210</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
