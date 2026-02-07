'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import styles from './MobileMenu.module.css';

const MobileMenu = () => {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const { logout } = useAuth();

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
            <div className={styles.avatar}>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userEmail}>{user.email}</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/speed-boats" className={styles.navLink}>
            Speed Boats
          </Link>
          <Link href="/party-boats" className={styles.navLink}>
            Party Boats
          </Link>
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
          <Link href="/contact" className={styles.navLink}>
            Contact
          </Link>

          {isAuthenticated ? (
            <>
              <div className={styles.divider} />
              <Link href="/account/profile" className={styles.navLink}>
                My Account
              </Link>
              <Link href="/account/bookings" className={styles.navLink}>
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
      </div>
    </>
  );
};

export default MobileMenu;