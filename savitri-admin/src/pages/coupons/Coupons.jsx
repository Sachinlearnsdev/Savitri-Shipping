import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useUIStore from '../../store/uiStore';
import { getCoupons, deleteCoupon, toggleCouponActive } from '../../services/coupons.service';
import {
  DISCOUNT_TYPE_LABELS,
  APPLICABLE_TO_LABELS,
  DEFAULT_PAGE_SIZE,
  CURRENCY,
} from '../../utils/constants';
import styles from './Coupons.module.css';

const filterStatusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const Coupons = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useUIStore();

  // List state
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingCoupon, setDeletingCoupon] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle state
  const [toggling, setToggling] = useState(null);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: pageSize };
      if (search) params.search = search;
      if (statusFilter) params.isActive = statusFilter;

      const response = await getCoupons(params);
      if (response.success) {
        setCoupons(response.data?.items || response.data || []);
        const pagination = response.data?.pagination || response.pagination || {};
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleActive = async (coupon) => {
    const couponId = coupon.id || coupon._id;
    try {
      setToggling(couponId);
      await toggleCouponActive(couponId);
      showSuccess(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchCoupons();
    } catch (err) {
      showError(err.message || 'Failed to toggle coupon status');
    } finally {
      setToggling(null);
    }
  };

  const handleOpenDelete = (coupon) => {
    setDeletingCoupon(coupon);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCoupon) return;
    try {
      setDeleting(true);
      await deleteCoupon(deletingCoupon.id || deletingCoupon._id);
      showSuccess('Coupon deleted successfully');
      setShowDeleteDialog(false);
      setDeletingCoupon(null);
      fetchCoupons();
    } catch (err) {
      showError(err.message || 'Failed to delete coupon');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}%`;
    }
    return `${CURRENCY.SYMBOL}${Number(coupon.discountValue).toLocaleString('en-IN')}`;
  };

  const formatUsage = (coupon) => {
    const count = coupon.usageCount || 0;
    const limit = coupon.usageLimit || 0;
    if (limit === 0) return `${count} / Unlimited`;
    return `${count} / ${limit}`;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Coupons</h1>
        <Button onClick={() => navigate('/coupons/new')}>Add Coupon</Button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by coupon code..."
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
          <Button variant="outline" onClick={fetchCoupons}>Retry</Button>
        </div>
      ) : coupons.length === 0 ? (
        <div className={styles.tableCard}>
          <div className={styles.empty}>
            <p>No coupons found. Create your first coupon to get started.</p>
            <Button onClick={() => navigate('/coupons/new')}>Add Coupon</Button>
          </div>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Type</th>
                  <th>Validity</th>
                  <th>Usage</th>
                  <th>Applicable To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const couponId = coupon.id || coupon._id;
                  return (
                    <tr key={couponId}>
                      <td className={styles.couponCode}>{coupon.code}</td>
                      <td className={styles.discount}>{formatDiscount(coupon)}</td>
                      <td>{DISCOUNT_TYPE_LABELS[coupon.discountType] || coupon.discountType}</td>
                      <td className={styles.validity}>
                        {formatDate(coupon.validFrom)} - {formatDate(coupon.validTo)}
                      </td>
                      <td className={styles.usage}>{formatUsage(coupon)}</td>
                      <td>{APPLICABLE_TO_LABELS[coupon.applicableTo] || coupon.applicableTo}</td>
                      <td>
                        <Badge variant={coupon.isActive ? 'success' : 'warning'}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            onClick={() => navigate(`/coupons/${couponId}`)}
                            title="Edit coupon"
                          >
                            Edit
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.toggleBtn}`}
                            onClick={() => handleToggleActive(coupon)}
                            disabled={toggling === couponId}
                            title={coupon.isActive ? 'Deactivate coupon' : 'Activate coupon'}
                          >
                            {toggling === couponId ? '...' : coupon.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleOpenDelete(coupon)}
                            title="Delete coupon"
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

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setDeletingCoupon(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon "${deletingCoupon?.code}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default Coupons;
