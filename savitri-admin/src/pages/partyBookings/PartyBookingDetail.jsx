import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import useUIStore from '../../store/uiStore';
import {
  getPartyBookingById,
  updatePartyBookingStatus,
  markPartyBookingPaid,
  cancelPartyBooking,
} from '../../services/partyBookings.service';
import {
  BOOKING_STATUS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_MODE_LABELS,
  TIME_SLOT_LABELS,
  EVENT_TYPE_LABELS,
  LOCATION_TYPE_LABELS,
  ADD_ON_TYPE_LABELS,
  PRICE_TYPE_LABELS,
  CURRENCY,
} from '../../utils/constants';
import styles from './PartyBookingDetail.module.css';

const paymentModeOptions = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'AT_VENUE', label: 'At Venue' },
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CARD', label: 'Card' },
];

const PartyBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useUIStore();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Cancel modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Mark paid modal
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [paidMode, setPaidMode] = useState('AT_VENUE');
  const [markingPaid, setMarkingPaid] = useState(false);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPartyBookingById(id);
      if (response.success) {
        setBooking(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const handleStatusUpdate = async (status) => {
    try {
      setActionLoading(true);
      await updatePartyBookingStatus(id, status);
      showSuccess(`Booking ${BOOKING_STATUS_LABELS[status].toLowerCase()} successfully`);
      fetchBooking();
    } catch (err) {
      showError(err.message || 'Failed to update booking status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    try {
      setMarkingPaid(true);
      await markPartyBookingPaid(id, { paymentMode: paidMode });
      showSuccess('Booking marked as paid');
      setShowPaidModal(false);
      fetchBooking();
    } catch (err) {
      showError(err.message || 'Failed to mark booking as paid');
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      showError('Please provide a reason for cancellation');
      return;
    }
    try {
      setCancelling(true);
      await cancelPartyBooking(id, cancelReason);
      showSuccess('Booking cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      fetchBooking();
    } catch (err) {
      showError(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
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
          <Button variant="outline" onClick={() => navigate('/party-bookings')}>
            Back to Party Bookings
          </Button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Booking not found</p>
          <Button variant="outline" onClick={() => navigate('/party-bookings')}>
            Back to Party Bookings
          </Button>
        </div>
      </div>
    );
  }

  const canConfirm = booking.status === BOOKING_STATUS.PENDING;
  const canComplete = booking.status === BOOKING_STATUS.CONFIRMED;
  const canCancel = [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(booking.status);
  const canMarkPaid = booking.paymentStatus === PAYMENT_STATUS.PENDING;
  const canMarkNoShow = booking.status === BOOKING_STATUS.CONFIRMED;

  const addOns = booking.selectedAddOns || [];

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backBtn} onClick={() => navigate('/party-bookings')}>
        &larr; Back to Party Bookings
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            Booking #{booking.bookingNumber || booking.id || booking._id}
          </h1>
          <Badge variant={BOOKING_STATUS_COLORS[booking.status] || 'default'} size="lg">
            {BOOKING_STATUS_LABELS[booking.status] || booking.status}
          </Badge>
        </div>
      </div>

      {/* Cards */}
      <div className={styles.cardsGrid}>
        {/* Booking Info */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Booking Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Booking Number</span>
              <span className={styles.infoValue}>
                {booking.bookingNumber || booking.id || booking._id}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Boat</span>
              <span className={styles.infoValue}>{booking.boatId?.name || '-'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Event Date</span>
              <span className={styles.infoValue}>{formatDate(booking.date)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Time Slot</span>
              <Badge variant="info">
                {TIME_SLOT_LABELS[booking.timeSlot] || booking.timeSlot || '-'}
              </Badge>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Event Type</span>
              <Badge variant="default">
                {EVENT_TYPE_LABELS[booking.eventType] || booking.eventType || '-'}
              </Badge>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Number of Guests</span>
              <span className={styles.infoValue}>{booking.numberOfGuests || '-'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Location Type</span>
              <span className={styles.infoValue}>
                {LOCATION_TYPE_LABELS[booking.locationType] || booking.locationType || '-'}
              </span>
            </div>
            {booking.adminNotes && (
              <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
                <span className={styles.infoLabel}>Admin Notes</span>
                <span className={styles.infoValue}>{booking.adminNotes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Customer Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Name</span>
              <span className={styles.infoValue}>
                {booking.customerId?.name || '-'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>
                {booking.customerId?.email || '-'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Phone</span>
              <span className={styles.infoValue}>
                {booking.customerId?.phone || '-'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Payment Mode</span>
              <span className={styles.infoValue}>
                {PAYMENT_MODE_LABELS[booking.paymentMode] || booking.paymentMode || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Add-ons Breakdown */}
        {addOns.length > 0 && (
          <div className={`${styles.card} ${styles.cardFull}`}>
            <h2 className={styles.cardTitle}>Selected Add-ons</h2>
            <table className={styles.addOnsTable}>
              <thead>
                <tr>
                  <th>Add-on</th>
                  <th>Type</th>
                  <th>Unit Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {addOns.map((addon, index) => (
                  <tr key={index}>
                    <td>{addon.label || ADD_ON_TYPE_LABELS[addon.type] || addon.type}</td>
                    <td>{PRICE_TYPE_LABELS[addon.priceType] || addon.priceType}</td>
                    <td>{formatCurrency(addon.price)}</td>
                    <td>{addon.quantity || 1}</td>
                    <td className={styles.amount}>{formatCurrency(addon.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pricing Breakdown */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Pricing Breakdown</h2>
          <div className={styles.pricingList}>
            <div className={styles.pricingRow}>
              <span className={styles.pricingLabel}>Base Price</span>
              <span className={styles.pricingValue}>
                {formatCurrency(booking.pricing?.basePrice)}
              </span>
            </div>
            {(booking.pricing?.addOnsTotal > 0) && (
              <div className={styles.pricingRow}>
                <span className={styles.pricingLabel}>Add-ons Total</span>
                <span className={styles.pricingValue}>
                  {formatCurrency(booking.pricing.addOnsTotal)}
                </span>
              </div>
            )}
            <div className={styles.pricingRow}>
              <span className={styles.pricingLabel}>Subtotal</span>
              <span className={styles.pricingValue}>
                {formatCurrency(booking.pricing?.subtotal)}
              </span>
            </div>
            <div className={styles.pricingRow}>
              <span className={styles.pricingLabel}>
                GST ({booking.pricing?.gstPercent || 18}%)
              </span>
              <span className={styles.pricingValue}>
                {formatCurrency(booking.pricing?.gstAmount)}
              </span>
            </div>
            {booking.pricing?.cgst != null && (
              <div className={styles.pricingRow} style={{ paddingLeft: 'var(--spacing-4)' }}>
                <span className={styles.pricingLabel}>CGST ({(booking.pricing.gstPercent || 18) / 2}%)</span>
                <span className={styles.pricingValue}>{formatCurrency(booking.pricing.cgst)}</span>
              </div>
            )}
            {booking.pricing?.sgst != null && (
              <div className={styles.pricingRow} style={{ paddingLeft: 'var(--spacing-4)' }}>
                <span className={styles.pricingLabel}>SGST ({(booking.pricing.gstPercent || 18) / 2}%)</span>
                <span className={styles.pricingValue}>{formatCurrency(booking.pricing.sgst)}</span>
              </div>
            )}
            <hr className={styles.pricingDivider} />
            <div className={styles.pricingRow}>
              <span className={styles.pricingTotal}>Total Amount</span>
              <span className={styles.pricingTotalValue}>
                {formatCurrency(booking.pricing?.totalAmount)}
              </span>
            </div>
            {booking.pricing?.adminOverrideAmount != null && (
              <>
                <div className={styles.pricingRow}>
                  <span className={styles.pricingLabel}>Admin Override</span>
                  <span className={styles.pricingValue}>
                    {formatCurrency(booking.pricing.adminOverrideAmount)}
                  </span>
                </div>
                <div className={styles.pricingRow}>
                  <span className={styles.pricingTotal}>Final Amount</span>
                  <span className={styles.pricingTotalValue}>
                    {formatCurrency(booking.pricing.finalAmount)}
                  </span>
                </div>
              </>
            )}
            {booking.pricing?.adminOverrideAmount == null && (
              <div className={styles.pricingRow}>
                <span className={styles.pricingTotal}>Final Amount</span>
                <span className={styles.pricingTotalValue}>
                  {formatCurrency(booking.pricing?.finalAmount)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status & Actions */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Status & Actions</h2>
          <div className={styles.statusSection}>
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>Booking</span>
              <Badge variant={BOOKING_STATUS_COLORS[booking.status] || 'default'}>
                {BOOKING_STATUS_LABELS[booking.status] || booking.status}
              </Badge>
            </div>
            <div className={styles.statusRow}>
              <span className={styles.statusLabel}>Payment</span>
              <Badge variant={PAYMENT_STATUS_COLORS[booking.paymentStatus] || 'default'}>
                {PAYMENT_STATUS_LABELS[booking.paymentStatus] || booking.paymentStatus || 'Pending'}
              </Badge>
            </div>

            {booking.cancellation?.reason && (
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>Cancel Reason</span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                  {booking.cancellation.reason}
                </span>
              </div>
            )}
            {booking.cancellation?.refundPercent != null && (
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>Refund</span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                  {booking.cancellation.refundPercent}% ({formatCurrency(booking.cancellation.refundAmount)})
                </span>
              </div>
            )}

            <div className={styles.actionButtons}>
              {canConfirm && (
                <Button
                  onClick={() => handleStatusUpdate(BOOKING_STATUS.CONFIRMED)}
                  loading={actionLoading}
                  size="sm"
                >
                  Confirm Booking
                </Button>
              )}
              {canMarkPaid && (
                <Button
                  variant="secondary"
                  onClick={() => setShowPaidModal(true)}
                  size="sm"
                >
                  Mark as Paid
                </Button>
              )}
              {canComplete && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate(BOOKING_STATUS.COMPLETED)}
                  loading={actionLoading}
                  size="sm"
                >
                  Mark Complete
                </Button>
              )}
              {canMarkNoShow && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate(BOOKING_STATUS.NO_SHOW)}
                  loading={actionLoading}
                  size="sm"
                >
                  No Show
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="danger"
                  onClick={() => setShowCancelModal(true)}
                  size="sm"
                >
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Booking"
        size="sm"
      >
        <div className={styles.cancelForm}>
          <Textarea
            label="Cancellation Reason"
            placeholder="Please provide a reason for cancellation..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            required
          />
          <div className={styles.cancelFormActions}>
            <Button variant="ghost" onClick={() => setShowCancelModal(false)} disabled={cancelling}>
              Go Back
            </Button>
            <Button variant="danger" onClick={handleCancel} loading={cancelling}>
              Cancel Booking
            </Button>
          </div>
        </div>
      </Modal>

      {/* Mark Paid Modal */}
      <Modal
        isOpen={showPaidModal}
        onClose={() => setShowPaidModal(false)}
        title="Mark as Paid"
        size="sm"
      >
        <div className={styles.cancelForm}>
          <Select
            label="Payment Mode"
            options={paymentModeOptions}
            value={paidMode}
            onChange={(value) => setPaidMode(value)}
          />
          <div className={styles.cancelFormActions}>
            <Button variant="ghost" onClick={() => setShowPaidModal(false)} disabled={markingPaid}>
              Cancel
            </Button>
            <Button onClick={handleMarkPaid} loading={markingPaid}>
              Confirm Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PartyBookingDetail;
