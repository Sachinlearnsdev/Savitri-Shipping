/**
 * Header Component
 * Main navigation header
 */

'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import useUIStore from '@/store/uiStore';
import { NAVIGATION_MENU, COMPANY } from '@/utils/constants';
import Button from '@/components/common/Button';
import styles from './Header.module.css';

const Header = () => {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const { toggleMobileMenu } = useUIStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Simple boat icon */}
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
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
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

        {/* Actions */}
        <div className={styles.actions}>
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <button
                className={styles.userButton}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className={styles.avatar}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user?.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className={styles.userName}>{user?.name}</span>
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
                <>
                  <div
                    className={styles.backdrop}
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className={styles.userDropdown}>
                    <Link
                      href="/account"
                      className={styles.dropdownItem}
                      onClick={() => setShowUserMenu(false)}
                    >
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
                    <Link
                      href="/account/bookings"
                      className={styles.dropdownItem}
                      onClick={() => setShowUserMenu(false)}
                    >
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
                    <Link
                      href="/account/settings"
                      className={styles.dropdownItem}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M16 10C16 10 16 8 14 6C12 4 10 4 10 4C10 4 8 4 6 6C4 8 4 10 4 10C4 10 4 12 6 14C8 16 10 16 10 16C10 16 12 16 14 14C16 12 16 10 16 10Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      Settings
                    </Link>
                    <div className={styles.dropdownDivider} />
                    <button
                      className={styles.dropdownItem}
                      onClick={handleLogout}
                    >
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
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className={styles.loginLink}>
                Login
              </Link>
              <Button size="sm" onClick={() => (window.location.href = '/register')}>
                Sign Up
              </Button>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
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
      </div>
    </header>
  );
};

export default Header;