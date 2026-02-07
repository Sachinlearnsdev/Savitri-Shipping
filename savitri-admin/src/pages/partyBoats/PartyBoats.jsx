import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useUIStore from '../../store/uiStore';
import { getAllPartyBoats, createPartyBoat, updatePartyBoat, deletePartyBoat } from '../../services/partyBoats.service';
import {
  BOAT_STATUS,
  BOAT_STATUS_LABELS,
  BOAT_STATUS_COLORS,
  LOCATION_TYPE_LABELS,
  TIME_SLOT,
  TIME_SLOT_LABELS,
  EVENT_TYPE,
  EVENT_TYPE_LABELS,
  ADD_ON_TYPE,
  ADD_ON_TYPE_LABELS,
  PRICE_TYPE,
  PRICE_TYPE_LABELS,
  DEFAULT_PAGE_SIZE,
  CURRENCY,
} from '../../utils/constants';
import styles from './PartyBoats.module.css';

const statusOptions = Object.entries(BOAT_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const filterStatusOptions = [{ value: '', label: 'All Statuses' }, ...statusOptions];
const addOnTypeOptions = Object.entries(ADD_ON_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const priceTypeOptions = Object.entries(PRICE_TYPE_LABELS).map(([value, label]) => ({ value, label }));

const locationOptions = Object.entries(LOCATION_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const timeSlotOptions = Object.entries(TIME_SLOT_LABELS).map(([value, label]) => ({ value, label }));
const eventTypeOptions = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));

const emptyAddOn = { type: ADD_ON_TYPE.CATERING_VEG, label: '', price: '', priceType: PRICE_TYPE.FIXED };

const initialFormData = {
  name: '',
  description: '',
  capacityMin: '',
  capacityMax: '',
  basePrice: '',
  locationOptions: [],
  timeSlots: [],
  eventTypes: [],
  djIncluded: true,
  operatingStartTime: '06:00',
  operatingEndTime: '00:00',
  addOns: [],
  status: BOAT_STATUS.ACTIVE,
};

const PartyBoats = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useUIStore();

  // List state
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingBoat, setEditingBoat] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingBoat, setDeletingBoat] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBoats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: pageSize };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await getAllPartyBoats(params);
      if (response.success) {
        setBoats(response.data?.items || response.data || []);
        const pagination = response.data?.pagination || response.pagination || {};
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load party boats');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => {
    fetchBoats();
  }, [fetchBoats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenCreate = () => {
    setEditingBoat(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const handleOpenEdit = (boat) => {
    setEditingBoat(boat);
    setFormData({
      name: boat.name || '',
      description: boat.description || '',
      capacityMin: boat.capacityMin || '',
      capacityMax: boat.capacityMax || '',
      basePrice: boat.basePrice || '',
      locationOptions: boat.locationOptions || [],
      timeSlots: boat.timeSlots || [],
      eventTypes: boat.eventTypes || [],
      djIncluded: boat.djIncluded !== false,
      operatingStartTime: boat.operatingStartTime || '06:00',
      operatingEndTime: boat.operatingEndTime || '00:00',
      addOns: (boat.addOns || []).map(a => ({
        type: a.type,
        label: a.label,
        price: a.price,
        priceType: a.priceType || PRICE_TYPE.FIXED,
      })),
      status: boat.status || BOAT_STATUS.ACTIVE,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBoat(null);
    setFormData(initialFormData);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  // Add-on helpers
  const handleAddAddOn = () => {
    setFormData((prev) => ({
      ...prev,
      addOns: [...prev.addOns, { ...emptyAddOn }],
    }));
  };

  const handleRemoveAddOn = (index) => {
    setFormData((prev) => ({
      ...prev,
      addOns: prev.addOns.filter((_, i) => i !== index),
    }));
  };

  const handleAddOnChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      addOns: prev.addOns.map((addon, i) =>
        i === index ? { ...addon, [field]: value } : addon
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.capacityMin || !formData.capacityMax || !formData.basePrice) {
      showError('Please fill in all required fields');
      return;
    }
    if (formData.locationOptions.length === 0) {
      showError('Please select at least one location option');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        capacityMin: Number(formData.capacityMin),
        capacityMax: Number(formData.capacityMax),
        basePrice: Number(formData.basePrice),
        addOns: formData.addOns
          .filter((a) => a.label && a.price)
          .map((a) => ({ ...a, price: Number(a.price) })),
      };

      if (editingBoat) {
        await updatePartyBoat(editingBoat.id || editingBoat._id, payload);
        showSuccess('Party boat updated successfully');
      } else {
        await createPartyBoat(payload);
        showSuccess('Party boat created successfully');
      }
      handleCloseModal();
      fetchBoats();
    } catch (err) {
      showError(err.message || 'Failed to save party boat');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (boat) => {
    setDeletingBoat(boat);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingBoat) return;
    try {
      setDeleting(true);
      await deletePartyBoat(deletingBoat.id || deletingBoat._id);
      showSuccess('Party boat deleted successfully');
      setShowDeleteDialog(false);
      setDeletingBoat(null);
      fetchBoats();
    } catch (err) {
      showError(err.message || 'Failed to delete party boat');
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount == null) return `${CURRENCY.SYMBOL}0`;
    return `${CURRENCY.SYMBOL}${Number(amount).toLocaleString('en-IN')}`;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Party Boats</h1>
        <Button onClick={handleOpenCreate}>Add Party Boat</Button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search party boats by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          {filterStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="outline" onClick={fetchBoats}>Retry</Button>
        </div>
      ) : boats.length === 0 ? (
        <div className={styles.tableCard}>
          <div className={styles.empty}>
            <p>No party boats found. Add your first party boat to get started.</p>
            <Button onClick={handleOpenCreate}>Add Party Boat</Button>
          </div>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Capacity</th>
                  <th>Location</th>
                  <th>Base Price</th>
                  <th>Events</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {boats.map((boat) => (
                  <tr key={boat.id || boat._id}>
                    <td className={styles.boatName}>{boat.name}</td>
                    <td>{boat.capacityMin}-{boat.capacityMax} guests</td>
                    <td>
                      <div className={styles.badges}>
                        {(boat.locationOptions || []).map((loc) => (
                          <Badge key={loc} variant="default">
                            {LOCATION_TYPE_LABELS[loc] || loc}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className={styles.price}>{formatCurrency(boat.basePrice)}</td>
                    <td>
                      <div className={styles.badges}>
                        {(boat.eventTypes || []).slice(0, 2).map((et) => (
                          <Badge key={et} variant="info">
                            {EVENT_TYPE_LABELS[et] || et}
                          </Badge>
                        ))}
                        {(boat.eventTypes || []).length > 2 && (
                          <Badge variant="default">+{boat.eventTypes.length - 2}</Badge>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge variant={BOAT_STATUS_COLORS[boat.status] || 'default'}>
                        {BOAT_STATUS_LABELS[boat.status] || boat.status}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={`${styles.actionBtn} ${styles.editBtn}`}
                          onClick={() => handleOpenEdit(boat)}
                          title="Edit boat"
                        >
                          Edit
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          onClick={() => handleOpenDelete(boat)}
                          title="Delete boat"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.paginationWrapper}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
              />
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingBoat ? 'Edit Party Boat' : 'Add New Party Boat'}
        size="xl"
      >
        <div className={styles.form}>
          <Input
            label="Boat Name"
            placeholder="e.g. Ocean Queen"
            value={formData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            required
          />
          <div className={styles.formRow}>
            <Input
              label="Min Capacity (guests)"
              type="number"
              placeholder="e.g. 50"
              value={formData.capacityMin}
              onChange={(e) => handleFormChange('capacityMin', e.target.value)}
              required
            />
            <Input
              label="Max Capacity (guests)"
              type="number"
              placeholder="e.g. 100"
              value={formData.capacityMax}
              onChange={(e) => handleFormChange('capacityMax', e.target.value)}
              required
            />
          </div>
          <Input
            label={`Base Price (${CURRENCY.SYMBOL})`}
            type="number"
            placeholder="e.g. 50000"
            value={formData.basePrice}
            onChange={(e) => handleFormChange('basePrice', e.target.value)}
            required
          />

          {/* Location Options */}
          <div className={styles.checkboxGroup}>
            <span className={styles.checkboxGroupLabel}>Location Options *</span>
            <div className={styles.checkboxOptions}>
              {locationOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`${styles.checkboxOption} ${formData.locationOptions.includes(opt.value) ? styles.checkboxOptionSelected : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={formData.locationOptions.includes(opt.value)}
                    onChange={() => toggleArrayField('locationOptions', opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className={styles.checkboxGroup}>
            <span className={styles.checkboxGroupLabel}>Time Slots</span>
            <div className={styles.checkboxOptions}>
              {timeSlotOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`${styles.checkboxOption} ${formData.timeSlots.includes(opt.value) ? styles.checkboxOptionSelected : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={formData.timeSlots.includes(opt.value)}
                    onChange={() => toggleArrayField('timeSlots', opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Event Types */}
          <div className={styles.checkboxGroup}>
            <span className={styles.checkboxGroupLabel}>Event Types</span>
            <div className={styles.checkboxOptions}>
              {eventTypeOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`${styles.checkboxOption} ${formData.eventTypes.includes(opt.value) ? styles.checkboxOptionSelected : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={formData.eventTypes.includes(opt.value)}
                    onChange={() => toggleArrayField('eventTypes', opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formRow}>
            <Input
              label="Operating Start Time"
              type="time"
              value={formData.operatingStartTime}
              onChange={(e) => handleFormChange('operatingStartTime', e.target.value)}
            />
            <Input
              label="Operating End Time"
              type="time"
              value={formData.operatingEndTime}
              onChange={(e) => handleFormChange('operatingEndTime', e.target.value)}
            />
          </div>

          <div className={styles.formRow}>
            <Select
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(value) => handleFormChange('status', value)}
            />
            <div className={styles.checkboxGroup}>
              <span className={styles.checkboxGroupLabel}>DJ Included</span>
              <label className={styles.checkboxOption} style={{ marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={formData.djIncluded}
                  onChange={(e) => handleFormChange('djIncluded', e.target.checked)}
                />
                DJ included by default
              </label>
            </div>
          </div>

          {/* Add-ons */}
          <div className={styles.addOnsSection}>
            <div className={styles.addOnsHeader}>
              <span className={styles.addOnsLabel}>Add-ons</span>
              <Button variant="outline" size="sm" onClick={handleAddAddOn}>
                + Add
              </Button>
            </div>
            {formData.addOns.length === 0 ? (
              <div className={styles.emptyAddOns}>No add-ons configured</div>
            ) : (
              formData.addOns.map((addon, index) => (
                <div key={index} className={styles.addOnRow}>
                  <Select
                    label={index === 0 ? 'Type' : ''}
                    options={addOnTypeOptions}
                    value={addon.type}
                    onChange={(value) => handleAddOnChange(index, 'type', value)}
                  />
                  <Input
                    label={index === 0 ? 'Label' : ''}
                    placeholder="e.g. Veg Platter"
                    value={addon.label}
                    onChange={(e) => handleAddOnChange(index, 'label', e.target.value)}
                  />
                  <Input
                    label={index === 0 ? 'Price' : ''}
                    type="number"
                    placeholder="0"
                    value={addon.price}
                    onChange={(e) => handleAddOnChange(index, 'price', e.target.value)}
                  />
                  <Select
                    label={index === 0 ? 'Price Type' : ''}
                    options={priceTypeOptions}
                    value={addon.priceType}
                    onChange={(value) => handleAddOnChange(index, 'priceType', value)}
                  />
                  <button
                    className={styles.removeAddOnBtn}
                    onClick={() => handleRemoveAddOn(index)}
                    title="Remove add-on"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          <Textarea
            label="Description"
            placeholder="Describe the party boat experience..."
            value={formData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            rows={3}
          />

          <div className={styles.formActions}>
            <Button variant="ghost" onClick={handleCloseModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editingBoat ? 'Update Boat' : 'Create Boat'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setDeletingBoat(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Party Boat"
        message={`Are you sure you want to delete "${deletingBoat?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default PartyBoats;
