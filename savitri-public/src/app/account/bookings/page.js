'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { API_ENDPOINTS } from '@/utils/constants';
import styles from './bookings.module.css';

const STATUS_CONFIG = {
  PENDING: { label: 'Awaiting Confirmation', className: 'statusPending' },
  CONFIRMED: { label: 'Confirmed', className: 'statusConfirmed' },
  COMPLETED: { label: 'Completed', className: 'statusCompleted' },
  CANCELLED: { label: 'Cancelled', className: 'statusCancelled' },
  NO_SHOW: { label: 'No Show', className: 'statusCancelled' },
};

const PAYMENT_STATUS_LABELS = {
  PENDING: 'Awaiting Payment',
  PAID: 'Paid',
  ADVANCE_PAID: 'Advance Paid',
  FULLY_PAID: 'Fully Paid',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partial Refund',
};

export default function MyBookingsPage() {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [counts, setCounts] = useState({ all: 0, speed: 0, party: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Date modification
  const [showModifyDialog, setShowModifyDialog] = useState(null);
  const [modifyDate, setModifyDate] = useState('');
  const [modifyLoading, setModifyLoading] = useState(false);

  const fetchBookings = async (type) => {
    try {
      setLoading(true);
      setError(null);
      const query = type && type !== 'all' ? `?type=${type}&limit=50` : '?limit=50';
      const response = await api.get(`${API_ENDPOINTS.BOOKINGS.MY_BOOKINGS}${query}`);
      if (response.success) {
        setBookings(response.data.bookings || response.data || []);
        if (response.data.counts) {
          setCounts(response.data.counts);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings(activeTab);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, activeTab]);

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
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatLongDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes || '00'} ${ampm}`;
  };

  const canCancel = (booking) => {
    return booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  };

  const getStatusConfig = (status) => {
    return STATUS_CONFIG[status] || { label: status, className: 'statusPending' };
  };

  const getBookingAmount = (booking) => {
    if (booking.pricing) {
      return booking.pricing.finalAmount || booking.pricing.totalAmount || 0;
    }
    return booking.amount || 0;
  };

  const getBoatName = (booking) => {
    if (booking.boatName) return booking.boatName;
    if (booking.boatId && typeof booking.boatId === 'object') return booking.boatId.name;
    return booking.bookingType === 'PARTY_BOAT' ? 'Party Boat' : 'Speed Boat';
  };

  const handleCancel = async (bookingId) => {
    try {
      setCancelLoading(true);
      const response = await api.post(API_ENDPOINTS.BOOKINGS.CANCEL(bookingId), {
        reason: cancelReason || 'Customer requested cancellation',
      });
      if (response.success) {
        setShowCancelDialog(null);
        setCancelReason('');
        fetchBookings(activeTab);
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  const canModifyDate = (booking) => {
    return (booking.status === 'PENDING' || booking.status === 'CONFIRMED') &&
      (booking.dateModificationCount || 0) < 2;
  };

  const handleModifyDate = async (bookingId) => {
    if (!modifyDate) {
      alert('Please select a new date');
      return;
    }
    try {
      setModifyLoading(true);
      const response = await api.patch(API_ENDPOINTS.BOOKINGS.MODIFY_DATE(bookingId), {
        newDate: modifyDate,
      });
      if (response.success) {
        setShowModifyDialog(null);
        setModifyDate('');
        fetchBookings(activeTab);
      }
    } catch (err) {
      alert(err.message || 'Failed to modify booking date');
    } finally {
      setModifyLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Bookings', count: counts.all },
    { id: 'speed', label: 'Speed Boats', count: counts.speed },
    { id: 'party', label: 'Party Boats', count: counts.party },
  ];

  if (!isAuthenticated) {
    return (
      <div className={styles.bookingsPage}>
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>&#x1F512;</div>
          <h3 className={styles.emptyTitle}>Sign in Required</h3>
          <p className={styles.emptyText}>Please sign in to view your bookings.</p>
          <Link href="/login" className={styles.emptyButton}>Sign In</Link>
        </div>
      </div>
    );
  }

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
        {tabs.map((tab) => (
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

      {/* Loading State */}
      {loading && (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>&#x23F3;</div>
          <h3 className={styles.emptyTitle}>Loading bookings...</h3>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>&#x26A0;</div>
          <h3 className={styles.emptyTitle}>Something went wrong</h3>
          <p className={styles.emptyText}>{error}</p>
          <button onClick={() => fetchBookings(activeTab)} className={styles.emptyButton}>
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && bookings.length === 0 && (
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
      {!loading && !error && bookings.length > 0 && (
        <div className={styles.bookingsList}>
          {bookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            const isParty = booking.bookingType === 'PARTY_BOAT';
            const amount = getBookingAmount(booking);
            const boatName = getBoatName(booking);

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
                  <div className={styles.boatName}>{boatName}</div>
                  <div className={styles.bookingDetails}>
                    <div className={styles.bookingDetail}>
                      <span className={styles.detailLabel}>Date</span>
                      <span className={styles.detailValue}>{formatLongDate(booking.date)}</span>
                    </div>
                    <div className={styles.bookingDetail}>
                      <span className={styles.detailLabel}>{isParty ? 'Time Slot' : 'Time'}</span>
                      <span className={styles.detailValue}>
                        {isParty
                          ? (booking.timeSlot || '-')
                          : `${formatTime(booking.startTime)} (${booking.duration || '-'}h)`}
                      </span>
                    </div>
                    {isParty && booking.eventType && (
                      <div className={styles.bookingDetail}>
                        <span className={styles.detailLabel}>Event</span>
                        <span className={styles.detailValue}>{booking.eventType}</span>
                      </div>
                    )}
                    {isParty && booking.numberOfGuests && (
                      <div className={styles.bookingDetail}>
                        <span className={styles.detailLabel}>Guests</span>
                        <span className={styles.detailValue}>{booking.numberOfGuests}</span>
                      </div>
                    )}
                    <div className={styles.bookingDetail}>
                      <span className={styles.detailLabel}>Amount</span>
                      <span className={styles.detailValue}>{formatCurrency(amount)}</span>
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
                          : booking.paymentStatus === 'REFUNDED' || booking.paymentStatus === 'PARTIALLY_REFUNDED'
                          ? styles.paymentRefunded
                          : styles.paymentPending
                      }`}
                    >
                      {PAYMENT_STATUS_LABELS[booking.paymentStatus] || booking.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className={styles.bookingActions}>
                  <span className={styles.bookingDate}>
                    Booked on {formatDate(booking.createdAt)}
                    {(booking.dateModificationCount || 0) > 0 && (
                      <span className={styles.modificationCount}>
                        {' '}&middot; {booking.dateModificationCount}/2 modifications used
                      </span>
                    )}
                  </span>
                  <div className={styles.actionButtons}>
                    {canModifyDate(booking) && (
                      <button
                        className={styles.modifyButton}
                        onClick={() => { setShowModifyDialog(booking.id); setModifyDate(''); }}
                      >
                        Modify Date
                      </button>
                    )}
                    {canCancel(booking) && (
                      <button
                        className={styles.cancelButton}
                        onClick={() => setShowCancelDialog(booking.id)}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Dialog (full-screen overlay) */}
      {showCancelDialog && (() => {
        const booking = bookings.find((b) => b.id === showCancelDialog);
        if (!booking) return null;
        const isPartyBooking = booking.bookingType === 'PARTY_BOAT';
        return (
          <div className={styles.cancelDialog}>
            <div className={styles.cancelDialogContent}>
              <h4 className={styles.cancelDialogTitle}>Cancel Booking?</h4>
              <p className={styles.cancelDialogText}>
                Are you sure you want to cancel <strong>{booking.bookingNumber}</strong>? Cancellation policy:
              </p>
              <ul className={styles.cancelPolicyList}>
                {isPartyBooking ? (
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
              <textarea
                className={styles.cancelReasonInput}
                placeholder="Reason for cancellation (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={2}
              />
              <div className={styles.cancelDialogActions}>
                <button
                  className={styles.cancelConfirmButton}
                  onClick={() => handleCancel(booking.id)}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
                <button
                  className={styles.cancelDismissButton}
                  onClick={() => { setShowCancelDialog(null); setCancelReason(''); }}
                >
                  Keep Booking
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modify Date Dialog (full-screen overlay) */}
      {showModifyDialog && (() => {
        const booking = bookings.find((b) => b.id === showModifyDialog);
        if (!booking) return null;
        return (
          <div className={styles.cancelDialog}>
            <div className={styles.cancelDialogContent}>
              <h4 className={styles.cancelDialogTitle}>Modify Booking Date</h4>
              <p className={styles.cancelDialogText}>
                Change date for <strong>{booking.bookingNumber}</strong>. You have{' '}
                <strong>{2 - (booking.dateModificationCount || 0)}</strong> modification(s) remaining.
              </p>
              <input
                type="date"
                className={styles.cancelReasonInput}
                value={modifyDate}
                onChange={(e) => setModifyDate(e.target.value)}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                max={new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0]}
                style={{ padding: '10px 12px' }}
              />
              <div className={styles.cancelDialogActions}>
                <button
                  className={styles.modifyConfirmButton}
                  onClick={() => handleModifyDate(booking.id)}
                  disabled={modifyLoading || !modifyDate}
                >
                  {modifyLoading ? 'Modifying...' : 'Confirm Change'}
                </button>
                <button
                  className={styles.cancelDismissButton}
                  onClick={() => { setShowModifyDialog(null); setModifyDate(''); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
