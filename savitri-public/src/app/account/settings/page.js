/**
 * Account Settings Page
 */

'use client';
import { useState } from 'react';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import profileService from '@/services/profile.service';
import Checkbox from '@/components/common/Checkbox';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import styles from './page.module.css';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { success, error: showError } = useToast();

  const [notifications, setNotifications] = useState({
    emailNotifications: user?.emailNotifications ?? true,
    smsNotifications: user?.smsNotifications ?? true,
    promotionalEmails: user?.promotionalEmails ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleNotificationChange = (field) => (e) => {
    setNotifications({
      ...notifications,
      [field]: e.target.checked,
    });
  };

  const handleSaveNotifications = async () => {
    setLoading(true);

    const { data, error } = await profileService.updateNotificationPreferences(notifications);

    if (error) {
      showError('Failed to update preferences');
    } else {
      updateUser(data.user);
      success('Preferences updated successfully');
    }

    setLoading(false);
  };

  return (
    <div className={styles.settingsPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.description}>
          Manage your account preferences
        </p>
      </div>

      {/* Notification Preferences */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Notification Preferences</h2>
        <div className={styles.settingsForm}>
          <Checkbox
            label="Email Notifications"
            checked={notifications.emailNotifications}
            onChange={handleNotificationChange('emailNotifications')}
          />
          <p className={styles.checkboxHint}>
            Receive booking confirmations and important updates via email
          </p>

          <Checkbox
            label="SMS Notifications"
            checked={notifications.smsNotifications}
            onChange={handleNotificationChange('smsNotifications')}
          />
          <p className={styles.checkboxHint}>
            Receive booking reminders and updates via SMS
          </p>

          <Checkbox
            label="Promotional Emails"
            checked={notifications.promotionalEmails}
            onChange={handleNotificationChange('promotionalEmails')}
          />
          <p className={styles.checkboxHint}>
            Receive special offers and promotional content
          </p>

          <Button
            onClick={handleSaveNotifications}
            loading={loading}
            disabled={loading}
          >
            Save Preferences
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle} style={{ color: 'var(--color-error)' }}>
          Danger Zone
        </h2>
        <div className={styles.dangerZone}>
          <div>
            <h3 className={styles.dangerTitle}>Delete Account</h3>
            <p className={styles.dangerDescription}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

// Delete Account Modal
function DeleteAccountModal({ isOpen, onClose }) {
  const { logout } = useAuth();
  const { success, error: showError } = useToast();
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();

    if (!confirm('Are you absolutely sure? This action cannot be undone.')) {
      return;
    }

    setLoading(true);

    const { error } = await profileService.deleteAccount({
      password,
      reason,
    });

    if (error) {
      showError(error.message || 'Failed to delete account');
      setLoading(false);
    } else {
      success('Account deleted successfully');
      setTimeout(() => {
        logout();
      }, 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Account"
      size="md"
    >
      <form onSubmit={handleDelete}>
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <p style={{ color: 'var(--color-error)', marginBottom: 'var(--spacing-4)' }}>
            <strong>Warning:</strong> This action is permanent and cannot be undone.
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>
            All your data, including bookings and reviews, will be permanently deleted.
          </p>
        </div>

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password to confirm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Reason for Leaving (Optional)"
          type="text"
          placeholder="Help us improve"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-6)' }}>
          <Button
            type="submit"
            variant="danger"
            loading={loading}
            disabled={loading}
          >
            Delete My Account
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}