'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import styles from './page.module.css';

const PARTY_BOATS = [
  {
    id: 'pb-1',
    name: 'Royal Celebration',
    capacityMin: 50,
    capacityMax: 100,
    basePrice: 50000,
    locationOptions: ['HARBOR', 'CRUISE'],
    djIncluded: true,
    eventTypes: ['Wedding', 'Birthday', 'Corporate', 'College Farewell', 'Other'],
    timeSlots: [
      { id: 'morning', label: 'Morning', time: '6:00 AM - 12:00 PM', price: 50000 },
      { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 6:00 PM', price: 55000 },
      { id: 'evening', label: 'Evening', time: '6:00 PM - 12:00 AM', price: 65000 },
      { id: 'fullday', label: 'Full Day', time: '6:00 AM - 12:00 AM', price: 120000 },
    ],
    addOns: [
      { id: 'catering-veg', name: 'Vegetarian Catering', price: 400, priceType: 'PER_PERSON', description: 'Full course veg meal with starters, main course, and desserts' },
      { id: 'catering-nonveg', name: 'Non-Vegetarian Catering', price: 600, priceType: 'PER_PERSON', description: 'Full course non-veg meal with starters, main course, and desserts' },
      { id: 'live-band', name: 'Live Band', price: 25000, priceType: 'FIXED', description: 'Professional 5-piece band for live music performance' },
      { id: 'photographer', name: 'Photographer', price: 20000, priceType: 'FIXED', description: 'Professional photographer with edited photos delivered in 7 days' },
      { id: 'decoration-standard', name: 'Standard Decoration', price: 15000, priceType: 'FIXED', description: 'Balloon and ribbon decoration with theme colors' },
      { id: 'decoration-premium', name: 'Premium Decoration', price: 35000, priceType: 'FIXED', description: 'Flower decoration with lighting, drapes, and custom theme' },
    ],
    cancellationPolicy: { fullRefundDays: 7, partialRefundDays: 3, partialPercent: 50 },
    paymentTerms: { advancePercent: 50, remainderDueBeforeDays: 3 },
  },
  {
    id: 'pb-2',
    name: 'Paradise Cruiser',
    capacityMin: 80,
    capacityMax: 150,
    basePrice: 75000,
    locationOptions: ['CRUISE'],
    djIncluded: true,
    eventTypes: ['Wedding', 'Birthday', 'Corporate', 'Other'],
    timeSlots: [
      { id: 'morning', label: 'Morning', time: '6:00 AM - 12:00 PM', price: 75000 },
      { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 6:00 PM', price: 80000 },
      { id: 'evening', label: 'Evening', time: '6:00 PM - 12:00 AM', price: 95000 },
      { id: 'fullday', label: 'Full Day', time: '6:00 AM - 12:00 AM', price: 180000 },
    ],
    addOns: [
      { id: 'catering-veg', name: 'Vegetarian Catering', price: 400, priceType: 'PER_PERSON', description: 'Full course veg meal with starters, main course, and desserts' },
      { id: 'catering-nonveg', name: 'Non-Vegetarian Catering', price: 600, priceType: 'PER_PERSON', description: 'Full course non-veg meal with starters, main course, and desserts' },
      { id: 'live-band', name: 'Live Band', price: 25000, priceType: 'FIXED', description: 'Professional 5-piece band for live music performance' },
      { id: 'photographer', name: 'Photographer', price: 20000, priceType: 'FIXED', description: 'Professional photographer with edited photos delivered in 7 days' },
      { id: 'decoration-standard', name: 'Standard Decoration', price: 15000, priceType: 'FIXED', description: 'Balloon and ribbon decoration with theme colors' },
      { id: 'decoration-premium', name: 'Premium Decoration', price: 40000, priceType: 'FIXED', description: 'Luxury flower decoration with lighting, drapes, and custom theme' },
    ],
    cancellationPolicy: { fullRefundDays: 7, partialRefundDays: 3, partialPercent: 50 },
    paymentTerms: { advancePercent: 50, remainderDueBeforeDays: 3 },
  },
  {
    id: 'pb-3',
    name: 'Star Night',
    capacityMin: 30,
    capacityMax: 60,
    basePrice: 35000,
    locationOptions: ['HARBOR'],
    djIncluded: true,
    eventTypes: ['Birthday', 'College Farewell', 'Corporate', 'Other'],
    timeSlots: [
      { id: 'morning', label: 'Morning', time: '6:00 AM - 12:00 PM', price: 35000 },
      { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 6:00 PM', price: 38000 },
      { id: 'evening', label: 'Evening', time: '6:00 PM - 12:00 AM', price: 45000 },
      { id: 'fullday', label: 'Full Day', time: '6:00 AM - 12:00 AM', price: 75000 },
    ],
    addOns: [
      { id: 'catering-veg', name: 'Vegetarian Catering', price: 400, priceType: 'PER_PERSON', description: 'Full course veg meal with starters, main course, and desserts' },
      { id: 'catering-nonveg', name: 'Non-Vegetarian Catering', price: 600, priceType: 'PER_PERSON', description: 'Full course non-veg meal with starters, main course, and desserts' },
      { id: 'live-band', name: 'Live Band', price: 25000, priceType: 'FIXED', description: 'Professional 5-piece band for live music performance' },
      { id: 'photographer', name: 'Photographer', price: 15000, priceType: 'FIXED', description: 'Professional photographer with edited photos delivered in 7 days' },
      { id: 'decoration-standard', name: 'Standard Decoration', price: 10000, priceType: 'FIXED', description: 'Balloon and ribbon decoration with theme colors' },
    ],
    cancellationPolicy: { fullRefundDays: 7, partialRefundDays: 3, partialPercent: 50 },
    paymentTerms: { advancePercent: 50, remainderDueBeforeDays: 3 },
  },
  {
    id: 'pb-4',
    name: 'Grand Voyager',
    capacityMin: 100,
    capacityMax: 200,
    basePrice: 100000,
    locationOptions: ['HARBOR', 'CRUISE'],
    djIncluded: true,
    eventTypes: ['Wedding', 'Birthday', 'Corporate', 'College Farewell', 'Other'],
    timeSlots: [
      { id: 'morning', label: 'Morning', time: '6:00 AM - 12:00 PM', price: 100000 },
      { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 6:00 PM', price: 110000 },
      { id: 'evening', label: 'Evening', time: '6:00 PM - 12:00 AM', price: 130000 },
      { id: 'fullday', label: 'Full Day', time: '6:00 AM - 12:00 AM', price: 250000 },
    ],
    addOns: [
      { id: 'catering-veg', name: 'Vegetarian Catering', price: 400, priceType: 'PER_PERSON', description: 'Full course veg meal with starters, main course, and desserts' },
      { id: 'catering-nonveg', name: 'Non-Vegetarian Catering', price: 600, priceType: 'PER_PERSON', description: 'Full course non-veg meal with starters, main course, and desserts' },
      { id: 'live-band', name: 'Live Band', price: 30000, priceType: 'FIXED', description: 'Professional 7-piece band with vocalist for live music performance' },
      { id: 'photographer', name: 'Photographer + Videographer', price: 35000, priceType: 'FIXED', description: 'Professional photo + video coverage with edited deliverables' },
      { id: 'decoration-standard', name: 'Standard Decoration', price: 20000, priceType: 'FIXED', description: 'Balloon and ribbon decoration with theme colors' },
      { id: 'decoration-premium', name: 'Premium Decoration', price: 50000, priceType: 'FIXED', description: 'Grand flower decoration with lighting, drapes, stage, and custom theme' },
    ],
    cancellationPolicy: { fullRefundDays: 7, partialRefundDays: 3, partialPercent: 50 },
    paymentTerms: { advancePercent: 50, remainderDueBeforeDays: 3 },
  },
];

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

export default function PartyBoatBookPage() {
  const params = useParams();
  const boat = PARTY_BOATS.find((b) => b.id === params.id);
  const { isAuthenticated, user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();

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
    addOnsParam.split(',').forEach(id => { obj[id] = true; });
    return obj;
  });

  // Step 5: Your Details
  const [customerName, setCustomerName] = useState(isAuthenticated && user?.name ? user.name : '');
  const [customerEmail, setCustomerEmail] = useState(isAuthenticated && user?.email ? user.email : '');
  const [customerPhone, setCustomerPhone] = useState(isAuthenticated && user?.phone ? user.phone : '');
  const [specialRequests, setSpecialRequests] = useState('');

  // Date constraints
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const maxDate = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Price calculation
  const priceBreakdown = useMemo(() => {
    if (!boat) return null;

    const timeSlot = boat.timeSlots.find((s) => s.id === selectedTimeSlot);
    const slotPrice = timeSlot ? timeSlot.price : 0;
    const guests = parseInt(guestCount) || 0;

    let addOnsTotal = 0;
    const addOnItems = [];

    Object.keys(selectedAddOns).forEach((addOnId) => {
      if (!selectedAddOns[addOnId]) return;
      const addOn = boat.addOns.find((a) => a.id === addOnId);
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
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;
    const advance = Math.round(total * (boat.paymentTerms.advancePercent / 100));
    const remainder = total - advance;

    return {
      slotPrice,
      addOnItems,
      addOnsTotal,
      subtotal,
      gst,
      total,
      advance,
      remainder,
    };
  }, [boat, selectedTimeSlot, selectedAddOns, guestCount]);

  if (!boat) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <h1 className={styles.notFoundTitle}>Boat Not Found</h1>
            <p className={styles.notFoundText}>The party boat you are looking for does not exist.</p>
            <Link href="/party-boats" className={styles.backLink}>Back to Party Boats</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleAddOnToggle = (addOnId) => {
    setSelectedAddOns((prev) => ({
      ...prev,
      [addOnId]: !prev[addOnId],
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
    if (specialRequests) confirmParams.set('requests', specialRequests);
    router.push(`/party-boats/${params.id}/book/confirmation?${confirmParams.toString()}`);
  };

  const handleRequestQuote = () => {
    alert('Your custom quote request has been submitted! Our team will contact you within 24 hours.');
  };

  const selectedSlotData = boat.timeSlots.find((s) => s.id === selectedTimeSlot);

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
                      {boat.eventTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
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
                    {boat.timeSlots.map((slot) => (
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
                    {boat.locationOptions.map((loc) => (
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
                  {boat.locationOptions.length === 1 && (
                    <p className={styles.hint}>This boat is only available at {LOCATION_LABELS[boat.locationOptions[0]]}.</p>
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
                    {boat.addOns.map((addOn) => {
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
                            <p className={styles.addOnDesc}>{addOn.description}</p>
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
                        className={styles.input}
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="you@example.com"
                        disabled={isAuthenticated && !!user?.email}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        className={styles.input}
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="98765 43210"
                        maxLength={10}
                      />
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
                        <span className={styles.reviewValue}>{eventType}</span>
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
                  <span className={styles.summaryValue}>{eventType || 'Not selected'}</span>
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
                    <span>{boat.paymentTerms.advancePercent}% advance</span>
                    <span className={styles.paymentAmount}>{formatCurrency(priceBreakdown.advance)}</span>
                  </div>
                  <div className={styles.paymentRow}>
                    <span>Remainder due {boat.paymentTerms.remainderDueBeforeDays} days before</span>
                    <span className={styles.paymentAmount}>{formatCurrency(priceBreakdown.remainder)}</span>
                  </div>
                </div>
              )}

              {/* Cancellation Policy */}
              <div className={styles.summaryCancellation}>
                <h4 className={styles.cancellationTitle}>Cancellation Policy</h4>
                <ul className={styles.cancellationList}>
                  <li>{boat.cancellationPolicy.fullRefundDays}+ days: 100% refund</li>
                  <li>{boat.cancellationPolicy.partialRefundDays}-{boat.cancellationPolicy.fullRefundDays} days: {boat.cancellationPolicy.partialPercent}% refund</li>
                  <li>Less than {boat.cancellationPolicy.partialRefundDays} days: No refund</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
