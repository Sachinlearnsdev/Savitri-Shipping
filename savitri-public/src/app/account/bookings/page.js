'use client';

import React from 'react';
import styles from './bookings.module.css';

export default function BookingsPage() {
  return (
    <div className={styles.bookingsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Bookings</h1>
        <p className={styles.subtitle}>View and manage your bookings</p>
      </div>

      {/* Empty State - Phase 1 Placeholder */}
      <div className={styles.emptyState}>
        <p className={styles.emptyIcon}>📋</p>
        <p className={styles.emptyText}>No bookings yet</p>
        <p className={styles.emptySubtext}>
          Your booking history will appear here once you make your first booking
        </p>
      </div>
    </div>
  );
}