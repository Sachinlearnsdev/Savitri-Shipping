/**
 * CTASection Component - Using Regular Button
 * Save as: src/components/home/CTASection/index.jsx
 */

'use client';
import Link from 'next/link';
import Button from '@/components/common/Button';
import styles from './CTASection.module.css';

const CTASection = () => {
  return (
    <section className={styles.cta}>
      {/* Background Image */}
      <div className={styles.background}>
        <div className={styles.overlay} />
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          {/* Icon */}
          <div className={styles.iconWrapper}>
            <span className={styles.icon}>🚢</span>
          </div>

          {/* Heading */}
          <h2 className={styles.title}>Ready to Set Sail?</h2>
          <p className={styles.subtitle}>
            Book your journey across Mumbai waters today. Fast, safe, and affordable.
          </p>

          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>500+</div>
              <div className={styles.statLabel}>Happy Travelers</div>
            </div>
            <div className={styles.divider} />
            <div className={styles.stat}>
              <div className={styles.statValue}>24/7</div>
              <div className={styles.statLabel}>Available</div>
            </div>
            <div className={styles.divider} />
            <div className={styles.stat}>
              <div className={styles.statValue}>50+</div>
              <div className={styles.statLabel}>Vessels</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className={styles.actions}>
            <Link href="/register">
              <Button variant="primary" size="lg">
                🚀 Book Your Journey Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className={styles.outlineBtn}>
                📞 Contact Us
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className={styles.trustBadges}>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>✓</span>
              <span className={styles.badgeText}>Safe & Certified</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>✓</span>
              <span className={styles.badgeText}>Instant Booking</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>✓</span>
              <span className={styles.badgeText}>Best Prices</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Waves */}
      <div className={styles.waves}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path 
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
            fill="var(--bg-primary)"
          />
        </svg>
      </div>
    </section>
  );
};

export default CTASection;