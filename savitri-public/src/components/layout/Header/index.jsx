/**
 * Header Component - FIXED VERSION
 * src/components/layout/Header/index.jsx
 */

'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import useUIStore from '@/store/uiStore';
import styles from './Header.module.css';

const Header = () => {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const { toggleMobileMenu } = useUIStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/speed-boats', label: 'Speed Boats' },
    { href: '/party-boats', label: 'Party Boats' },
    { href: '/ferry', label: 'Ferry' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>⛵</span>
          <span className={styles.logoText}>Savitri Shipping</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <ul className={styles.navLinks}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`${styles.navLink} ${pathname === link.href ? styles.activeLink : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Auth Buttons */}
        <div className={styles.authButtons}>
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <button
                className={styles.userButton}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className={styles.avatar}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className={styles.userName}>{user?.name || 'User'}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {showUserMenu && (
                <div className={styles.userDropdown}>
                  <Link
                    href="/account"
                    className={styles.dropdownItem}
                    onClick={() => setShowUserMenu(false)}
                  >
                    👤 Profile
                  </Link>
                  <Link
                    href="/account/bookings"
                    className={styles.dropdownItem}
                    onClick={() => setShowUserMenu(false)}
                  >
                    📋 My Bookings
                  </Link>
                  <Link
                    href="/account/settings"
                    className={styles.dropdownItem}
                    onClick={() => setShowUserMenu(false)}
                  >
                    ⚙️ Settings
                  </Link>
                  <div className={styles.divider} />
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className={styles.loginBtn}>
                Login
              </Link>
              <Link href="/register" className={styles.signupBtn}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle - ONLY VISIBLE ON MOBILE */}
        <button
          className={styles.mobileMenuToggle}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6H21M3 12H21M3 18H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;