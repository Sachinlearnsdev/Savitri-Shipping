import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.homepage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Welcome to Savitri Shipping
          </h1>
          <p className={styles.heroSubtitle}>
            Your trusted partner for ferry and boat rental services in Mumbai.
            Safe, reliable, and affordable transportation solutions.
          </p>
          <div className={styles.heroActions}>
            <Link href="/register" className={styles.primaryButton}>
              Get Started
            </Link>
            <Link href="/about" className={styles.secondaryButton}>
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={styles.services}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Services</h2>
          <div className={styles.servicesGrid}>
            {/* Speed Boats */}
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>🚤</div>
              <h3 className={styles.serviceTitle}>Speed Boats</h3>
              <p className={styles.serviceDescription}>
                Rent speed boats by the hour for quick and comfortable water transport.
              </p>
            </div>

            {/* Party Boats */}
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>🎉</div>
              <h3 className={styles.serviceTitle}>Party Boats</h3>
              <p className={styles.serviceDescription}>
                Host memorable events on our spacious party boats with custom packages.
              </p>
            </div>

            {/* Ferry Services */}
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>⛴️</div>
              <h3 className={styles.serviceTitle}>Ferry Services</h3>
              <p className={styles.serviceDescription}>
                Regular ferry services between Mumbai and Mandwa with vehicle transport.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Choose Us</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>🛡️ Safe & Secure</h3>
              <p className={styles.featureDescription}>
                All our vessels are regularly inspected and maintained to the highest safety standards.
              </p>
            </div>

            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>💰 Affordable Prices</h3>
              <p className={styles.featureDescription}>
                Competitive pricing with transparent costs. No hidden charges.
              </p>
            </div>

            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>👨‍✈️ Professional Crew</h3>
              <p className={styles.featureDescription}>
                Experienced and licensed crew members dedicated to your comfort and safety.
              </p>
            </div>

            <div className={styles.featureCard}>
              <h3 className={styles.featureTitle}>⏰ 24/7 Available</h3>
              <p className={styles.featureDescription}>
                Round-the-clock booking support and customer service for your convenience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Ready to Book Your Journey?</h2>
          <p className={styles.ctaDescription}>
            Create an account today and start exploring our services.
          </p>
          <Link href="/register" className={styles.ctaButton}>
            Register Now
          </Link>
        </div>
      </section>
    </div>
  );
}