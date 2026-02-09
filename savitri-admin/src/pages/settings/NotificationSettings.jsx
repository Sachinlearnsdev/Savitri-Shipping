import { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Toggle from '../../components/common/Toggle';
import useUIStore from '../../store/uiStore';
import { getSettingsByGroup, updateSettings } from '../../services/settings.service';
import { SETTINGS_GROUPS } from '../../utils/constants';
import styles from './NotificationSettings.module.css';

const NotificationSettings = () => {
  const { showSuccess, showError } = useUIStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    emailEnabled: true,
    adminAlertEmail: '',
    smsEnabled: false,
    bookingConfirmation: true,
    bookingCancellation: true,
    paymentReceived: true,
    adminNewBooking: true,
    adminCancellation: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getSettingsByGroup(SETTINGS_GROUPS.NOTIFICATION);
        if (response.success && response.data) {
          const settings = response.data;
          const config = settings.value || settings.config || settings;
          setFormData({
            emailEnabled: config.emailEnabled !== undefined ? config.emailEnabled : true,
            adminAlertEmail: config.adminAlertEmail || '',
            smsEnabled: config.smsEnabled !== undefined ? config.smsEnabled : false,
            bookingConfirmation: config.bookingConfirmation !== undefined ? config.bookingConfirmation : true,
            bookingCancellation: config.bookingCancellation !== undefined ? config.bookingCancellation : true,
            paymentReceived: config.paymentReceived !== undefined ? config.paymentReceived : true,
            adminNewBooking: config.adminNewBooking !== undefined ? config.adminNewBooking : true,
            adminCancellation: config.adminCancellation !== undefined ? config.adminCancellation : true,
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load notification settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        key: 'config',
        value: {
          emailEnabled: formData.emailEnabled,
          adminAlertEmail: formData.adminAlertEmail,
          smsEnabled: formData.smsEnabled,
          bookingConfirmation: formData.bookingConfirmation,
          bookingCancellation: formData.bookingCancellation,
          paymentReceived: formData.paymentReceived,
          adminNewBooking: formData.adminNewBooking,
          adminCancellation: formData.adminCancellation,
        },
      };
      await updateSettings(SETTINGS_GROUPS.NOTIFICATION, payload);
      showSuccess('Notification settings saved successfully');
    } catch (err) {
      showError(err.message || 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Notification Settings</h1>
            <p className={styles.subtitle}>Configure email and SMS notification preferences</p>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.loading}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notification Settings</h1>
          <p className={styles.subtitle}>Configure email and SMS notification preferences</p>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.form}>
          {/* Email Notifications */}
          <h3 className={styles.sectionTitle}>Email Notifications</h3>

          <div className={styles.toggleRow}>
            <Toggle
              label="Enable Email Notifications"
              checked={formData.emailEnabled}
              onChange={(checked) => handleChange('emailEnabled', checked)}
            />
          </div>

          <Input
            label="Admin Alert Email"
            type="email"
            placeholder="e.g. admin@savitrishipping.com"
            value={formData.adminAlertEmail}
            onChange={(e) => handleChange('adminAlertEmail', e.target.value)}
            hint="Receives admin alert notifications"
          />

          {/* SMS Notifications */}
          <div className={styles.smsSectionHeader}>
            <h3 className={styles.sectionTitle}>SMS Notifications</h3>
            <span className={styles.comingSoonBadge}>Coming Soon</span>
          </div>

          <div className={`${styles.toggleGroup} ${styles.smsOverlay}`}>
            <div className={styles.toggleRow} title="SMS integration coming soon. Register with DLT and configure SMS provider to enable.">
              <Toggle
                label="Enable SMS Notifications"
                checked={formData.smsEnabled}
                onChange={() => {}}
                disabled
              />
            </div>
            <p className={styles.helperText}>
              SMS integration coming soon. Register with DLT and configure SMS provider to enable.
            </p>
          </div>

          {/* Notification Triggers */}
          <h3 className={styles.sectionTitle}>Notification Triggers</h3>

          <div className={styles.toggleGroup}>
            <div className={styles.toggleRow}>
              <Toggle
                label="Booking Confirmation (to customer)"
                checked={formData.bookingConfirmation}
                onChange={(checked) => handleChange('bookingConfirmation', checked)}
              />
            </div>

            <div className={styles.toggleRow}>
              <Toggle
                label="Booking Cancellation (to customer)"
                checked={formData.bookingCancellation}
                onChange={(checked) => handleChange('bookingCancellation', checked)}
              />
            </div>

            <div className={styles.toggleRow}>
              <Toggle
                label="Payment Received (to customer)"
                checked={formData.paymentReceived}
                onChange={(checked) => handleChange('paymentReceived', checked)}
              />
            </div>

            <div className={styles.toggleRow}>
              <Toggle
                label="New Booking Alert (to admin)"
                checked={formData.adminNewBooking}
                onChange={(checked) => handleChange('adminNewBooking', checked)}
              />
            </div>

            <div className={styles.toggleRow}>
              <Toggle
                label="Cancellation Alert (to admin)"
                checked={formData.adminCancellation}
                onChange={(checked) => handleChange('adminCancellation', checked)}
              />
            </div>
          </div>

          {/* Save */}
          <div className={styles.formActions}>
            <Button onClick={handleSave} loading={saving}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
