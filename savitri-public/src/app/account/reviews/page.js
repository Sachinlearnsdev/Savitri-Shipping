'use client';

import React from 'react';
import styles from './reviews.module.css';

export default function ReviewsPage() {
  return (
    <div className={styles.reviewsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Reviews</h1>
        <p className={styles.subtitle}>Your feedback helps us improve</p>
      </div>

      {/* Empty State - Phase 1 Placeholder */}
      <div className={styles.emptyState}>
        <p className={styles.emptyIcon}>⭐</p>
        <p className={styles.emptyText}>No reviews yet</p>
        <p className={styles.emptySubtext}>
          Reviews you write will appear here
        </p>
      </div>
    </div>
  );
}