import { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import useUIStore from '../../store/uiStore';
import { getSettingsByGroup, updateSettings } from '../../services/settings.service';
import { SETTINGS_GROUPS } from '../../utils/constants';
import styles from './BookingSettings.module.css';

const BookingSettings = () => {
  const { showSuccess, showError } = useUIStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    maxAdvanceDays: '45',
    minNoticeHours: '2',
    bufferMinutes: '30',
    minDurationHours: '1',
    maxDurationHours: '8',
    operatingStartTime: '08:00',
    operatingEndTime: '18:00',
    cancellation24hRefund: '100',
    cancellation12hRefund: '50',
    cancellationLateRefund: '0',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getSettingsByGroup(SETTINGS_GROUPS.BOOKING);
        if (response.success && response.data) {
          const settings = response.data;
          const config = settings.value || settings.config || settings;
          setFormData({
            maxAdvanceDays: config.maxAdvanceDays || '45',
            minNoticeHours: config.minNoticeHours || '2',
            bufferMinutes: config.bufferMinutes || '30',
            minDurationHours: config.minDurationHours || '1',
            maxDurationHours: config.maxDurationHours || '8',
            operatingStartTime: config.operatingStartTime || '08:00',
            operatingEndTime: config.operatingEndTime || '18:00',
            cancellation24hRefund: config.cancellation24hRefund || '100',
            cancellation12hRefund: config.cancellation12hRefund || '50',
            cancellationLateRefund: config.cancellationLateRefund || '0',
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load booking settings');
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
          maxAdvanceDays: Number(formData.maxAdvanceDays),
          minNoticeHours: Number(formData.minNoticeHours),
          bufferMinutes: Number(formData.bufferMinutes),
          minDurationHours: Number(formData.minDurationHours),
          maxDurationHours: Number(formData.maxDurationHours),
          operatingStartTime: formData.operatingStartTime,
          operatingEndTime: formData.operatingEndTime,
          cancellation24hRefund: Number(formData.cancellation24hRefund),
          cancellation12hRefund: Number(formData.cancellation12hRefund),
          cancellationLateRefund: Number(formData.cancellationLateRefund),
        },
      };
      await updateSettings(SETTINGS_GROUPS.BOOKING, payload);
      showSuccess('Booking settings saved successfully');
    } catch (err) {
      showError(err.message || 'Failed to save booking settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Booking Settings</h1>
            <p className={styles.subtitle}>Configure booking rules, limits, and cancellation policy</p>
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
          <h1 className={styles.title}>Booking Settings</h1>
          <p className={styles.subtitle}>Configure booking rules, limits, and cancellation policy</p>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {/* Booking Limits */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Booking Limits</h2>
        <div className={styles.form}>
          <div className={styles.formRow}>
            <Input
              label="Max Advance Booking (days)"
              type="number"
              placeholder="45"
              value={formData.maxAdvanceDays}
              onChange={(e) => handleChange('maxAdvanceDays', e.target.value)}
              hint="Maximum days in advance a booking can be made"
            />
            <Input
              label="Minimum Notice (hours)"
              type="number"
              placeholder="2"
              value={formData.minNoticeHours}
              onChange={(e) => handleChange('minNoticeHours', e.target.value)}
              hint="Minimum hours before ride time to book"
            />
          </div>
          <div className={styles.formRow}>
            <Input
              label="Buffer Between Bookings (minutes)"
              type="number"
              placeholder="30"
              value={formData.bufferMinutes}
              onChange={(e) => handleChange('bufferMinutes', e.target.value)}
              hint="Gap between consecutive bookings"
            />
          </div>
        </div>
      </div>

      {/* Duration & Hours */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Duration & Operating Hours</h2>
        <div className={styles.form}>
          <div className={styles.formRow}>
            <Input
              label="Minimum Duration (hours)"
              type="number"
              placeholder="1"
              value={formData.minDurationHours}
              onChange={(e) => handleChange('minDurationHours', e.target.value)}
            />
            <Input
              label="Maximum Duration (hours)"
              type="number"
              placeholder="8"
              value={formData.maxDurationHours}
              onChange={(e) => handleChange('maxDurationHours', e.target.value)}
            />
          </div>
          <div className={styles.formRow}>
            <Input
              label="Operating Start Time"
              type="time"
              value={formData.operatingStartTime}
              onChange={(e) => handleChange('operatingStartTime', e.target.value)}
            />
            <Input
              label="Operating End Time"
              type="time"
              value={formData.operatingEndTime}
              onChange={(e) => handleChange('operatingEndTime', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Cancellation Policy</h2>
        <div className={styles.form}>
          <div className={styles.formRow3}>
            <Input
              label="24h+ Refund (%)"
              type="number"
              placeholder="100"
              value={formData.cancellation24hRefund}
              onChange={(e) => handleChange('cancellation24hRefund', e.target.value)}
              hint="Cancelled 24+ hours before"
            />
            <Input
              label="12-24h Refund (%)"
              type="number"
              placeholder="50"
              value={formData.cancellation12hRefund}
              onChange={(e) => handleChange('cancellation12hRefund', e.target.value)}
              hint="Cancelled 12-24 hours before"
            />
            <Input
              label="<12h Refund (%)"
              type="number"
              placeholder="0"
              value={formData.cancellationLateRefund}
              onChange={(e) => handleChange('cancellationLateRefund', e.target.value)}
              hint="Cancelled less than 12 hours"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className={styles.formActions}>
        <Button onClick={handleSave} loading={saving}>
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default BookingSettings;
