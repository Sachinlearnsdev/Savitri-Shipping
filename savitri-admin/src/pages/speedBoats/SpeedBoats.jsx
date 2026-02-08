import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useUIStore from '../../store/uiStore';
import { getAllBoats, createBoat, updateBoat, deleteBoat } from '../../services/speedBoats.service';
import {
  BOAT_STATUS,
  BOAT_STATUS_LABELS,
  BOAT_STATUS_COLORS,
  DEFAULT_PAGE_SIZE,
  CURRENCY,
} from '../../utils/constants';
import styles from './SpeedBoats.module.css';

const statusOptions = Object.entries(BOAT_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const filterStatusOptions = [{ value: '', label: 'All Statuses' }, ...statusOptions];

const initialFormData = {
  name: '',
  registrationNumber: '',
  capacity: '',
  description: '',
  features: '',
  baseRate: '',
  status: BOAT_STATUS.ACTIVE,
};

const SpeedBoats = () => {
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

      const response = await getAllBoats(params);
      if (response.success) {
        setBoats(response.data?.items || response.data || []);
        const pagination = response.data?.pagination || response.pagination || {};
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load boats');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => {
    fetchBoats();
  }, [fetchBoats]);

  // Debounced search
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
      registrationNumber: boat.registrationNumber || '',
      capacity: boat.capacity || '',
      description: boat.description || '',
      features: (boat.features || []).join(', '),
      baseRate: boat.baseRate || '',
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

  const handleSubmit = async () => {
    if (!formData.name || !formData.registrationNumber || !formData.capacity || !formData.baseRate) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        baseRate: Number(formData.baseRate),
        features: formData.features
          ? formData.features.split(',').map(f => f.trim()).filter(Boolean)
          : [],
      };

      if (editingBoat) {
        await updateBoat(editingBoat.id || editingBoat._id, payload);
        showSuccess('Boat updated successfully');
      } else {
        await createBoat(payload);
        showSuccess('Boat created successfully');
      }
      handleCloseModal();
      fetchBoats();
    } catch (err) {
      showError(err.message || 'Failed to save boat');
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
      await deleteBoat(deletingBoat.id || deletingBoat._id);
      showSuccess('Boat deleted successfully');
      setShowDeleteDialog(false);
      setDeletingBoat(null);
      fetchBoats();
    } catch (err) {
      showError(err.message || 'Failed to delete boat');
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
        <h1 className={styles.title}>Speed Boats</h1>
        <Button onClick={handleOpenCreate}>Add Boat</Button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search boats by name or registration..."
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
            <p>No boats found. Add your first speed boat to get started.</p>
            <Button onClick={handleOpenCreate}>Add Boat</Button>
          </div>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Registration #</th>
                  <th>Capacity</th>
                  <th>Base Rate</th>
                  <th>Images</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {boats.map((boat) => (
                  <tr key={boat.id || boat._id}>
                    <td className={styles.boatName}>
                      <Link to={`/speed-boats/${boat.id || boat._id}`} className={styles.boatNameLink}>
                        {boat.name}
                      </Link>
                    </td>
                    <td>{boat.registrationNumber}</td>
                    <td>{boat.capacity} Passengers</td>
                    <td className={styles.rate}>{formatCurrency(boat.baseRate)}/hr</td>
                    <td>
                      <Link to={`/speed-boats/${boat.id || boat._id}`} className={styles.imageCount}>
                        {(boat.images || []).length} photo{(boat.images || []).length !== 1 ? 's' : ''}
                      </Link>
                    </td>
                    <td>
                      <Badge variant={BOAT_STATUS_COLORS[boat.status] || 'default'}>
                        {BOAT_STATUS_LABELS[boat.status] || boat.status}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={`${styles.actionBtn} ${styles.viewBtn}`}
                          onClick={() => navigate(`/speed-boats/${boat.id || boat._id}`)}
                          title="View details & images"
                        >
                          View
                        </button>
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
        title={editingBoat ? 'Edit Boat' : 'Add New Boat'}
        size="lg"
      >
        <div className={styles.form}>
          <div className={styles.formRow}>
            <Input
              label="Boat Name"
              placeholder="e.g. Sea Runner"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              required
            />
            <Input
              label="Registration Number"
              placeholder="e.g. MH-1234"
              value={formData.registrationNumber}
              onChange={(e) => handleFormChange('registrationNumber', e.target.value)}
              required
            />
          </div>
          <div className={styles.formRow}>
            <Input
              label="Capacity (persons)"
              type="number"
              placeholder="e.g. 8"
              value={formData.capacity}
              onChange={(e) => handleFormChange('capacity', e.target.value)}
              required
            />
            <Input
              label="Base Rate (per hour)"
              type="number"
              placeholder="e.g. 2000"
              value={formData.baseRate}
              onChange={(e) => handleFormChange('baseRate', e.target.value)}
              required
            />
          </div>
          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(value) => handleFormChange('status', value)}
          />
          <Textarea
            label="Description"
            placeholder="Brief description of the boat..."
            value={formData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            rows={3}
          />
          <Input
            label="Features & Amenities (comma-separated)"
            placeholder="e.g. Captain Included, Safety Gear, Life Jackets, Bluetooth Speakers"
            value={formData.features}
            onChange={(e) => handleFormChange('features', e.target.value)}
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
        title="Delete Boat"
        message={`Are you sure you want to delete "${deletingBoat?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default SpeedBoats;
