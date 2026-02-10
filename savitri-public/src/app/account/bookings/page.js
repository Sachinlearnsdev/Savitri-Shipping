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

const INQUIRY_STATUS_CONFIG = {
  PENDING: { label: 'Pending', className: 'statusPending' },
  QUOTED: { label: 'Quoted', className: 'statusQuoted' },
  ACCEPTED: { label: 'Accepted', className: 'statusConfirmed' },
  REJECTED: { label: 'Declined', className: 'statusCancelled' },
  CONVERTED: { label: 'Converted', className: 'statusCompleted' },
  EXPIRED: { label: 'Expired', className: 'statusCancelled' },
};

const EVENT_TYPE_LABELS = {
  WEDDING: 'Wedding',
  BIRTHDAY: 'Birthday Party',
  CORPORATE: 'Corporate Event',
  COLLEGE_FAREWELL: 'College Farewell',
  OTHER: 'Other',
};

const TIME_SLOT_LABELS = {
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  EVENING: 'Evening',
  FULL_DAY: 'Full Day',
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
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [counts, setCounts] = useState({ all: 0, speed: 0, party: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Inquiries state
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesCount, setInquiriesCount] = useState(0);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquiriesError, setInquiriesError] = useState(null);
  const [respondLoading, setRespondLoading] = useState(null);
  const [respondSuccess, setRespondSuccess] = useState(null);

  // Callback request state
  const [showCallbackDialog, setShowCallbackDialog] = useState(null);
  const [callbackDate, setCallbackDate] = useState('');
  const [callbackTime, setCallbackTime] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackLoading, setCallbackLoading] = useState(false);
  const [callbackSuccess, setCallbackSuccess] = useState(false);

  // Date modification - OTP-based flow
  const [showModifyDialog, setShowModifyDialog] = useState(null);
  const [modifyDate, setModifyDate] = useState('');
  const [modifyTime, setModifyTime] = useState('');
  const [modifyLoading, setModifyLoading] = useState(false);
  const [modifyStep, setModifyStep] = useState('select'); // 'select' | 'checking' | 'otp' | 'confirming'
  const [modifyOtp, setModifyOtp] = useState('');
  const [modifyMaskedEmail, setModifyMaskedEmail] = useState('');
  const [modifyError, setModifyError] = useState('');
  const [modifySuccess, setModifySuccess] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);

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

  const fetchInquiries = async () => {
    try {
      setInquiriesLoading(true);
      setInquiriesError(null);
      const response = await api.get(`${API_ENDPOINTS.INQUIRIES.MY_INQUIRIES}?limit=50`);
      if (response.success) {
        const items = response.data.inquiries || response.data || [];
        setInquiries(items);
        setInquiriesCount(items.length);
      }
    } catch (err) {
      setInquiriesError(err.message || 'Failed to load inquiries');
    } finally {
      setInquiriesLoading(false);
    }
  };

  const handleRespondToQuote = async (inquiryId, response) => {
    try {
      setRespondLoading(inquiryId);
      setRespondSuccess(null);
      const result = await api.patch(API_ENDPOINTS.INQUIRIES.RESPOND(inquiryId), { response });
      if (result.success) {
        setRespondSuccess({ id: inquiryId, response });
        setTimeout(() => {
          setRespondSuccess(null);
          fetchInquiries();
        }, 2000);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit response');
    } finally {
      setRespondLoading(null);
    }
  };

  const handleCallbackRequest = async (inquiryId) => {
    if (!callbackDate || !callbackTime) {
      alert('Please select a preferred date and time slot.');
      return;
    }
    try {
      setCallbackLoading(true);
      const result = await api.post(API_ENDPOINTS.INQUIRIES.CALLBACK_REQUEST(inquiryId), {
        preferredDate: callbackDate,
        preferredTime: callbackTime,
        phone: callbackPhone || user?.phone || '',
      });
      if (result.success) {
        setCallbackSuccess(true);
        setTimeout(() => {
          setShowCallbackDialog(null);
          setCallbackDate('');
          setCallbackTime('');
          setCallbackPhone('');
          setCallbackSuccess(false);
          fetchInquiries();
        }, 2000);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit callback request');
    } finally {
      setCallbackLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'inquiries') {
        fetchInquiries();
      } else {
        fetchBookings(activeTab);
      }
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, activeTab]);

  // Fetch inquiries count on mount for tab badge
  useEffect(() => {
    if (isAuthenticated) {
      api.get(`${API_ENDPOINTS.INQUIRIES.MY_INQUIRIES}?limit=1`)
        .then((res) => {
          if (res.success) {
            const total = res.data?.pagination?.total || (res.data?.inquiries || []).length;
            setInquiriesCount(total);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

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

  // Check available slots when date is selected
  const handleCheckAvailability = async (bookingId, date) => {
    if (!date) return;
    setModifyError('');
    try {
      const booking = bookings.find((b) => b.id === bookingId);
      const response = await api.get(
        `${API_ENDPOINTS.BOOKINGS.AVAILABLE_SLOTS}?date=${date}&numberOfBoats=${booking?.numberOfBoats || 1}`
      );
      if (response.success && response.data) {
        if (!response.data.open) {
          setAvailableSlots([]);
          setModifyError('Operations are closed on this date. Please select another date.');
        } else {
          setAvailableSlots(response.data.slots || []);
        }
      }
    } catch (err) {
      setModifyError(err.message || 'Failed to check availability');
      setAvailableSlots([]);
    }
  };

  // Step 1: Send OTP for modification
  const handleSendModificationOtp = async (bookingId) => {
    if (!modifyDate) {
      setModifyError('Please select a new date');
      return;
    }
    setModifyError('');
    setModifyStep('checking');
    setModifyLoading(true);
    try {
      const body = { newDate: modifyDate };
      if (modifyTime) {
        body.newStartTime = modifyTime;
      }
      const response = await api.post(API_ENDPOINTS.BOOKINGS.MODIFY_SEND_OTP(bookingId), body);
      if (response.success) {
        setModifyStep('otp');
        setModifyMaskedEmail(response.data?.email || '');
        setModifyOtp('');
      }
    } catch (err) {
      setModifyError(err.message || 'Failed to send OTP');
      setModifyStep('select');
    } finally {
      setModifyLoading(false);
    }
  };

  // Step 2: Confirm modification with OTP
  const handleConfirmModification = async (bookingId) => {
    if (!modifyOtp || modifyOtp.length < 4) {
      setModifyError('Please enter a valid OTP');
      return;
    }
    setModifyError('');
    setModifyStep('confirming');
    setModifyLoading(true);
    try {
      const body = {
        otp: modifyOtp,
        newDate: modifyDate,
      };
      if (modifyTime) {
        body.newStartTime = modifyTime;
      }
      const response = await api.put(API_ENDPOINTS.BOOKINGS.MODIFY_CONFIRM(bookingId), body);
      if (response.success) {
        setModifySuccess('Booking modified successfully!');
        setTimeout(() => {
          setShowModifyDialog(null);
          resetModifyState();
          fetchBookings(activeTab);
        }, 2000);
      }
    } catch (err) {
      setModifyError(err.message || 'Failed to confirm modification');
      setModifyStep('otp');
    } finally {
      setModifyLoading(false);
    }
  };

  const resetModifyState = () => {
    setModifyDate('');
    setModifyTime('');
    setModifyStep('select');
    setModifyOtp('');
    setModifyMaskedEmail('');
    setModifyError('');
    setModifySuccess('');
    setAvailableSlots([]);
  };

  const getInquiryBoatName = (inquiry) => {
    if (inquiry.boatId && typeof inquiry.boatId === 'object') return inquiry.boatId.name;
    return 'Party Boat';
  };

  const tabs = [
    { id: 'all', label: 'All Bookings', count: counts.all },
    { id: 'speed', label: 'Speed Boats', count: counts.speed },
    { id: 'party', label: 'Party Boats', count: counts.party },
    { id: 'inquiries', label: 'Inquiries & Quotes', count: inquiriesCount },
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

      {/* ===== INQUIRIES TAB ===== */}
      {activeTab === 'inquiries' && (
        <>
          {/* Inquiries Loading */}
          {inquiriesLoading && (
            <div className={styles.emptyContainer}>
              <div className={styles.emptyIcon}>&#x23F3;</div>
              <h3 className={styles.emptyTitle}>Loading inquiries...</h3>
            </div>
          )}

          {/* Inquiries Error */}
          {!inquiriesLoading && inquiriesError && (
            <div className={styles.emptyContainer}>
              <div className={styles.emptyIcon}>&#x26A0;</div>
              <h3 className={styles.emptyTitle}>Something went wrong</h3>
              <p className={styles.emptyText}>{inquiriesError}</p>
              <button onClick={fetchInquiries} className={styles.emptyButton}>
                Try Again
              </button>
            </div>
          )}

          {/* Inquiries Empty */}
          {!inquiriesLoading && !inquiriesError && inquiries.length === 0 && (
            <div className={styles.emptyContainer}>
              <div className={styles.emptyIcon}>&#x1F4E9;</div>
              <h3 className={styles.emptyTitle}>No Inquiries Yet</h3>
              <p className={styles.emptyText}>
                You have not submitted any party boat inquiries. Browse our party boats and send an inquiry for a custom quote.
              </p>
              <Link href="/party-boats" className={styles.emptyButton}>
                Browse Party Boats
              </Link>
            </div>
          )}

          {/* Inquiries List */}
          {!inquiriesLoading && !inquiriesError && inquiries.length > 0 && (
            <div className={styles.bookingsList}>
              {inquiries.map((inquiry) => {
                const statusConfig = INQUIRY_STATUS_CONFIG[inquiry.status] || { label: inquiry.status, className: 'statusPending' };
                const boatName = getInquiryBoatName(inquiry);

                return (
                  <div key={inquiry.id} className={styles.bookingCard}>
                    <div className={styles.bookingHeader}>
                      <div className={styles.bookingHeaderLeft}>
                        <span className={styles.bookingNumber}>{inquiry.inquiryNumber}</span>
                        <span className={`${styles.typeBadge} ${styles.typeInquiry}`}>
                          Inquiry
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
                          <span className={styles.detailLabel}>Event</span>
                          <span className={styles.detailValue}>
                            {EVENT_TYPE_LABELS[inquiry.eventType] || inquiry.eventType}
                          </span>
                        </div>
                        {inquiry.numberOfGuests && (
                          <div className={styles.bookingDetail}>
                            <span className={styles.detailLabel}>Guests</span>
                            <span className={styles.detailValue}>{inquiry.numberOfGuests}</span>
                          </div>
                        )}
                        {inquiry.preferredDate && (
                          <div className={styles.bookingDetail}>
                            <span className={styles.detailLabel}>Preferred Date</span>
                            <span className={styles.detailValue}>{formatLongDate(inquiry.preferredDate)}</span>
                          </div>
                        )}
                        {inquiry.preferredTimeSlot && (
                          <div className={styles.bookingDetail}>
                            <span className={styles.detailLabel}>Time Slot</span>
                            <span className={styles.detailValue}>
                              {TIME_SLOT_LABELS[inquiry.preferredTimeSlot] || inquiry.preferredTimeSlot}
                            </span>
                          </div>
                        )}
                        {inquiry.budget && (
                          <div className={styles.bookingDetail}>
                            <span className={styles.detailLabel}>Your Budget</span>
                            <span className={styles.detailValue}>{formatCurrency(inquiry.budget)}</span>
                          </div>
                        )}
                      </div>

                      {/* Status-specific content */}

                      {/* PENDING - Waiting for quote */}
                      {inquiry.status === 'PENDING' && (
                        <div className={styles.inquiryStatusMessage}>
                          <div className={styles.inquiryStatusIcon}>&#x23F3;</div>
                          <div>
                            <div className={styles.inquiryStatusTitle}>Waiting for quote from our team</div>
                            <div className={styles.inquiryStatusText}>
                              We have received your inquiry and will get back to you with a quote shortly.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* QUOTED - Show quote details and action buttons */}
                      {inquiry.status === 'QUOTED' && (
                        <div className={styles.quoteSection}>
                          <div className={styles.quoteHeader}>
                            <span className={styles.quoteLabel}>Quoted Amount</span>
                            <span className={styles.quoteAmount}>{formatCurrency(inquiry.quotedAmount)}</span>
                          </div>
                          {inquiry.quotedDetails && (
                            <div className={styles.quoteDetails}>
                              <span className={styles.quoteDetailsLabel}>Quote Details from Admin:</span>
                              <p className={styles.quoteDetailsText}>{inquiry.quotedDetails}</p>
                            </div>
                          )}

                          {/* Success message for respond */}
                          {respondSuccess && respondSuccess.id === inquiry.id && (
                            <div className={styles.respondSuccessMessage}>
                              {respondSuccess.response === 'ACCEPTED'
                                ? 'Quote accepted! Our team will confirm your booking soon.'
                                : 'Quote declined. You can submit a new inquiry anytime.'}
                            </div>
                          )}

                          {/* Action buttons */}
                          {(!respondSuccess || respondSuccess.id !== inquiry.id) && (
                            <div className={styles.quoteActions}>
                              <button
                                className={styles.acceptButton}
                                onClick={() => handleRespondToQuote(inquiry.id, 'ACCEPTED')}
                                disabled={respondLoading === inquiry.id}
                              >
                                {respondLoading === inquiry.id ? 'Processing...' : 'Accept Quote'}
                              </button>
                              <button
                                className={styles.rejectButton}
                                onClick={() => handleRespondToQuote(inquiry.id, 'REJECTED')}
                                disabled={respondLoading === inquiry.id}
                              >
                                Decline Quote
                              </button>
                            </div>
                          )}

                          {/* Schedule Call section */}
                          {(!respondSuccess || respondSuccess.id !== inquiry.id) && (
                            <div className={styles.callbackSection}>
                              <button
                                className={styles.callbackTrigger}
                                onClick={() => {
                                  setShowCallbackDialog(inquiry.id);
                                  setCallbackPhone(user?.phone || '');
                                  setCallbackDate('');
                                  setCallbackTime('');
                                  setCallbackSuccess(false);
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                                </svg>
                                Schedule a Call Back
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ACCEPTED - Awaiting booking */}
                      {inquiry.status === 'ACCEPTED' && (
                        <div className={styles.inquiryStatusMessage}>
                          <div className={styles.inquiryStatusIcon}>&#x2705;</div>
                          <div>
                            <div className={styles.inquiryStatusTitle}>Quote accepted - awaiting booking confirmation</div>
                            <div className={styles.inquiryStatusText}>
                              Our team will finalize your booking details and confirm shortly.
                              {inquiry.quotedAmount && (
                                <span className={styles.acceptedAmount}> Quoted: {formatCurrency(inquiry.quotedAmount)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CONVERTED - Link to booking */}
                      {inquiry.status === 'CONVERTED' && (
                        <div className={styles.inquiryStatusMessage}>
                          <div className={styles.inquiryStatusIcon}>&#x1F389;</div>
                          <div>
                            <div className={styles.inquiryStatusTitle}>Booking Created</div>
                            <div className={styles.inquiryStatusText}>
                              Your inquiry has been converted to a booking.
                              {inquiry.quotedAmount && (
                                <span className={styles.acceptedAmount}> Amount: {formatCurrency(inquiry.quotedAmount)}</span>
                              )}
                            </div>
                            <button
                              className={styles.viewBookingLink}
                              onClick={() => setActiveTab('party')}
                            >
                              View in Party Bookings
                            </button>
                          </div>
                        </div>
                      )}

                      {/* REJECTED - Declined */}
                      {inquiry.status === 'REJECTED' && (
                        <div className={styles.inquiryStatusMessage}>
                          <div className={styles.inquiryStatusIcon}>&#x274C;</div>
                          <div>
                            <div className={styles.inquiryStatusTitle}>Quote declined</div>
                            <div className={styles.inquiryStatusText}>
                              You declined the quoted amount of {inquiry.quotedAmount ? formatCurrency(inquiry.quotedAmount) : 'N/A'}.
                            </div>
                            <Link href="/party-boats" className={styles.newInquiryLink}>
                              Submit a New Inquiry
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* EXPIRED */}
                      {inquiry.status === 'EXPIRED' && (
                        <div className={styles.inquiryStatusMessage}>
                          <div className={styles.inquiryStatusIcon}>&#x23F0;</div>
                          <div>
                            <div className={styles.inquiryStatusTitle}>Inquiry Expired</div>
                            <div className={styles.inquiryStatusText}>
                              This inquiry has expired. You can submit a new one anytime.
                            </div>
                            <Link href="/party-boats" className={styles.newInquiryLink}>
                              Submit a New Inquiry
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={styles.bookingActions}>
                      <span className={styles.bookingDate}>
                        Submitted on {formatDate(inquiry.createdAt)}
                        {inquiry.quotedAt && (
                          <span className={styles.modificationCount}>
                            {' '}&middot; Quoted on {formatDate(inquiry.quotedAt)}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ===== BOOKINGS TABS (all / speed / party) ===== */}
      {activeTab !== 'inquiries' && (
        <>
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
                        onClick={() => { setShowModifyDialog(booking.id); resetModifyState(); }}
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

        </>
      )}

      {/* Callback Request Dialog */}
      {showCallbackDialog && (
        <div className={styles.cancelDialog}>
          <div className={styles.cancelDialogContent}>
            <h4 className={styles.cancelDialogTitle}>Schedule a Call Back</h4>
            <p className={styles.cancelDialogText}>
              Our team will call you at your preferred time to discuss the quote details.
            </p>

            {callbackSuccess ? (
              <div className={styles.respondSuccessMessage}>
                Callback request submitted! Our team will call you at your preferred time.
              </div>
            ) : (
              <>
                <label className={styles.callbackFieldLabel}>Preferred Date</label>
                <input
                  type="date"
                  className={styles.cancelReasonInput}
                  value={callbackDate}
                  onChange={(e) => setCallbackDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]}
                  style={{ padding: '10px 12px', marginBottom: '12px' }}
                />

                <label className={styles.callbackFieldLabel}>Preferred Time Slot</label>
                <div className={styles.callbackTimeSlots}>
                  {[
                    { value: 'Morning 9-12', label: 'Morning (9 AM - 12 PM)' },
                    { value: 'Afternoon 12-4', label: 'Afternoon (12 - 4 PM)' },
                    { value: 'Evening 4-7', label: 'Evening (4 - 7 PM)' },
                  ].map((slot) => (
                    <button
                      key={slot.value}
                      type="button"
                      className={`${styles.callbackTimeSlot} ${callbackTime === slot.value ? styles.callbackTimeSlotActive : ''}`}
                      onClick={() => setCallbackTime(slot.value)}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>

                <label className={styles.callbackFieldLabel}>Phone Number</label>
                <input
                  type="tel"
                  className={styles.cancelReasonInput}
                  value={callbackPhone}
                  onChange={(e) => setCallbackPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  maxLength={10}
                  style={{ padding: '10px 12px', marginBottom: '16px' }}
                />

                <div className={styles.cancelDialogActions}>
                  <button
                    className={styles.modifyConfirmButton}
                    onClick={() => handleCallbackRequest(showCallbackDialog)}
                    disabled={callbackLoading || !callbackDate || !callbackTime}
                  >
                    {callbackLoading ? 'Submitting...' : 'Request Call Back'}
                  </button>
                  <button
                    className={styles.cancelDismissButton}
                    onClick={() => {
                      setShowCallbackDialog(null);
                      setCallbackDate('');
                      setCallbackTime('');
                      setCallbackPhone('');
                      setCallbackSuccess(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
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

      {/* Modify Date Dialog - OTP-based flow (full-screen overlay) */}
      {showModifyDialog && (() => {
        const booking = bookings.find((b) => b.id === showModifyDialog);
        if (!booking) return null;
        return (
          <div className={styles.cancelDialog}>
            <div className={styles.cancelDialogContent} style={{ maxWidth: '480px' }}>
              {/* Header */}
              <h4 className={styles.cancelDialogTitle}>Modify Booking Date</h4>
              <p className={styles.cancelDialogText}>
                {modifyStep === 'otp' || modifyStep === 'confirming'
                  ? `Enter the OTP sent to ${modifyMaskedEmail} to confirm your modification.`
                  : (
                    <>
                      Change date for <strong>{booking.bookingNumber}</strong>. You have{' '}
                      <strong>{2 - (booking.dateModificationCount || 0)}</strong> modification(s) remaining.
                    </>
                  )
                }
              </p>

              {/* Success Message */}
              {modifySuccess && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#dcfce7',
                  border: '1px solid #86efac',
                  borderRadius: '8px',
                  color: '#166534',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '12px',
                  textAlign: 'center',
                }}>
                  {modifySuccess}
                </div>
              )}

              {/* Error Message */}
              {modifyError && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#991b1b',
                  fontSize: '14px',
                  marginBottom: '12px',
                }}>
                  {modifyError}
                </div>
              )}

              {/* Step 1: Select Date & Time */}
              {(modifyStep === 'select' || modifyStep === 'checking') && !modifySuccess && (
                <>
                  {/* Current booking info */}
                  <div style={{
                    padding: '10px 14px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    color: '#374151',
                  }}>
                    <strong>Current:</strong> {formatLongDate(booking.date)} at {formatTime(booking.startTime)} ({booking.duration}h)
                  </div>

                  {/* Date Picker */}
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    New Date
                  </label>
                  <input
                    type="date"
                    className={styles.cancelReasonInput}
                    value={modifyDate}
                    onChange={(e) => {
                      setModifyDate(e.target.value);
                      setModifyTime('');
                      setModifyError('');
                      if (e.target.value) {
                        handleCheckAvailability(booking.id, e.target.value);
                      }
                    }}
                    min={new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]}
                    max={new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0]}
                    style={{ padding: '10px 12px', marginBottom: '12px' }}
                  />

                  {/* Time Slot Selection */}
                  {modifyDate && availableSlots.length > 0 && (
                    <>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                        Select Time Slot (optional)
                      </label>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                        gap: '8px',
                        marginBottom: '16px',
                      }}>
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.isAvailable}
                            onClick={() => {
                              setModifyTime(slot.time === modifyTime ? '' : slot.time);
                              setModifyError('');
                            }}
                            style={{
                              padding: '8px 6px',
                              border: modifyTime === slot.time ? '2px solid #2563eb' : '1px solid #d1d5db',
                              borderRadius: '8px',
                              backgroundColor: !slot.isAvailable ? '#f3f4f6' : modifyTime === slot.time ? '#eff6ff' : 'white',
                              color: !slot.isAvailable ? '#9ca3af' : modifyTime === slot.time ? '#2563eb' : '#374151',
                              fontSize: '13px',
                              fontWeight: modifyTime === slot.time ? '600' : '400',
                              cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                              textAlign: 'center',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div>{slot.time}</div>
                            <div style={{ fontSize: '11px', color: slot.isAvailable ? '#059669' : '#ef4444' }}>
                              {slot.isAvailable ? `${slot.availableBoats} avail.` : 'Full'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <div className={styles.cancelDialogActions}>
                    <button
                      className={styles.modifyConfirmButton}
                      onClick={() => handleSendModificationOtp(booking.id)}
                      disabled={modifyLoading || !modifyDate}
                    >
                      {modifyLoading ? 'Checking...' : 'Send OTP to Confirm'}
                    </button>
                    <button
                      className={styles.cancelDismissButton}
                      onClick={() => { setShowModifyDialog(null); resetModifyState(); }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: Enter OTP */}
              {(modifyStep === 'otp' || modifyStep === 'confirming') && !modifySuccess && (
                <>
                  {/* Change summary */}
                  <div style={{
                    padding: '12px 14px',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    color: '#1e40af',
                  }}>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Date:</strong>{' '}
                      <span style={{ textDecoration: 'line-through', color: '#ef4444' }}>{formatLongDate(booking.date)}</span>
                      {' '}&rarr;{' '}
                      <span style={{ color: '#059669', fontWeight: '600' }}>{formatLongDate(modifyDate + 'T00:00:00')}</span>
                    </div>
                    {modifyTime && (
                      <div>
                        <strong>Time:</strong>{' '}
                        <span style={{ textDecoration: 'line-through', color: '#ef4444' }}>{formatTime(booking.startTime)}</span>
                        {' '}&rarr;{' '}
                        <span style={{ color: '#059669', fontWeight: '600' }}>{formatTime(modifyTime)}</span>
                      </div>
                    )}
                  </div>

                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    className={styles.cancelReasonInput}
                    value={modifyOtp}
                    onChange={(e) => {
                      setModifyOtp(e.target.value.replace(/\D/g, ''));
                      setModifyError('');
                    }}
                    placeholder="Enter 6-digit OTP"
                    style={{
                      padding: '12px 16px',
                      fontSize: '20px',
                      textAlign: 'center',
                      letterSpacing: '8px',
                      fontWeight: '600',
                      marginBottom: '12px',
                    }}
                    autoFocus
                  />

                  <div className={styles.cancelDialogActions}>
                    <button
                      className={styles.modifyConfirmButton}
                      onClick={() => handleConfirmModification(booking.id)}
                      disabled={modifyLoading || modifyOtp.length < 4}
                    >
                      {modifyLoading ? 'Confirming...' : 'Confirm Modification'}
                    </button>
                    <button
                      className={styles.cancelDismissButton}
                      onClick={() => {
                        setModifyStep('select');
                        setModifyOtp('');
                        setModifyError('');
                      }}
                    >
                      Back
                    </button>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => handleSendModificationOtp(booking.id)}
                      disabled={modifyLoading}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '13px',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Resend OTP
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
