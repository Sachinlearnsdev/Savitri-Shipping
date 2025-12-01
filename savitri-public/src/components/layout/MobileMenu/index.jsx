/**
 * MobileMenu Component
 * Mobile navigation menu
 */

'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import useUIStore from '@/store/uiStore';
import { NAVIGATION_MENU } from '@/utils/constants';
import Button from '@/components/common/Button';
import styles from './MobileMenu.module.css';

const MobileMenu = () => {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();

  // Close menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

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

  const handleLogout = async () => {
    await logout();
    closeMobileMenu();
  };

  if (!isMobileMenuOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={closeMobileMenu} />

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
              />
            </svg>
          </button>
        </div>

        {/* User Section */}
        {isAuthenticated && (
          <div className={styles.userSection}>
            <div className={styles.avatar}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user?.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user?.name}</p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className={styles.nav}>
          {NAVIGATION_MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? styles.navLinkActive : styles.navLink}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Account Links (if authenticated) */}
        {isAuthenticated && (
          <>
            <div className={styles.divider} />
            <nav className={styles.nav}>
              <Link href="/account" className={styles.navLink}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z"
                    fill="currentColor"
                  />
                  <path
                    d="M10 12C4.47715 12 0 14.4772 0 17.5V20H20V17.5C20 14.4772 15.5228 12 10 12Z"
                    fill="currentColor"
                  />
                </svg>
                Profile
              </Link>
              <Link href="/account/bookings" className={styles.navLink}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect width="20" height="20" rx="3" fill="currentColor" opacity="0.2" />
                  <path
                    d="M6 8H14M6 12H14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                My Bookings
              </Link>
              <Link href="/account/vehicles" className={styles.navLink}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3 7L5 5H15L17 7V15H3V7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="6" cy="15" r="2" stroke="currentColor" strokeWidth="2" />
                  <circle cx="14" cy="15" r="2" stroke="currentColor" strokeWidth="2" />
                </svg>
                Saved Vehicles
              </Link>
              <Link href="/account/settings" className={styles.navLink}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                Settings
              </Link>
            </nav>
          </>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          {isAuthenticated ? (
            <Button variant="outline" fullWidth onClick={handleLogout}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7 3H4C2.89543 3 2 3.89543 2 5V15C2 16.1046 2.89543 17 4 17H7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M13 6L18 10L13 14M18 10H7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Logout
            </Button>
          ) : (
            <>
              <Button variant="outline" fullWidth onClick={() => (window.location.href = '/login')}>
                Login
              </Button>
              <Button fullWidth onClick={() => (window.location.href = '/register')}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileMenu;