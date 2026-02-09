import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import useUIStore from '../../store/uiStore';
import { getCustomerById, getCustomerBookings, updateCustomerStatus, toggleVenuePayment } from '../../services/customers.service';
import {
  USER_STATUS,
  USER_STATUS_LABELS,
  USER_STATUS_COLORS,
  BOOKING_STATUS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  CURRENCY,
  DEFAULT_PAGE_SIZE,
} from '../../utils/constants';
import styles from './CustomerDetail.module.css';

const statusChangeOptions = [
  { value: USER_STATUS.ACTIVE, label: 'Active' },
  { value: USER_STATUS.INACTIVE, label: 'Inactive' },
  { value: USER_STATUS.LOCKED, label: 'Locked' },
];

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useUIStore();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsTotalPages, setBookingsTotalPages] = useState(1);
  const [bookingsTotalItems, setBookingsTotalItems] = useState(0);
  const [bookingsPageSize, setBookingsPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Status change state
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Venue payment state
  const [venuePaymentAllowed, setVenuePaymentAllowed] = useState(false);
  const [updatingVenuePayment, setUpdatingVenuePayment] = useState(false);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCustomerById(id);
      if (response.success) {
        setCustomer(response.data);
        setSelectedStatus(response.data.status || USER_STATUS.ACTIVE);
        setVenuePaymentAllowed(response.data.venuePaymentAllowed || false);
      }
    } catch (err) {
      setError(err.message || 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = useCallback(async () => {
    try {
      setBookingsLoading(true);
      const response = await getCustomerBookings(id, {
        page: bookingsPage,
        limit: bookingsPageSize,
      });
      if (response.success) {
        setBookings(response.data?.items || response.data || []);
        const pagination = response.data?.pagination || response.pagination || {};
        setBookingsTotalPages(pagination.totalPages || 1);
        setBookingsTotalItems(pagination.total || 0);
      }
    } catch {
      // Bookings may not exist yet, silently handle
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [id, bookingsPage, bookingsPageSize]);

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchBookings();
    }
  }, [fetchBookings]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount) => {
    if (amount == null) return `${CURRENCY.SYMBOL}0`;
    return `${CURRENCY.SYMBOL}${Number(amount).toLocaleString('en-IN')}`;
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === customer.status) {
      showError('Please select a different status');
      return;
    }
    try {
      setUpdatingStatus(true);
      await updateCustomerStatus(id, selectedStatus);
      showSuccess(`Customer status updated to ${USER_STATUS_LABELS[selectedStatus]}`);
      fetchCustomer();
    } catch (err) {
      showError(err.message || 'Failed to update customer status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleVenuePaymentToggle = async () => {
    try {
      setUpdatingVenuePayment(true);
      const newValue = !venuePaymentAllowed;
      await toggleVenuePayment(id, newValue);
      setVenuePaymentAllowed(newValue);
      showSuccess(`Venue payment ${newValue ? 'enabled' : 'disabled'} for this customer`);
    } catch (err) {
      showError(err.message || 'Failed to update venue payment setting');
    } finally {
      setUpdatingVenuePayment(false);
    }
  };

  const handleBookingRowClick = (booking) => {
    navigate(`/bookings/${booking.id || booking._id}`);
  };

  // Calculate stats from bookings or customer data
  const totalBookings = customer?.bookingCount ?? customer?.totalBookings ?? bookingsTotalItems ?? 0;
  const completedTrips = customer?.completedBookings ??
    bookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED).length;
  const totalSpent = customer?.totalSpent ??
    bookings
      .filter((b) => b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + (Number(b.pricing?.finalAmount) || Number(b.pricing?.totalAmount) || 0), 0);

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
          <Button variant="outline" onClick={() => navigate('/users/customers')}>
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Customer not found</p>
          <Button variant="outline" onClick={() => navigate('/users/customers')}>
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  const initials = (customer.name || '?').charAt(0).toUpperCase();

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backBtn} onClick={() => navigate('/users/customers')}>
        &larr; Back to Customers
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{customer.name || 'Customer'}</h1>
          <Badge variant={USER_STATUS_COLORS[customer.status] || 'default'} size="lg">
            {USER_STATUS_LABELS[customer.status] || customer.status}
          </Badge>
        </div>
      </div>

      {/* Cards Grid */}
      <div className={styles.cardsGrid}>
        {/* Customer Info Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Customer Information</h2>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Name</span>
              <span className={styles.infoValue}>{customer.name || '-'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>
                {customer.email || '-'}
                <span className={customer.emailVerified ? styles.verified : styles.notVerified}>
                  {customer.emailVerified ? ' \u2713' : ' \u2717'}
                </span>
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Phone</span>
              <span className={styles.infoValue}>
                {customer.phone || '-'}
                <span className={customer.phoneVerified ? styles.verified : styles.notVerified}>
                  {customer.phoneVerified ? ' \u2713' : ' \u2717'}
                </span>
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status</span>
              <span className={styles.infoValue}>
                <Badge variant={USER_STATUS_COLORS[customer.status] || 'default'}>
                  {USER_STATUS_LABELS[customer.status] || customer.status}
                </Badge>
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Member Since</span>
              <span className={styles.infoValue}>{formatDate(customer.createdAt)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Last Login</span>
              <span className={styles.infoValue}>{formatDate(customer.lastLoginAt || customer.lastLogin)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email Notifications</span>
              <span className={styles.infoValue}>
                {customer.preferences?.emailNotifications ?? customer.emailNotifications ? 'On' : 'Off'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>SMS Notifications</span>
              <span className={styles.infoValue}>
                {customer.preferences?.smsNotifications ?? customer.smsNotifications ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Statistics</h2>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <p className={styles.statValue}>{totalBookings}</p>
              <p className={styles.statLabel}>Total Bookings</p>
            </div>
            <div className={styles.statItem}>
              <p className={styles.statValue}>{completedTrips}</p>
              <p className={styles.statLabel}>Completed Trips</p>
            </div>
            <div className={styles.statItem}>
              <p className={styles.statValue}>{formatCurrency(totalSpent)}</p>
              <p className={styles.statLabel}>Total Spent</p>
            </div>
          </div>

          {/* Completed Rides Count */}
          <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--border-color)' }}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Completed Rides</span>
                <span className={styles.infoValue}>{customer.completedRidesCount || 0}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Venue Payment Eligible</span>
                <span className={styles.infoValue}>
                  {(customer.venuePaymentAllowed || (customer.completedRidesCount || 0) >= 5) ? 'Yes' : 'No (needs 5+ rides)'}
                </span>
              </div>
            </div>
          </div>

          {/* Venue Payment Toggle */}
          <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-secondary)' }}>
              Allow Venue Payment:
            </span>
            <button
              onClick={handleVenuePaymentToggle}
              disabled={updatingVenuePayment}
              style={{
                padding: 'var(--spacing-1) var(--spacing-3)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid',
                borderColor: venuePaymentAllowed ? 'var(--color-success-500, #22c55e)' : 'var(--border-color)',
                backgroundColor: venuePaymentAllowed ? 'var(--color-success-50, #f0fdf4)' : 'var(--bg-primary)',
                color: venuePaymentAllowed ? 'var(--color-success-700, #15803d)' : 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: updatingVenuePayment ? 'not-allowed' : 'pointer',
                opacity: updatingVenuePayment ? 0.6 : 1,
              }}
            >
              {updatingVenuePayment ? 'Updating...' : (venuePaymentAllowed ? 'Enabled' : 'Disabled')}
            </button>
          </div>
        </div>

        {/* Booking History Card - Full Width */}
        <div className={`${styles.card} ${styles.cardFull}`}>
          <h2 className={styles.cardTitle}>Booking History</h2>
          {bookingsLoading ? (
            <div className={styles.loading}>Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: 'var(--spacing-8) 0' }}>
              No bookings found for this customer.
            </p>
          ) : (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Booking #</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Boat</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr
                        key={booking.id || booking._id}
                        onClick={() => handleBookingRowClick(booking)}
                      >
                        <td>{booking.bookingNumber || booking.id || booking._id}</td>
                        <td>{formatDate(booking.date)}</td>
                        <td>{booking.startTime || '-'}</td>
                        <td>{booking.numberOfBoats || '-'}</td>
                        <td>{formatCurrency(booking.pricing?.finalAmount || booking.pricing?.totalAmount)}</td>
                        <td>
                          <Badge variant={BOOKING_STATUS_COLORS[booking.status] || 'default'}>
                            {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                          </Badge>
                        </td>
                        <td>
                          <Badge variant={PAYMENT_STATUS_COLORS[booking.paymentStatus] || 'default'}>
                            {PAYMENT_STATUS_LABELS[booking.paymentStatus] || booking.paymentStatus || 'Pending'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {bookingsTotalPages > 1 && (
                <div className={styles.paginationWrapper}>
                  <Pagination
                    currentPage={bookingsPage}
                    totalPages={bookingsTotalPages}
                    totalItems={bookingsTotalItems}
                    pageSize={bookingsPageSize}
                    onPageChange={setBookingsPage}
                    onPageSizeChange={(size) => { setBookingsPageSize(size); setBookingsPage(1); }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Actions Bar */}
      <div className={styles.actionsBar}>
        <span className={styles.actionsLabel}>Change Status:</span>
        <select
          className={styles.filterSelect}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          {statusChangeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <Button
          onClick={handleStatusUpdate}
          loading={updatingStatus}
          disabled={selectedStatus === customer.status}
          size="sm"
        >
          Update Status
        </Button>
      </div>
    </div>
  );
};

export default CustomerDetail;
