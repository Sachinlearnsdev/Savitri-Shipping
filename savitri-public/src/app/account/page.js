/**
 * Account Profile Page
 */

'use client';
import { useState } from 'react';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import profileService from '@/services/profile.service';
import { validateName, validateEmail, validatePhone } from '@/utils/validators';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import styles from './page.module.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    const nameValidation = validateName(formData.name);
    if (!nameValidation.valid) {
      newErrors.name = nameValidation.message;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message;
    }

    if (formData.phone) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.valid) {
        newErrors.phone = phoneValidation.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    const { data, error } = await profileService.updateProfile({
      name: formData.name,
    });

    if (error) {
      showError(error.message || 'Failed to update profile');
    } else {
      updateUser(data.user);
      success('Profile updated successfully');
    }

    setLoading(false);
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Profile</h1>
        <p className={styles.description}>Manage your account information</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Personal Information</h2>

          <Input
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={handleChange('name')}
            error={errors.name}
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            error={errors.email}
            disabled
            hint="Contact support to change your email"
          />

          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={handleChange('phone')}
            error={errors.phone}
            disabled
            hint="Contact support to change your phone"
          />
        </div>

        <div className={styles.actions}>
          <Button type="submit" loading={loading} disabled={loading}>
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPasswordModal(true)}
          >
            Change Password
          </Button>
        </div>
      </form>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Account Status</h2>
        <div className={styles.statusGrid}>
          <div className={styles.statusCard}>
            <div className={styles.statusLabel}>Email Status</div>
            <div className={styles.statusValue}>
              {user?.emailVerified ? (
                <span className={styles.statusVerified}>✓ Verified</span>
              ) : (
                <span className={styles.statusUnverified}>Not Verified</span>
              )}
            </div>
          </div>
          <div className={styles.statusCard}>
            <div className={styles.statusLabel}>Phone Status</div>
            <div className={styles.statusValue}>
              {user?.phoneVerified ? (
                <span className={styles.statusVerified}>✓ Verified</span>
              ) : (
                <span className={styles.statusUnverified}>Not Verified</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}

// Change Password Modal Component
function ChangePasswordModal({ isOpen, onClose }) {
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);

    const { error } = await profileService.changePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });

    if (error) {
      showError(error.message || 'Failed to change password');
    } else {
      success('Password changed successfully');
      onClose();
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }

    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password">
      <form onSubmit={handleSubmit}>
        <Input
          label="Current Password"
          type="password"
          value={formData.currentPassword}
          onChange={handleChange('currentPassword')}
          required
        />
        <Input
          label="New Password"
          type="password"
          value={formData.newPassword}
          onChange={handleChange('newPassword')}
          error={errors.newPassword}
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          required
        />
        <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-6)' }}>
          <Button type="submit" loading={loading} disabled={loading}>
            Change Password
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}