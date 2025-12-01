/**
 * Homepage
 * Main landing page
 */

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileMenu from '@/components/layout/MobileMenu';
import Toast from '@/components/common/Toast';
import HeroSection from '@/components/home/HeroSection';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <>
      <Header />
      <MobileMenu />
      <Toast />

      <main id="main-content" className={styles.main}>
        <HeroSection />

        {/* More sections will be added in next batches */}
        <section className={styles.section}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Our Services</h2>
            <p className={styles.sectionDescription}>
              Choose from our range of water transport services
            </p>
            
            <div className={styles.servicesGrid}>
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon}>🚤</div>
                <h3>Speed Boats</h3>
                <p>Rent speed boats by the hour for quick trips</p>
              </div>
              
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon}>🛥️</div>
                <h3>Party Boats</h3>
                <p>Book party boats for events and celebrations</p>
              </div>
              
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon}>⛴️</div>
                <h3>Ferry Services</h3>
                <p>Regular ferry routes across Mumbai</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Why Choose Us</h2>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="18" stroke="var(--color-primary)" strokeWidth="2" />
                    <path d="M13 20L18 25L27 15" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>Safe & Secure</h3>
                <p>All our vessels are certified and regularly maintained</p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M20 5L23 15L33 16L26 23L28 33L20 28L12 33L14 23L7 16L17 15L20 5Z" stroke="var(--color-primary)" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>Affordable Prices</h3>
                <p>Competitive pricing with transparent billing</p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="15" stroke="var(--color-primary)" strokeWidth="2" />
                    <path d="M20 12V20L25 25" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <h3>24/7 Available</h3>
                <p>Book anytime with round-the-clock customer support</p>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M20 5C11.7 5 5 11.7 5 20C5 28.3 11.7 35 20 35C28.3 35 35 28.3 35 20C35 11.7 28.3 5 20 5Z" stroke="var(--color-primary)" strokeWidth="2" />
                    <path d="M20 15V20H25" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <h3>Professional Crew</h3>
                <p>Experienced and trained staff for your safety</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}