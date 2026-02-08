import React from 'react';
import Link from 'next/link';
import { APP_NAME, COMPANY_PHONE, COMPANY_EMAIL, COMPANY_ADDRESS } from '@/utils/constants';
import styles from './Footer.module.css';

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
      { href: '/terms', label: 'Terms & Conditions' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/refund', label: 'Refund Policy' },
    ],
    services: [
      { href: '/speed-boats', label: 'Speed Boats' },
      { href: '/party-boats', label: 'Party Boats' },
    ],
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Column 1: Company Info */}
        <div className={styles.column}>
          <h3 className={styles.title}>{APP_NAME}</h3>
          <p className={styles.description}>
            Your trusted partner for ferry and boat rental services in Mumbai.
            Safe, reliable, and affordable transportation solutions.
          </p>
          <div className={styles.socialIcons}>
            <a href="#" className={styles.socialIconButton} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <InstagramIcon />
            </a>
            <a href="#" className={styles.socialIconButton} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <FacebookIcon />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Quick Links</h4>
          <ul className={styles.linkList}>
            {footerLinks.company.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Services */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Services</h4>
          <ul className={styles.linkList}>
            {footerLinks.services.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Operating Hours */}
          <div className={styles.hoursSection}>
            <h4 className={styles.columnTitle}>Operating Hours</h4>
            <ul className={styles.hoursList}>
              <li className={styles.hoursItem}>
                <ClockIcon />
                <span>Daily: 8:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Column 4: Contact */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Contact Us</h4>
          <ul className={styles.contactList}>
            <li>
              <a href={`tel:${COMPANY_PHONE}`} className={styles.contactLink}>
                <PhoneIcon />
                <span>{COMPANY_PHONE}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${COMPANY_EMAIL}`} className={styles.contactLink}>
                <MailIcon />
                <span>{COMPANY_EMAIL}</span>
              </a>
            </li>
            <li className={styles.contactLink}>
              <MapPinIcon />
              <span>{COMPANY_ADDRESS}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottom}>
        <div className={styles.bottomContainer}>
          <p className={styles.copyright}>
            &copy; {currentYear} {APP_NAME}. All rights reserved.
          </p>
          <div className={styles.bottomSocial}>
            <a href="#" className={styles.bottomSocialLink} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <InstagramIcon />
            </a>
            <a href="#" className={styles.bottomSocialLink} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <FacebookIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
