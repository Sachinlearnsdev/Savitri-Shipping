import React from 'react';
import Link from 'next/link';
import { APP_NAME, COMPANY_PHONE, COMPANY_EMAIL, COMPANY_ADDRESS } from '@/utils/constants';
import styles from './Footer.module.css';

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
        {/* Column 1: About */}
        <div className={styles.column}>
          <h3 className={styles.title}>{APP_NAME}</h3>
          <p className={styles.description}>
            Your trusted partner for ferry and boat rental services in Mumbai.
            Safe, reliable, and affordable transportation solutions.
          </p>
        </div>

        {/* Column 2: Company */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Company</h4>
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
        </div>

        {/* Column 4: Contact */}
        <div className={styles.column}>
          <h4 className={styles.columnTitle}>Contact Us</h4>
          <ul className={styles.contactList}>
            <li>
              <a href={`tel:${COMPANY_PHONE}`} className={styles.contactLink}>
                {COMPANY_PHONE}
              </a>
            </li>
            <li>
              <a href={`mailto:${COMPANY_EMAIL}`} className={styles.contactLink}>
                {COMPANY_EMAIL}
              </a>
            </li>
            <li className={styles.address}>{COMPANY_ADDRESS}</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottom}>
        <div className={styles.container}>
          <p className={styles.copyright}>
            © {currentYear} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;