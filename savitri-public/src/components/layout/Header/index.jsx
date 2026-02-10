"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/layout/NotificationBell";
import styles from "./Header.module.css";

const HARDCODED_COUPONS = [
  "Use code WELCOME20 for 20% off your first booking!",
  "SUMMER10: Flat \u20B9500 off on all speed boat rides",
  "Book 3+ boats and get 10% off automatically",
  "PARTY15: 15% off on party boat bookings this month",
];

const Header = () => {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const { toggleMobileMenu } = useUIStore();
  const { logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/speed-boats", label: "Speed Boats" },
    { href: "/party-boats", label: "Party Boats" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  // Build marquee text from coupons
  const marqueeText = HARDCODED_COUPONS.join("   \u2022   ");

  return (
    <>
      {/* Top Bar - Coupon Marquee */}
      <div className={styles.topBar}>
        <div className={styles.marqueeWrapper}>
          <div className={styles.marqueeTrack}>
            <span className={styles.marqueeContent}>{marqueeText}</span>
            <span className={styles.marqueeContent}>{marqueeText}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>Savitri Shipping</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.nav}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${
                  isActive(link.href) ? styles.active : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className={styles.actions}>
            {isAuthenticated ? (
              <>
              <NotificationBell />
              <div className={styles.userMenuWrapper} ref={dropdownRef}>
                <button
                  className={styles.accountButton}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar}`}
                      alt={user?.name}
                      className={styles.avatarImage}
                    />
                  ) : (
                    <span className={styles.avatar}>
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                  <span className={styles.accountName}>{user?.name}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={`${styles.dropdownArrow} ${
                      isDropdownOpen ? styles.open : ""
                    }`}
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className={styles.dropdown}>
                    <Link
                      href="/account/profile"
                      className={styles.dropdownItem}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className={styles.dropdownIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      My Account
                    </Link>
                    <Link
                      href="/account/bookings"
                      className={styles.dropdownItem}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className={styles.dropdownIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14,2 14,8 20,8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10,9 9,9 8,9" />
                        </svg>
                      </span>
                      My Bookings
                    </Link>

                    <div className={styles.dropdownDivider}></div>

                    <button
                      className={`${styles.dropdownItem} ${styles.logoutItem}`}
                      onClick={handleLogout}
                    >
                      <span className={styles.dropdownIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                          <polyline points="16,17 21,12 16,7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                      </span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.loginButton}>
                  Login
                </Link>
                <Link href="/register" className={styles.registerButton}>
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12H21M3 6H21M3 18H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;
