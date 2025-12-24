'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Total Bookings', value: '0', icon: '📋', color: 'blue' },
    { label: 'Saved Vehicles', value: '0', icon: '🚗', color: 'green' },
    { label: 'Reviews Given', value: '0', icon: '⭐', color: 'yellow' },
    { label: 'Active Sessions', value: '1', icon: '🔐', color: 'purple' },
  ];

  const quickActions = [
    { label: 'Update Profile', href: '/account/profile', icon: '✏️' },
    { label: 'Add Vehicle', href: '/account/vehicles', icon: '➕' },
    { label: 'View Bookings', href: '/account/bookings', icon: '📋' },
    { label: 'Security Settings', href: '/account/security', icon: '🔒' },
  ];

  return (
    <div className={styles.dashboard}>
      {/* Welcome Section */}
      <div className={styles.welcome}>
        <h1 className={styles.title}>Welcome back, {user?.name}! 👋</h1>
        <p className={styles.subtitle}>
          Here's what's happening with your account
        </p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} className={`${styles.statCard} ${styles[stat.color]}`}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statContent}>
              <p className={styles.statValue}>{stat.value}</p>
              <p className={styles.statLabel}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={styles.actionCard}
            >
              <span className={styles.actionIcon}>{action.icon}</span>
              <span className={styles.actionLabel}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Account Status */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Account Status</h2>
        <div className={styles.statusCard}>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Email Verification:</span>
            <span className={`${styles.statusBadge} ${user?.emailVerified ? styles.verified : styles.pending}`}>
              {user?.emailVerified ? '✓ Verified' : '⏳ Pending'}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Phone Verification:</span>
            <span className={`${styles.statusBadge} ${user?.phoneVerified ? styles.verified : styles.pending}`}>
              {user?.phoneVerified ? '✓ Verified' : '⏳ Pending'}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Account Status:</span>
            <span className={`${styles.statusBadge} ${styles.active}`}>
              ✓ Active
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <div className={styles.emptyState}>
          <p className={styles.emptyIcon}>📊</p>
          <p className={styles.emptyText}>No recent activity</p>
          <p className={styles.emptySubtext}>
            Your bookings and activities will appear here
          </p>
        </div>
      </div>
    </div>
  );
}