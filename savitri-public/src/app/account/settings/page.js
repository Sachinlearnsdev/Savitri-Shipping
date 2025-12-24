'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import Button from '@/components/common/Button';
import Checkbox from '@/components/common/Checkbox';
import { profileService } from '@/services/profile.service';
import { getErrorMessage } from '@/utils/helpers';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuthStore();
  const { showSuccess, showError } = useUIStore();

  const [notifications, setNotifications] = useState({
    emailNotifications: user?.emailNotifications ?? true,
    smsNotifications: user?.smsNotifications ?? true,
    promotionalEmails: user?.promotionalEmails ?? false,
  });

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleNotificationChange = (field, value) => {
    setNotifications((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      await profileService.updateNotifications(notifications);
      updateUser(notifications);
      showSuccess('Notification preferences updated!');
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) return;

    const doubleConfirm = prompt(
      'Type "DELETE" to confirm account deletion:'
    );

    if (doubleConfirm !== 'DELETE') {
      showError('Account deletion cancelled');
      return;
    }

    try {
      setDeleteLoading(true);
      await profileService.deleteAccount();
      showSuccess('Account deleted successfully');
      logout();
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className={styles.settingsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your account preferences</p>
      </div>

      {/* Notification Preferences */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Notification Preferences</h2>

        <div className={styles.notificationList}>
          <Checkbox
            label="Email Notifications"
            checked={notifications.emailNotifications}
            onChange={(checked) =>
              handleNotificationChange('emailNotifications', checked)
            }
          />
          <p className={styles.checkboxHint}>
            Receive booking confirmations and updates via email
          </p>

          <Checkbox
            label="SMS Notifications"
            checked={notifications.smsNotifications}
            onChange={(checked) =>
              handleNotificationChange('smsNotifications', checked)
            }
          />
          <p className={styles.checkboxHint}>
            Receive booking reminders and updates via SMS
          </p>

          <Checkbox
            label="Promotional Emails"
            checked={notifications.promotionalEmails}
            onChange={(checked) =>
              handleNotificationChange('promotionalEmails', checked)
            }
          />
          <p className={styles.checkboxHint}>
            Receive special offers and promotional content
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleSaveNotifications}
          loading={loading}
        >
          Save Preferences
        </Button>
      </div>

      {/* Danger Zone */}
      <div className={`${styles.card} ${styles.dangerZone}`}>
        <h2 className={styles.cardTitle}>Danger Zone</h2>

        <div className={styles.dangerContent}>
          <div className={styles.dangerInfo}>
            <h3 className={styles.dangerTitle}>Delete Account</h3>
            <p className={styles.dangerText}>
              Once you delete your account, there is no going back. All your
              data including bookings, vehicles, and reviews will be permanently
              deleted.
            </p>
          </div>

          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            loading={deleteLoading}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}