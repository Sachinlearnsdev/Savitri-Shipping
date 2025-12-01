/**
 * My Reviews Page
 */

'use client';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';
import styles from './page.module.css';

export default function ReviewsPage() {
  // This will be implemented in Phase 2 with actual review functionality

  return (
    <div className={styles.reviewsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Reviews</h1>
        <p className={styles.description}>
          Reviews you've given for completed bookings
        </p>
      </div>

      {/* Empty State - Phase 1 */}
      <EmptyState
        icon={
          <svg viewBox="0 0 80 80" fill="none">
            <path
              d="M40 10L45 30L65 31L50 45L54 65L40 55L26 65L30 45L15 31L35 30L40 10Z"
              stroke="var(--color-gray-300)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        title="No reviews yet"
        description="Complete a booking to leave your first review and help other customers!"
        action={
          <Button onClick={() => (window.location.href = '/')}>
            Book a Service
          </Button>
        }
      />
    </div>
  );
}