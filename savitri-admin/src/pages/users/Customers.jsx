import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useUIStore from '../../store/uiStore';
import { getAllCustomers, updateCustomerStatus } from '../../services/customers.service';
import {
  USER_STATUS,
  USER_STATUS_LABELS,
  USER_STATUS_COLORS,
  DEFAULT_PAGE_SIZE,
} from '../../utils/constants';
import styles from './Customers.module.css';

const filterStatusOptions = [
  { value: '', label: 'All Statuses' },
  { value: USER_STATUS.ACTIVE, label: 'Active' },
  { value: USER_STATUS.INACTIVE, label: 'Inactive' },
  { value: USER_STATUS.LOCKED, label: 'Locked' },
];

const statusChangeOptions = [
  { value: USER_STATUS.ACTIVE, label: 'Active' },
  { value: USER_STATUS.INACTIVE, label: 'Inactive' },
  { value: USER_STATUS.LOCKED, label: 'Locked' },
];

const Customers = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useUIStore();

  // List state
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Status change state
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusCustomer, setStatusCustomer] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: pageSize };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await getAllCustomers(params);
      if (response.success) {
        setCustomers(response.data?.items || response.data || []);
        const pagination = response.data?.pagination || response.pagination || {};
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleRowClick = (customer) => {
    navigate(`/users/customers/${customer.id || customer._id}`);
  };

  const handleOpenStatusChange = (e, customer) => {
    e.stopPropagation();
    setStatusCustomer(customer);
    // Pre-select a different status than current
    const currentStatus = customer.status || USER_STATUS.ACTIVE;
    const nextStatus = statusChangeOptions.find((opt) => opt.value !== currentStatus);
    setNewStatus(nextStatus ? nextStatus.value : USER_STATUS.ACTIVE);
    setShowStatusDialog(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!statusCustomer || !newStatus) return;
    try {
      setUpdatingStatus(true);
      await updateCustomerStatus(statusCustomer.id || statusCustomer._id, newStatus);
      showSuccess(`Customer status updated to ${USER_STATUS_LABELS[newStatus]}`);
      setShowStatusDialog(false);
      setStatusCustomer(null);
      setNewStatus('');
      fetchCustomers();
    } catch (err) {
      showError(err.message || 'Failed to update customer status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Customers</h1>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name, email, or phone..."
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
          <Button variant="outline" onClick={fetchCustomers}>Retry</Button>
        </div>
      ) : customers.length === 0 ? (
        <div className={styles.tableCard}>
          <div className={styles.empty}>
            <p>No customers found.</p>
          </div>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Bookings</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id || customer._id}
                    onClick={() => handleRowClick(customer)}
                  >
                    <td className={styles.customerName}>
                      {customer.name || '-'}
                    </td>
                    <td>
                      {customer.email || '-'}
                      <span className={customer.emailVerified ? styles.verified : styles.notVerified}>
                        {customer.emailVerified ? ' \u2713' : ' \u2717'}
                      </span>
                    </td>
                    <td>
                      {customer.phone || '-'}
                      <span className={customer.phoneVerified ? styles.verified : styles.notVerified}>
                        {customer.phoneVerified ? ' \u2713' : ' \u2717'}
                      </span>
                    </td>
                    <td>
                      <Badge variant={USER_STATUS_COLORS[customer.status] || 'default'}>
                        {USER_STATUS_LABELS[customer.status] || customer.status}
                      </Badge>
                    </td>
                    <td>{customer.bookingCount ?? customer.totalBookings ?? 0}</td>
                    <td>{formatDate(customer.createdAt)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={`${styles.actionBtn} ${styles.viewBtn}`}
                          onClick={(e) => { e.stopPropagation(); handleRowClick(customer); }}
                          title="View customer details"
                        >
                          View
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.viewBtn}`}
                          onClick={(e) => handleOpenStatusChange(e, customer)}
                          title="Change customer status"
                        >
                          Change Status
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

      {/* Status Change Confirm Dialog */}
      {showStatusDialog && (
        <ConfirmDialog
          isOpen={showStatusDialog}
          onClose={() => { setShowStatusDialog(false); setStatusCustomer(null); setNewStatus(''); }}
          onConfirm={handleConfirmStatusChange}
          title="Change Customer Status"
          message={
            <div>
              <p style={{ marginBottom: 'var(--spacing-3)' }}>
                Change status for <strong>{statusCustomer?.name}</strong>:
              </p>
              <select
                className={styles.filterSelect}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{ width: '100%' }}
              >
                {statusChangeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          }
          confirmText="Update Status"
          variant="primary"
          loading={updatingStatus}
        />
      )}
    </div>
  );
};

export default Customers;
