import { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Toggle from '../../components/common/Toggle';
import useUIStore from '../../store/uiStore';
import { getSettingsByGroup, updateSettings } from '../../services/settings.service';
import { SETTINGS_GROUPS } from '../../utils/constants';
import styles from './BillingSettings.module.css';

const BillingSettings = () => {
  const { showSuccess, showError } = useUIStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    gstPercent: '18',
    gstInclusive: false,
    invoicePrefix: 'INV',
    panNumber: '',
    gstNumber: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getSettingsByGroup(SETTINGS_GROUPS.BILLING);
        if (response.success && response.data) {
          const settings = response.data;
          const config = settings.value || settings.config || settings;
          setFormData({
            gstPercent: config.gstPercent || '18',
            gstInclusive: config.gstInclusive || false,
            invoicePrefix: config.invoicePrefix || 'INV',
            panNumber: config.panNumber || '',
            gstNumber: config.gstNumber || '',
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load billing settings');
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
          gstPercent: Number(formData.gstPercent),
          gstInclusive: formData.gstInclusive,
          invoicePrefix: formData.invoicePrefix,
          panNumber: formData.panNumber,
          gstNumber: formData.gstNumber,
        },
      };
      await updateSettings(SETTINGS_GROUPS.BILLING, payload);
      showSuccess('Billing settings saved successfully');
    } catch (err) {
      showError(err.message || 'Failed to save billing settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Billing Settings</h1>
            <p className={styles.subtitle}>Configure GST, invoicing, and tax details</p>
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
          <h1 className={styles.title}>Billing Settings</h1>
          <p className={styles.subtitle}>Configure GST, invoicing, and tax details</p>
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
          <div className={styles.formRow}>
            <Input
              label="GST Percentage"
              type="number"
              placeholder="18"
              value={formData.gstPercent}
              onChange={(e) => handleChange('gstPercent', e.target.value)}
              hint="Applied to all bookings"
            />
            <Input
              label="Invoice Prefix"
              placeholder="INV"
              value={formData.invoicePrefix}
              onChange={(e) => handleChange('invoicePrefix', e.target.value)}
              hint="Prefix for invoice numbers (e.g. INV-001)"
            />
          </div>

          <div className={styles.toggleRow}>
            <Toggle
              label="GST Inclusive (prices include GST)"
              checked={formData.gstInclusive}
              onChange={(checked) => handleChange('gstInclusive', checked)}
            />
          </div>

          <div className={styles.formRow}>
            <Input
              label="PAN Number"
              placeholder="e.g. ABCDE1234F"
              value={formData.panNumber}
              onChange={(e) => handleChange('panNumber', e.target.value)}
            />
            <Input
              label="GST Number"
              placeholder="e.g. 27ABCDE1234F1Z5"
              value={formData.gstNumber}
              onChange={(e) => handleChange('gstNumber', e.target.value)}
            />
          </div>

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

export default BillingSettings;
