/**
 * 404 Not Found Page - Fixed Icon Display
 * Save as: src/app/not-found.js
 */

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileMenu from '@/components/layout/MobileMenu';
import Toast from '@/components/common/Toast';
import Button from '@/components/common/Button';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <>
      <Header />
      <MobileMenu />
      <Toast />
      
      <div className={styles.notFound}>
        <div className={styles.container}>
          <div className={styles.content}>
            {/* Animated 404 */}
            <div className={styles.errorCode}>
              <span className={styles.digit}>4</span>
              <div className={styles.boat}>
                <span className={styles.boatIcon}>⛵</span>
              </div>
              <span className={styles.digit}>4</span>
            </div>

            {/* Message */}
            <h1 className={styles.title}>Page Not Found</h1>
            <p className={styles.message}>
              Oops! Looks like this page has sailed away. The page you're looking for doesn't exist or has been moved.
            </p>

            {/* Actions */}
            <div className={styles.actions}>
              <Link href="/">
                <Button variant="primary" size="lg">
                  <span className={styles.buttonIcon}>🏠</span>
                  Back to Home
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  <span className={styles.buttonIcon}>📧</span>
                  Contact Support
                </Button>
              </Link>
            </div>

            {/* Quick Links */}
            <div className={styles.quickLinks}>
              <p className={styles.quickLinksTitle}>Or try these pages:</p>
              <div className={styles.linkCards}>
                <Link href="/about" className={styles.linkCard}>
                  <span className={styles.linkIcon}>ℹ️</span>
                  <span className={styles.linkText}>About Us</span>
                </Link>
                <Link href="/faq" className={styles.linkCard}>
                  <span className={styles.linkIcon}>❓</span>
                  <span className={styles.linkText}>FAQ</span>
                </Link>
                <Link href="/account" className={styles.linkCard}>
                  <span className={styles.linkIcon}>👤</span>
                  <span className={styles.linkText}>My Account</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative waves at bottom */}
        <div className={styles.waves}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
      </div>

      <Footer />
    </>
  );
}