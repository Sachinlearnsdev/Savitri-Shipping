'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Modal from '@/components/common/Modal';
import { profileService } from '@/services/profile.service';
import { validateName, validatePassword, validateEmail } from '@/utils/validators';
import { getErrorMessage, getInitials } from '@/utils/helpers';
import styles from './profile.module.css';

// Gender options for select
const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

// Indian states for address
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
].map((s) => ({ value: s, label: s }));

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { showSuccess, showError } = useUIStore();

  // Page-level loading
  const [pageLoading, setPageLoading] = useState(true);

  // Profile data from API
  const [profile, setProfile] = useState(null);

  // Avatar file input ref
  const avatarInputRef = useRef(null);

  // Personal Information form state
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
  });
  const [personalErrors, setPersonalErrors] = useState({});
  const [personalLoading, setPersonalLoading] = useState(false);

  // Address form state
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [addressLoading, setAddressLoading] = useState(false);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    promotionalEmails: true,
  });
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Change password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Avatar state
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Email verification state
  const [emailVerifyModal, setEmailVerifyModal] = useState(false);
  const [emailVerifyStep, setEmailVerifyStep] = useState('email'); // 'email' or 'otp'
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyOtp, setVerifyOtp] = useState('');
  const [emailVerifyLoading, setEmailVerifyLoading] = useState(false);
  const [emailVerifyError, setEmailVerifyError] = useState('');

  // Phone verification state (commented out - enable when SMS is configured)
  // const [phoneVerifyModal, setPhoneVerifyModal] = useState(false);
  // const [phoneVerifyStep, setPhoneVerifyStep] = useState('phone'); // 'phone' or 'otp'
  // const [verifyPhone, setVerifyPhone] = useState('');
  // const [phoneVerifyOtp, setPhoneVerifyOtp] = useState('');
  // const [phoneVerifyLoading, setPhoneVerifyLoading] = useState(false);
  // const [phoneVerifyError, setPhoneVerifyError] = useState('');

  /**
   * Fetch profile data on mount
   */
  const fetchProfile = useCallback(async () => {
    try {
      setPageLoading(true);
      const response = await profileService.getProfile();
      const data = response.data;
      setProfile(data);

      // Populate personal info
      setPersonalInfo({
        name: data.name || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        gender: data.gender || '',
      });

      // Populate address
      setAddress({
        line1: data.address?.line1 || '',
        line2: data.address?.line2 || '',
        city: data.address?.city || '',
        state: data.address?.state || '',
        pincode: data.address?.pincode || '',
        country: data.address?.country || 'India',
      });

      // Populate notification preferences
      setNotifications({
        emailNotifications: data.emailNotifications ?? true,
        smsNotifications: data.smsNotifications ?? true,
        promotionalEmails: data.promotionalEmails ?? true,
      });
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setPageLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /**
   * Format date for display (e.g., "Feb 2026")
   */
  const formatMemberSince = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
  };

  /**
   * Format full date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  /**
   * Format account ID as short form
   */
  const formatAccountId = (id) => {
    if (!id) return 'N/A';
    return `#${id.slice(-8).toUpperCase()}`;
  };

  /**
   * Handle avatar upload
   */
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      showError('Please select a valid image file (JPG, PNG)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showError('File size must be less than 5 MB');
      return;
    }

    try {
      setAvatarLoading(true);
      const response = await profileService.uploadAvatar(file);
      const updatedAvatar = response.data?.avatar;
      setProfile((prev) => ({ ...prev, avatar: updatedAvatar }));
      updateUser({ avatar: updatedAvatar });
      showSuccess('Profile photo updated successfully!');
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setAvatarLoading(false);
      // Reset file input so same file can be re-selected
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  /**
   * Handle personal information save
   */
  const handlePersonalInfoSave = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!validateName(personalInfo.name)) {
      errors.name = 'Please enter a valid name (at least 2 characters)';
    }

    if (personalInfo.dateOfBirth) {
      const dob = new Date(personalInfo.dateOfBirth);
      const today = new Date();
      if (dob > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    if (Object.keys(errors).length > 0) {
      setPersonalErrors(errors);
      return;
    }

    try {
      setPersonalLoading(true);
      setPersonalErrors({});

      const updateData = {
        name: personalInfo.name,
      };
      if (personalInfo.dateOfBirth) {
        updateData.dateOfBirth = personalInfo.dateOfBirth;
      }
      if (personalInfo.gender) {
        updateData.gender = personalInfo.gender;
      }

      const response = await profileService.updateProfile(updateData);
      updateUser({ name: personalInfo.name });
      setProfile((prev) => ({ ...prev, ...response.data }));
      showSuccess('Personal information updated successfully!');
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setPersonalLoading(false);
    }
  };

  /**
   * Handle address save
   */
  const handleAddressSave = async (e) => {
    e.preventDefault();
    const errors = {};

    if (address.pincode && !/^\d{6}$/.test(address.pincode)) {
      errors.pincode = 'Pincode must be 6 digits';
    }

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    try {
      setAddressLoading(true);
      setAddressErrors({});

      const response = await profileService.updateProfile({ address });
      setProfile((prev) => ({ ...prev, address: response.data?.address || address }));
      showSuccess('Address updated successfully!');
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setAddressLoading(false);
    }
  };

  /**
   * Handle notification preferences save
   */
  const handleNotificationsSave = async () => {
    try {
      setNotificationsLoading(true);
      await profileService.updateNotifications(notifications);
      showSuccess('Notification preferences updated successfully!');
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setNotificationsLoading(false);
    }
  };

  /**
   * Handle password change
   */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    const passwordValidation = validatePassword(passwordForm.newPassword);
    if (!passwordValidation.isValid) {
      errors.newPassword =
        'Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordErrors({});
      await profileService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showSuccess('Password changed successfully!');
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setPasswordLoading(false);
    }
  };

  /**
   * Toggle notification preference
   */
  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /**
   * Open email verification modal
   */
  const openEmailVerification = () => {
    setVerifyEmail(profile?.email || '');
    setVerifyOtp('');
    setEmailVerifyStep('email');
    setEmailVerifyError('');
    setEmailVerifyModal(true);
  };

  /**
   * Handle email verification step 1: Send OTP
   */
  const handleEmailVerifySendOtp = async () => {
    if (!validateEmail(verifyEmail)) {
      setEmailVerifyError('Please enter a valid email address');
      return;
    }

    try {
      setEmailVerifyLoading(true);
      setEmailVerifyError('');
      await profileService.updateEmail(verifyEmail);
      setEmailVerifyStep('otp');
      showSuccess('Verification code sent to your email!');
    } catch (error) {
      setEmailVerifyError(getErrorMessage(error));
    } finally {
      setEmailVerifyLoading(false);
    }
  };

  /**
   * Handle email verification step 2: Verify OTP
   */
  const handleEmailVerifyOtp = async () => {
    if (!verifyOtp || verifyOtp.length !== 6) {
      setEmailVerifyError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setEmailVerifyLoading(true);
      setEmailVerifyError('');
      await profileService.verifyEmailChange(verifyEmail, verifyOtp);
      setProfile((prev) => ({ ...prev, email: verifyEmail, emailVerified: true }));
      updateUser({ email: verifyEmail, emailVerified: true });
      setEmailVerifyModal(false);
      showSuccess('Email verified successfully!');
    } catch (error) {
      setEmailVerifyError(getErrorMessage(error));
    } finally {
      setEmailVerifyLoading(false);
    }
  };

  // TODO: Enable when SMS is configured
  // const openPhoneVerification = () => {
  //   setVerifyPhone(profile?.phone || '');
  //   setPhoneVerifyOtp('');
  //   setPhoneVerifyStep('phone');
  //   setPhoneVerifyError('');
  //   setPhoneVerifyModal(true);
  // };
  //
  // const handlePhoneVerifySendOtp = async () => {
  //   const cleaned = verifyPhone.replace(/\D/g, '');
  //   if (!/^[6-9]\d{9}$/.test(cleaned)) {
  //     setPhoneVerifyError('Please enter a valid 10-digit Indian phone number');
  //     return;
  //   }
  //   try {
  //     setPhoneVerifyLoading(true);
  //     setPhoneVerifyError('');
  //     await profileService.updatePhone(cleaned);
  //     setPhoneVerifyStep('otp');
  //     showSuccess('Verification code sent to your phone!');
  //   } catch (error) {
  //     setPhoneVerifyError(getErrorMessage(error));
  //   } finally {
  //     setPhoneVerifyLoading(false);
  //   }
  // };
  //
  // const handlePhoneVerifyOtp = async () => {
  //   if (!phoneVerifyOtp || phoneVerifyOtp.length !== 6) {
  //     setPhoneVerifyError('Please enter a valid 6-digit OTP');
  //     return;
  //   }
  //   try {
  //     setPhoneVerifyLoading(true);
  //     setPhoneVerifyError('');
  //     const cleaned = verifyPhone.replace(/\D/g, '');
  //     await profileService.verifyPhoneChange(cleaned, phoneVerifyOtp);
  //     setProfile((prev) => ({ ...prev, phone: cleaned, phoneVerified: true }));
  //     updateUser({ phone: cleaned, phoneVerified: true });
  //     setPhoneVerifyModal(false);
  //     showSuccess('Phone number verified successfully!');
  //   } catch (error) {
  //     setPhoneVerifyError(getErrorMessage(error));
  //   } finally {
  //     setPhoneVerifyLoading(false);
  //   }
  // };

  /**
   * Handle avatar removal
   */
  const handleAvatarRemove = async () => {
    try {
      setAvatarLoading(true);
      await profileService.removeAvatar();
      setProfile((prev) => ({ ...prev, avatar: null }));
      updateUser({ avatar: null });
      showSuccess('Profile photo removed successfully!');
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setAvatarLoading(false);
    }
  };

  // Loading state
  if (pageLoading) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Cloudinary URLs are absolute; legacy /uploads/ paths need backend prefix
  const avatarUrl = profile?.avatar
    ? profile.avatar.startsWith('http')
      ? profile.avatar
      : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${profile.avatar}`
    : null;

  return (
    <div className={styles.profilePage}>
      {/* Page Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>My Profile</h1>
        <p className={styles.subtitle}>Manage your personal information and account settings</p>
      </div>

      {/* Section 1: Profile Header Card */}
      <div className={styles.card}>
        <div className={styles.profileHeader}>
          {/* Avatar */}
          <div className={styles.avatarWrapper}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={profile?.name} className={styles.avatarImage} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {getInitials(profile?.name)}
              </div>
            )}
            <label
              className={`${styles.avatarUploadBtn} ${avatarLoading ? styles.avatarUploading : ''}`}
              title="Change photo"
            >
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleAvatarUpload}
                className={styles.avatarInput}
                disabled={avatarLoading}
              />
              {avatarLoading ? (
                <span className={styles.avatarSpinner} />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </label>
            {avatarUrl && !avatarLoading && (
              <button
                type="button"
                className={styles.avatarRemoveBtn}
                title="Remove photo"
                onClick={handleAvatarRemove}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{profile?.name || 'User'}</h2>
            <span className={styles.accountId}>Account {formatAccountId(profile?.id)}</span>
            <span className={styles.memberSince}>
              Member since {formatMemberSince(profile?.createdAt)}
            </span>

            {/* Contact with verification badges */}
            <div className={styles.contactBadges}>
              {/* Email row */}
              <div className={styles.contactRow}>
                <svg className={styles.contactIcon} width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M3 5H17V15H3V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 5L10 11L17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className={styles.contactText}>{profile?.email || 'No email'}</span>
                {profile?.emailVerified ? (
                  <span className={styles.verifiedBadge} title="Email verified">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                ) : (
                  <>
                    <span className={styles.unverifiedBadge} title="Email not verified">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <path d="M7 4V7.5M7 10H7.005" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <button
                      type="button"
                      className={styles.verifyBtn}
                      onClick={openEmailVerification}
                    >
                      Verify
                    </button>
                  </>
                )}
              </div>

              {/* Phone row */}
              <div className={styles.contactRow}>
                <svg className={styles.contactIcon} width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M14 2H6C5.44772 2 5 2.44772 5 3V17C5 17.5523 5.44772 18 6 18H14C14.5523 18 15 17.5523 15 17V3C15 2.44772 14.5523 2 14 2Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 15H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className={styles.contactText}>
                  {profile?.phone ? `+91 ${profile.phone}` : 'No phone'}
                </span>
                {profile?.phoneVerified ? (
                  <span className={styles.verifiedBadge} title="Phone verified">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                ) : (
                  <>
                    <span className={styles.unverifiedBadge} title="Phone not verified">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <path d="M7 4V7.5M7 10H7.005" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </span>
                    {/* TODO: Enable when SMS is configured */}
                    <button
                      type="button"
                      className={styles.verifyBtnDisabled}
                      disabled
                      title="Coming soon"
                    >
                      Verify
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Personal Information */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 18C3 14.134 6.13401 11 10 11C13.866 11 17 14.134 17 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className={styles.cardTitle}>Personal Information</h2>
        </div>

        <form onSubmit={handlePersonalInfoSave} className={styles.form}>
          <div className={styles.formGrid}>
            <Input
              label="Full Name"
              type="text"
              value={personalInfo.name}
              onChange={(e) => {
                setPersonalInfo((prev) => ({ ...prev, name: e.target.value }));
                if (personalErrors.name) setPersonalErrors((prev) => ({ ...prev, name: '' }));
              }}
              error={personalErrors.name}
              required
            />
            <Input
              label="Date of Birth"
              type="date"
              value={personalInfo.dateOfBirth}
              onChange={(e) => {
                setPersonalInfo((prev) => ({ ...prev, dateOfBirth: e.target.value }));
                if (personalErrors.dateOfBirth)
                  setPersonalErrors((prev) => ({ ...prev, dateOfBirth: '' }));
              }}
              error={personalErrors.dateOfBirth}
            />
          </div>
          <div className={styles.formGrid}>
            <Select
              label="Gender"
              options={GENDER_OPTIONS}
              value={personalInfo.gender}
              onChange={(value) => setPersonalInfo((prev) => ({ ...prev, gender: value }))}
              placeholder="Select gender"
            />
            <div /> {/* empty cell for grid alignment */}
          </div>
          <div className={styles.formActions}>
            <Button
              type="submit"
              variant="primary"
              loading={personalLoading}
            >
              Save Personal Info
            </Button>
          </div>
        </form>
      </div>

      {/* Section 3: Contact Information */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5H17V15H3V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 5L10 11L17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className={styles.cardTitle}>Contact Information</h2>
        </div>

        <div className={styles.contactGrid}>
          <div className={styles.contactItem}>
            <div className={styles.contactLabel}>Email Address</div>
            <div className={styles.contactValue}>
              <span>{profile?.email || 'Not provided'}</span>
              <div className={styles.contactActions}>
                <span
                  className={`${styles.statusBadge} ${
                    profile?.emailVerified ? styles.statusVerified : styles.statusUnverified
                  }`}
                >
                  {profile?.emailVerified ? 'Verified' : 'Not Verified'}
                </span>
                {!profile?.emailVerified && (
                  <button
                    type="button"
                    className={styles.verifyLink}
                    onClick={openEmailVerification}
                  >
                    Verify now
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className={styles.contactItem}>
            <div className={styles.contactLabel}>Phone Number</div>
            <div className={styles.contactValue}>
              <span>{profile?.phone ? `+91 ${profile.phone}` : 'Not provided'}</span>
              <div className={styles.contactActions}>
                <span
                  className={`${styles.statusBadge} ${
                    profile?.phoneVerified ? styles.statusVerified : styles.statusUnverified
                  }`}
                >
                  {profile?.phoneVerified ? 'Verified' : 'Not Verified'}
                </span>
                {/* TODO: Enable when SMS is configured */}
                {!profile?.phoneVerified && (
                  <span
                    className={styles.verifyLinkDisabled}
                    title="Coming soon"
                  >
                    Coming soon
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Address */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 11C11.6569 11 13 9.65685 13 8C13 6.34315 11.6569 5 10 5C8.34315 5 7 6.34315 7 8C7 9.65685 8.34315 11 10 11Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 18C10 18 16 13 16 8C16 4.68629 13.3137 2 10 2C6.68629 2 4 4.68629 4 8C4 13 10 18 10 18Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <h2 className={styles.cardTitle}>Address</h2>
        </div>

        <form onSubmit={handleAddressSave} className={styles.form}>
          <Input
            label="Address Line 1"
            type="text"
            value={address.line1}
            onChange={(e) => setAddress((prev) => ({ ...prev, line1: e.target.value }))}
            placeholder="Street address, house number"
          />
          <Input
            label="Address Line 2"
            type="text"
            value={address.line2}
            onChange={(e) => setAddress((prev) => ({ ...prev, line2: e.target.value }))}
            placeholder="Apartment, suite, unit (optional)"
          />
          <div className={styles.formGrid}>
            <Input
              label="City"
              type="text"
              value={address.city}
              onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="City"
            />
            <Select
              label="State"
              options={INDIAN_STATES}
              value={address.state}
              onChange={(value) => setAddress((prev) => ({ ...prev, state: value }))}
              placeholder="Select state"
            />
          </div>
          <div className={styles.formGrid}>
            <Input
              label="Pincode"
              type="text"
              value={address.pincode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setAddress((prev) => ({ ...prev, pincode: val }));
                if (addressErrors.pincode) setAddressErrors((prev) => ({ ...prev, pincode: '' }));
              }}
              error={addressErrors.pincode}
              placeholder="6-digit pincode"
              maxLength={6}
            />
            <Input
              label="Country"
              type="text"
              value={address.country}
              disabled
            />
          </div>
          <div className={styles.formActions}>
            <Button
              type="submit"
              variant="primary"
              loading={addressLoading}
            >
              Save Address
            </Button>
          </div>
        </form>
      </div>

      {/* Section 5: Notification Preferences */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2C7.23858 2 5 4.23858 5 7V10L3 13H17L15 10V7C15 4.23858 12.7614 2 10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 16C8 17.1046 8.89543 18 10 18C11.1046 18 12 17.1046 12 16" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <h2 className={styles.cardTitle}>Notification Preferences</h2>
        </div>

        <div className={styles.notificationList}>
          <div className={styles.notificationItem}>
            <div className={styles.notificationInfo}>
              <span className={styles.notificationLabel}>Email Notifications</span>
              <span className={styles.notificationDesc}>
                Receive booking confirmations and updates via email
              </span>
            </div>
            <button
              type="button"
              className={`${styles.toggle} ${notifications.emailNotifications ? styles.toggleOn : ''}`}
              onClick={() => toggleNotification('emailNotifications')}
              role="switch"
              aria-checked={notifications.emailNotifications}
            >
              <span className={styles.toggleHandle} />
            </button>
          </div>

          <div className={`${styles.notificationItem} ${styles.notificationItemDisabled}`}>
            <div className={styles.notificationInfo}>
              <span className={styles.notificationLabel}>
                SMS Notifications
                <span className={styles.comingSoonLabel}>Coming Soon</span>
              </span>
              <span className={styles.notificationDesc}>
                Receive booking confirmations and updates via SMS
              </span>
            </div>
            <button
              type="button"
              className={`${styles.toggle}`}
              disabled
              role="switch"
              aria-checked={false}
              title="SMS notifications coming soon"
            >
              <span className={styles.toggleHandle} />
            </button>
          </div>

          <div className={styles.notificationItem}>
            <div className={styles.notificationInfo}>
              <span className={styles.notificationLabel}>Promotional Emails</span>
              <span className={styles.notificationDesc}>
                Receive offers, discounts, and marketing communications
              </span>
            </div>
            <button
              type="button"
              className={`${styles.toggle} ${notifications.promotionalEmails ? styles.toggleOn : ''}`}
              onClick={() => toggleNotification('promotionalEmails')}
              role="switch"
              aria-checked={notifications.promotionalEmails}
            >
              <span className={styles.toggleHandle} />
            </button>
          </div>
        </div>

        <div className={styles.formActions}>
          <Button
            variant="primary"
            onClick={handleNotificationsSave}
            loading={notificationsLoading}
          >
            Save Preferences
          </Button>
        </div>
      </div>

      {/* Section 6: Security */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 9V6C7 4.34315 8.34315 3 10 3C11.6569 3 13 4.34315 13 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="10" cy="13.5" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          <h2 className={styles.cardTitle}>Security</h2>
        </div>

        <form onSubmit={handlePasswordChange} className={styles.form}>
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => {
              setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }));
              if (passwordErrors.currentPassword)
                setPasswordErrors((prev) => ({ ...prev, currentPassword: '' }));
            }}
            error={passwordErrors.currentPassword}
            required
          />
          <div className={styles.formGrid}>
            <Input
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => {
                setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }));
                if (passwordErrors.newPassword)
                  setPasswordErrors((prev) => ({ ...prev, newPassword: '' }));
              }}
              error={passwordErrors.newPassword}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => {
                setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }));
                if (passwordErrors.confirmPassword)
                  setPasswordErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              error={passwordErrors.confirmPassword}
              required
            />
          </div>
          <p className={styles.passwordHint}>
            Password must be at least 8 characters with 1 uppercase letter, 1 number, and 1 special character (!@#$%^&*).
          </p>
          <div className={styles.formActions}>
            <Button
              type="submit"
              variant="primary"
              loading={passwordLoading}
            >
              Change Password
            </Button>
          </div>
        </form>
      </div>

      {/* Email Verification Modal */}
      <Modal
        isOpen={emailVerifyModal}
        onClose={() => setEmailVerifyModal(false)}
        title={emailVerifyStep === 'email' ? 'Verify Email Address' : 'Enter Verification Code'}
        size="sm"
      >
        {emailVerifyStep === 'email' ? (
          <div className={styles.verifyModalContent}>
            <p className={styles.verifyModalDesc}>
              We will send a verification code to your email address. Please confirm or update your email below.
            </p>
            <Input
              label="Email Address"
              type="email"
              value={verifyEmail}
              onChange={(e) => {
                setVerifyEmail(e.target.value);
                if (emailVerifyError) setEmailVerifyError('');
              }}
              error={emailVerifyError}
              placeholder="Enter your email address"
              required
            />
            <div className={styles.verifyModalActions}>
              <Button
                variant="outline"
                onClick={() => setEmailVerifyModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleEmailVerifySendOtp}
                loading={emailVerifyLoading}
              >
                Send Code
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.verifyModalContent}>
            <p className={styles.verifyModalDesc}>
              A 6-digit verification code has been sent to <strong>{verifyEmail}</strong>. Please enter it below.
            </p>
            <Input
              label="Verification Code"
              type="text"
              value={verifyOtp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerifyOtp(val);
                if (emailVerifyError) setEmailVerifyError('');
              }}
              error={emailVerifyError}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
            />
            <div className={styles.verifyModalActions}>
              <Button
                variant="outline"
                onClick={() => setEmailVerifyStep('email')}
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleEmailVerifyOtp}
                loading={emailVerifyLoading}
              >
                Verify
              </Button>
            </div>
            <button
              type="button"
              className={styles.resendLink}
              onClick={handleEmailVerifySendOtp}
              disabled={emailVerifyLoading}
            >
              Resend code
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
