'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import { useUIStore } from '@/store/uiStore';
import { profileService } from '@/services/profile.service';
import { formatDateTime } from '@/utils/formatters';
import { getErrorMessage } from '@/utils/helpers';
import styles from './sessions.module.css';

export default function SessionsPage() {
  const { showSuccess, showError } = useUIStore();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await profileService.getSessions();
      setSessions(response.data || []);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutSession = async (sessionId) => {
    if (!confirm('Are you sure you want to logout from this device?')) return;

    try {
      await profileService.deleteSession(sessionId);
      showSuccess('Logged out from device successfully');
      fetchSessions();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('Are you sure you want to logout from all devices?')) return;

    try {
      setLogoutAllLoading(true);
      await profileService.logoutAllDevices();
      showSuccess('Logged out from all devices successfully');
      // Will be redirected to login by auth middleware
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLogoutAllLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading sessions...</div>;
  }

  return (
    <div className={styles.sessionsPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Active Sessions</h1>
          <p className={styles.subtitle}>
            Manage devices where you're currently logged in
          </p>
        </div>
        {sessions.length > 1 && (
          <Button
            variant="danger"
            onClick={handleLogoutAll}
            loading={logoutAllLoading}
          >
            Logout All Devices
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyIcon}>🔐</p>
          <p className={styles.emptyText}>No active sessions</p>
        </div>
      ) : (
        <div className={styles.sessionsList}>
          {sessions.map((session) => (
            <div key={session.id} className={styles.sessionCard}>
              <div className={styles.sessionIcon}>💻</div>
              
              <div className={styles.sessionInfo}>
                <h3 className={styles.sessionDevice}>
                  {session.userAgent || 'Unknown Device'}
                </h3>
                <p className={styles.sessionDetail}>
                  IP: {session.ipAddress || 'Unknown'}
                </p>
                <p className={styles.sessionDetail}>
                  Last active: {formatDateTime(session.createdAt)}
                </p>
              </div>

              <div className={styles.sessionActions}>
                <span className={styles.currentBadge}>Current Session</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLogoutSession(session.id)}
                >
                  Logout
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}