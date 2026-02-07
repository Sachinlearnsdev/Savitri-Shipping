import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Pagination from '../../components/common/Pagination';
import useUIStore from '../../store/uiStore';
import { getAllPartyBookings, createPartyBooking } from '../../services/partyBookings.service';
import { getAllPartyBoats } from '../../services/partyBoats.service';
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_MODE,
  PAYMENT_MODE_LABELS,
  TIME_SLOT_LABELS,
  EVENT_TYPE_LABELS,
  LOCATION_TYPE_LABELS,
  CURRENCY,
  DEFAULT_PAGE_SIZE,
} from '../../utils/constants';
import styles from './PartyBookings.module.css';

const bookingStatusOptions = [
  { value: '', label: 'All Statuses' },
  ...Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const paymentStatusOptions = [
  { value: '', label: 'All Payments' },
  ...Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const paymentModeOptions = Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => ({ value, label }));
const timeSlotOptions = Object.entries(TIME_SLOT_LABELS).map(([value, label]) => ({ value, label }));
const eventTypeOptions = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const locationTypeOptions = Object.entries(LOCATION_TYPE_LABELS).map(([value, label]) => ({ value, label }));

const PartyBookings = () => {
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
  const [boatFilter, setBoatFilter] = useState('');

  // Boats for selection
  const [availableBoats, setAvailableBoats] = useState([]);
  const [boatsLoading, setBoatsLoading] = useState(false);
  const [selectedBoat, setSelectedBoat] = useState(null);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    boatId: '',
    date: '',
    timeSlot: '',
    eventType: '',
    numberOfGuests: '',
    locationType: '',
    paymentMode: PAYMENT_MODE.AT_VENUE,
    adminNotes: '',
    adminOverrideAmount: '',
  });
  const [selectedAddOns, setSelectedAddOns] = useState({});

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: pageSize };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      if (dateFilter) params.date = dateFilter;
      if (boatFilter) params.boatId = boatFilter;

      const response = await getAllPartyBookings(params);
      if (response.success) {
        setBookings(response.data?.items || response.data || []);
        const pagination = response.data?.pagination || response.pagination || {};
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load party bookings');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusFilter, paymentFilter, dateFilter, boatFilter]);

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
      const response = await getAllPartyBoats({ status: 'ACTIVE', limit: 100 });
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

  // Fetch boats for filter dropdown on mount
  useEffect(() => {
    fetchAvailableBoats();
  }, []);

  const handleOpenCreate = () => {
    setCreateForm({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      boatId: '',
      date: '',
      timeSlot: '',
      eventType: '',
      numberOfGuests: '',
      locationType: '',
      paymentMode: PAYMENT_MODE.AT_VENUE,
      adminNotes: '',
      adminOverrideAmount: '',
    });
    setSelectedAddOns({});
    setSelectedBoat(null);
    if (availableBoats.length === 0) {
      fetchAvailableBoats();
    }
    setShowCreateModal(true);
  };

  const handleCreateChange = (field, value) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));

    // When boat changes, update selectedBoat and reset add-ons
    if (field === 'boatId') {
      const boat = availableBoats.find((b) => (b.id || b._id) === value);
      setSelectedBoat(boat || null);
      setSelectedAddOns({});
      // Reset location type if boat doesn't support current selection
      if (boat && createForm.locationType) {
        if (!(boat.locationOptions || []).includes(createForm.locationType)) {
          setCreateForm((prev) => ({ ...prev, locationType: '' }));
        }
      }
      // Reset time slot if boat doesn't support current selection
      if (boat && createForm.timeSlot) {
        if (!(boat.timeSlots || []).includes(createForm.timeSlot)) {
          setCreateForm((prev) => ({ ...prev, timeSlot: '' }));
        }
      }
    }
  };

  const handleAddOnToggle = (addonType) => {
    setSelectedAddOns((prev) => {
      const updated = { ...prev };
      if (updated[addonType]) {
        delete updated[addonType];
      } else {
        updated[addonType] = true;
      }
      return updated;
    });
  };

  const handleCreateSubmit = async () => {
    if (!createForm.customerName || !createForm.customerPhone) {
      showError('Please provide customer name and phone');
      return;
    }
    if (!createForm.boatId || !createForm.date || !createForm.timeSlot || !createForm.eventType || !createForm.numberOfGuests || !createForm.locationType) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const addOns = Object.keys(selectedAddOns).map((type) => ({
        type,
        quantity: 1,
      }));

      const payload = {
        customerName: createForm.customerName,
        customerPhone: createForm.customerPhone,
        boatId: createForm.boatId,
        date: createForm.date,
        timeSlot: createForm.timeSlot,
        eventType: createForm.eventType,
        numberOfGuests: Number(createForm.numberOfGuests),
        locationType: createForm.locationType,
        paymentMode: createForm.paymentMode,
        selectedAddOns: addOns,
      };
      if (createForm.customerEmail) payload.customerEmail = createForm.customerEmail;
      if (createForm.adminNotes) payload.adminNotes = createForm.adminNotes;
      if (createForm.adminOverrideAmount) payload.adminOverrideAmount = Number(createForm.adminOverrideAmount);

      const response = await createPartyBooking(payload);
      if (response.success) {
        showSuccess('Party booking created successfully');
        setShowCreateModal(false);
        fetchBookings();
      }
    } catch (err) {
      showError(err.message || 'Failed to create party booking');
    } finally {
      setSaving(false);
    }
  };

  const handleRowClick = (booking) => {
    navigate(`/party-bookings/${booking.id || booking._id}`);
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

  // Filter options for boats
  const boatFilterOptions = [
    { value: '', label: 'All Boats' },
    ...availableBoats.map((boat) => ({
      value: boat.id || boat._id,
      label: boat.name,
    })),
  ];

  // Boat dropdown options for create modal
  const boatSelectOptions = availableBoats.map((boat) => ({
    value: boat.id || boat._id,
    label: `${boat.name} (${boat.capacityMin}-${boat.capacityMax} guests, ${formatCurrency(boat.basePrice)})`,
  }));

  // Filtered location/time slot options based on selected boat
  const filteredLocationOptions = selectedBoat
    ? locationTypeOptions.filter((opt) => (selectedBoat.locationOptions || []).includes(opt.value))
    : locationTypeOptions;

  const filteredTimeSlotOptions = selectedBoat
    ? timeSlotOptions.filter((opt) => (selectedBoat.timeSlots || []).includes(opt.value))
    : timeSlotOptions;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Party Boat Bookings</h1>
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
        <select
          className={styles.filterSelect}
          value={boatFilter}
          onChange={(e) => { setBoatFilter(e.target.value); setPage(1); }}
        >
          {boatFilterOptions.map((opt) => (
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
            <p>No party bookings found.</p>
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
                  <th>Boat</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Event</th>
                  <th>Guests</th>
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
                    <td>{booking.boatId?.name || '-'}</td>
                    <td>{formatDate(booking.date)}</td>
                    <td>
                      <Badge variant="info">
                        {TIME_SLOT_LABELS[booking.timeSlot] || booking.timeSlot || '-'}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant="default">
                        {EVENT_TYPE_LABELS[booking.eventType] || booking.eventType || '-'}
                      </Badge>
                    </td>
                    <td>{booking.numberOfGuests || '-'}</td>
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

      {/* Create Party Booking Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Party Booking"
        size="lg"
      >
        <div className={styles.form}>
          {/* Customer Info */}
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

          {/* Boat Selection */}
          <Select
            label="Party Boat"
            options={boatSelectOptions}
            value={createForm.boatId}
            onChange={(value) => handleCreateChange('boatId', value)}
            placeholder={boatsLoading ? 'Loading boats...' : 'Select a party boat'}
            required
          />

          {/* Date & Event Details */}
          <div className={styles.formRow}>
            <Input
              label="Event Date"
              type="date"
              value={createForm.date}
              onChange={(e) => handleCreateChange('date', e.target.value)}
              required
            />
            <Select
              label="Time Slot"
              options={filteredTimeSlotOptions}
              value={createForm.timeSlot}
              onChange={(value) => handleCreateChange('timeSlot', value)}
              placeholder="Select time slot"
              required
            />
          </div>

          <div className={styles.formRow}>
            <Select
              label="Event Type"
              options={eventTypeOptions}
              value={createForm.eventType}
              onChange={(value) => handleCreateChange('eventType', value)}
              placeholder="Select event type"
              required
            />
            <Input
              label="Number of Guests"
              type="number"
              placeholder={selectedBoat ? `${selectedBoat.capacityMin}-${selectedBoat.capacityMax}` : 'e.g. 50'}
              value={createForm.numberOfGuests}
              onChange={(e) => handleCreateChange('numberOfGuests', e.target.value)}
              hint={selectedBoat ? `Capacity: ${selectedBoat.capacityMin}-${selectedBoat.capacityMax} guests` : ''}
              required
            />
          </div>

          <Select
            label="Location Type"
            options={filteredLocationOptions}
            value={createForm.locationType}
            onChange={(value) => handleCreateChange('locationType', value)}
            placeholder="Select location"
            required
          />

          {/* Add-ons */}
          {selectedBoat && (selectedBoat.addOns || []).length > 0 && (
            <div className={styles.addOnSelection}>
              <label className={styles.addOnLabel}>
                Add-ons (optional)
                {Object.keys(selectedAddOns).length > 0 && (
                  <span className={styles.addOnCount}>({Object.keys(selectedAddOns).length} selected)</span>
                )}
              </label>
              <div className={styles.addOnList}>
                {selectedBoat.addOns.map((addon) => {
                  const isSelected = !!selectedAddOns[addon.type];
                  return (
                    <label
                      key={addon.type}
                      className={`${styles.addOnItem} ${isSelected ? styles.addOnItemSelected : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleAddOnToggle(addon.type)}
                        className={styles.addOnCheckbox}
                      />
                      <div className={styles.addOnInfo}>
                        <span className={styles.addOnName}>{addon.label}</span>
                        <span className={styles.addOnPrice}>
                          {formatCurrency(addon.price)}
                          {addon.priceType === 'PER_PERSON' ? '/person' : ' (fixed)'}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment & Notes */}
          <div className={styles.formRow}>
            <Select
              label="Payment Mode"
              options={paymentModeOptions}
              value={createForm.paymentMode}
              onChange={(value) => handleCreateChange('paymentMode', value)}
            />
            <Input
              label="Override Amount (optional)"
              type="number"
              placeholder="Leave blank for auto-calculation"
              value={createForm.adminOverrideAmount}
              onChange={(e) => handleCreateChange('adminOverrideAmount', e.target.value)}
              hint="Override the calculated total amount"
            />
          </div>

          <Textarea
            label="Admin Notes (optional)"
            placeholder="Internal notes about this booking..."
            value={createForm.adminNotes}
            onChange={(e) => handleCreateChange('adminNotes', e.target.value)}
            rows={3}
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

export default PartyBookings;
