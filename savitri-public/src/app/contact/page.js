/**
 * Contact Page
 */

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileMenu from '@/components/layout/MobileMenu';
import Toast from '@/components/common/Toast';
import { COMPANY } from '@/utils/constants';
import styles from './page.module.css';

export const metadata = {
  title: 'Contact Us - Savitri Shipping',
  description: 'Get in touch with Savitri Shipping. We are here to help!',
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <MobileMenu />
      <Toast />

      <main className={styles.contactPage}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className="container">
            <h1 className={styles.heroTitle}>Contact Us</h1>
            <p className={styles.heroDescription}>
              We're here to help! Reach out to us anytime.
            </p>
          </div>
        </section>

        {/* Contact Info & Form */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.contactGrid}>
              {/* Contact Information */}
              <div className={styles.contactInfo}>
                <h2 className={styles.infoTitle}>Get In Touch</h2>
                <p className={styles.infoDescription}>
                  Have questions? We'd love to hear from you. Send us a message
                  and we'll respond as soon as possible.
                </p>

                <div className={styles.contactMethods}>
                  <div className={styles.contactMethod}>
                    <div className={styles.methodIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 8L10.89 13.26C11.53 13.67 12.47 13.67 13.11 13.26L21 8M5 19H19C20.1 19 21 18.1 21 17V7C21 5.9 20.1 5 19 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3>Email</h3>
                      <a href={`mailto:${COMPANY.EMAIL}`}>{COMPANY.EMAIL}</a>
                    </div>
                  </div>

                  <div className={styles.contactMethod}>
                    <div className={styles.methodIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3>Phone</h3>
                      <a href={`tel:${COMPANY.PHONE}`}>{COMPANY.PHONE}</a>
                    </div>
                  </div>

                  <div className={styles.contactMethod}>
                    <div className={styles.methodIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 21C16.4183 21 20 17.4183 20 13C20 8.58172 16.4183 5 12 5C7.58172 5 4 8.58172 4 13C4 17.4183 7.58172 21 12 21Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M12 9V13L15 15"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3>Business Hours</h3>
                      <p>24/7 Service Available</p>
                    </div>
                  </div>

                  <div className={styles.contactMethod}>
                    <div className={styles.methodIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                    <div>
                      <h3>Address</h3>
                      <p>{COMPANY.ADDRESS}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form (Placeholder) */}
              <div className={styles.contactForm}>
                <h2 className={styles.formTitle}>Send us a Message</h2>
                <p className={styles.formDescription}>
                  Contact form will be available soon. For now, please reach us
                  via email or phone.
                </p>
                <div className={styles.formPlaceholder}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <rect width="80" height="80" rx="8" fill="var(--bg-secondary)" />
                    <path
                      d="M20 30H60M20 40H60M20 50H45"
                      stroke="var(--color-gray-300)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p>Contact Form Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}