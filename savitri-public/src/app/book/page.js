'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { API_ENDPOINTS } from '@/utils/constants';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import styles from './book.module.css';

const DURATION_OPTIONS = [
  { value: 1, label: '1 Hour' },
  { value: 2, label: '2 Hours' },
  { value: 3, label: '3 Hours' },
  { value: 4, label: '4 Hours' },
  { value: 5, label: '5 Hours' },
  { value: 6, label: '6 Hours' },
  { value: 7, label: '7 Hours' },
  { value: 8, label: '8 Hours' },
];

export default function BookPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { showSuccess, showError } = useUIStore();

  // Form state
  const [date, setDate] = useState('');
  const [numberOfBoats, setNumberOfBoats] = useState(1);
  const [duration, setDuration] = useState(2);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMode, setPaymentMode] = useState('ONLINE');
  const [customerNotes, setCustomerNotes] = useState('');

  // Guest customer fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // API data
  const [availableSlots, setAvailableSlots] = useState([]);
  const [priceData, setPriceData] = useState(null);

  // UI state
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Date constraints
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const maxDate = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Pre-fill customer details if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerName(user.name || '');
      setCustomerEmail(user.email || '');
      setCustomerPhone(user.phone || '');
    }
  }, [isAuthenticated, user]);

  // Fetch available slots when date or numberOfBoats changes
  useEffect(() => {
    if (date) {
      fetchAvailableSlots();
    }
  }, [date, numberOfBoats]);

  // Calculate price when slot, duration, or boats change
  useEffect(() => {
    if (date && selectedSlot && duration && numberOfBoats) {
      calculatePrice();
    } else {
      setPriceData(null);
    }
  }, [date, selectedSlot, duration, numberOfBoats]);

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      setSlotsError('');
      setSelectedSlot(null);
      setPriceData(null);

      const response = await api.get(
        `${API_ENDPOINTS.BOOKINGS.AVAILABLE_SLOTS}?date=${date}&numberOfBoats=${numberOfBoats}`
      );
      setAvailableSlots(response.data?.slots || response.data || []);
    } catch (err) {
      setSlotsError(err.message || 'Failed to load available time slots.');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const calculatePrice = async () => {
    try {
      setLoadingPrice(true);
      setPriceError('');

      const response = await api.post(API_ENDPOINTS.BOOKINGS.CALCULATE_PRICE, {
        date,
        startTime: selectedSlot,
        duration,
        numberOfBoats,
      });
      setPriceData(response.data);
    } catch (err) {
      setPriceError(err.message || 'Failed to calculate price.');
      setPriceData(null);
    } finally {
      setLoadingPrice(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const validateForm = () => {
    const errors = {};

    if (!date) errors.date = 'Please select a date';
    if (!selectedSlot) errors.slot = 'Please select a time slot';
    if (!numberOfBoats || numberOfBoats < 1) errors.boats = 'Please select at least 1 boat';
    if (!duration) errors.duration = 'Please select duration';

    if (!isAuthenticated) {
      if (!customerName.trim()) errors.name = 'Please enter your name';
      if (!customerEmail.trim()) {
        errors.email = 'Please enter your email';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        errors.email = 'Please enter a valid email';
      }
      if (!customerPhone.trim()) {
        errors.phone = 'Please enter your phone number';
      } else if (!/^[6-9]\d{9}$/.test(customerPhone.replace(/\s/g, ''))) {
        errors.phone = 'Please enter a valid 10-digit Indian phone number';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);

      const bookingData = {
        date,
        startTime: selectedSlot,
        duration,
        numberOfBoats,
        paymentMode,
        customerNotes: customerNotes.trim() || undefined,
      };

      if (!isAuthenticated) {
        bookingData.customerName = customerName.trim();
        bookingData.customerEmail = customerEmail.trim();
        bookingData.customerPhone = customerPhone.replace(/\s/g, '');
      }

      const response = await api.post(API_ENDPOINTS.BOOKINGS.CREATE, bookingData);
      setBookingSuccess(response.data);
      showSuccess('Booking created successfully!');
    } catch (err) {
      showError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If booking was successful, show success page
  if (bookingSuccess) {
    return (
      <div className={styles.bookPage}>
        <div className={styles.container}>
          <div className={styles.successContainer}>
            <div className={styles.successIcon}>&#10003;</div>
            <h1 className={styles.successTitle}>Booking Confirmed!</h1>
            <p className={styles.successMessage}>
              Your speed boat booking has been created successfully.
            </p>

            <div className={styles.successDetails}>
              {bookingSuccess.bookingNumber && (
                <div className={styles.successItem}>
                  <span className={styles.successLabel}>Booking Number</span>
                  <span className={styles.successValue}>{bookingSuccess.bookingNumber}</span>
                </div>
              )}
              <div className={styles.successItem}>
                <span className={styles.successLabel}>Date</span>
                <span className={styles.successValue}>{formatDate(date)}</span>
              </div>
              <div className={styles.successItem}>
                <span className={styles.successLabel}>Time</span>
                <span className={styles.successValue}>{formatTime(selectedSlot)}</span>
              </div>
              <div className={styles.successItem}>
                <span className={styles.successLabel}>Duration</span>
                <span className={styles.successValue}>{duration} hour{duration > 1 ? 's' : ''}</span>
              </div>
              <div className={styles.successItem}>
                <span className={styles.successLabel}>Boats</span>
                <span className={styles.successValue}>{numberOfBoats}</span>
              </div>
              {bookingSuccess.totalAmount && (
                <div className={styles.successItem}>
                  <span className={styles.successLabel}>Total Amount</span>
                  <span className={styles.successValue}>
                    {formatCurrency(bookingSuccess.totalAmount)}
                  </span>
                </div>
              )}
              <div className={styles.successItem}>
                <span className={styles.successLabel}>Payment Mode</span>
                <span className={styles.successValue}>
                  {paymentMode === 'ONLINE' ? 'Pay Online' : 'Pay at Venue'}
                </span>
              </div>
              {bookingSuccess.status && (
                <div className={styles.successItem}>
                  <span className={styles.successLabel}>Status</span>
                  <span className={`${styles.successBadge} ${styles[`status${bookingSuccess.status}`]}`}>
                    {bookingSuccess.status}
                  </span>
                </div>
              )}
            </div>

            <p className={styles.successNote}>
              A confirmation has been sent to your email. You can view your bookings anytime from your account.
            </p>

            <div className={styles.successActions}>
              {isAuthenticated && (
                <Link href="/account/bookings" className={styles.primaryActionButton}>
                  View My Bookings
                </Link>
              )}
              <Link href="/boats" className={styles.secondaryActionButton}>
                Back to Boats
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bookPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Book a Speed Boat</h1>
          <p className={styles.pageSubtitle}>
            Complete the steps below to reserve your speed boat adventure
          </p>
        </div>
      </div>

      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.bookingForm}>
          <div className={styles.formLayout}>
            {/* Left Column - Form Steps */}
            <div className={styles.formSteps}>

              {/* Step 1: Select Date */}
              <div className={styles.step}>
                <div className={styles.stepHeader}>
                  <span className={styles.stepBadge}>1</span>
                  <h2 className={styles.stepTitle}>Select Date</h2>
                </div>
                <div className={styles.stepContent}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="date">Booking Date</label>
                    <input
                      type="date"
                      id="date"
                      className={`${styles.input} ${formErrors.date ? styles.inputError : ''}`}
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setFormErrors((prev) => ({ ...prev, date: '' }));
                      }}
                      min={minDate}
                      max={maxDate}
                      required
                    />
                    {formErrors.date && <span className={styles.fieldError}>{formErrors.date}</span>}
                    <p className={styles.hint}>You can book up to 45 days in advance. Minimum 2 hours notice required.</p>
                  </div>

                  {/* Available Slots */}
                  {date && (
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Available Time Slots</label>

                      {loadingSlots && (
                        <div className={styles.inlineLoading}>
                          <div className={styles.spinnerSmall}></div>
                          <span>Loading available slots...</span>
                        </div>
                      )}

                      {slotsError && !loadingSlots && (
                        <div className={styles.inlineError}>
                          <span>{slotsError}</span>
                          <button type="button" onClick={fetchAvailableSlots} className={styles.retryLink}>
                            Retry
                          </button>
                        </div>
                      )}

                      {!loadingSlots && !slotsError && availableSlots.length === 0 && (
                        <div className={styles.noSlots}>
                          No available slots for this date. The day may be closed or fully booked. Please try another date.
                        </div>
                      )}

                      {!loadingSlots && !slotsError && availableSlots.length > 0 && (
                        <div className={styles.slotsGrid}>
                          {availableSlots.map((slot) => {
                            const slotTime = typeof slot === 'string' ? slot : slot.startTime || slot.time;
                            const slotAvailable = typeof slot === 'string' ? true : slot.available !== false;
                            return (
                              <button
                                key={slotTime}
                                type="button"
                                className={`${styles.slotButton} ${selectedSlot === slotTime ? styles.slotSelected : ''} ${!slotAvailable ? styles.slotDisabled : ''}`}
                                onClick={() => {
                                  if (slotAvailable) {
                                    setSelectedSlot(slotTime);
                                    setFormErrors((prev) => ({ ...prev, slot: '' }));
                                  }
                                }}
                                disabled={!slotAvailable}
                              >
                                {formatTime(slotTime)}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {formErrors.slot && <span className={styles.fieldError}>{formErrors.slot}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Select Details */}
              <div className={styles.step}>
                <div className={styles.stepHeader}>
                  <span className={styles.stepBadge}>2</span>
                  <h2 className={styles.stepTitle}>Select Details</h2>
                </div>
                <div className={styles.stepContent}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="boats">Number of Boats</label>
                      <input
                        type="number"
                        id="boats"
                        className={`${styles.input} ${formErrors.boats ? styles.inputError : ''}`}
                        value={numberOfBoats}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
                          setNumberOfBoats(val);
                          setFormErrors((prev) => ({ ...prev, boats: '' }));
                        }}
                        min={1}
                        max={10}
                      />
                      {formErrors.boats && <span className={styles.fieldError}>{formErrors.boats}</span>}
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="duration">Duration</label>
                      <select
                        id="duration"
                        className={`${styles.input} ${styles.select} ${formErrors.duration ? styles.inputError : ''}`}
                        value={duration}
                        onChange={(e) => {
                          setDuration(parseInt(e.target.value));
                          setFormErrors((prev) => ({ ...prev, duration: '' }));
                        }}
                      >
                        {DURATION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {formErrors.duration && <span className={styles.fieldError}>{formErrors.duration}</span>}
                    </div>
                  </div>

                  {selectedSlot && (
                    <div className={styles.selectionSummary}>
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Selected Time</span>
                        <span className={styles.summaryValue}>{formatTime(selectedSlot)}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Boats</span>
                        <span className={styles.summaryValue}>{numberOfBoats}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Duration</span>
                        <span className={styles.summaryValue}>{duration} hour{duration > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Your Details (if not logged in) */}
              {!isAuthenticated && (
                <div className={styles.step}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepBadge}>3</span>
                    <h2 className={styles.stepTitle}>Your Details</h2>
                  </div>
                  <div className={styles.stepContent}>
                    <p className={styles.guestNote}>
                      An account will be created automatically with your details.
                      Already have an account?{' '}
                      <Link href="/login" className={styles.link}>Log in</Link>
                    </p>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="customerName">Full Name</label>
                      <input
                        type="text"
                        id="customerName"
                        className={`${styles.input} ${formErrors.name ? styles.inputError : ''}`}
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          setFormErrors((prev) => ({ ...prev, name: '' }));
                        }}
                        placeholder="Enter your full name"
                      />
                      {formErrors.name && <span className={styles.fieldError}>{formErrors.name}</span>}
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="customerEmail">Email Address</label>
                        <input
                          type="email"
                          id="customerEmail"
                          className={`${styles.input} ${formErrors.email ? styles.inputError : ''}`}
                          value={customerEmail}
                          onChange={(e) => {
                            setCustomerEmail(e.target.value);
                            setFormErrors((prev) => ({ ...prev, email: '' }));
                          }}
                          placeholder="you@example.com"
                        />
                        {formErrors.email && <span className={styles.fieldError}>{formErrors.email}</span>}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="customerPhone">Phone Number</label>
                        <input
                          type="tel"
                          id="customerPhone"
                          className={`${styles.input} ${formErrors.phone ? styles.inputError : ''}`}
                          value={customerPhone}
                          onChange={(e) => {
                            setCustomerPhone(e.target.value);
                            setFormErrors((prev) => ({ ...prev, phone: '' }));
                          }}
                          placeholder="98765 43210"
                          maxLength={10}
                        />
                        {formErrors.phone && <span className={styles.fieldError}>{formErrors.phone}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Additional Notes */}
              <div className={styles.step}>
                <div className={styles.stepHeader}>
                  <span className={styles.stepBadge}>{isAuthenticated ? '3' : '4'}</span>
                  <h2 className={styles.stepTitle}>Additional Information</h2>
                </div>
                <div className={styles.stepContent}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="notes">Notes (Optional)</label>
                    <textarea
                      id="notes"
                      className={styles.textarea}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Any special requests or notes for your booking..."
                      rows={3}
                      maxLength={500}
                    />
                    <p className={styles.hint}>{customerNotes.length}/500 characters</p>
                  </div>

                  {/* Payment Mode */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Payment Mode</label>
                    <div className={styles.radioGroup}>
                      <label className={`${styles.radioCard} ${paymentMode === 'ONLINE' ? styles.radioSelected : ''}`}>
                        <input
                          type="radio"
                          name="paymentMode"
                          value="ONLINE"
                          checked={paymentMode === 'ONLINE'}
                          onChange={(e) => setPaymentMode(e.target.value)}
                          className={styles.radioInput}
                        />
                        <div className={styles.radioContent}>
                          <span className={styles.radioTitle}>Pay Online</span>
                          <span className={styles.radioDescription}>Secure online payment</span>
                        </div>
                      </label>
                      <label className={`${styles.radioCard} ${paymentMode === 'AT_VENUE' ? styles.radioSelected : ''}`}>
                        <input
                          type="radio"
                          name="paymentMode"
                          value="AT_VENUE"
                          checked={paymentMode === 'AT_VENUE'}
                          onChange={(e) => setPaymentMode(e.target.value)}
                          className={styles.radioInput}
                        />
                        <div className={styles.radioContent}>
                          <span className={styles.radioTitle}>Pay at Venue</span>
                          <span className={styles.radioDescription}>Pay when you arrive</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Price Summary & Confirm */}
            <div className={styles.sidebar}>
              <div className={styles.priceSummary}>
                <h3 className={styles.summaryTitle}>Booking Summary</h3>

                {/* Selection Details */}
                <div className={styles.summaryDetails}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryRowLabel}>Date</span>
                    <span className={styles.summaryRowValue}>
                      {date ? formatDate(date) : 'Not selected'}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryRowLabel}>Time</span>
                    <span className={styles.summaryRowValue}>
                      {selectedSlot ? formatTime(selectedSlot) : 'Not selected'}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryRowLabel}>Duration</span>
                    <span className={styles.summaryRowValue}>
                      {duration} hour{duration > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryRowLabel}>Boats</span>
                    <span className={styles.summaryRowValue}>{numberOfBoats}</span>
                  </div>
                </div>

                {/* Price Breakdown */}
                {loadingPrice && (
                  <div className={styles.priceLoading}>
                    <div className={styles.spinnerSmall}></div>
                    <span>Calculating price...</span>
                  </div>
                )}

                {priceError && !loadingPrice && (
                  <div className={styles.priceError}>
                    <span>{priceError}</span>
                  </div>
                )}

                {priceData && !loadingPrice && (
                  <div className={styles.priceBreakdown}>
                    <div className={styles.priceRow}>
                      <span>Base Rate</span>
                      <span>{formatCurrency(priceData.baseAmount || priceData.baseRate)}</span>
                    </div>
                    {priceData.adjustment !== undefined && priceData.adjustment !== 0 && (
                      <div className={styles.priceRow}>
                        <span>{priceData.adjustmentLabel || 'Pricing Adjustment'}</span>
                        <span className={priceData.adjustment > 0 ? styles.priceUp : styles.priceDown}>
                          {priceData.adjustment > 0 ? '+' : ''}{formatCurrency(priceData.adjustment)}
                        </span>
                      </div>
                    )}
                    <div className={styles.priceRow}>
                      <span>Subtotal</span>
                      <span>{formatCurrency(priceData.subtotal || priceData.baseAmount)}</span>
                    </div>
                    <div className={styles.priceRow}>
                      <span>GST (18%)</span>
                      <span>{formatCurrency(priceData.gst || priceData.taxAmount)}</span>
                    </div>
                    <div className={`${styles.priceRow} ${styles.totalRow}`}>
                      <span>Total</span>
                      <span>{formatCurrency(priceData.total || priceData.totalAmount)}</span>
                    </div>
                  </div>
                )}

                {!priceData && !loadingPrice && !priceError && (
                  <div className={styles.priceHint}>
                    Select date, time slot, and details to see pricing.
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={submitting || !date || !selectedSlot || !priceData}
                >
                  {submitting ? (
                    <span className={styles.submittingText}>
                      <span className={styles.spinnerTiny}></span>
                      Creating Booking...
                    </span>
                  ) : (
                    'Book Now'
                  )}
                </button>

                <p className={styles.submitHint}>
                  By booking, you agree to our{' '}
                  <Link href="/terms" className={styles.link}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/refund" className={styles.link}>Cancellation Policy</Link>.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
