'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

export default function AccountLayout({ children }) {
  const pathname = usePathname();

  const sidebarLinks = [
    { href: '/account/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/account/profile', label: 'Profile', icon: '👤' },
    { href: '/account/security', label: 'Security', icon: '🔒' },
    { href: '/account/vehicles', label: 'My Vehicles', icon: '🚗' },
    { href: '/account/bookings', label: 'My Bookings', icon: '📋' },
    { href: '/account/reviews', label: 'My Reviews', icon: '⭐' },
    { href: '/account/settings', label: 'Settings', icon: '⚙️' },
    { href: '/account/sessions', label: 'Active Sessions', icon: '🔐' },
    { href: '/account/history', label: 'Login History', icon: '📜' },
  ];

  const isActive = (href) => {
    return pathname === href;
  };

  return (
    <div className={styles.accountLayout}>
      <div className={styles.container}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${
                  isActive(link.href) ? styles.active : ''
                }`}
              >
                <span className={styles.icon}>{link.icon}</span>
                <span className={styles.label}>{link.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}