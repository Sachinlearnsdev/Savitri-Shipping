/**
 * About Page
 */

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileMenu from '@/components/layout/MobileMenu';
import Toast from '@/components/common/Toast';
import styles from './page.module.css';

export const metadata = {
  title: 'About Us - Savitri Shipping',
  description: 'Learn about Savitri Shipping - Your trusted water transport partner in Mumbai',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <MobileMenu />
      <Toast />

      <main className={styles.aboutPage}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className="container">
            <h1 className={styles.heroTitle}>About Savitri Shipping</h1>
            <p className={styles.heroDescription}>
              Your trusted partner for water transport services in Mumbai
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className={styles.section}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Our Story</h2>
            <div className={styles.content}>
              <p>
                Founded in 2020, Savitri Shipping has been providing reliable and safe water
                transport services across Mumbai. We started with a vision to make water
                transport accessible, affordable, and comfortable for everyone.
              </p>
              <p>
                Today, we operate a fleet of modern vessels including speed boats, party boats,
                and regular ferry services, serving thousands of customers every month.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className={styles.section} style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className={styles.missionGrid}>
              <div className={styles.missionCard}>
                <h3>Our Mission</h3>
                <p>
                  To provide safe, reliable, and affordable water transport services that
                  connect communities and enable seamless travel across Mumbai's waterways.
                </p>
              </div>
              <div className={styles.missionCard}>
                <h3>Our Vision</h3>
                <p>
                  To become the leading water transport service provider in India, known
                  for excellence in service, safety, and customer satisfaction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className={styles.section}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Our Values</h2>
            <div className={styles.valuesGrid}>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>🛡️</div>
                <h3>Safety First</h3>
                <p>Safety of our passengers is our top priority. All vessels are regularly maintained and certified.</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>⭐</div>
                <h3>Excellence</h3>
                <p>We strive for excellence in every aspect of our service, from booking to journey completion.</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>🤝</div>
                <h3>Integrity</h3>
                <p>We operate with honesty and transparency in all our dealings with customers and partners.</p>
              </div>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>💚</div>
                <h3>Sustainability</h3>
                <p>We're committed to environmentally responsible operations and reducing our carbon footprint.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className={styles.statsSection}>
          <div className="container">
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>50+</div>
                <div className={styles.statLabel}>Vessels</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>500+</div>
                <div className={styles.statLabel}>Happy Customers</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>10+</div>
                <div className={styles.statLabel}>Routes</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>24/7</div>
                <div className={styles.statLabel}>Service</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}