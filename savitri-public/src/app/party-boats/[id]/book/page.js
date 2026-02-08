'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { API_ENDPOINTS } from '@/utils/constants';
import styles from './page.module.css';

// ==================== CONSTANTS ====================

const TIME_SLOT_CONFIG = {
  MORNING: { label: 'Morning', time: '6:00 AM - 12:00 PM' },
  AFTERNOON: { label: 'Afternoon', time: '12:00 PM - 6:00 PM' },
  EVENING: { label: 'Evening', time: '6:00 PM - 12:00 AM' },
  FULL_DAY: { label: 'Full Day', time: '6:00 AM - 12:00 AM' },
};

const EVENT_TYPE_LABELS = {
  WEDDING: 'Wedding',
  BIRTHDAY: 'Birthday',
  CORPORATE: 'Corporate',
  COLLEGE_FAREWELL: 'College Farewell',
  OTHER: 'Other',
};

const LOCATION_DESCRIPTIONS = {
  HARBOR: 'Docked at harbor with city views',
  CRUISE: 'Sailing along Mumbai coastline',
};

const LOCATION_LABELS = {
  HARBOR: 'Harbor',
  CRUISE: 'Cruise',
};

const STEPS = [
  { id: 1, label: 'Event Details' },
  { id: 2, label: 'Time Slot' },
  { id: 3, label: 'Location' },
  { id: 4, label: 'Add-ons' },
  { id: 5, label: 'Your Details' },
  { id: 6, label: 'Review' },
];

// Default policies (standard across all party boats)
const DEFAULT_CANCELLATION_POLICY = { fullRefundDays: 7, partialRefundDays: 3, partialPercent: 50 };
const DEFAULT_PAYMENT_TERMS = { advancePercent: 50, remainderDueBeforeDays: 3 };

// ==================== HELPERS ====================

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Not selected';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

// ==================== COMPONENT ====================

export default function PartyBoatBookPage() {
  const params = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  // API state
  const [boat, setBoat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Event Details
  const [eventType, setEventType] = useState(() => searchParams.get('eventType') || '');
  const [guestCount, setGuestCount] = useState('');
  const [eventDate, setEventDate] = useState('');

  // Step 2: Time Slot
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(() => searchParams.get('timeSlot') || '');

  // Step 3: Location
  const [selectedLocation, setSelectedLocation] = useState('');

  // Step 4: Add-ons
  const [selectedAddOns, setSelectedAddOns] = useState(() => {
    const addOnsParam = searchParams.get('addOns');
    if (!addOnsParam) return {};
    const obj = {};
    addOnsParam.split(',').forEach(key => { obj[key] = true; });
    return obj;
  });

  // Step 5: Your Details
  const [customerName, setCustomerName] = useState(isAuthenticated && user?.name ? user.name : '');
  const [customerEmail, setCustomerEmail] = useState(isAuthenticated && user?.email ? user.email : '');
  const [customerPhone, setCustomerPhone] = useState(isAuthenticated && user?.phone ? user.phone : '');
  const [specialRequests, setSpecialRequests] = useState('');

  // Coupon state
  const [couponCode, setCouponCode] = useState(() => searchParams.get('couponCode') || '');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Date constraints
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const maxDate = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Fetch boat data on mount
  useEffect(() => {
    const fetchBoat = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(API_ENDPOINTS.BOOKINGS.PARTY_BOAT_BY_ID(params.id));

        if (response.success && response.data) {
          setBoat(response.data);
        } else {
          setError('Party boat not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load boat details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBoat();
    }
  }, [params.id]);

  // Derive cancellation policy and payment terms from boat or use defaults
  const cancellationPolicy = boat?.cancellationPolicy || DEFAULT_CANCELLATION_POLICY;
  const paymentTerms = boat?.paymentTerms || DEFAULT_PAYMENT_TERMS;

  // Build time slots from API data
  const timeSlots = useMemo(() => {
    if (!boat || !boat.timeSlots) return [];
    return boat.timeSlots.map((slotKey) => {
      const config = TIME_SLOT_CONFIG[slotKey];
      if (!config) return null;
      return {
        id: slotKey,
        label: config.label,
        time: config.time,
        price: boat.basePrice,
      };
    }).filter(Boolean);
  }, [boat]);

  // Build add-ons list from API data
  const addOns = useMemo(() => {
    if (!boat || !boat.addOns) return [];
    return boat.addOns.map((addOn) => ({
      id: addOn.type,
      name: addOn.label,
      price: addOn.price,
      priceType: addOn.priceType,
      description: addOn.description || '',
    }));
  }, [boat]);

  // Build event types from API data
  const eventTypes = useMemo(() => {
    if (!boat || !boat.eventTypes) return [];
    return boat.eventTypes.map((type) => ({
      value: type,
      label: EVENT_TYPE_LABELS[type] || type,
    }));
  }, [boat]);

  // Build location options from API data
  const locationOptions = useMemo(() => {
    if (!boat || !boat.locationOptions) return [];
    return boat.locationOptions;
  }, [boat]);

  // Price calculation
  const priceBreakdown = useMemo(() => {
    if (!boat) return null;

    const timeSlot = timeSlots.find((s) => s.id === selectedTimeSlot);
    const slotPrice = timeSlot ? timeSlot.price : 0;
    const guests = parseInt(guestCount) || 0;

    let addOnsTotal = 0;
    const addOnItems = [];

    Object.keys(selectedAddOns).forEach((addOnKey) => {
      if (!selectedAddOns[addOnKey]) return;
      const addOn = addOns.find((a) => a.id === addOnKey);
      if (!addOn) return;

      let itemTotal = 0;
      if (addOn.priceType === 'PER_PERSON') {
        itemTotal = addOn.price * (guests || boat.capacityMin);
        addOnItems.push({
          name: addOn.name,
          detail: `${formatCurrency(addOn.price)} x ${guests || boat.capacityMin} guests`,
          amount: itemTotal,
        });
      } else {
        itemTotal = addOn.price;
        addOnItems.push({
          name: addOn.name,
          detail: null,
          amount: itemTotal,
        });
      }
      addOnsTotal += itemTotal;
    });

    const subtotal = slotPrice + addOnsTotal;
    const discount = couponApplied ? couponApplied.discount : 0;
    const discountedSubtotal = Math.max(0, subtotal - discount);
    const gst = Math.round(discountedSubtotal * 0.18);
    const total = discountedSubtotal + gst;
    const advance = Math.round(total * (paymentTerms.advancePercent / 100));
    const remainder = total - advance;

    return {
      slotPrice,
      addOnItems,
      addOnsTotal,
      subtotal,
      discount,
      discountedSubtotal,
      gst,
      total,
      advance,
      remainder,
    };
  }, [boat, timeSlots, addOns, selectedTimeSlot, selectedAddOns, guestCount, paymentTerms, couponApplied]);

  // Coupon handlers
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || couponLoading) return;

    try {
      setCouponLoading(true);
      setCouponError('');
      setCouponApplied(null);

      const orderAmount = priceBreakdown ? priceBreakdown.subtotal : 0;

      const response = await api.post(API_ENDPOINTS.BOOKINGS.APPLY_COUPON, {
        code: couponCode.trim().toUpperCase(),
        orderAmount,
        bookingType: 'PARTY_BOAT',
      });

      if (response.success && response.data) {
        setCouponApplied(response.data);
        setCouponError('');
      } else {
        setCouponError(response.message || 'Invalid coupon code');
      }
    } catch (err) {
      setCouponError(err.message || 'Failed to apply coupon');
      setCouponApplied(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    setCouponError('');
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <p>Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error / not found
  if (error || !boat) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <h1 className={styles.notFoundTitle}>Boat Not Found</h1>
            <p className={styles.notFoundText}>
              {error || 'The party boat you are looking for does not exist.'}
            </p>
            <Link href="/party-boats" className={styles.backLink}>Back to Party Boats</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAddOnToggle = (addOnKey) => {
    setSelectedAddOns((prev) => ({
      ...prev,
      [addOnKey]: !prev[addOnKey],
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return eventType && guestCount && eventDate &&
          parseInt(guestCount) >= boat.capacityMin &&
          parseInt(guestCount) <= boat.capacityMax;
      case 2:
        return !!selectedTimeSlot;
      case 3:
        return !!selectedLocation;
      case 4:
        return true; // Add-ons are optional
      case 5:
        return customerName.trim() && customerEmail.trim() && customerPhone.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) &&
          /^[6-9]\d{9}$/.test(customerPhone.replace(/\s/g, ''));
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 6 && canProceed()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const selectedSlotData = timeSlots.find((s) => s.id === selectedTimeSlot);

  const handleConfirmBooking = () => {
    const confirmParams = new URLSearchParams();
    confirmParams.set('boat', boat.name);
    confirmParams.set('event', eventType);
    confirmParams.set('guests', guestCount);
    confirmParams.set('date', eventDate);
    confirmParams.set('slot', selectedSlotData ? `${selectedSlotData.label} (${selectedSlotData.time})` : '');
    confirmParams.set('slotPrice', priceBreakdown?.slotPrice || 0);
    confirmParams.set('location', LOCATION_LABELS[selectedLocation] || '');
    confirmParams.set('name', customerName);
    confirmParams.set('email', customerEmail);
    confirmParams.set('phone', customerPhone);
    confirmParams.set('subtotal', priceBreakdown?.subtotal || 0);
    confirmParams.set('gst', priceBreakdown?.gst || 0);
    confirmParams.set('total', priceBreakdown?.total || 0);
    confirmParams.set('advance', priceBreakdown?.advance || 0);
    confirmParams.set('remainder', priceBreakdown?.remainder || 0);
    confirmParams.set('addOnsTotal', priceBreakdown?.addOnsTotal || 0);
    confirmParams.set('capacity', `${boat.capacityMin}-${boat.capacityMax}`);
    if (priceBreakdown?.discount > 0) confirmParams.set('discount', priceBreakdown.discount);
    if (couponApplied) confirmParams.set('couponCode', couponApplied.code || couponCode);
    if (specialRequests) confirmParams.set('requests', specialRequests);
    const boatId = boat.id || boat._id;
    router.push(`/party-boats/${boatId}/book/confirmation?${confirmParams.toString()}`);
  };

  const handleRequestQuote = () => {
    alert('Your custom quote request has been submitted! Our team will contact you within 24 hours.');
  };

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Book Party Boat</h1>
          <p className={styles.pageSubtitle}>Complete the steps below to reserve your event</p>
        </div>
      </div>

      <div className={styles.container}>
        {/* Selected Boat Card */}
        <div className={styles.selectedBoat}>
          <div className={styles.selectedBoatInfo}>
            <h3 className={styles.selectedBoatName}>{boat.name}</h3>
            <span className={styles.selectedBoatCapacity}>{boat.capacityMin}-{boat.capacityMax} Guests</span>
          </div>
          {boat.djIncluded && <span className={styles.selectedBoatDj}>DJ Included</span>}
        </div>

        {/* Step Indicators */}
        <div className={styles.stepIndicators}>
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className={`${styles.stepIndicator} ${currentStep === step.id ? styles.stepActive : ''} ${currentStep > step.id ? styles.stepCompleted : ''}`}
                onClick={() => {
                  if (step.id < currentStep) setCurrentStep(step.id);
                }}
              >
                <div className={styles.stepCircle}>
                  {currentStep > step.id ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span className={styles.stepLabel}>{step.label}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`${styles.stepLine} ${currentStep > step.id ? styles.stepLineCompleted : ''}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Main Layout */}
        <div className={styles.bookingLayout}>
          {/* Left Column - Form */}
          <div className={styles.formColumn}>
            {/* Step 1: Event Details */}
            {currentStep === 1 && (
              <div className={styles.stepCard}>
                <div className={styles.stepCardHeader}>
                  <span className={styles.stepBadge}>1</span>
                  <h2 className={styles.stepCardTitle}>Event Details</h2>
                </div>
                <div className={styles.stepCardContent}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="eventType">Event Type</label>
                    <select
                      id="eventType"
                      className={styles.select}
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                    >
                      <option value="">Select event type</option>
                      {eventTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="guestCount">Number of Guests</label>
                    <input
                      type="number"
                      id="guestCount"
                      className={styles.input}
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      min={boat.capacityMin}
                      max={boat.capacityMax}
                      placeholder={`${boat.capacityMin} - ${boat.capacityMax}`}
                    />
                    <p className={styles.hint}>Capacity: {boat.capacityMin} to {boat.capacityMax} guests</p>
                    {guestCount && (parseInt(guestCount) < boat.capacityMin || parseInt(guestCount) > boat.capacityMax) && (
                      <p className={styles.fieldError}>
                        Guest count must be between {boat.capacityMin} and {boat.capacityMax}
                      </p>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Event Date</label>
                    <div className={styles.datePickerWrapper}>
                      <input
                        type="date"
                        id="eventDate"
                        className={styles.dateInput}
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        min={minDate}
                        max={maxDate}
                      />
                      <div className={styles.dateDisplay} onClick={() => document.getElementById('eventDate').showPicker?.()}>
                        {eventDate ? (
                          <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <path d="M16 2V6M8 2V6M3 10H21" strokeLinecap="round" />
                            </svg>
                            <span className={styles.dateDisplayText}>
                              {new Date(eventDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                            <button type="button" className={styles.dateClearBtn} onClick={(e) => { e.stopPropagation(); setEventDate(''); }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <path d="M16 2V6M8 2V6M3 10H21" strokeLinecap="round" />
                            </svg>
                            <span className={styles.dateDisplayPlaceholder}>Select event date</span>
                          </>
                        )}
                      </div>
                    </div>
                    <p className={styles.hint}>You can book up to 45 days in advance</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Time Slot */}
            {currentStep === 2 && (
              <div className={styles.stepCard}>
                <div className={styles.stepCardHeader}>
                  <span className={styles.stepBadge}>2</span>
                  <h2 className={styles.stepCardTitle}>Select Time Slot</h2>
                </div>
                <div className={styles.stepCardContent}>
                  <div className={styles.timeSlotGrid}>
                    {timeSlots.map((slot) => (
                      <label
                        key={slot.id}
                        className={`${styles.timeSlotOption} ${selectedTimeSlot === slot.id ? styles.timeSlotActive : ''}`}
                      >
                        <input
                          type="radio"
                          name="timeSlot"
                          value={slot.id}
                          checked={selectedTimeSlot === slot.id}
                          onChange={() => setSelectedTimeSlot(slot.id)}
                          className={styles.radioInput}
                        />
                        <div className={styles.timeSlotContent}>
                          <span className={styles.timeSlotLabel}>{slot.label}</span>
                          <span className={styles.timeSlotTime}>{slot.time}</span>
                          <span className={styles.timeSlotPrice}>{formatCurrency(slot.price)}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <div className={styles.stepCard}>
                <div className={styles.stepCardHeader}>
                  <span className={styles.stepBadge}>3</span>
                  <h2 className={styles.stepCardTitle}>Select Location</h2>
                </div>
                <div className={styles.stepCardContent}>
                  <div className={styles.locationGrid}>
                    {locationOptions.map((loc) => (
                      <label
                        key={loc}
                        className={`${styles.locationOption} ${selectedLocation === loc ? styles.locationActive : ''}`}
                      >
                        <input
                          type="radio"
                          name="location"
                          value={loc}
                          checked={selectedLocation === loc}
                          onChange={() => setSelectedLocation(loc)}
                          className={styles.radioInput}
                        />
                        <div className={styles.locationContent}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.locationIcon}>
                            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2" />
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          <span className={styles.locationLabel}>{LOCATION_LABELS[loc]}</span>
                          <span className={styles.locationDesc}>{LOCATION_DESCRIPTIONS[loc]}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {locationOptions.length === 1 && (
                    <p className={styles.hint}>This boat is only available at {LOCATION_LABELS[locationOptions[0]]}.</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Add-ons */}
            {currentStep === 4 && (
              <div className={styles.stepCard}>
                <div className={styles.stepCardHeader}>
                  <span className={styles.stepBadge}>4</span>
                  <h2 className={styles.stepCardTitle}>Add-ons (Optional)</h2>
                </div>
                <div className={styles.stepCardContent}>
                  <p className={styles.addOnHint}>Enhance your event with these optional add-ons</p>
                  <div className={styles.addOnsList}>
                    {addOns.map((addOn) => {
                      const isSelected = !!selectedAddOns[addOn.id];
                      const guests = parseInt(guestCount) || boat.capacityMin;
                      return (
                        <div
                          key={addOn.id}
                          className={`${styles.addOnItem} ${isSelected ? styles.addOnItemActive : ''}`}
                          onClick={() => handleAddOnToggle(addOn.id)}
                        >
                          <div className={styles.addOnCheckbox}>
                            {isSelected && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <div className={styles.addOnDetails}>
                            <div className={styles.addOnRow}>
                              <span className={styles.addOnName}>{addOn.name}</span>
                              <span className={styles.addOnPrice}>
                                {addOn.priceType === 'PER_PERSON'
                                  ? `${formatCurrency(addOn.price)}/person`
                                  : formatCurrency(addOn.price)
                                }
                              </span>
                            </div>
                            {addOn.description && <p className={styles.addOnDesc}>{addOn.description}</p>}
                            {isSelected && addOn.priceType === 'PER_PERSON' && (
                              <p className={styles.addOnCalc}>
                                {formatCurrency(addOn.price)} x {guests} guests = {formatCurrency(addOn.price * guests)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Your Details */}
            {currentStep === 5 && (
              <div className={styles.stepCard}>
                <div className={styles.stepCardHeader}>
                  <span className={styles.stepBadge}>5</span>
                  <h2 className={styles.stepCardTitle}>Your Details</h2>
                </div>
                <div className={styles.stepCardContent}>
                  {isAuthenticated && user ? (
                    <div className={styles.autoFillNote}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ verticalAlign: 'middle', marginRight: 6, flexShrink: 0 }}>
                        <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Logged in as <strong>{user.name || user.email}</strong>. Your details have been auto-filled.
                    </div>
                  ) : (
                    <div className={styles.autoFillNote} style={{ backgroundColor: 'var(--color-primary-50)' }}>
                      Already have an account? <a href="/login" className={styles.loginLink}>Log in</a> to auto-fill your details.
                    </div>
                  )}
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      className={styles.input}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={isAuthenticated && !!user?.name}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        className={`${styles.input} ${customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) ? styles.inputError : ''}`}
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
                      <label className={styles.label} htmlFor="phone">Phone Number</label>
                      <div className={styles.phoneInputWrapper}>
                        <span className={styles.phonePrefix}>+91</span>
                        <input
                          type="tel"
                          id="phone"
                          className={`${styles.input} ${styles.phoneInput} ${customerPhone && !/^\d{10}$/.test(customerPhone) ? styles.inputError : ''}`}
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

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="requests">Special Requests (Optional)</label>
                    <textarea
                      id="requests"
                      className={styles.textarea}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any special arrangements, dietary requirements, or notes..."
                      rows={4}
                      maxLength={500}
                    />
                    <p className={styles.hint}>{specialRequests.length}/500 characters</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
              <div className={styles.stepCard}>
                <div className={styles.stepCardHeader}>
                  <span className={styles.stepBadge}>6</span>
                  <h2 className={styles.stepCardTitle}>Review & Confirm</h2>
                </div>
                <div className={styles.stepCardContent}>
                  <div className={styles.reviewSection}>
                    <h3 className={styles.reviewLabel}>Event Details</h3>
                    <div className={styles.reviewGrid}>
                      <div className={styles.reviewItem}>
                        <span className={styles.reviewKey}>Boat</span>
                        <span className={styles.reviewValue}>{boat.name}</span>
                      </div>
                      <div className={styles.reviewItem}>
                        <span className={styles.reviewKey}>Event Type</span>
                        <span className={styles.reviewValue}>{EVENT_TYPE_LABELS[eventType] || eventType}</span>
                      </div>
                      <div className={styles.reviewItem}>
                        <span className={styles.reviewKey}>Guests</span>
                        <span className={styles.reviewValue}>{guestCount}</span>
                      </div>
                      <div className={styles.reviewItem}>
                        <span className={styles.reviewKey}>Date</span>
                        <span className={styles.reviewValue}>{formatDate(eventDate)}</span>
                      </div>
                      <div className={styles.reviewItem}>
                        <span className={styles.reviewKey}>Time Slot</span>
                        <span className={styles.reviewValue}>
                          {selectedSlotData ? `${selectedSlotData.label} (${selectedSlotData.time})` : '-'}
                        </span>
                      </div>
                      <div className={styles.reviewItem}>
                        <span className={styles.reviewKey}>Location</span>
                        <span className={styles.reviewValue}>{LOCATION_LABELS[selectedLocation] || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {priceBreakdown && priceBreakdown.addOnItems.length > 0 && (
                    <div className={styles.reviewSection}>
                      <h3 className={styles.reviewLabel}>Add-ons</h3>
                      <div className={styles.reviewAddOns}>
                        {priceBreakdown.addOnItems.map((item, i) => (
                          <div key={i} className={styles.reviewAddOnRow}>
                            <span>{item.name}</span>
                            <span>{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.reviewSection}>
                    <h3 className={styles.reviewLabel}>Contact Information</h3>
                    <div className={styles.reviewGrid}>
                      <div className={styles.reviewItem}>
                        <span className={styles.reviewKey}>Name</span>
                        <span className={styles.reviewValue}>{customerName}</span>
                      </div>
                      <div className={styles.reviewItem}>
                        <span className={styles.reviewKey}>Email</span>
                        <span className={styles.reviewValue}>{customerEmail}</span>
                      </div>
                      <div className={styles.reviewItem}>
                        <span className={styles.reviewKey}>Phone</span>
                        <span className={styles.reviewValue}>{customerPhone}</span>
                      </div>
                      {specialRequests && (
                        <div className={`${styles.reviewItem} ${styles.reviewItemFull}`}>
                          <span className={styles.reviewKey}>Special Requests</span>
                          <span className={styles.reviewValue}>{specialRequests}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.reviewActions}>
                    <button className={styles.confirmBtn} onClick={handleConfirmBooking}>
                      Confirm Booking
                    </button>
                    <button className={styles.quoteBtn} onClick={handleRequestQuote}>
                      Request Custom Quote
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className={styles.navButtons}>
              {currentStep > 1 && (
                <button className={styles.backBtn} onClick={handleBack}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Back
                </button>
              )}
              {currentStep < 6 && (
                <button
                  className={styles.nextBtn}
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Next
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Price Summary */}
          <div className={styles.summaryColumn}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Booking Summary</h3>

              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Boat</span>
                  <span className={styles.summaryValue}>{boat.name}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Event</span>
                  <span className={styles.summaryValue}>{eventType ? (EVENT_TYPE_LABELS[eventType] || eventType) : 'Not selected'}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Date</span>
                  <span className={styles.summaryValue}>{eventDate ? formatDate(eventDate) : 'Not selected'}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Guests</span>
                  <span className={styles.summaryValue}>{guestCount || 'Not selected'}</span>
                </div>
              </div>

              {/* Coupon Section */}
              <div className={styles.couponSection}>
                <label className={styles.couponLabel}>Coupon Code</label>
                <div className={styles.couponInputRow}>
                  <input
                    type="text"
                    className={styles.couponInput}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    disabled={!!couponApplied || couponLoading}
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
                    Coupon applied! You save {formatCurrency(couponApplied.discount)}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              {priceBreakdown && (
                <div className={styles.priceBreakdown}>
                  {priceBreakdown.slotPrice > 0 && (
                    <div className={styles.priceRow}>
                      <span>Time Slot ({selectedSlotData?.label || '-'})</span>
                      <span>{formatCurrency(priceBreakdown.slotPrice)}</span>
                    </div>
                  )}

                  {selectedLocation && (
                    <div className={styles.priceRow}>
                      <span>Location</span>
                      <span>{LOCATION_LABELS[selectedLocation]}</span>
                    </div>
                  )}

                  {priceBreakdown.addOnItems.map((item, i) => (
                    <div key={i} className={styles.priceRow}>
                      <span>{item.name}</span>
                      <span>{formatCurrency(item.amount)}</span>
                    </div>
                  ))}

                  <div className={`${styles.priceRow} ${styles.subtotalRow}`}>
                    <span>Subtotal</span>
                    <span>{formatCurrency(priceBreakdown.subtotal)}</span>
                  </div>

                  {priceBreakdown.discount > 0 && (
                    <div className={styles.priceRow} style={{ color: 'var(--color-success)' }}>
                      <span>Coupon Discount</span>
                      <span>-{formatCurrency(priceBreakdown.discount)}</span>
                    </div>
                  )}

                  <div className={styles.priceRow}>
                    <span>GST (18%)</span>
                    <span>{formatCurrency(priceBreakdown.gst)}</span>
                  </div>
                  <div className={`${styles.priceRow} ${styles.totalRow}`}>
                    <span>Total</span>
                    <span>{formatCurrency(priceBreakdown.total)}</span>
                  </div>
                </div>
              )}

              {!priceBreakdown?.slotPrice && (
                <div className={styles.priceHint}>
                  Select event details and time slot to see pricing.
                </div>
              )}

              {/* Payment Terms */}
              {priceBreakdown && priceBreakdown.total > 0 && (
                <div className={styles.paymentTerms}>
                  <div className={styles.paymentRow}>
                    <span>{paymentTerms.advancePercent}% advance</span>
                    <span className={styles.paymentAmount}>{formatCurrency(priceBreakdown.advance)}</span>
                  </div>
                  <div className={styles.paymentRow}>
                    <span>Remainder due {paymentTerms.remainderDueBeforeDays} days before</span>
                    <span className={styles.paymentAmount}>{formatCurrency(priceBreakdown.remainder)}</span>
                  </div>
                </div>
              )}

              {/* Cancellation Policy */}
              <div className={styles.summaryCancellation}>
                <h4 className={styles.cancellationTitle}>Cancellation Policy</h4>
                <ul className={styles.cancellationList}>
                  <li>{cancellationPolicy.fullRefundDays}+ days: 100% refund</li>
                  <li>{cancellationPolicy.partialRefundDays}-{cancellationPolicy.fullRefundDays} days: {cancellationPolicy.partialPercent}% refund</li>
                  <li>Less than {cancellationPolicy.partialRefundDays} days: No refund</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
