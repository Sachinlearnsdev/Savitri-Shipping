import Link from 'next/link';
import styles from './about.module.css';

export default function AboutPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>About Savitri Shipping</h1>
        <p className={styles.heroSubtitle}>
          Your trusted partner for premium boat rentals in Mumbai since 2015
        </p>
      </section>

      <div className={styles.container}>
        {/* Story */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Our Story</h2>
          <p className={styles.text}>
            Savitri Shipping was founded with a simple mission &mdash; to make Mumbai&apos;s beautiful
            coastline accessible to everyone. What started as a small fleet of two boats has grown into
            a premier water transport and entertainment company serving thousands of customers every year.
          </p>
          <p className={styles.text}>
            Based in Mumbai, Maharashtra, we specialize in speed boat rentals and party boat experiences.
            Our fleet of well-maintained vessels, combined with professional crews, ensures every trip
            is safe, comfortable, and memorable.
          </p>
        </section>

        {/* Services */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>What We Offer</h2>
          <div className={styles.cardsGrid}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5">
                  <path d="M2 20L4.5 17.5M4.5 17.5L8.04 13.96C8.47 13.53 9.13 13.44 9.66 13.74L10.34 14.13C10.87 14.43 11.53 14.34 11.96 13.91L15.5 10.37M4.5 17.5H8M15.5 10.37L18.5 7.37M15.5 10.37L18 10.37M22 4L18.5 7.37M18.5 7.37V4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Speed Boat Rentals</h3>
              <p className={styles.cardText}>
                Hourly rentals for groups of 6-12. Captain included with every booking. Perfect for
                quick adventures and sightseeing along the Mumbai coast.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="1.5">
                  <path d="M12 2L14.5 9H22L16 13.5L18 21L12 17L6 21L8 13.5L2 9H9.5L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Party Boat Experiences</h3>
              <p className={styles.cardText}>
                Host weddings, birthdays, corporate events, and celebrations on our spacious party boats.
                DJ, catering, decoration &mdash; we handle everything.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Our Values</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2">
                  <path d="M12 22S20 18 20 12V5L12 2 4 5V12C4 18 12 22 12 22Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className={styles.valueTitle}>Safety First</h3>
              <p className={styles.valueText}>Regular vessel inspections and certified crew for your peace of mind.</p>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                  <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className={styles.valueTitle}>Reliability</h3>
              <p className={styles.valueText}>On-time departures, well-maintained fleet, and consistent service quality.</p>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2">
                  <path d="M12 1V23M17 5H9.5C8.57 5 7.68 5.37 7.02 6.02 6.37 6.68 6 7.57 6 8.5 6 9.43 6.37 10.32 7.02 10.98 7.68 11.63 8.57 12 9.5 12H14.5C15.43 12 16.32 12.37 16.98 13.02 17.63 13.68 18 14.57 18 15.5 18 16.43 17.63 17.32 16.98 17.98 16.32 18.63 15.43 19 14.5 19H6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className={styles.valueTitle}>Transparent Pricing</h3>
              <p className={styles.valueText}>No hidden charges. See exact pricing before you book, including all taxes.</p>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className={styles.valueTitle}>Customer First</h3>
              <p className={styles.valueText}>Dedicated support, flexible booking, and hassle-free cancellations.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Ready to Experience Mumbai Waters?</h2>
          <p className={styles.ctaText}>
            Book your next adventure with Savitri Shipping today.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/speed-boats" className={styles.ctaPrimary}>Browse Speed Boats</Link>
            <Link href="/contact" className={styles.ctaSecondary}>Contact Us</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
