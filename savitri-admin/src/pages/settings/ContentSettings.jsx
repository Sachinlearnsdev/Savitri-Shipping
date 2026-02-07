import { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import useUIStore from '../../store/uiStore';
import { getSettingsByGroup, updateSettings } from '../../services/settings.service';
import { SETTINGS_GROUPS } from '../../utils/constants';
import styles from './ContentSettings.module.css';

const ContentSettings = () => {
  const { showSuccess, showError } = useUIStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    heroTitle: '',
    heroSubtitle: '',
    aboutText: '',
    termsAndConditions: '',
    cancellationPolicyText: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getSettingsByGroup(SETTINGS_GROUPS.CONTENT);
        if (response.success && response.data) {
          const settings = response.data;
          const config = settings.value || settings.config || settings;
          setFormData({
            heroTitle: config.heroTitle || '',
            heroSubtitle: config.heroSubtitle || '',
            aboutText: config.aboutText || '',
            termsAndConditions: config.termsAndConditions || '',
            cancellationPolicyText: config.cancellationPolicyText || '',
            contactEmail: config.contactEmail || '',
            contactPhone: config.contactPhone || '',
            contactAddress: config.contactAddress || '',
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load content settings');
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
        value: { ...formData },
      };
      await updateSettings(SETTINGS_GROUPS.CONTENT, payload);
      showSuccess('Content settings saved successfully');
    } catch (err) {
      showError(err.message || 'Failed to save content settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Content Settings</h1>
            <p className={styles.subtitle}>Manage website content, hero section, and contact information</p>
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
          <h1 className={styles.title}>Content Settings</h1>
          <p className={styles.subtitle}>Manage website content, hero section, and contact information</p>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {/* Hero Section */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Hero Section</h2>
        <div className={styles.form}>
          <Input
            label="Hero Title"
            placeholder="e.g. Experience the Thrill of Speed Boats"
            value={formData.heroTitle}
            onChange={(e) => handleChange('heroTitle', e.target.value)}
          />
          <Input
            label="Hero Subtitle"
            placeholder="e.g. Book your adventure on the water today"
            value={formData.heroSubtitle}
            onChange={(e) => handleChange('heroSubtitle', e.target.value)}
          />
        </div>
      </div>

      {/* About & Policies */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>About & Policies</h2>
        <div className={styles.form}>
          <Textarea
            label="About Text"
            placeholder="About your company..."
            value={formData.aboutText}
            onChange={(e) => handleChange('aboutText', e.target.value)}
            rows={5}
          />
          <Textarea
            label="Terms & Conditions"
            placeholder="Terms and conditions text..."
            value={formData.termsAndConditions}
            onChange={(e) => handleChange('termsAndConditions', e.target.value)}
            rows={6}
          />
          <Textarea
            label="Cancellation Policy"
            placeholder="Cancellation policy text..."
            value={formData.cancellationPolicyText}
            onChange={(e) => handleChange('cancellationPolicyText', e.target.value)}
            rows={4}
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Contact Information</h2>
        <div className={styles.form}>
          <div className={styles.formRow}>
            <Input
              label="Contact Email"
              type="email"
              placeholder="info@savitrishipping.com"
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
            />
            <Input
              label="Contact Phone"
              placeholder="+91 9876543210"
              value={formData.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
            />
          </div>
          <Textarea
            label="Address"
            placeholder="Full address..."
            value={formData.contactAddress}
            onChange={(e) => handleChange('contactAddress', e.target.value)}
            rows={3}
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
  );
};

export default ContentSettings;
