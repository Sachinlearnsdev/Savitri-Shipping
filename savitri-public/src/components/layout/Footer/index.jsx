/**
 * Footer Component
 * Main footer with links and company info
 */

'use client';
import Link from 'next/link';
import { FOOTER_MENU, SOCIAL_MEDIA, COMPANY } from '@/utils/constants';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Top Section */}
        <div className={styles.top}>
          {/* Company Info */}
          <div className={styles.column}>
            <div className={styles.logo}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 24L14 18L26 18L32 24L30 28L10 28L8 24Z"
                  fill="var(--color-primary)"
                />
                <path
                  d="M14 18L20 12L26 18"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M4 30C6 28 8 28 10 30C12 32 14 32 16 30C18 28 20 28 22 30C24 32 26 32 28 30C30 28 32 28 34 30C36 32 38 32 40 30"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className={styles.logoText}>{COMPANY.NAME}</span>
            </div>
            <p className={styles.description}>
              Professional ferry and boat rental services in Mumbai. 
              Safe, affordable, and available 24/7.
            </p>
            <div className={styles.contact}>
              <div className={styles.contactItem}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M2 4L8 10L2 16V4Z"
                    fill="currentColor"
                  />
                  <path
                    d="M18 4L12 10L18 16V4Z"
                    fill="currentColor"
                  />
                </svg>
                <a href={`mailto:${COMPANY.EMAIL}`}>{COMPANY.EMAIL}</a>
              </div>
              <div className={styles.contactItem}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M2 3C2 2.44772 2.44772 2 3 2H5.15287C5.64171 2 6.0589 2.35341 6.13927 2.8356L7.16639 8.87147C7.23947 9.3118 7.02176 9.75305 6.62319 9.95098L4.79462 10.8652C5.78788 13.1643 7.83574 15.2121 10.1348 16.2054L11.049 14.3768C11.247 13.9782 11.6882 13.7605 12.1285 13.8336L18.1644 14.8607C18.6466 14.9411 19 15.3583 19 15.8471V18C19 18.5523 18.5523 19 18 19H15C7.8203 19 2 13.1797 2 6V3Z"
                    fill="currentColor"
                  />
                </svg>
                <a href={`tel:${COMPANY.PHONE}`}>{COMPANY.PHONE}</a>
              </div>
            </div>
          </div>

          {/* Services Links */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Services</h3>
            <ul className={styles.links}>
              {FOOTER_MENU.SERVICES.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Company</h3>
            <ul className={styles.links}>
              {FOOTER_MENU.COMPANY.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Legal</h3>
            <ul className={styles.links}>
              {FOOTER_MENU.LEGAL.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} {COMPANY.NAME}. All rights reserved.
          </p>

          {/* Social Media */}
          <div className={styles.social}>
            {SOCIAL_MEDIA.FACEBOOK && (
              <a
                href={SOCIAL_MEDIA.FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            )}
            {SOCIAL_MEDIA.INSTAGRAM && (
              <a
                href={SOCIAL_MEDIA.INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                </svg>
              </a>
            )}
            {SOCIAL_MEDIA.TWITTER && (
              <a
                href={SOCIAL_MEDIA.TWITTER}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            )}
            {SOCIAL_MEDIA.LINKEDIN && (
              <a
                href={SOCIAL_MEDIA.LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"
                    fill="currentColor"
                  />
                  <circle cx="4" cy="4" r="2" fill="currentColor" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;