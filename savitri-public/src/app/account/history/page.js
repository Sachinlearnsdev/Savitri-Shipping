'use client';

import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { profileService } from '@/services/profile.service';
import { formatDateTime } from '@/utils/formatters';
import { getErrorMessage } from '@/utils/helpers';
import styles from './history.module.css';

export default function LoginHistoryPage() {
  const { showError } = useUIStore();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await profileService.getLoginHistory();
      setHistory(response.data || []);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading login history...</div>;
  }

  return (
    <div className={styles.historyPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Login History</h1>
        <p className={styles.subtitle}>
          View your recent login activity (last 10 attempts)
        </p>
      </div>

      {history.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyIcon}>📜</p>
          <p className={styles.emptyText}>No login history available</p>
        </div>
      ) : (
        <div className={styles.historyList}>
          {history.map((item) => (
            <div key={item.id} className={styles.historyCard}>
              <div className={styles.historyIcon}>
                {item.success ? '✅' : '❌'}
              </div>
              
              <div className={styles.historyInfo}>
                <h3 className={styles.historyStatus}>
                  {item.success ? 'Successful Login' : 'Failed Login Attempt'}
                </h3>
                <p className={styles.historyDetail}>
                  Device: {item.userAgent || 'Unknown'}
                </p>
                <p className={styles.historyDetail}>
                  IP: {item.ipAddress || 'Unknown'}
                </p>
                {item.location && (
                  <p className={styles.historyDetail}>
                    Location: {item.location}
                  </p>
                )}
                <p className={styles.historyTime}>
                  {formatDateTime(item.createdAt)}
                </p>
              </div>

              <div className={styles.historyBadge}>
                {item.success ? (
                  <span className={styles.successBadge}>Success</span>
                ) : (
                  <span className={styles.failedBadge}>Failed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}