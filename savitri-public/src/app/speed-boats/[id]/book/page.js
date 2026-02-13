'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { API_ENDPOINTS } from '@/utils/constants';
import styles from './page.module.css';

// ==================== CONSTANTS ====================

const DURATION_OPTIONS = [
  { value: 1, label: '1 Hr' },
  { value: 1.5, label: '1.5 Hrs' },
  { value: 2, label: '2 Hrs' },
  { value: 2.5, label: '2.5 Hrs' },
  { value: 3, label: '3 Hrs' },
  { value: 3.5, label: '3.5 Hrs' },
  { value: 4, label: '4 Hrs' },
];

const BOAT_GRADIENTS = [
  'linear-gradient(135deg, #0891b2, #0e7490)',
  'linear-gradient(135deg, #059669, #047857)',
  'linear-gradient(135deg, #7c3aed, #6d28d9)',
  'linear-gradient(135deg, #d97706, #b45309)',
  'linear-gradient(135deg, #2563eb, #1d4ed8)',
  'linear-gradient(135deg, #dc2626, #b91c1c)',
];

// ==================== HELPERS ====================

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatTime12 = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m === 0 ? '00' : String(m).padStart(2, '0')} ${period}`;
};

const addHoursToTime = (timeStr, hours) => {
  const [h, m] = timeStr.split(':').map(Number);
  const totalMinutes = h * 60 + m + hours * 60;
  const endH = Math.floor(totalMinutes / 60);
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
};

const generateCalendarDays = (calendarStatuses) => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const closedDates = new Set();
  if (calendarStatuses) {
    calendarStatuses.forEach((entry) => {
      if (!entry.isOpen) closedDates.add(entry.date);
    });
  }

  for (let i = 0; i < 45; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    days.push({
      date,
      dateStr,
      dayName: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      dayNumber: date.getDate(),
      month: date.toLocaleDateString('en-IN', { month: 'short' }),
      isClosed: closedDates.has(dateStr),
      isToday: i === 0,
    });
  }
  return days;
};

// ==================== COMPONENT ====================

export default function SpeedBoatBookPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  // API data
  const [boat, setBoat] = useState(null);
  const [calendarStatuses, setCalendarStatuses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Available slots from API
  const [availableSlots, setAvailableSlots] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Pricing from API
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Booking submission
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // Step management — auto-advance to Step 2 if coming from detail page with slot pre-selected
  const [currentStep, setCurrentStep] = useState(() => {
    const hasDate = searchParams.get('date');
    const hasSlot = searchParams.get('startTime');
    return (hasDate && hasSlot) ? 2 : 1;
  });
  const totalSteps = 4;
  // Step 1: Date (paginated week view)
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) return -1; // temporary, resolved after data loads
    return null;
  });

  // Step 2: Time & Duration
  const [selectedSlotTime, setSelectedSlotTime] = useState(() => {
    return searchParams.get('startTime') || null;
  });
  const [duration, setDuration] = useState(() => {
    const d = searchParams.get('duration');
    return d ? parseFloat(d) : 2;
  });
  const [isCustomDuration, setIsCustomDuration] = useState(() => {
    const d = searchParams.get('duration');
    return d && ![1, 1.5, 2, 2.5, 3, 3.5, 4].includes(parseFloat(d));
  });
  const [customHours, setCustomHours] = useState(() => {
    const d = searchParams.get('duration');
    return d && ![1, 1.5, 2, 2.5, 3, 3.5, 4].includes(parseFloat(d)) ? parseFloat(d) : 5;
  });
  const effectiveDuration = isCustomDuration ? customHours : duration;

  // Step 3: Customer Details
  const [customerName, setCustomerName] = useState(isAuthenticated && user?.name ? user.name : '');
  const [customerEmail, setCustomerEmail] = useState(isAuthenticated && user?.email ? user.email : '');
  const [customerPhone, setCustomerPhone] = useState(isAuthenticated && user?.phone ? user.phone : '');

  // Step 4: Payment
  const [paymentMode, setPaymentMode] = useState('ONLINE');
  const [customerNotes, setCustomerNotes] = useState('');

  // Additional boats selection
  const [selectedBoatIds, setSelectedBoatIds] = useState([params.id]); // primary boat always selected
  const [additionalBoats, setAdditionalBoats] = useState([]); // other available boats for the slot
  const [showAddBoats, setShowAddBoats] = useState(false);
  const [additionalBoatsLoading, setAdditionalBoatsLoading] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState(() => searchParams.get('couponCode') || '');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const calendarDays = generateCalendarDays(calendarStatuses);
  const DAYS_PER_PAGE = 7;
  const totalWeeks = Math.ceil(calendarDays.length / DAYS_PER_PAGE);
  const visibleDays = calendarDays.slice(
    weekOffset * DAYS_PER_PAGE,
    (weekOffset + 1) * DAYS_PER_PAGE
  );

  // Compute time slots from API data
  const getComputedSlots = () => {
    if (!availableSlots || !availableSlots.slots) return [];
    const apiSlots = availableSlots.slots;
    const blocks = Math.ceil(effectiveDuration);
    const slots = [];

    for (let i = 0; i <= apiSlots.length - blocks; i++) {
      const range = apiSlots.slice(i, i + blocks);
      const allAvailable = range.every((s) => s.isAvailable);
      const startTime = range[0].time;
      const endTime = addHoursToTime(startTime, effectiveDuration);

      slots.push({
        startTime,
        label: `${formatTime12(startTime)} - ${formatTime12(endTime)}`,
        available: allAvailable,
      });
    }
    return slots;
  };

  const computedSlots = getComputedSlots();
  const selectedSlot = computedSlots.find((s) => s.startTime === selectedSlotTime);

  // Get boat gradient fallback
  const getBoatGradient = () => {
    if (!boat) return BOAT_GRADIENTS[0];
    const idx = boat.name ? boat.name.charCodeAt(0) % BOAT_GRADIENTS.length : 0;
    return BOAT_GRADIENTS[idx];
  };

  // Fetch boat detail and calendar on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 44);
        const startDateStr = today.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        const [boatResponse, calendarResponse] = await Promise.all([
          api.get(API_ENDPOINTS.BOOKINGS.BOAT_BY_ID(params.id)),
          api.get(`${API_ENDPOINTS.BOOKINGS.CALENDAR_STATUS}?startDate=${startDateStr}&endDate=${endDateStr}`),
        ]);

        if (boatResponse.success) setBoat(boatResponse.data);
        if (calendarResponse.success) setCalendarStatuses(calendarResponse.data || []);

        // Resolve date param to day index
        const dateParam = searchParams.get('date');
        if (dateParam) {
          const days = generateCalendarDays(calendarResponse.data || []);
          const idx = days.findIndex((d) => d.dateStr === dateParam);
          if (idx >= 0) {
            setSelectedDayIndex(idx);
            // Set week offset to show the selected date
            setWeekOffset(Math.floor(idx / 7));
          } else {
            setSelectedDayIndex(null);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load boat details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDayIndex === null || selectedDayIndex < 0 || !calendarDays[selectedDayIndex]) return;
    if (calendarDays[selectedDayIndex].isClosed) return;

    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        const dateStr = calendarDays[selectedDayIndex].dateStr;
        const response = await api.get(
          `${API_ENDPOINTS.BOOKINGS.AVAILABLE_SLOTS}?date=${dateStr}&numberOfBoats=1`
        );
        if (response.success) {
          setAvailableSlots(response.data);
        }
      } catch (err) {
        setAvailableSlots(null);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDayIndex, calendarStatuses]);

  // Fetch pricing when slot + duration + boats are selected
  useEffect(() => {
    if (!selectedSlotTime || selectedDayIndex === null || selectedDayIndex < 0 || !calendarDays[selectedDayIndex]) {
      setPricing(null);
      return;
    }

    const fetchPricing = async () => {
      try {
        setPricingLoading(true);
        const dateStr = calendarDays[selectedDayIndex].dateStr;
        const response = await api.post(API_ENDPOINTS.BOOKINGS.CALCULATE_PRICE, {
          date: dateStr,
          startTime: selectedSlotTime,
          duration: effectiveDuration,
          numberOfBoats: selectedBoatIds.length,
          boatIds: selectedBoatIds,
        });
        if (response.success) {
          setPricing(response.data);
        }
      } catch (err) {
        setPricing(null);
      } finally {
        setPricingLoading(false);
      }
    };

    fetchPricing();
  }, [selectedSlotTime, selectedDayIndex, effectiveDuration, selectedBoatIds.length]);

  // Fetch available additional boats when a slot is selected
  useEffect(() => {
    if (!selectedSlotTime || selectedDayIndex === null || selectedDayIndex < 0 || !calendarDays[selectedDayIndex]) {
      setAdditionalBoats([]);
      return;
    }

    const fetchAdditionalBoats = async () => {
      try {
        setAdditionalBoatsLoading(true);
        const dateStr = calendarDays[selectedDayIndex].dateStr;
        const response = await api.get(
          `${API_ENDPOINTS.BOOKINGS.AVAILABLE_BOATS}?date=${dateStr}&startTime=${selectedSlotTime}&duration=${effectiveDuration}`
        );
        if (response.success) {
          // Filter out the primary boat from the list
          const otherBoats = (response.data.availableBoatList || []).filter(
            b => (b.id || b._id) !== params.id
          );
          setAdditionalBoats(otherBoats);
        }
      } catch (err) {
        setAdditionalBoats([]);
      } finally {
        setAdditionalBoatsLoading(false);
      }
    };

    fetchAdditionalBoats();
  }, [selectedSlotTime, selectedDayIndex, effectiveDuration, params.id]);

  // Handlers
  const handleDaySelect = (index) => {
    if (!calendarDays[index].isClosed) {
      setSelectedDayIndex(index);
      setSelectedSlotTime(null);
      setPricing(null);
      setSelectedBoatIds([params.id]); // reset to primary boat
      setShowAddBoats(false);
    }
  };

  const handleDurationChange = (value) => {
    setIsCustomDuration(false);
    setDuration(value);
    setSelectedSlotTime(null);
    setPricing(null);
    setSelectedBoatIds([params.id]);
    setShowAddBoats(false);
  };

  const handleCustomDuration = () => {
    setIsCustomDuration(true);
    setSelectedSlotTime(null);
    setPricing(null);
    setSelectedBoatIds([params.id]);
    setShowAddBoats(false);
  };

  const handleCustomHoursChange = (val) => {
    const num = Math.max(0.5, Math.min(8, parseFloat(val) || 1));
    setCustomHours(num);
    setSelectedSlotTime(null);
    setPricing(null);
  };

  const handleToggleAdditionalBoat = (boatId) => {
    setSelectedBoatIds((prev) => {
      if (prev.includes(boatId)) {
        return prev.filter((id) => id !== boatId);
      }
      return [...prev, boatId];
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || couponLoading) return;

    try {
      setCouponLoading(true);
      setCouponError('');
      setCouponApplied(null);

      const orderAmount = pricing ? pricing.totalAmount : boat.baseRate * effectiveDuration * 1.18;

      const response = await api.post(API_ENDPOINTS.BOOKINGS.APPLY_COUPON, {
        code: couponCode.trim().toUpperCase(),
        orderAmount: Math.round(orderAmount),
        bookingType: 'SPEED_BOAT',
      });

      if (response.success) {
        setCouponApplied(response.data);
        setCouponError('');
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code');
      setCouponApplied(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponApplied(null);
    setCouponError('');
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return selectedDayIndex !== null && selectedDayIndex >= 0;
      case 2:
        return selectedSlotTime !== null;
      case 3:
        return (
          customerName.trim() !== '' &&
          customerEmail.trim() !== '' &&
          customerPhone.trim() !== ''
        );
      case 4:
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (currentStep < totalSteps && canGoNext()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmBooking = async () => {
    if (bookingLoading) return;

    try {
      setBookingLoading(true);
      setBookingError(null);

      const dateStr = calendarDays[selectedDayIndex].dateStr;

      const response = await api.post(API_ENDPOINTS.BOOKINGS.CREATE, {
        date: dateStr,
        startTime: selectedSlotTime,
        duration: effectiveDuration,
        boatIds: selectedBoatIds,
        numberOfBoats: selectedBoatIds.length,
        paymentMode,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        customerNotes: customerNotes.trim() || undefined,
        couponCode: couponApplied ? couponApplied.code : undefined,
      });

      if (response.success) {
        setBookingSuccess(response.data);
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <div className={styles.loadingSpinner}></div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !boat) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h1 className={styles.notFoundTitle}>{error ? 'Error' : 'Boat Not Found'}</h1>
          <p className={styles.notFoundText}>
            {error || 'The speed boat you are looking for does not exist.'}
          </p>
          <Link href="/speed-boats" className={styles.notFoundButton}>
            Back to All Boats
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (bookingSuccess) {
    const isOnlinePayment = paymentMode === 'ONLINE';
    const displayPaymentStatus = (bookingSuccess.paymentStatus === 'PENDING')
      ? 'Awaiting Payment'
      : bookingSuccess.paymentStatus;

    return (
      <div className={styles.page}>
        <div className={styles.successContainer}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className={styles.successTitle}>Booking Created!</h1>
            <p className={styles.successText}>
              Your speed boat booking has been created successfully.
            </p>

            <div className={styles.successPaymentNote}>
              <div className={styles.successPaymentNoteIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <p className={styles.successPaymentNoteText}>
                {isOnlinePayment
                  ? 'Your booking has been created. Payment status will be updated once payment is verified by our team.'
                  : bookingSuccess.advanceAmount > 0
                    ? `Your booking has been created. Advance of ${formatCurrency(bookingSuccess.advanceAmount)} has been recorded. Please pay the remaining ${formatCurrency(bookingSuccess.remainingAmount)} at the venue.`
                    : 'Your booking has been created. Please pay at the venue on the day of your booking.'}
              </p>
            </div>

            <div className={styles.successDetails}>
              <div className={styles.successRow}>
                <span>Booking #</span>
                <strong>{bookingSuccess.bookingNumber}</strong>
              </div>
              <div className={styles.successRow}>
                <span>Boat</span>
                <strong>{boat.name}</strong>
              </div>
              <div className={styles.successRow}>
                <span>Date</span>
                <strong>
                  {calendarDays[selectedDayIndex]?.date.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </strong>
              </div>
              <div className={styles.successRow}>
                <span>Time</span>
                <strong>{selectedSlot ? selectedSlot.label : ''}</strong>
              </div>
              <div className={styles.successRow}>
                <span>Duration</span>
                <strong>{effectiveDuration} hour{effectiveDuration > 1 ? 's' : ''}</strong>
              </div>
              <div className={styles.successRow}>
                <span>Payment</span>
                <strong className={styles.successStatus}>{displayPaymentStatus}</strong>
              </div>
              <div className={styles.successRow}>
                <span>Payment Mode</span>
                <strong>{isOnlinePayment ? 'Online' : 'At Venue'}</strong>
              </div>
              <div className={styles.successRow}>
                <span>Total</span>
                <strong className={styles.successAmount}>
                  {formatCurrency(bookingSuccess.pricing?.finalAmount || 0)}
                </strong>
              </div>
            </div>

            <p className={styles.successNote}>
              A confirmation email has been sent to <strong>{customerEmail}</strong>.
              You can view and manage your bookings from your account.
            </p>

            <div className={styles.successActions}>
              {isAuthenticated ? (
                <Link href="/account/bookings" className={styles.successPrimaryBtn}>
                  View My Bookings
                </Link>
              ) : (
                <Link href="/speed-boats" className={styles.successPrimaryBtn}>
                  Browse More Boats
                </Link>
              )}
              <Link href="/speed-boats" className={styles.successSecondaryBtn}>
                Back to Speed Boats
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Select Date' },
    { num: 2, label: 'Time & Duration' },
    { num: 3, label: 'Your Details' },
    { num: 4, label: 'Payment & Notes' },
  ];

  // Estimated price for display (API pricing when available, fallback to base estimate)
  const estimatedTotal = pricing
    ? (couponApplied ? pricing.totalAmount - couponApplied.discountAmount : pricing.finalAmount)
    : boat.baseRate * effectiveDuration * selectedBoatIds.length;

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Book {boat.name}</h1>
          <p className={styles.pageSubtitle}>Complete the steps below to reserve your speed boat</p>
        </div>
      </div>

      <div className={styles.container}>
        {/* Selected Boat Card */}
        <div className={styles.selectedBoatCard}>
          <div className={styles.selectedBoatImage} style={{ background: getBoatGradient() }}>
            {boat.images && boat.images.length > 0 ? (
              <img
                src={typeof boat.images[0] === 'string' ? boat.images[0] : boat.images[0].url}
                alt={boat.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
              />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5">
                <path d="M2 20L4.5 17.5M4.5 17.5L8.04 13.96C8.47 13.53 9.13 13.44 9.66 13.74L10.34 14.13C10.87 14.43 11.53 14.34 11.96 13.91L15.5 10.37M4.5 17.5H8M15.5 10.37L18.5 7.37M15.5 10.37L18 10.37M22 4L18.5 7.37M18.5 7.37V4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className={styles.selectedBoatInfo}>
            <h3 className={styles.selectedBoatName}>{boat.name}</h3>
            <p className={styles.selectedBoatMeta}>
              {boat.capacity} Passengers &middot; Captain Included
            </p>
          </div>
          <div className={styles.selectedBoatPrice}>
            {formatCurrency(boat.baseRate)}/hr
          </div>
        </div>

        {/* Step Indicators */}
        <div className={styles.stepIndicators}>
          {steps.map((step) => (
            <div
              key={step.num}
              className={`${styles.stepIndicator} ${currentStep === step.num ? styles.stepIndicatorActive : ''} ${currentStep > step.num ? styles.stepIndicatorDone : ''}`}
              onClick={() => { if (step.num < currentStep) setCurrentStep(step.num); }}
            >
              <div className={styles.stepCircle}>
                {currentStep > step.num ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
              {step.num < totalSteps && <div className={styles.stepLine}></div>}
            </div>
          ))}
        </div>

        {/* Main Layout */}
        <div className={styles.bookingLayout}>

          {/* Left Column - Form Steps */}
          <div className={styles.formColumn}>

            {/* Step 1: Select Date */}
            {currentStep === 1 && (
              <div className={styles.stepCard}>
                <div className={styles.stepCardHeader}>
                  <span className={styles.stepBadge}>1</span>
                  <h2 className={styles.stepCardTitle}>Select Date</h2>
                </div>
                <div className={styles.stepCardContent}>
                  <p className={styles.stepHint}>
                    Choose your preferred date. Bookings available up to 45 days in advance.
                  </p>

                  {/* Week Navigation */}
                  <div className={styles.calendarNav}>
                    <button
                      className={styles.calNavButton}
                      onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                      disabled={weekOffset === 0}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Prev Week
                    </button>
                    <span className={styles.calNavLabel}>
                      {visibleDays[0]?.month} {visibleDays[0]?.dayNumber} &ndash; {visibleDays[visibleDays.length - 1]?.month} {visibleDays[visibleDays.length - 1]?.dayNumber}
                    </span>
                    <button
                      className={styles.calNavButton}
                      onClick={() => setWeekOffset(Math.min(totalWeeks - 1, weekOffset + 1))}
                      disabled={weekOffset >= totalWeeks - 1}
                    >
                      Next Week
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>

                  {/* Calendar Grid (7 days) */}
                  <div className={styles.calendarGrid}>
                    {visibleDays.map((day, localIdx) => {
                      const globalIdx = weekOffset * DAYS_PER_PAGE + localIdx;
                      return (
                        <button
                          key={globalIdx}
                          className={`${styles.calDay} ${selectedDayIndex === globalIdx ? styles.calDaySelected : ''} ${day.isClosed ? styles.calDayClosed : ''} ${day.isToday ? styles.calDayToday : ''}`}
                          onClick={() => handleDaySelect(globalIdx)}
                          disabled={day.isClosed}
                        >
                          <span className={styles.calDayName}>{day.dayName}</span>
                          <span className={styles.calDayNum}>{day.dayNumber}</span>
                          <span className={styles.calDayMonth}>{day.month}</span>
                          {day.isClosed && <span className={styles.calClosedLabel}>Closed</span>}
                        </button>
                      );
                    })}
                  </div>

                  {selectedDayIndex !== null && selectedDayIndex >= 0 && calendarDays[selectedDayIndex] && (
                    <p className={styles.dateSelected}>
                      Selected:{' '}
                      <strong>
                        {calendarDays[selectedDayIndex].date.toLocaleDateString('en-IN', {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </strong>
                    </p>
                  )}

                  {/* Quick Info */}
                  <div className={styles.quickInfo}>
                    <div className={styles.quickInfoItem}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>Operating hours: 8:00 AM - 6:00 PM</span>
                    </div>
                    <div className={styles.quickInfoItem}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>Departure: Gateway of India, Mumbai</span>
                    </div>
                    <div className={styles.quickInfoItem}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Free cancellation up to 24 hours before</span>
                    </div>
                    <div className={styles.quickInfoItem}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Captain &amp; safety gear included</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Time & Duration */}
            {currentStep === 2 && (
              <div className={styles.stepCard}>
                <div className={styles.stepCardHeader}>
                  <span className={styles.stepBadge}>2</span>
                  <h2 className={styles.stepCardTitle}>Select Time & Duration</h2>
                </div>
                <div className={styles.stepCardContent}>
                  {/* Duration Pills */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>How long do you want to ride?</label>
                    <div className={styles.durationPills}>
                      {DURATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          className={`${styles.durationPill} ${!isCustomDuration && duration === opt.value ? styles.durationPillSelected : ''}`}
                          onClick={() => handleDurationChange(opt.value)}
                        >
                          {opt.label}
                          {opt.value === 2 && <span className={styles.pillBadge}>Popular</span>}
                        </button>
                      ))}
                      <button
                        className={`${styles.durationPill} ${isCustomDuration ? styles.durationPillSelected : ''}`}
                        onClick={handleCustomDuration}
                      >
                        Custom
                      </button>
                    </div>
                    {isCustomDuration && (
                      <div className={styles.customDurationRow}>
                        <label className={styles.customDurationLabel}>Hours:</label>
                        <input
                          type="number"
                          className={styles.customDurationInput}
                          value={customHours}
                          onChange={(e) => handleCustomHoursChange(e.target.value)}
                          min={0.5}
                          max={8}
                          step={0.5}
                        />
                        <span className={styles.customDurationHint}>0.5-8 hours</span>
                      </div>
                    )}
                  </div>

                  {/* Computed Time Slots */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Available {effectiveDuration}-Hour Slots</label>
                    <p className={styles.fieldHint}>
                      Grey slots overlap with already booked times and are unavailable.
                    </p>
                    {slotsLoading ? (
                      <p className={styles.fieldHint}>Loading available slots...</p>
                    ) : availableSlots && !availableSlots.open ? (
                      <p className={styles.fieldHint} style={{ color: 'var(--color-error)' }}>
                        Operations are closed on this date. Please select another date.
                      </p>
                    ) : computedSlots.length === 0 ? (
                      <p className={styles.fieldHint} style={{ color: 'var(--color-error)' }}>
                        No slots available for this duration. Try a shorter duration.
                      </p>
                    ) : (
                      <div className={styles.timeSlotsGrid}>
                        {computedSlots.map((slot) => (
                          <button
                            key={slot.startTime}
                            className={`${styles.timeSlot} ${selectedSlotTime === slot.startTime ? styles.timeSlotSelected : ''} ${!slot.available ? styles.timeSlotBooked : ''}`}
                            onClick={() => {
                              if (slot.available) setSelectedSlotTime(slot.startTime);
                            }}
                            disabled={!slot.available}
                          >
                            <span className={styles.slotLabel}>{slot.label}</span>
                            {!slot.available && <span className={styles.slotBookedTag}>Unavailable</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add More Boats Section */}
                  {selectedSlotTime && additionalBoats.length > 0 && (
                    <div className={styles.formGroup}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label className={styles.formLabel}>
                          Boats Selected: {selectedBoatIds.length}
                        </label>
                        <button
                          type="button"
                          className={styles.addBoatsToggle}
                          onClick={() => setShowAddBoats(!showAddBoats)}
                        >
                          {showAddBoats ? 'Hide' : 'Add More Boats'}
                        </button>
                      </div>
                      {showAddBoats && (
                        <div className={styles.additionalBoatsList}>
                          {additionalBoatsLoading ? (
                            <p className={styles.fieldHint}>Loading available boats...</p>
                          ) : (
                            additionalBoats.map((addBoat) => {
                              const addBoatId = addBoat.id || addBoat._id;
                              const isSelected = selectedBoatIds.includes(addBoatId);
                              return (
                                <label
                                  key={addBoatId}
                                  className={`${styles.additionalBoatItem} ${isSelected ? styles.additionalBoatItemSelected : ''}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleAdditionalBoat(addBoatId)}
                                    className={styles.additionalBoatCheckbox}
                                  />
                                  <div className={styles.additionalBoatInfo}>
                                    <span className={styles.additionalBoatName}>{addBoat.name}</span>
                                    <span className={styles.additionalBoatMeta}>
                                      {addBoat.registrationNumber} &middot; {addBoat.capacity} passengers &middot; {formatCurrency(addBoat.baseRate)}/hr
                                    </span>
                                  </div>
                                </label>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Customer Details */}
            {currentStep === 3 && (
              <div className={styles.stepCard}>
                <div className={styles.stepCardHeader}>
                  <span className={styles.stepBadge}>3</span>
                  <h2 className={styles.stepCardTitle}>Your Details</h2>
                </div>
                <div className={styles.stepCardContent}>
                  {isAuthenticated && user ? (
                    <p className={styles.guestNote}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ verticalAlign: 'middle', marginRight: 6 }}>
                        <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Logged in as <strong>{user.name || user.email}</strong>. Your details have been auto-filled.
                    </p>
                  ) : (
                    <p className={styles.guestNote}>
                      An account will be created automatically with your details. Already have an account?{' '}
                      <Link href="/login" className={styles.link}>Log in</Link>
                    </p>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      className={styles.textInput}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={isAuthenticated && !!user?.name}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        className={`${styles.textInput} ${customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) ? styles.inputError : ''}`}
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="you@example.com"
                        disabled={isAuthenticated && !!user?.email}
                      />
                      {customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) && (
                        <span className={styles.fieldError}>Please enter a valid email</span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="phone">Phone Number</label>
                      <div className={styles.phoneInputWrapper}>
                        <span className={styles.phonePrefix}>+91</span>
                        <input
                          type="tel"
                          id="phone"
                          className={`${styles.textInput} ${styles.phoneInput} ${customerPhone && !/^\d{10}$/.test(customerPhone) ? styles.inputError : ''}`}
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="98765 43210"
                          maxLength={10}
                        />
                      </div>
                      {customerPhone && !/^\d{10}$/.test(customerPhone) && (
                        <span className={styles.fieldError}>Enter a valid 10-digit number</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Payment & Notes */}
            {currentStep === 4 && (
              <div className={styles.stepCard}>
                <div className={styles.stepCardHeader}>
                  <span className={styles.stepBadge}>4</span>
                  <h2 className={styles.stepCardTitle}>Payment & Notes</h2>
                </div>
                <div className={styles.stepCardContent}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Payment Mode</label>
                    <div className={styles.radioGroup}>
                      <label className={`${styles.radioCard} ${paymentMode === 'ONLINE' ? styles.radioCardSelected : ''}`}>
                        <input
                          type="radio"
                          name="paymentMode"
                          value="ONLINE"
                          checked={paymentMode === 'ONLINE'}
                          onChange={(e) => setPaymentMode(e.target.value)}
                          className={styles.radioInput}
                        />
                        <div className={styles.radioContent}>
                          <span className={styles.radioTitle}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="1" y1="10" x2="23" y2="10" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Pay Online
                          </span>
                          <span className={styles.radioDesc}>Secure online payment via UPI, card, or net banking</span>
                        </div>
                      </label>
                      <label className={`${styles.radioCard} ${paymentMode === 'AT_VENUE' ? styles.radioCardSelected : ''}`}>
                        <input
                          type="radio"
                          name="paymentMode"
                          value="AT_VENUE"
                          checked={paymentMode === 'AT_VENUE'}
                          onChange={(e) => setPaymentMode(e.target.value)}
                          className={styles.radioInput}
                        />
                        <div className={styles.radioContent}>
                          <span className={styles.radioTitle}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            Pay at Venue
                          </span>
                          <span className={styles.radioDesc}>
                            {(() => {
                              const totalAmt = pricing ? (couponApplied ? pricing.totalAmount - couponApplied.discountAmount : pricing.finalAmount) : (boat.baseRate * effectiveDuration * selectedBoatIds.length * 1.18);
                              const advAmt = Math.round((totalAmt * 25) / 100);
                              const remAmt = Math.round(totalAmt) - advAmt;
                              return `Pay ${formatCurrency(advAmt)} advance now + ${formatCurrency(remAmt)} at venue`;
                            })()}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="notes">Notes (Optional)</label>
                    <textarea
                      id="notes"
                      className={styles.textarea}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Any special requests or notes for your booking..."
                      rows={3}
                      maxLength={500}
                    />
                    <p className={styles.fieldHint}>{customerNotes.length}/500 characters</p>
                  </div>

                  {bookingError && (
                    <div className={styles.bookingErrorBox}>
                      <p>{bookingError}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step Navigation */}
            <div className={styles.stepNav}>
              {currentStep < totalSteps ? (
                <button
                  className={styles.nextButton}
                  onClick={goNext}
                  disabled={!canGoNext()}
                >
                  Continue to {steps[currentStep]?.label || 'Next'}
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ) : (
                <button
                  className={styles.confirmButton}
                  onClick={handleConfirmBooking}
                  disabled={!canGoNext() || bookingLoading}
                >
                  {bookingLoading ? 'Creating Booking...' : `Confirm Booking \u00B7 ${formatCurrency(estimatedTotal)}`}
                </button>
              )}
              {currentStep > 1 && (
                <button className={styles.backButton} onClick={goBack}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Go Back to {steps[currentStep - 2]?.label || 'Previous Step'}
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Price Summary */}
          <div className={styles.summaryColumn}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Booking Summary</h3>

              {/* Boat */}
              <div className={styles.summarySection}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>{selectedBoatIds.length > 1 ? 'Boats' : 'Boat'}</span>
                  <span className={styles.summaryValue}>
                    {selectedBoatIds.length > 1
                      ? `${boat.name} + ${selectedBoatIds.length - 1} more`
                      : boat.name}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Date</span>
                  <span className={styles.summaryValue}>
                    {selectedDayIndex !== null && selectedDayIndex >= 0 && calendarDays[selectedDayIndex]
                      ? calendarDays[selectedDayIndex].date.toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Not selected'}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Time</span>
                  <span className={styles.summaryValue}>
                    {selectedSlot ? selectedSlot.label : (selectedSlotTime ? formatTime12(selectedSlotTime) : 'Not selected')}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Duration</span>
                  <span className={styles.summaryValue}>{effectiveDuration} hour{effectiveDuration > 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Coupon Section */}
              <div className={styles.couponSection}>
                <span className={styles.couponLabel}>Have a coupon code?</span>
                <div className={styles.couponInputRow}>
                  <input
                    type="text"
                    className={styles.couponInput}
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      if (couponError) setCouponError('');
                    }}
                    placeholder="Enter code"
                    disabled={!!couponApplied || couponLoading}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  {couponApplied ? (
                    <button className={styles.couponRemoveBtn} onClick={handleRemoveCoupon}>
                      Remove
                    </button>
                  ) : (
                    <button
                      className={styles.couponApplyBtn}
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || couponLoading}
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponError && <p className={styles.couponError}>{couponError}</p>}
                {couponApplied && (
                  <p className={styles.couponSuccess}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {couponApplied.discountType === 'PERCENTAGE'
                      ? `${couponApplied.discountValue}% off applied! You save ${formatCurrency(couponApplied.discountAmount)}`
                      : `${formatCurrency(couponApplied.discountAmount)} off applied!`}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className={styles.priceBreakdown}>
                {pricing ? (
                  <>
                    {pricing.boatPricing && pricing.boatPricing.length > 1 ? (
                      pricing.boatPricing.map((bp, idx) => (
                        <div key={idx} className={styles.priceRow}>
                          <span>{bp.boatName} ({formatCurrency(bp.adjustedRate)}/hr x {pricing.duration}h)</span>
                          <span>{formatCurrency(bp.subtotal)}</span>
                        </div>
                      ))
                    ) : (
                      <div className={styles.priceRow}>
                        <span>Base rate ({formatCurrency(pricing.adjustedRate)}/hr x {pricing.duration}h{pricing.numberOfBoats > 1 ? ` x ${pricing.numberOfBoats}` : ''})</span>
                        <span>{formatCurrency(pricing.subtotal)}</span>
                      </div>
                    )}
                    {pricing.appliedRule && (
                      <div className={`${styles.priceRow}`} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                        <span>{pricing.appliedRule.name} ({pricing.appliedRule.adjustmentPercent > 0 ? '+' : ''}{pricing.appliedRule.adjustmentPercent}%)</span>
                        <span></span>
                      </div>
                    )}
                    <div className={styles.priceRow}>
                      <span>GST ({pricing.gstPercent}%)</span>
                      <span>{formatCurrency(pricing.gstAmount)}</span>
                    </div>
                    {couponApplied && (
                      <div className={`${styles.priceRow} ${styles.priceDiscount}`}>
                        <span>Coupon ({couponApplied.code})</span>
                        <span>-{formatCurrency(couponApplied.discountAmount)}</span>
                      </div>
                    )}
                    <div className={`${styles.priceRow} ${styles.priceTotal}`}>
                      <span>Total</span>
                      <span>{formatCurrency(couponApplied ? pricing.totalAmount - couponApplied.discountAmount : pricing.finalAmount)}</span>
                    </div>
                  </>
                ) : pricingLoading ? (
                  <div className={styles.priceRow}>
                    <span>Calculating price...</span>
                    <span></span>
                  </div>
                ) : (
                  <>
                    <div className={styles.priceRow}>
                      <span>{formatCurrency(boat.baseRate)} x {effectiveDuration} hr{effectiveDuration > 1 ? 's' : ''}{selectedBoatIds.length > 1 ? ` x ${selectedBoatIds.length} boats` : ''}</span>
                      <span>{formatCurrency(boat.baseRate * effectiveDuration * selectedBoatIds.length)}</span>
                    </div>
                    <div className={styles.priceRow}>
                      <span>GST (18%)</span>
                      <span>{formatCurrency(Math.round(boat.baseRate * effectiveDuration * selectedBoatIds.length * 0.18))}</span>
                    </div>
                    <div className={`${styles.priceRow} ${styles.priceTotal}`}>
                      <span>Estimated Total</span>
                      <span>{formatCurrency(Math.round(boat.baseRate * effectiveDuration * selectedBoatIds.length * 1.18))}</span>
                    </div>
                    <p className={styles.fieldHint} style={{ marginTop: '4px' }}>
                      Final price may vary based on dynamic pricing. Select a time slot for exact pricing.
                    </p>
                  </>
                )}
              </div>

              {/* Cancellation Policy */}
              <div className={styles.policyNote}>
                <h4 className={styles.policyNoteTitle}>Cancellation Policy</h4>
                <ul className={styles.policyNoteList}>
                  <li>24+ hours: 100% refund</li>
                  <li>12-24 hours: 50% refund</li>
                  <li>Less than 12 hours: No refund</li>
                </ul>
              </div>

              <p className={styles.termsNote}>
                By booking, you agree to our{' '}
                <Link href="/terms" className={styles.link}>Terms</Link>
                {' '}and{' '}
                <Link href="/refund" className={styles.link}>Cancellation Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
