/**
 * Account Layout
 * Protected layout with sidebar navigation
 */

'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileMenu from '@/components/layout/MobileMenu';
import Toast from '@/components/common/Toast';
import Loader from '@/components/common/Loader';
import styles from './layout.module.css';

export default function AccountLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return <Loader fullScreen text="Loading..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const menuItems = [
    {
      href: '/account',
      label: 'Profile',
      icon: (
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
      ),
    },
    {
      href: '/account/bookings',
      label: 'My Bookings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect width="20" height="20" rx="3" fill="currentColor" opacity="0.2" />
          <path
            d="M6 8H14M6 12H14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      href: '/account/vehicles',
      label: 'Saved Vehicles',
      icon: (
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
      ),
    },
    {
      href: '/account/reviews',
      label: 'My Reviews',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 2L12.09 7.26L18 8.27L14 12.14L15.18 18.02L10 15.27L4.82 18.02L6 12.14L2 8.27L7.91 7.26L10 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      href: '/account/settings',
      label: 'Settings',
      icon: (
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
      ),
    },
  ];

  return (
    <>
      <Header />
      <MobileMenu />
      <Toast />

      <div className={styles.accountLayout}>
        <div className="container">
          <div className={styles.layoutGrid}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.userCard}>
                <div className={styles.avatar}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user?.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className={styles.userInfo}>
                  <h3 className={styles.userName}>{user?.name}</h3>
                  <p className={styles.userEmail}>{user?.email}</p>
                </div>
              </div>

              <nav className={styles.nav}>
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      pathname === item.href
                        ? styles.navLinkActive
                        : styles.navLink
                    }
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.content}>{children}</main>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}