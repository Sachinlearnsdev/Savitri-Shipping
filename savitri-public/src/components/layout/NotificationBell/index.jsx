'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { API_ENDPOINTS } from '@/utils/constants';
import styles from './NotificationBell.module.css';

const BellIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const NotificationBell = () => {
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const items = [];

      // Fetch inquiries with QUOTED status (customer hasn't responded)
      try {
        const inquiriesRes = await api.get(`${API_ENDPOINTS.INQUIRIES.MY_INQUIRIES}?limit=10`);
        if (inquiriesRes.success) {
          const allInquiries = inquiriesRes.data?.inquiries || inquiriesRes.data || [];
          const quotedInquiries = allInquiries.filter((inq) => inq.status === 'QUOTED');
          quotedInquiries.forEach((inq) => {
            items.push({
              id: `inq-${inq.id}`,
              type: 'inquiry_quoted',
              title: `Your inquiry ${inq.inquiryNumber} has been quoted`,
              subtitle: inq.quotedAmount
                ? `Quoted amount: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(inq.quotedAmount)}`
                : 'A quote has been sent for your inquiry',
              date: inq.quotedAt || inq.updatedAt,
              link: '/account/bookings',
            });
          });
        }
      } catch (err) {
        // Silently fail - don't break the notification bell
      }

      // Fetch recent bookings for status updates
      try {
        const bookingsRes = await api.get(`${API_ENDPOINTS.BOOKINGS.MY_BOOKINGS}?limit=10`);
        if (bookingsRes.success) {
          const allBookings = bookingsRes.data?.bookings || bookingsRes.data || [];

          // Check for recently confirmed bookings (confirmed within last 7 days)
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          allBookings.forEach((booking) => {
            const updatedDate = new Date(booking.updatedAt);

            if (booking.status === 'CONFIRMED' && updatedDate > sevenDaysAgo) {
              items.push({
                id: `bk-confirmed-${booking.id}`,
                type: 'booking_confirmed',
                title: `Your booking ${booking.bookingNumber} has been confirmed`,
                subtitle: booking.bookingType === 'PARTY_BOAT' ? 'Party Boat booking' : 'Speed Boat booking',
                date: booking.updatedAt,
                link: '/account/bookings',
              });
            }

            // Bookings happening tomorrow
            const bookingDate = new Date(booking.date);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const dayAfter = new Date(tomorrow);
            dayAfter.setDate(dayAfter.getDate() + 1);

            if (
              bookingDate >= tomorrow &&
              bookingDate < dayAfter &&
              (booking.status === 'CONFIRMED' || booking.status === 'PENDING')
            ) {
              items.push({
                id: `bk-reminder-${booking.id}`,
                type: 'booking_reminder',
                title: `Reminder: Your booking ${booking.bookingNumber} is tomorrow`,
                subtitle: booking.bookingType === 'PARTY_BOAT' ? 'Party Boat booking' : 'Speed Boat booking',
                date: new Date().toISOString(),
                link: '/account/bookings',
              });
            }
          });
        }
      } catch (err) {
        // Silently fail
      }

      // Sort by date, most recent first
      items.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Limit to 10 notifications
      const limited = items.slice(0, 10);
      setNotifications(limited);
      setUnreadCount(limited.length);
    } catch (err) {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch on mount and every 5 minutes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isAuthenticated) return null;

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'inquiry_quoted':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );
      case 'booking_confirmed':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        );
      case 'booking_reminder':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        );
      default:
        return <BellIcon size={16} />;
    }
  };

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <button
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} new)` : ''}`}
      >
        <BellIcon size={20} />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h4 className={styles.dropdownTitle}>Notifications</h4>
            {unreadCount > 0 && (
              <span className={styles.dropdownCount}>{unreadCount} new</span>
            )}
          </div>

          <div className={styles.dropdownBody}>
            {loading && notifications.length === 0 && (
              <div className={styles.emptyState}>Loading...</div>
            )}

            {!loading && notifications.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <BellIcon size={24} />
                </div>
                <p>No notifications</p>
              </div>
            )}

            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.link}
                className={styles.notificationItem}
                onClick={() => setIsOpen(false)}
              >
                <div className={`${styles.notificationIcon} ${styles[`icon_${notification.type}`]}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className={styles.notificationContent}>
                  <div className={styles.notificationTitle}>{notification.title}</div>
                  <div className={styles.notificationSubtitle}>{notification.subtitle}</div>
                  <div className={styles.notificationTime}>{formatTimeAgo(notification.date)}</div>
                </div>
              </Link>
            ))}
          </div>

          {notifications.length > 0 && (
            <div className={styles.dropdownFooter}>
              <Link
                href="/account/bookings"
                className={styles.viewAllLink}
                onClick={() => setIsOpen(false)}
              >
                View All Bookings & Inquiries
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
