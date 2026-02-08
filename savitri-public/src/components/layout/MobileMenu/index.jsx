'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { COMPANY_PHONE } from '@/utils/constants';
import styles from './MobileMenu.module.css';

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const MobileMenu = () => {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const { logout } = useAuth();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/speed-boats', label: 'Speed Boats' },
    { href: '/party-boats', label: 'Party Boats' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Close menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  if (!isMobileMenuOpen) return null;

  const handleLogout = async () => {
    await logout();
    closeMobileMenu();
  };

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={closeMobileMenu} />

      {/* Menu */}
      <div className={styles.menu}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Menu</h2>
          <button
            className={styles.closeButton}
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* User Info */}
        {isAuthenticated && user && (
          <div className={styles.userInfo}>
            {user.avatar ? (
              <img
                src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar}`}
                alt={user.name}
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatar}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userEmail}>{user.email}</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${isActive(link.href) ? styles.activeLink : ''}`}
            >
              {isActive(link.href) && <span className={styles.activeIndicator} />}
              {link.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              <div className={styles.divider} />
              <Link
                href="/account/profile"
                className={`${styles.navLink} ${isActive('/account/profile') ? styles.activeLink : ''}`}
              >
                {isActive('/account/profile') && <span className={styles.activeIndicator} />}
                My Account
              </Link>
              <Link
                href="/account/bookings"
                className={`${styles.navLink} ${isActive('/account/bookings') ? styles.activeLink : ''}`}
              >
                {isActive('/account/bookings') && <span className={styles.activeIndicator} />}
                My Bookings
              </Link>
              <div className={styles.divider} />
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <>
              <div className={styles.divider} />
              <Link href="/login" className={styles.navLink}>
                Login
              </Link>
              <Link href="/register" className={styles.navLink}>
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Social & Contact Footer */}
        <div className={styles.menuFooter}>
          <a href={`tel:${COMPANY_PHONE}`} className={styles.menuFooterPhone}>
            <PhoneIcon />
            <span>{COMPANY_PHONE}</span>
          </a>
          <div className={styles.menuFooterSocial}>
            <a href="#" className={styles.socialIconButton} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <InstagramIcon />
            </a>
            <a href="#" className={styles.socialIconButton} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <FacebookIcon />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
