'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './bookings.module.css';

const SPEED_BOAT_BOOKINGS = [
  {
    id: 'sbk-1',
    bookingNumber: 'SB-20260215-001',
    boatName: 'Sea Hawk',
    type: 'speed',
    date: '2026-02-20',
    startTime: '10:00',
    duration: 2,
    amount: 5900,
    paymentMode: 'ONLINE',
    paymentStatus: 'PAID',
    status: 'CONFIRMED',
    createdAt: '2026-02-10T10:30:00Z',
  },
  {
    id: 'sbk-2',
    bookingNumber: 'SB-20260210-003',
    boatName: 'Ocean Rider',
    type: 'speed',
    date: '2026-02-12',
    startTime: '14:00',
    duration: 1,
    amount: 2360,
    paymentMode: 'AT_VENUE',
    paymentStatus: 'PENDING',
    status: 'COMPLETED',
    createdAt: '2026-02-08T14:00:00Z',
  },
  {
    id: 'sbk-3',
    bookingNumber: 'SB-20260205-002',
    boatName: 'Wave Runner',
    type: 'speed',
    date: '2026-02-08',
    startTime: '09:00',
    duration: 3,
    amount: 12390,
    paymentMode: 'ONLINE',
    paymentStatus: 'REFUNDED',
    status: 'CANCELLED',
    createdAt: '2026-02-05T09:00:00Z',
  },
];

const PARTY_BOAT_BOOKINGS = [
  {
    id: 'pbk-1',
    bookingNumber: 'PB-20260220-001',
    boatName: 'Royal Celebration',
    type: 'party',
    date: '2026-03-15',
    timeSlot: 'Evening',
    eventType: 'Birthday',
    guests: 75,
    amount: 95800,
    paymentMode: 'ONLINE',
    paymentStatus: 'ADVANCE_PAID',
    status: 'CONFIRMED',
    createdAt: '2026-02-05T16:00:00Z',
  },
  {
    id: 'pbk-2',
    bookingNumber: 'PB-20260218-002',
    boatName: 'Star Night',
    type: 'party',
    date: '2026-02-25',
    timeSlot: 'Afternoon',
    eventType: 'College Farewell',
    guests: 45,
    amount: 62540,
    paymentMode: 'ONLINE',
    paymentStatus: 'FULLY_PAID',
    status: 'PENDING',
    createdAt: '2026-02-01T12:00:00Z',
  },
];

const ALL_BOOKINGS = [...SPEED_BOAT_BOOKINGS, ...PARTY_BOAT_BOOKINGS].sort(
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
);

const TABS = [
  { id: 'all', label: 'All Bookings', count: ALL_BOOKINGS.length },
  { id: 'speed', label: 'Speed Boats', count: SPEED_BOAT_BOOKINGS.length },
  { id: 'party', label: 'Party Boats', count: PARTY_BOAT_BOOKINGS.length },
];

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', className: 'statusPending' },
  CONFIRMED: { label: 'Confirmed', className: 'statusConfirmed' },
  COMPLETED: { label: 'Completed', className: 'statusCompleted' },
  CANCELLED: { label: 'Cancelled', className: 'statusCancelled' },
  NO_SHOW: { label: 'No Show', className: 'statusCancelled' },
};

const PAYMENT_STATUS_LABELS = {
  PENDING: 'Pending',
  PAID: 'Paid',
  ADVANCE_PAID: 'Advance Paid',
  FULLY_PAID: 'Fully Paid',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partial Refund',
};

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [showCancelDialog, setShowCancelDialog] = useState(null);

  const getFilteredBookings = () => {
    if (activeTab === 'speed') return SPEED_BOAT_BOOKINGS;
    if (activeTab === 'party') return PARTY_BOAT_BOOKINGS;
    return ALL_BOOKINGS;
  };

  const bookings = getFilteredBookings();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatLongDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const canCancel = (booking) => {
    return booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  };

  const getStatusConfig = (status) => {
    return STATUS_CONFIG[status] || { label: status, className: 'statusPending' };
  };

  const handleCancel = (bookingId) => {
    alert('Booking cancellation will be available when connected to the backend.');
    setShowCancelDialog(null);
  };

  return (
    <div className={styles.bookingsPage}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>My Bookings</h1>
          <p className={styles.subtitle}>View and manage your bookings</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/speed-boats" className={styles.newBookingButton}>
            Book Speed Boat
          </Link>
          <Link href="/party-boats" className={styles.newBookingButtonOutline}>
            Book Party Boat
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className={styles.tabCount}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {bookings.length === 0 && (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>&#x1F4CB;</div>
          <h3 className={styles.emptyTitle}>No Bookings Found</h3>
          <p className={styles.emptyText}>
            {activeTab === 'speed'
              ? "You haven't booked any speed boats yet."
              : activeTab === 'party'
              ? "You haven't booked any party boats yet."
              : "You haven't made any bookings yet."}
          </p>
          <Link
            href={activeTab === 'party' ? '/party-boats' : '/speed-boats'}
            className={styles.emptyButton}
          >
            Browse {activeTab === 'party' ? 'Party' : 'Speed'} Boats
          </Link>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length > 0 && (
        <div className={styles.bookingsList}>
          {bookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            const isParty = booking.type === 'party';

            return (
              <div key={booking.id} className={styles.bookingCard}>
                <div className={styles.bookingHeader}>
                  <div className={styles.bookingHeaderLeft}>
                    <span className={styles.bookingNumber}>{booking.bookingNumber}</span>
                    <span className={`${styles.typeBadge} ${isParty ? styles.typeParty : styles.typeSpeed}`}>
                      {isParty ? 'Party Boat' : 'Speed Boat'}
                    </span>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[statusConfig.className]}`}>
                    {statusConfig.label}
                  </span>
                </div>

                <div className={styles.bookingBody}>
                  <div className={styles.boatName}>{booking.boatName}</div>
                  <div className={styles.bookingDetails}>
                    <div className={styles.bookingDetail}>
                      <span className={styles.detailLabel}>Date</span>
                      <span className={styles.detailValue}>{formatLongDate(booking.date)}</span>
                    </div>
                    <div className={styles.bookingDetail}>
                      <span className={styles.detailLabel}>{isParty ? 'Time Slot' : 'Time'}</span>
                      <span className={styles.detailValue}>
                        {isParty
                          ? booking.timeSlot
                          : `${formatTime(booking.startTime)} (${booking.duration}h)`}
                      </span>
                    </div>
                    {isParty && (
                      <>
                        <div className={styles.bookingDetail}>
                          <span className={styles.detailLabel}>Event</span>
                          <span className={styles.detailValue}>{booking.eventType}</span>
                        </div>
                        <div className={styles.bookingDetail}>
                          <span className={styles.detailLabel}>Guests</span>
                          <span className={styles.detailValue}>{booking.guests}</span>
                        </div>
                      </>
                    )}
                    <div className={styles.bookingDetail}>
                      <span className={styles.detailLabel}>Amount</span>
                      <span className={styles.detailValue}>{formatCurrency(booking.amount)}</span>
                    </div>
                  </div>

                  <div className={styles.paymentInfo}>
                    <span className={styles.paymentLabel}>Payment:</span>
                    <span className={styles.paymentValue}>
                      {booking.paymentMode === 'ONLINE' ? 'Online' : booking.paymentMode === 'BANK_TRANSFER' ? 'Bank Transfer' : 'At Venue'}
                    </span>
                    <span
                      className={`${styles.paymentStatus} ${
                        ['PAID', 'FULLY_PAID', 'ADVANCE_PAID'].includes(booking.paymentStatus)
                          ? styles.paymentPaid
                          : booking.paymentStatus === 'REFUNDED'
                          ? styles.paymentRefunded
                          : styles.paymentPending
                      }`}
                    >
                      {PAYMENT_STATUS_LABELS[booking.paymentStatus] || booking.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className={styles.bookingActions}>
                  <span className={styles.bookingDate}>Booked on {formatDate(booking.createdAt)}</span>
                  {canCancel(booking) && (
                    <button
                      className={styles.cancelButton}
                      onClick={() => setShowCancelDialog(booking.id)}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>

                {/* Cancel Confirmation Dialog */}
                {showCancelDialog === booking.id && (
                  <div className={styles.cancelDialog}>
                    <div className={styles.cancelDialogContent}>
                      <h4 className={styles.cancelDialogTitle}>Cancel Booking?</h4>
                      <p className={styles.cancelDialogText}>
                        Are you sure you want to cancel this booking? Cancellation policy:
                      </p>
                      <ul className={styles.cancelPolicyList}>
                        {isParty ? (
                          <>
                            <li>7+ days before: 100% refund</li>
                            <li>3-7 days before: 50% refund</li>
                            <li>Less than 3 days: No refund</li>
                          </>
                        ) : (
                          <>
                            <li>24+ hours before: 100% refund</li>
                            <li>12-24 hours before: 50% refund</li>
                            <li>Less than 12 hours: No refund</li>
                          </>
                        )}
                      </ul>
                      <div className={styles.cancelDialogActions}>
                        <button
                          className={styles.cancelConfirmButton}
                          onClick={() => handleCancel(booking.id)}
                        >
                          Yes, Cancel
                        </button>
                        <button
                          className={styles.cancelDismissButton}
                          onClick={() => setShowCancelDialog(null)}
                        >
                          Keep Booking
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
