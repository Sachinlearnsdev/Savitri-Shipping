/**
 * Account Profile Page
 * FIXED: Proper email/phone update flows, password change with confirmPassword
 */

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import profileService from '@/services/profile.service';
import { validateName, validatePassword, validateConfirmPassword } from '@/utils/validators';
import { formatPhone } from '@/utils/formatters';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import styles from './page.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth({ requireAuth: true });
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    // Backend only accepts name update via PUT /profile
    const { data, error } = await profileService.updateProfile({
      name: formData.name,
    });

    if (error) {
      const errorMsg = error.message || error.error?.message || 'Failed to update profile';
      showError(errorMsg);
    } else {
      // Update user in store
      updateUser({ name: formData.name });
      success('Profile updated successfully');
    }

    setLoading(false);
  };

  const handleUpdateEmail = () => {
    router.push('/account/settings?tab=email');
  };

  const handleUpdatePhone = () => {
    router.push('/account/settings?tab=phone');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

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

          <div className={styles.fieldWithAction}>
            <Input
              label="Email"
              type="email"
              value={user.email}
              disabled
              hint={
                user.emailVerified 
                  ? '✓ Verified' 
                  : '⚠ Not verified'
              }
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUpdateEmail}
            >
              Change Email
            </Button>
          </div>

          <div className={styles.fieldWithAction}>
            <Input
              label="Phone Number"
              type="tel"
              value={formatPhone(user.phone, false)}
              disabled
              hint={
                user.phoneVerified 
                  ? '✓ Verified' 
                  : '⚠ Not verified'
              }
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUpdatePhone}
            >
              Change Phone
            </Button>
          </div>
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
              {user.emailVerified ? (
                <span className={styles.statusVerified}>✓ Verified</span>
              ) : (
                <span className={styles.statusUnverified}>Not Verified</span>
              )}
            </div>
          </div>
          <div className={styles.statusCard}>
            <div className={styles.statusLabel}>Phone Status</div>
            <div className={styles.statusValue}>
              {user.phoneVerified ? (
                <span className={styles.statusVerified}>✓ Verified</span>
              ) : (
                <span className={styles.statusUnverified}>Not Verified</span>
              )}
            </div>
          </div>
          <div className={styles.statusCard}>
            <div className={styles.statusLabel}>Member Since</div>
            <div className={styles.statusValue}>
              {new Date(user.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
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

  const validate = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.valid) {
      newErrors.newPassword = passwordValidation.message;
    }

    const confirmValidation = validateConfirmPassword(
      formData.newPassword, 
      formData.confirmPassword
    );
    if (!confirmValidation.valid) {
      newErrors.confirmPassword = confirmValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    // Backend expects: { currentPassword, newPassword, confirmPassword }
    const { data, error } = await profileService.changePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword, // FIXED: Added this
    });

    if (error) {
      const errorMsg = error.message || error.error?.message || 'Failed to change password';
      showError(errorMsg);
    } else {
      success('Password changed successfully');
      onClose();
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
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
          error={errors.currentPassword}
          required
        />
        <Input
          label="New Password"
          type="password"
          value={formData.newPassword}
          onChange={handleChange('newPassword')}
          error={errors.newPassword}
          hint="Min 8 characters, 1 uppercase, 1 number, 1 special character"
          required
        />
        <Input
          label="Confirm New Password"
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