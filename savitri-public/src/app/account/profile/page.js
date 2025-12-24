'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { profileService } from '@/services/profile.service';
import { validateName } from '@/utils/validators';
import { getErrorMessage } from '@/utils/helpers';
import styles from './profile.module.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { showSuccess, showError } = useUIStore();

  const [name, setName] = useState(user?.name || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNameChange = (value) => {
    setName(value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateName(name)) {
      setError('Please enter a valid name (at least 2 characters)');
      return;
    }

    try {
      setLoading(true);
      const response = await profileService.updateProfile({ name });
      updateUser({ name });
      showSuccess('Profile updated successfully!');
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.subtitle}>Manage your personal information</p>
      </div>

      {/* Profile Info Card */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Personal Information</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            error={error}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={user?.email || ''}
            disabled
            hint="To change email, go to Security settings"
          />

          <Input
            label="Phone Number"
            type="tel"
            value={user?.phone || 'Not provided'}
            disabled
            hint="To change phone, go to Security settings"
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={name === user?.name}
          >
            Save Changes
          </Button>
        </form>
      </div>

      {/* Account Info */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Account Information</h2>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Email Status:</span>
            <span className={`${styles.badge} ${user?.emailVerified ? styles.verified : styles.pending}`}>
              {user?.emailVerified ? '✓ Verified' : '⏳ Not Verified'}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Phone Status:</span>
            <span className={`${styles.badge} ${user?.phoneVerified ? styles.verified : styles.pending}`}>
              {user?.phoneVerified ? '✓ Verified' : '⏳ Not Verified'}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Account Status:</span>
            <span className={`${styles.badge} ${styles.active}`}>
              ✓ Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}