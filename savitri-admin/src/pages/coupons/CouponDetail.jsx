import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import useUIStore from '../../store/uiStore';
import { getCouponById, createCoupon, updateCoupon } from '../../services/coupons.service';
import {
  DISCOUNT_TYPE,
  DISCOUNT_TYPE_LABELS,
  APPLICABLE_TO,
  APPLICABLE_TO_LABELS,
  CURRENCY,
} from '../../utils/constants';
import styles from './CouponDetail.module.css';

const discountTypeOptions = Object.entries(DISCOUNT_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const applicableToOptions = Object.entries(APPLICABLE_TO_LABELS).map(([value, label]) => ({ value, label }));

const initialFormData = {
  code: '',
  description: '',
  discountType: DISCOUNT_TYPE.PERCENTAGE,
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  validFrom: '',
  validTo: '',
  usageLimit: '',
  applicableTo: APPLICABLE_TO.ALL,
  isActive: true,
};

const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CouponDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useUIStore();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [originalCoupon, setOriginalCoupon] = useState(null);

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getCouponById(id);
        if (response.success) {
          const coupon = response.data;
          setOriginalCoupon(coupon);
          setFormData({
            code: coupon.code || '',
            description: coupon.description || '',
            discountType: coupon.discountType || DISCOUNT_TYPE.PERCENTAGE,
            discountValue: coupon.discountValue != null ? String(coupon.discountValue) : '',
            minOrderAmount: coupon.minOrderAmount != null ? String(coupon.minOrderAmount) : '',
            maxDiscountAmount: coupon.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : '',
            validFrom: formatDateForInput(coupon.validFrom),
            validTo: formatDateForInput(coupon.validTo),
            usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
            applicableTo: coupon.applicableTo || APPLICABLE_TO.ALL,
            isActive: coupon.isActive !== false,
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load coupon details');
      } finally {
        setLoading(false);
      }
    };

    if (isEditing) {
      fetchCoupon();
    }
  }, [id, isEditing]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCodeChange = (e) => {
    handleFormChange('code', e.target.value.toUpperCase());
  };

  const handleSave = async () => {
    if (!formData.code || !formData.discountType || !formData.discountValue || !formData.validFrom || !formData.validTo) {
      showError('Please fill in all required fields');
      return;
    }

    if (formData.discountType === DISCOUNT_TYPE.PERCENTAGE && Number(formData.discountValue) > 100) {
      showError('Percentage discount cannot exceed 100%');
      return;
    }

    if (new Date(formData.validTo) <= new Date(formData.validFrom)) {
      showError('Valid To date must be after Valid From date');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        code: formData.code.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        applicableTo: formData.applicableTo,
      };

      if (formData.description) payload.description = formData.description.trim();
      if (formData.minOrderAmount) payload.minOrderAmount = Number(formData.minOrderAmount);
      if (formData.maxDiscountAmount && formData.discountType === DISCOUNT_TYPE.PERCENTAGE) {
        payload.maxDiscountAmount = Number(formData.maxDiscountAmount);
      }
      if (formData.usageLimit) payload.usageLimit = Number(formData.usageLimit);

      if (isEditing) {
        await updateCoupon(id, payload);
        showSuccess('Coupon updated successfully');
      } else {
        await createCoupon(payload);
        showSuccess('Coupon created successfully');
        navigate('/coupons');
      }
    } catch (err) {
      showError(err.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  // Whether code field should be disabled: editing and coupon has been used
  const isCodeDisabled = isEditing && originalCoupon && (originalCoupon.usageCount || 0) > 0;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="outline" onClick={() => navigate('/coupons')}>
            Back to Coupons
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backBtn} onClick={() => navigate('/coupons')}>
        &larr; Back to Coupons
      </button>

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          {isEditing ? `Edit Coupon: ${formData.code || ''}` : 'Create Coupon'}
        </h1>
      </div>

      {/* Coupon Form */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Coupon Details</h2>
        <div className={styles.form}>
          <div className={styles.formRow}>
            <Input
              label="Coupon Code"
              placeholder="e.g. SUMMER20"
              value={formData.code}
              onChange={handleCodeChange}
              disabled={isCodeDisabled}
              required
            />
            <Select
              label="Discount Type"
              options={discountTypeOptions}
              value={formData.discountType}
              onChange={(value) => handleFormChange('discountType', value)}
              required
            />
          </div>
          <div className={styles.formRow}>
            <Input
              label={formData.discountType === DISCOUNT_TYPE.PERCENTAGE ? 'Discount Value (%)' : `Discount Value (${CURRENCY.SYMBOL})`}
              type="number"
              placeholder={formData.discountType === DISCOUNT_TYPE.PERCENTAGE ? 'e.g. 20' : 'e.g. 500'}
              value={formData.discountValue}
              onChange={(e) => handleFormChange('discountValue', e.target.value)}
              required
            />
            <Input
              label={`Min Order Amount (${CURRENCY.SYMBOL})`}
              type="number"
              placeholder="e.g. 1000 (0 = no minimum)"
              value={formData.minOrderAmount}
              onChange={(e) => handleFormChange('minOrderAmount', e.target.value)}
            />
          </div>
          {formData.discountType === DISCOUNT_TYPE.PERCENTAGE && (
            <Input
              label={`Max Discount Amount (${CURRENCY.SYMBOL})`}
              type="number"
              placeholder="e.g. 500 (0 = no cap)"
              value={formData.maxDiscountAmount}
              onChange={(e) => handleFormChange('maxDiscountAmount', e.target.value)}
            />
          )}
          <div className={styles.formRow}>
            <Input
              label="Valid From"
              type="date"
              value={formData.validFrom}
              onChange={(e) => handleFormChange('validFrom', e.target.value)}
              required
            />
            <Input
              label="Valid To"
              type="date"
              value={formData.validTo}
              onChange={(e) => handleFormChange('validTo', e.target.value)}
              required
            />
          </div>
          <div className={styles.formRow}>
            <Input
              label="Usage Limit"
              type="number"
              placeholder="e.g. 100 (0 = unlimited)"
              value={formData.usageLimit}
              onChange={(e) => handleFormChange('usageLimit', e.target.value)}
            />
            <Select
              label="Applicable To"
              options={applicableToOptions}
              value={formData.applicableTo}
              onChange={(value) => handleFormChange('applicableTo', value)}
            />
          </div>
          <Textarea
            label="Description"
            placeholder="Brief description of the coupon (optional)..."
            value={formData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            rows={3}
          />

          {/* Active Toggle */}
          <div className={styles.toggleRow}>
            <div>
              <div className={styles.toggleLabel}>Active Status</div>
              <div className={styles.toggleDescription}>
                {formData.isActive ? 'Coupon is active and can be used by customers' : 'Coupon is inactive and cannot be used'}
              </div>
            </div>
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleFormChange('isActive', e.target.checked)}
              />
              <span className={styles.toggleSlider} />
            </label>
          </div>

          <div className={styles.formActions}>
            <Button variant="ghost" onClick={() => navigate('/coupons')} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {isEditing ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponDetail;
