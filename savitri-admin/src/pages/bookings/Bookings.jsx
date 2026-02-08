import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Pagination from '../../components/common/Pagination';
import useUIStore from '../../store/uiStore';
import { getAllBookings, createBooking, calculatePrice } from '../../services/bookings.service';
import { getAllBoats } from '../../services/speedBoats.service';
import {
  BOOKING_STATUS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_MODE,
  PAYMENT_MODE_LABELS,
  DEFAULT_PAGE_SIZE,
  CURRENCY,
} from '../../utils/constants';
import styles from './Bookings.module.css';

const bookingStatusOptions = [
  { value: '', label: 'All Statuses' },
  ...Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const paymentStatusOptions = [
  { value: '', label: 'All Payments' },
  ...Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const paymentModeOptions = Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => ({ value, label }));

const Bookings = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useUIStore();

  // List state
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Boats for selection
  const [availableBoats, setAvailableBoats] = useState([]);
  const [selectedBoatIds, setSelectedBoatIds] = useState([]);
  const [boatsLoading, setBoatsLoading] = useState(false);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    date: '',
    startTime: '',
    duration: '1',
    paymentMode: PAYMENT_MODE.AT_VENUE,
    adminNotes: '',
    adminOverrideAmount: '',
  });

  // Price calculator
  const [priceData, setPriceData] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState(null);
  const priceTimerRef = useRef(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: pageSize };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      if (dateFilter) params.date = dateFilter;

      const response = await getAllBookings(params);
      if (response.success) {
        setBookings(response.data?.items || response.data || []);
        const pagination = response.data?.pagination || response.pagination || {};
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, paymentFilter, dateFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAvailableBoats = async () => {
    try {
      setBoatsLoading(true);
      const response = await getAllBoats({ status: 'ACTIVE', limit: 100 });
      if (response.success) {
        const boats = response.data?.items || response.data || [];
        setAvailableBoats(boats);
      }
    } catch {
      setAvailableBoats([]);
    } finally {
      setBoatsLoading(false);
    }
  };

  // Live price calculation with debounce
  useEffect(() => {
    const { date, startTime, duration } = createForm;
    const numBoats = selectedBoatIds.length;

    // Clear previous timer
    if (priceTimerRef.current) {
      clearTimeout(priceTimerRef.current);
    }

    // Only calculate if all required fields are filled
    if (!date || !startTime || !duration || numBoats === 0) {
      setPriceData(null);
      setPriceError(null);
      return;
    }

    const parsedDuration = Number(duration);
    if (isNaN(parsedDuration) || parsedDuration < 0.5) {
      setPriceData(null);
      setPriceError(null);
      return;
    }

    priceTimerRef.current = setTimeout(async () => {
      try {
        setPriceLoading(true);
        setPriceError(null);
        const response = await calculatePrice({
          date,
          startTime,
          duration: parsedDuration,
          numberOfBoats: numBoats,
        });
        if (response.success) {
          setPriceData(response.data);
        }
      } catch (err) {
        setPriceError(err.message || 'Failed to calculate price');
        setPriceData(null);
      } finally {
        setPriceLoading(false);
      }
    }, 500);

    return () => {
      if (priceTimerRef.current) {
        clearTimeout(priceTimerRef.current);
      }
    };
  }, [createForm.date, createForm.startTime, createForm.duration, selectedBoatIds.length]);

  const handleOpenCreate = () => {
    setCreateForm({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      date: '',
      startTime: '',
      duration: '1',
      paymentMode: PAYMENT_MODE.AT_VENUE,
      adminNotes: '',
      adminOverrideAmount: '',
    });
    setSelectedBoatIds([]);
    setPriceData(null);
    setPriceError(null);
    fetchAvailableBoats();
    setShowCreateModal(true);
  };

  const handleBoatToggle = (boatId) => {
    setSelectedBoatIds((prev) =>
      prev.includes(boatId)
        ? prev.filter((id) => id !== boatId)
        : [...prev, boatId]
    );
  };

  const handleCreateChange = (field, value) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateSubmit = async () => {
    if (!createForm.customerName || !createForm.customerPhone || !createForm.date || !createForm.startTime) {
      showError('Please fill in all required fields');
      return;
    }
    if (selectedBoatIds.length === 0) {
      showError('Please select at least one boat');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        customerName: createForm.customerName,
        customerPhone: createForm.customerPhone,
        date: createForm.date,
        startTime: createForm.startTime,
        duration: Number(createForm.duration),
        numberOfBoats: selectedBoatIds.length,
        paymentMode: createForm.paymentMode,
      };
      if (createForm.customerEmail) payload.customerEmail = createForm.customerEmail;
      if (createForm.adminNotes) payload.adminNotes = createForm.adminNotes;
      if (createForm.adminOverrideAmount !== '' && createForm.adminOverrideAmount !== null) {
        payload.adminOverrideAmount = Number(createForm.adminOverrideAmount);
      }

      const response = await createBooking(payload);
      if (response.success) {
        showSuccess('Booking created successfully');
        setShowCreateModal(false);
        fetchBookings();
      }
    } catch (err) {
      showError(err.message || 'Failed to create booking');
    } finally {
      setSaving(false);
    }
  };

  const handleRowClick = (booking) => {
    navigate(`/bookings/${booking.id || booking._id}`);
  };

  const formatCurrency = (amount) => {
    if (amount == null) return `${CURRENCY.SYMBOL}0`;
    return `${CURRENCY.SYMBOL}${Number(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Bookings</h1>
        <Button onClick={handleOpenCreate}>Create Booking</Button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by booking #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          {bookingStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
        >
          {paymentStatusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          type="date"
          className={styles.filterDate}
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="outline" onClick={fetchBookings}>Retry</Button>
        </div>
      ) : bookings.length === 0 ? (
        <div className={styles.tableCard}>
          <div className={styles.empty}>
            <p>No bookings found.</p>
            <Button onClick={handleOpenCreate}>Create First Booking</Button>
          </div>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Booking #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Boats</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id || booking._id}
                    onClick={() => handleRowClick(booking)}
                  >
                    <td className={styles.bookingNumber}>
                      {booking.bookingNumber || booking.id || booking._id}
                    </td>
                    <td className={styles.customerName}>
                      {booking.customerId?.name || booking.customerName || '-'}
                    </td>
                    <td>{formatDate(booking.date)}</td>
                    <td>{booking.startTime || '-'}</td>
                    <td>
                      {booking.numberOfBoats || '-'}
                    </td>
                    <td className={styles.amount}>
                      {formatCurrency(booking.pricing?.finalAmount || booking.pricing?.totalAmount)}
                    </td>
                    <td>
                      <Badge variant={BOOKING_STATUS_COLORS[booking.status] || 'default'}>
                        {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={PAYMENT_STATUS_COLORS[booking.paymentStatus] || 'default'}>
                        {PAYMENT_STATUS_LABELS[booking.paymentStatus] || booking.paymentStatus || '-'}
                      </Badge>
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

      {/* Create Booking Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Booking"
        size="lg"
      >
        <div className={styles.form}>
          <div className={styles.formRow}>
            <Input
              label="Customer Name"
              placeholder="Full name"
              value={createForm.customerName}
              onChange={(e) => handleCreateChange('customerName', e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              placeholder="10-digit phone"
              value={createForm.customerPhone}
              onChange={(e) => handleCreateChange('customerPhone', e.target.value)}
              required
            />
          </div>
          <Input
            label="Email (optional)"
            type="email"
            placeholder="customer@example.com"
            value={createForm.customerEmail}
            onChange={(e) => handleCreateChange('customerEmail', e.target.value)}
          />
          <div className={styles.formRow}>
            <Input
              label="Date"
              type="date"
              value={createForm.date}
              onChange={(e) => handleCreateChange('date', e.target.value)}
              required
            />
            <Input
              label="Start Time"
              type="time"
              value={createForm.startTime}
              onChange={(e) => handleCreateChange('startTime', e.target.value)}
              required
            />
          </div>
          <Input
            label="Duration (hours)"
            type="number"
            placeholder="e.g. 1.5"
            value={createForm.duration}
            onChange={(e) => handleCreateChange('duration', e.target.value)}
            hint="Minimum 0.5 hours (30 min)"
            required
          />
          <div className={styles.boatSelection}>
            <label className={styles.boatSelectionLabel}>
              Select Boats <span className={styles.required}>*</span>
              {selectedBoatIds.length > 0 && (
                <span className={styles.boatCount}>({selectedBoatIds.length} selected)</span>
              )}
            </label>
            {boatsLoading ? (
              <div className={styles.boatListLoading}>Loading boats...</div>
            ) : availableBoats.length === 0 ? (
              <div className={styles.boatListEmpty}>No active boats available</div>
            ) : (
              <div className={styles.boatList}>
                {availableBoats.map((boat) => {
                  const boatId = boat.id || boat._id;
                  const isSelected = selectedBoatIds.includes(boatId);
                  return (
                    <label
                      key={boatId}
                      className={`${styles.boatItem} ${isSelected ? styles.boatItemSelected : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleBoatToggle(boatId)}
                        className={styles.boatCheckbox}
                      />
                      <div className={styles.boatInfo}>
                        <span className={styles.boatName}>{boat.name}</span>
                        <span className={styles.boatMeta}>
                          {boat.registrationNumber} &middot; {boat.capacity} passengers &middot; {CURRENCY.SYMBOL}{boat.baseRate}/hr
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          {/* Live Price Breakdown */}
          {(priceLoading || priceData || priceError) && (
            <div className={styles.priceBreakdown}>
              <h4 className={styles.priceBreakdownTitle}>Price Breakdown</h4>
              {priceLoading ? (
                <div className={styles.priceLoading}>Calculating price...</div>
              ) : priceError ? (
                <div className={styles.priceError}>{priceError}</div>
              ) : priceData ? (
                <>
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>Base Rate (per boat/hr)</span>
                    <span className={styles.priceValue}>{formatCurrency(priceData.baseRate)}</span>
                  </div>
                  {priceData.appliedRule && (
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}>
                        Rule: {priceData.appliedRule.name} ({priceData.appliedRule.adjustmentPercent >= 0 ? '+' : ''}{priceData.appliedRule.adjustmentPercent}%)
                      </span>
                      <span className={styles.priceValue}>{formatCurrency(priceData.adjustedRate)}/hr</span>
                    </div>
                  )}
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>
                      Subtotal ({priceData.numberOfBoats} boat{priceData.numberOfBoats > 1 ? 's' : ''} x {priceData.duration} hr{priceData.duration > 1 ? 's' : ''})
                    </span>
                    <span className={styles.priceValue}>{formatCurrency(priceData.subtotal)}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>GST ({priceData.gstPercent}%)</span>
                    <span className={styles.priceValue}>{formatCurrency(priceData.gstAmount)}</span>
                  </div>
                  <hr className={styles.priceDivider} />
                  <div className={styles.priceRow}>
                    <span className={styles.priceTotalLabel}>Total Amount</span>
                    <span className={styles.priceTotalValue}>{formatCurrency(priceData.totalAmount)}</span>
                  </div>
                  {createForm.adminOverrideAmount !== '' && Number(createForm.adminOverrideAmount) >= 0 && (
                    <div className={styles.priceFinalRow}>
                      <span className={styles.priceFinalLabel}>Final (Override)</span>
                      <span className={styles.priceFinalValue}>{formatCurrency(Number(createForm.adminOverrideAmount))}</span>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}
          <Input
            label="Override Amount (optional)"
            type="number"
            placeholder="Leave empty to use calculated total"
            value={createForm.adminOverrideAmount}
            onChange={(e) => handleCreateChange('adminOverrideAmount', e.target.value)}
            hint={createForm.adminOverrideAmount !== '' ? 'This amount will replace the calculated total' : 'Set a custom amount to override the calculated price'}
          />
          <Select
            label="Payment Mode"
            options={paymentModeOptions}
            value={createForm.paymentMode}
            onChange={(value) => handleCreateChange('paymentMode', value)}
          />
          <div className={styles.formActions}>
            <Button variant="ghost" onClick={() => setShowCreateModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} loading={saving}>
              Create Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Bookings;
