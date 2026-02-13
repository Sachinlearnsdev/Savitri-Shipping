import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useNotificationStore from '../../../store/notificationStore';
import { getSocket } from '../../../utils/socket';
import styles from './NotificationBell.module.css';

/**
 * Format a timestamp into a human-readable "time ago" string
 */
const timeAgo = (date) => {
  const now = Date.now();
  const diffMs = now - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
};

/**
 * Notification type configurations
 */
const NOTIFICATION_CONFIG = {
  'new-booking': {
    iconColor: 'green',
    getTitle: (data) => 'New Booking',
    getDesc: (data) => {
      const typeLabel = data.type === 'party-boat' ? 'Party boat' : 'Speed boat';
      return `${typeLabel} booking ${data.bookingNumber} by ${data.customerName}`;
    },
    getRoute: (data) => data.type === 'party-boat' ? '/party-bookings' : '/bookings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  'booking-cancelled': {
    iconColor: 'red',
    getTitle: (data) => 'Booking Cancelled',
    getDesc: (data) => {
      const typeLabel = data.type === 'party-boat' ? 'Party boat' : 'Speed boat';
      return `${typeLabel} booking ${data.bookingNumber} cancelled by ${data.customerName}`;
    },
    getRoute: (data) => data.type === 'party-boat' ? '/party-bookings' : '/bookings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  'payment-received': {
    iconColor: 'blue',
    getTitle: (data) => 'Payment Received',
    getDesc: (data) => {
      const mode = data.paymentMode === 'ONLINE' ? 'online' : 'at venue';
      return `Booking ${data.bookingNumber} - Payment received (${mode})`;
    },
    getRoute: (data) => data.type === 'party-boat' ? '/party-bookings' : '/bookings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  'new-review': {
    iconColor: 'yellow',
    getTitle: (data) => 'New Review',
    getDesc: (data) => {
      return `${data.customerName} left a ${data.rating}-star review for ${data.boatName}`;
    },
    getRoute: () => '/reviews/company',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  'booking-modified': {
    iconColor: 'orange',
    getTitle: (data) => 'Booking Modified',
    getDesc: (data) => {
      return `Booking ${data.bookingNumber} date/time has been modified`;
    },
    getRoute: (data) => data.type === 'party-boat' ? '/party-bookings' : '/bookings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
};

const MAX_NOTIFICATIONS = 20;

const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const fetchCounts = useNotificationStore((s) => s.fetchCounts);
  const polledCounts = useNotificationStore((s) => s.counts);

  /**
   * Add a new real-time notification
   */
  const addNotification = useCallback((event, data) => {
    const config = NOTIFICATION_CONFIG[event];
    if (!config) return;

    const notification = {
      id: `${event}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      event,
      data,
      title: config.getTitle(data),
      description: config.getDesc(data),
      route: config.getRoute(data),
      iconColor: config.iconColor,
      icon: config.icon,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => {
      const updated = [notification, ...prev];
      return updated.slice(0, MAX_NOTIFICATIONS);
    });

    setUnreadCount((prev) => prev + 1);
    fetchCounts();
  }, [fetchCounts]);

  /**
   * Listen for Socket.io events with retry for socket availability
   */
  useEffect(() => {
    const events = Object.keys(NOTIFICATION_CONFIG);
    let handlers = {};
    let currentSocket = null;
    let retryTimer = null;

    const attachListeners = () => {
      const socket = getSocket();
      if (!socket) {
        console.log('[NotificationBell] Socket not ready, retrying in 1s...');
        retryTimer = setTimeout(attachListeners, 1000);
        return;
      }

      console.log('[NotificationBell] Socket found, attaching event listeners');
      currentSocket = socket;
      events.forEach((event) => {
        handlers[event] = (data) => {
          console.log(`[NotificationBell] Received event: ${event}`, data);
          addNotification(event, data);
        };
        socket.on(event, handlers[event]);
      });

      // Re-attach listeners if socket reconnects
      socket.on('connect', () => {
        // Listeners persist across reconnects in socket.io, no action needed
      });
    };

    attachListeners();

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      if (currentSocket) {
        events.forEach((event) => {
          if (handlers[event]) {
            currentSocket.off(event, handlers[event]);
          }
        });
      }
    };
  }, [addNotification]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /**
   * Mark all notifications as read
   */
  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  /**
   * Clear all notifications
   */
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  /**
   * Handle clicking a notification
   */
  const handleNotifClick = (notification) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );

    if (!notification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    if (notification.route) {
      navigate(notification.route);
    }

    setIsOpen(false);
  };

  // Total badge count: real-time unread + polled pending counts
  const totalBadge = unreadCount + (polledCounts.total || 0);

  return (
    <>
      <button
        className={styles.bellButton}
        aria-label="Notifications"
        onClick={() => setIsOpen(true)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {totalBadge > 0 && (
          <span className={styles.badge}>
            {totalBadge > 99 ? '99+' : totalBadge}
          </span>
        )}
      </button>

      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sliding Panel */}
      <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}>
        {/* Panel Header */}
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Notifications</span>
          <div className={styles.panelHeaderActions}>
            {unreadCount > 0 && (
              <button className={styles.markAllRead} onClick={markAllRead}>
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button className={styles.clearAll} onClick={clearAll}>
                Clear all
              </button>
            )}
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Panel Body */}
        <div className={styles.panelBody}>
          {/* Real-time notifications */}
          {notifications.length > 0 && notifications.map((notif) => (
            <button
              key={notif.id}
              className={`${styles.notifItem} ${!notif.read ? styles.unread : ''}`}
              onClick={() => handleNotifClick(notif)}
            >
              <div className={`${styles.notifIcon} ${styles[notif.iconColor]}`}>
                {notif.icon}
              </div>
              <div className={styles.notifContent}>
                <p className={styles.notifTitle}>{notif.title}</p>
                <p className={styles.notifDesc}>{notif.description}</p>
                <span className={styles.notifTime}>{timeAgo(notif.timestamp)}</span>
              </div>
            </button>
          ))}

          {/* Polled pending counts as clickable items when no real-time notifications */}
          {notifications.length === 0 && polledCounts.total > 0 && (
            <>
              {polledCounts.pendingBookings > 0 && (
                <button
                  className={styles.notifItem}
                  onClick={() => { navigate('/bookings'); setIsOpen(false); }}
                >
                  <div className={`${styles.notifIcon} ${styles.green}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div className={styles.notifContent}>
                    <p className={styles.notifTitle}>Pending Speed Boat Bookings</p>
                    <p className={styles.notifDesc}>
                      {polledCounts.pendingBookings} booking{polledCounts.pendingBookings !== 1 ? 's' : ''} awaiting action
                    </p>
                  </div>
                </button>
              )}
              {polledCounts.pendingPartyBookings > 0 && (
                <button
                  className={styles.notifItem}
                  onClick={() => { navigate('/party-bookings'); setIsOpen(false); }}
                >
                  <div className={`${styles.notifIcon} ${styles.green}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div className={styles.notifContent}>
                    <p className={styles.notifTitle}>Pending Party Boat Bookings</p>
                    <p className={styles.notifDesc}>
                      {polledCounts.pendingPartyBookings} booking{polledCounts.pendingPartyBookings !== 1 ? 's' : ''} awaiting action
                    </p>
                  </div>
                </button>
              )}
              {polledCounts.pendingReviews > 0 && (
                <button
                  className={styles.notifItem}
                  onClick={() => { navigate('/reviews/company'); setIsOpen(false); }}
                >
                  <div className={`${styles.notifIcon} ${styles.yellow}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <div className={styles.notifContent}>
                    <p className={styles.notifTitle}>Unapproved Reviews</p>
                    <p className={styles.notifDesc}>
                      {polledCounts.pendingReviews} review{polledCounts.pendingReviews !== 1 ? 's' : ''} pending approval
                    </p>
                  </div>
                </button>
              )}
            </>
          )}

          {/* Empty state */}
          {notifications.length === 0 && polledCounts.total === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <p className={styles.emptyTitle}>No notifications</p>
              <p className={styles.emptyText}>You are all caught up. New notifications will appear here.</p>
            </div>
          )}
        </div>

        {/* Panel Footer */}
        {(notifications.length > 0 || polledCounts.total > 0) && (
          <div className={styles.panelFooter}>
            <button
              className={styles.viewAllLink}
              onClick={() => { navigate('/bookings'); setIsOpen(false); }}
            >
              View all bookings
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationBell;
