import { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import useUIStore from '../../store/uiStore';
import { getSettingsByGroup, updateSettings } from '../../services/settings.service';
import { SETTINGS_GROUPS } from '../../utils/constants';
import styles from './GeneralSettings.module.css';

const timezoneOptions = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
  { value: 'UTC', label: 'UTC' },
];

const dateFormatOptions = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

const currencyOptions = [
  { value: 'INR', label: 'INR (\u20B9)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (\u20AC)' },
];

const GeneralSettings = () => {
  const { showSuccess, showError } = useUIStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    websiteUrl: '',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getSettingsByGroup(SETTINGS_GROUPS.GENERAL);
        if (response.success && response.data) {
          const settings = response.data;
          const config = settings.value || settings.config || settings;
          setFormData({
            companyName: config.companyName || '',
            address: config.address || '',
            contactEmail: config.contactEmail || '',
            contactPhone: config.contactPhone || '',
            websiteUrl: config.websiteUrl || '',
            timezone: config.timezone || 'Asia/Kolkata',
            dateFormat: config.dateFormat || 'DD/MM/YYYY',
            currency: config.currency || 'INR',
            facebookUrl: config.facebookUrl || '',
            instagramUrl: config.instagramUrl || '',
            twitterUrl: config.twitterUrl || '',
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load general settings');
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
          companyName: formData.companyName,
          address: formData.address,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          websiteUrl: formData.websiteUrl,
          timezone: formData.timezone,
          dateFormat: formData.dateFormat,
          currency: formData.currency,
          facebookUrl: formData.facebookUrl,
          instagramUrl: formData.instagramUrl,
          twitterUrl: formData.twitterUrl,
        },
      };
      await updateSettings(SETTINGS_GROUPS.GENERAL, payload);
      showSuccess('General settings saved successfully');
    } catch (err) {
      showError(err.message || 'Failed to save general settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>General Settings</h1>
            <p className={styles.subtitle}>Manage company information and preferences</p>
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
          <h1 className={styles.title}>General Settings</h1>
          <p className={styles.subtitle}>Manage company information and preferences</p>
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
          {/* Company Information */}
          <h3 className={styles.sectionTitle}>Company Information</h3>

          <Input
            label="Company Name"
            placeholder="e.g. Savitri Shipping"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
          />

          <Textarea
            label="Address"
            placeholder="Full company address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={3}
          />

          <div className={styles.formRow}>
            <Input
              label="Contact Email"
              type="email"
              placeholder="e.g. info@savitrishipping.com"
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
            />
            <Input
              label="Contact Phone"
              placeholder="e.g. 9876543210"
              value={formData.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
            />
          </div>

          <Input
            label="Website URL"
            placeholder="e.g. https://savitrishipping.com"
            value={formData.websiteUrl}
            onChange={(e) => handleChange('websiteUrl', e.target.value)}
          />

          {/* Regional Settings */}
          <h3 className={styles.sectionTitle}>Regional Settings</h3>

          <div className={styles.formRow}>
            <Select
              label="Timezone"
              options={timezoneOptions}
              value={formData.timezone}
              onChange={(value) => handleChange('timezone', value)}
            />
            <Select
              label="Date Format"
              options={dateFormatOptions}
              value={formData.dateFormat}
              onChange={(value) => handleChange('dateFormat', value)}
            />
          </div>

          <div className={styles.formRow}>
            <Select
              label="Currency"
              options={currencyOptions}
              value={formData.currency}
              onChange={(value) => handleChange('currency', value)}
            />
            <div />
          </div>

          {/* Social Links */}
          <h3 className={styles.sectionTitle}>Social Links</h3>

          <div className={styles.formRow}>
            <Input
              label="Facebook URL"
              placeholder="e.g. https://facebook.com/savitrishipping"
              value={formData.facebookUrl}
              onChange={(e) => handleChange('facebookUrl', e.target.value)}
            />
            <Input
              label="Instagram URL"
              placeholder="e.g. https://instagram.com/savitrishipping"
              value={formData.instagramUrl}
              onChange={(e) => handleChange('instagramUrl', e.target.value)}
            />
          </div>

          <Input
            label="Twitter URL"
            placeholder="e.g. https://twitter.com/savitrishipping"
            value={formData.twitterUrl}
            onChange={(e) => handleChange('twitterUrl', e.target.value)}
          />

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

export default GeneralSettings;
