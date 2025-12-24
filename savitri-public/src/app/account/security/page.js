'use client';

import React, { useState } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useUIStore } from '@/store/uiStore';
import { profileService } from '@/services/profile.service';
import { validatePassword } from '@/utils/validators';
import { getErrorMessage } from '@/utils/helpers';
import styles from './security.module.css';

export default function SecurityPage() {
  const { showSuccess, showError } = useUIStore();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      newErrors.newPassword = 'Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      await profileService.changePassword(formData);
      showSuccess('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.securityPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Security</h1>
        <p className={styles.subtitle}>Manage your password and security settings</p>
      </div>

      {/* Change Password */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Change Password</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={formData.currentPassword}
            onChange={(e) => handleChange('currentPassword', e.target.value)}
            error={errors.currentPassword}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={formData.newPassword}
            onChange={(e) => handleChange('newPassword', e.target.value)}
            error={errors.newPassword}
            hint="Min 8 characters with 1 uppercase, 1 number, 1 special character"
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            required
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            Change Password
          </Button>
        </form>
      </div>

      {/* Security Info */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Additional Security Options</h2>
        
        <div className={styles.infoList}>
          <div className={styles.infoItem}>
            <div className={styles.infoContent}>
              <h3 className={styles.infoTitle}>Update Email</h3>
              <p className={styles.infoText}>
                Change your email address (requires verification)
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoContent}>
              <h3 className={styles.infoTitle}>Update Phone</h3>
              <p className={styles.infoText}>
                Change your phone number (requires verification)
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>

          <div className={styles.infoItem}>
            <div className={styles.infoContent}>
              <h3 className={styles.infoTitle}>Two-Factor Authentication</h3>
              <p className={styles.infoText}>
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}