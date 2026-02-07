import { useState, useEffect, useCallback } from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Toggle from '../../components/common/Toggle';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useUIStore from '../../store/uiStore';
import { getAllRules, createRule, updateRule, deleteRule } from '../../services/pricingRules.service';
import styles from './PricingRules.module.css';

const RULE_TYPES = [
  { value: 'PEAK_HOURS', label: 'Peak Hours' },
  { value: 'OFF_PEAK_HOURS', label: 'Off Peak Hours' },
  { value: 'WEEKEND', label: 'Weekend' },
  { value: 'SEASONAL', label: 'Seasonal' },
  { value: 'HOLIDAY', label: 'Holiday' },
  { value: 'SPECIAL', label: 'Special' },
];

const RULE_TYPE_LABELS = {};
RULE_TYPES.forEach((t) => { RULE_TYPE_LABELS[t.value] = t.label; });

const initialFormData = {
  name: '',
  type: 'PEAK_HOURS',
  adjustmentPercent: '',
  priority: '',
  isActive: true,
  startTime: '',
  endTime: '',
  startDate: '',
  endDate: '',
  daysOfWeek: [],
};

const PricingRules = () => {
  const { showSuccess, showError } = useUIStore();

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingRule, setDeletingRule] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllRules();
      if (response.success) {
        setRules(response.data?.items || response.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load pricing rules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleOpenCreate = () => {
    setEditingRule(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    const conditions = rule.conditions || {};
    setFormData({
      name: rule.name || '',
      type: rule.type || 'PEAK_HOURS',
      adjustmentPercent: rule.adjustmentPercent || '',
      priority: rule.priority || '',
      isActive: rule.isActive !== undefined ? rule.isActive : true,
      startTime: conditions.startTime || '',
      endTime: conditions.endTime || '',
      startDate: conditions.startDate ? conditions.startDate.split('T')[0] : '',
      endDate: conditions.endDate ? conditions.endDate.split('T')[0] : '',
      daysOfWeek: conditions.daysOfWeek || [],
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRule(null);
    setFormData(initialFormData);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type || formData.adjustmentPercent === '') {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const conditions = {};
      if (formData.startTime) conditions.startTime = formData.startTime;
      if (formData.endTime) conditions.endTime = formData.endTime;
      if (formData.startDate) conditions.startDate = formData.startDate;
      if (formData.endDate) conditions.endDate = formData.endDate;
      if (formData.daysOfWeek.length > 0) conditions.daysOfWeek = formData.daysOfWeek;

      const payload = {
        name: formData.name,
        type: formData.type,
        adjustmentPercent: Number(formData.adjustmentPercent),
        priority: formData.priority ? Number(formData.priority) : 0,
        isActive: formData.isActive,
        conditions,
      };

      if (editingRule) {
        await updateRule(editingRule.id || editingRule._id, payload);
        showSuccess('Pricing rule updated successfully');
      } else {
        await createRule(payload);
        showSuccess('Pricing rule created successfully');
      }
      handleCloseModal();
      fetchRules();
    } catch (err) {
      showError(err.message || 'Failed to save pricing rule');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (rule) => {
    setDeletingRule(rule);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRule) return;
    try {
      setDeleting(true);
      await deleteRule(deletingRule.id || deletingRule._id);
      showSuccess('Pricing rule deleted successfully');
      setShowDeleteDialog(false);
      setDeletingRule(null);
      fetchRules();
    } catch (err) {
      showError(err.message || 'Failed to delete pricing rule');
    } finally {
      setDeleting(false);
    }
  };

  const showTimeFields = ['PEAK_HOURS', 'OFF_PEAK_HOURS'].includes(formData.type);
  const showDateFields = ['SEASONAL', 'HOLIDAY', 'SPECIAL'].includes(formData.type);
  const showDayFields = ['WEEKEND', 'SPECIAL'].includes(formData.type);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Pricing Rules</h1>
        <Button onClick={handleOpenCreate}>Add Rule</Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="outline" onClick={fetchRules}>Retry</Button>
        </div>
      ) : rules.length === 0 ? (
        <div className={styles.tableCard}>
          <div className={styles.empty}>
            <p>No pricing rules configured. Add your first rule to set up dynamic pricing.</p>
            <Button onClick={handleOpenCreate}>Add Rule</Button>
          </div>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Adjustment</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => {
                  const percent = Number(rule.adjustmentPercent);
                  return (
                    <tr key={rule.id || rule._id}>
                      <td className={styles.ruleName}>{rule.name}</td>
                      <td>{RULE_TYPE_LABELS[rule.type] || rule.type}</td>
                      <td>
                        <span className={percent >= 0 ? styles.adjustmentPositive : styles.adjustmentNegative}>
                          {percent >= 0 ? '+' : ''}{percent}%
                        </span>
                      </td>
                      <td>{rule.priority || 0}</td>
                      <td>
                        <Badge variant={rule.isActive ? 'success' : 'warning'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            onClick={() => handleOpenEdit(rule)}
                            title="Edit rule"
                          >
                            Edit
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleOpenDelete(rule)}
                            title="Delete rule"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingRule ? 'Edit Pricing Rule' : 'Add Pricing Rule'}
        size="lg"
      >
        <div className={styles.form}>
          <Input
            label="Rule Name"
            placeholder="e.g. Weekend Surcharge"
            value={formData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            required
          />
          <div className={styles.formRow}>
            <Select
              label="Type"
              options={RULE_TYPES}
              value={formData.type}
              onChange={(value) => handleFormChange('type', value)}
              required
            />
            <Input
              label="Adjustment %"
              type="number"
              placeholder="e.g. 20 for +20% or -10 for -10%"
              value={formData.adjustmentPercent}
              onChange={(e) => handleFormChange('adjustmentPercent', e.target.value)}
              required
              hint="Positive for surcharge, negative for discount"
            />
          </div>
          <div className={styles.formRow}>
            <Input
              label="Priority"
              type="number"
              placeholder="e.g. 1 (higher = applied first)"
              value={formData.priority}
              onChange={(e) => handleFormChange('priority', e.target.value)}
              hint="Higher priority rules are evaluated first"
            />
            <div className={styles.toggleRow}>
              <Toggle
                label="Active"
                checked={formData.isActive}
                onChange={(checked) => handleFormChange('isActive', checked)}
              />
            </div>
          </div>

          {/* Conditional Fields */}
          {(showTimeFields || showDateFields || showDayFields) && (
            <div className={styles.conditionsSection}>
              <h4 className={styles.conditionsTitle}>Conditions</h4>
              {showTimeFields && (
                <div className={styles.formRow}>
                  <Input
                    label="Start Time"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleFormChange('startTime', e.target.value)}
                  />
                  <Input
                    label="End Time"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleFormChange('endTime', e.target.value)}
                  />
                </div>
              )}
              {showDateFields && (
                <div className={styles.formRow}>
                  <Input
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleFormChange('startDate', e.target.value)}
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleFormChange('endDate', e.target.value)}
                  />
                </div>
              )}
              {showDayFields && (
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--spacing-1)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)' }}>
                    Days of Week
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                      <button
                        key={day}
                        type="button"
                        style={{
                          padding: 'var(--spacing-1) var(--spacing-3)',
                          border: `1px solid ${formData.daysOfWeek.includes(idx) ? 'var(--color-primary-600)' : 'var(--border-color)'}`,
                          borderRadius: 'var(--radius-lg)',
                          backgroundColor: formData.daysOfWeek.includes(idx) ? 'var(--color-primary-600)' : 'transparent',
                          color: formData.daysOfWeek.includes(idx) ? '#fff' : 'var(--text-primary)',
                          cursor: 'pointer',
                          fontSize: 'var(--font-size-sm)',
                          transition: 'var(--transition-all)',
                        }}
                        onClick={() => {
                          const newDays = formData.daysOfWeek.includes(idx)
                            ? formData.daysOfWeek.filter((d) => d !== idx)
                            : [...formData.daysOfWeek, idx];
                          handleFormChange('daysOfWeek', newDays);
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={styles.formActions}>
            <Button variant="ghost" onClick={handleCloseModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setDeletingRule(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Pricing Rule"
        message={`Are you sure you want to delete "${deletingRule?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default PricingRules;
