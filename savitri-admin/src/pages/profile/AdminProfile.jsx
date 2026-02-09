import { useState, useEffect, useRef } from 'react';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import {
  getAdminProfile,
  updateAdminProfile,
  uploadAdminAvatar,
  removeAdminAvatar,
  changeAdminPassword,
} from '../../services/adminProfile.service';
import { getInitials, getAvatarColor } from '../../utils/helpers';
import { PASSWORD_MIN_LENGTH } from '../../utils/constants';
import styles from './AdminProfile.module.css';

const AdminProfile = () => {
  const { showSuccess, showError } = useUIStore();
  const updateUser = useAuthStore((s) => s.updateUser);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Personal info form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Date fields
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [savingDates, setSavingDates] = useState(false);

  // Address fields
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');
  const [savingAddress, setSavingAddress] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Avatar
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getAdminProfile();
      if (response.success) {
        const data = response.data;
        setProfile(data);
        setName(data.name || '');
        setPhone(data.phone || '');
        setDesignation(data.designation || '');
        setDepartment(data.department || '');
        setEmployeeId(data.employeeId || '');

        // Format dates for input[type=date]
        if (data.dateOfBirth) {
          setDateOfBirth(new Date(data.dateOfBirth).toISOString().split('T')[0]);
        }
        if (data.joiningDate) {
          setJoiningDate(new Date(data.joiningDate).toISOString().split('T')[0]);
        }

        // Address
        if (data.address) {
          setAddressLine1(data.address.line1 || '');
          setAddressLine2(data.address.line2 || '');
          setCity(data.address.city || '');
          setState(data.address.state || '');
          setPincode(data.address.pincode || '');
          setCountry(data.address.country || 'India');
        }
      }
    } catch (err) {
      showError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const response = await updateAdminProfile({
        name,
        phone: phone || undefined,
        designation: designation || undefined,
        department: department || undefined,
        employeeId: employeeId || undefined,
      });
      if (response.success) {
        setProfile(response.data);
        updateUser({ name: response.data.name, phone: response.data.phone, avatar: response.data.avatar });
        showSuccess('Personal information updated');
      }
    } catch (err) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveDates = async () => {
    try {
      setSavingDates(true);
      const response = await updateAdminProfile({
        dateOfBirth: dateOfBirth || undefined,
        joiningDate: joiningDate || undefined,
      });
      if (response.success) {
        setProfile(response.data);
        showSuccess('Dates updated');
      }
    } catch (err) {
      showError(err.message || 'Failed to update dates');
    } finally {
      setSavingDates(false);
    }
  };

  const handleSaveAddress = async () => {
    try {
      setSavingAddress(true);
      const response = await updateAdminProfile({
        address: {
          line1: addressLine1 || undefined,
          line2: addressLine2 || undefined,
          city: city || undefined,
          state: state || undefined,
          pincode: pincode || undefined,
          country: country || 'India',
        },
      });
      if (response.success) {
        setProfile(response.data);
        showSuccess('Address updated');
      }
    } catch (err) {
      showError(err.message || 'Failed to update address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('Please fill in all password fields');
      return;
    }
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      showError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New password and confirm password do not match');
      return;
    }
    try {
      setSavingPassword(true);
      const response = await changeAdminPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (response.success) {
        showSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      showError(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setAvatarLoading(true);
      const response = await uploadAdminAvatar(file);
      if (response.success) {
        setProfile((prev) => ({ ...prev, avatar: response.data.avatar }));
        updateUser({ avatar: response.data.avatar });
        showSuccess('Avatar uploaded');
      }
    } catch (err) {
      showError(err.message || 'Failed to upload avatar');
    } finally {
      setAvatarLoading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    try {
      setAvatarLoading(true);
      const response = await removeAdminAvatar();
      if (response.success) {
        setProfile((prev) => ({ ...prev, avatar: null }));
        updateUser({ avatar: null });
        showSuccess('Avatar removed');
      }
    } catch (err) {
      showError(err.message || 'Failed to remove avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Failed to load profile.</div>
      </div>
    );
  }

  const initials = getInitials(profile.name || 'A');
  const avatarColor = getAvatarColor(profile.name || 'A');
  const roleName = profile.roleId?.name || 'Admin';

  return (
    <div className={styles.container}>
      {/* Profile Photo Section */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Profile Photo</h2>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className={styles.avatarImage} />
            ) : (
              <div className={styles.avatarPlaceholder} style={{ backgroundColor: avatarColor }}>
                {initials}
              </div>
            )}
          </div>
          <div className={styles.avatarActions}>
            <div className={styles.avatarBtnRow}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
              <button
                className={styles.uploadBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
              >
                {avatarLoading ? 'Uploading...' : 'Upload Photo'}
              </button>
              {profile.avatar && (
                <button
                  className={styles.removeBtn}
                  onClick={handleAvatarRemove}
                  disabled={avatarLoading}
                >
                  Remove
                </button>
              )}
            </div>
            <p className={styles.avatarHint}>JPG, PNG or WebP. Max 5MB.</p>
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Personal Information</h2>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Name</label>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={`${styles.input} ${styles.inputReadOnly}`}
              value={profile.email || ''}
              disabled
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Phone</label>
            <input
              type="tel"
              className={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit phone number"
              maxLength={10}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Role</label>
            <div>
              <span className={styles.roleBadge}>{roleName}</span>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Designation</label>
            <input
              type="text"
              className={styles.input}
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Senior Manager"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Department</label>
            <input
              type="text"
              className={styles.input}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Operations"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Employee ID</label>
            <input
              type="text"
              className={styles.input}
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. EMP001"
            />
          </div>
        </div>
        <div className={styles.saveRow}>
          <button
            className={styles.saveBtn}
            onClick={handleSaveProfile}
            disabled={savingProfile}
          >
            {savingProfile ? 'Saving...' : 'Save Personal Info'}
          </button>
        </div>
      </div>

      {/* Dates Section */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Important Dates</h2>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Date of Birth</label>
            <input
              type="date"
              className={styles.input}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Joining Date</label>
            <input
              type="date"
              className={styles.input}
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.saveRow}>
          <button
            className={styles.saveBtn}
            onClick={handleSaveDates}
            disabled={savingDates}
          >
            {savingDates ? 'Saving...' : 'Save Dates'}
          </button>
        </div>
      </div>

      {/* Address Section */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Address</h2>
        <div className={styles.formGrid}>
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label className={styles.label}>Address Line 1</label>
            <input
              type="text"
              className={styles.input}
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="Street address"
            />
          </div>
          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label className={styles.label}>Address Line 2</label>
            <input
              type="text"
              className={styles.input}
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>City</label>
            <input
              type="text"
              className={styles.input}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>State</label>
            <input
              type="text"
              className={styles.input}
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Pincode</label>
            <input
              type="text"
              className={styles.input}
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit pincode"
              maxLength={6}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Country</label>
            <input
              type="text"
              className={styles.input}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country"
            />
          </div>
        </div>
        <div className={styles.saveRow}>
          <button
            className={styles.saveBtn}
            onClick={handleSaveAddress}
            disabled={savingAddress}
          >
            {savingAddress ? 'Saving...' : 'Save Address'}
          </button>
        </div>
      </div>

      {/* Change Password Section */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Change Password</h2>
        <div className={styles.passwordGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Current Password</label>
            <input
              type="password"
              className={styles.input}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>New Password</label>
            <input
              type="password"
              className={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm Password</label>
            <input
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
        </div>
        <div className={styles.saveRow}>
          <button
            className={styles.saveBtn}
            onClick={handleChangePassword}
            disabled={savingPassword}
          >
            {savingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
