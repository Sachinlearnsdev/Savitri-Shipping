/**
 * My Bookings Page
 */

'use client';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';
import styles from './page.module.css';

export default function BookingsPage() {
  // This will be implemented in Phase 2 with actual booking functionality

  return (
    <div className={styles.bookingsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Bookings</h1>
        <p className={styles.description}>View and manage your bookings</p>
      </div>

      {/* Tabs for filtering */}
      <div className={styles.tabs}>
        <button className={styles.tabActive}>All</button>
        <button className={styles.tab}>Speed Boats</button>
        <button className={styles.tab}>Party Boats</button>
        <button className={styles.tab}>Ferry</button>
      </div>

      {/* Empty State - Phase 1 */}
      <EmptyState
        icon={
          <svg viewBox="0 0 80 80" fill="none">
            <rect x="10" y="30" width="60" height="40" rx="4" stroke="var(--color-gray-300)" strokeWidth="2" />
            <path d="M20 35H60M20 45H60M20 55H60" stroke="var(--color-gray-300)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        }
        title="No bookings yet"
        description="You haven't made any bookings yet. Start exploring our services and book your first trip!"
        action={
          <Button onClick={() => (window.location.href = '/')}>
            Explore Services
          </Button>
        }
      />
    </div>
  );
}