'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { API_ENDPOINTS } from '@/utils/constants';
import { useAuthStore } from '@/store/authStore';
import styles from './page.module.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const LOCATION_LABELS = {
  HARBOR: 'Harbor',
  CRUISE: 'Cruise',
};

const EVENT_TYPE_LABELS = {
  WEDDING: 'Wedding',
  BIRTHDAY: 'Birthday',
  CORPORATE: 'Corporate',
  COLLEGE_FAREWELL: 'College Farewell',
  OTHER: 'Other',
};

const TIME_SLOT_LABELS = {
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  EVENING: 'Evening',
  FULL_DAY: 'Full Day',
};

const MAX_VISIBLE_EVENTS = 3;

// Gradient colors for boats without images (cycled by index)
const BOAT_GRADIENTS = [
  'linear-gradient(135deg, #dc2626, #991b1b)',
  'linear-gradient(135deg, #7c3aed, #5b21b6)',
  'linear-gradient(135deg, #0891b2, #155e75)',
  'linear-gradient(135deg, #d97706, #92400e)',
];

const generateCalendarDays = (calendarStatuses) => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const statusMap = {};
  if (calendarStatuses && calendarStatuses.length > 0) {
    calendarStatuses.forEach(s => {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      statusMap[key] = s.isOpen;
    });
  }

  for (let i = 0; i < 46; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const isOpen = statusMap[key] !== undefined ? statusMap[key] : true;

    days.push({
      date,
      dayName: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateNum: date.getDate(),
      month: date.toLocaleDateString('en-IN', { month: 'short' }),
      isClosed: !isOpen,
      isToday: i === 0,
    });
  }
  return days;
};

const INITIAL_INQUIRY_FORM = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  eventType: '',
  numberOfGuests: '',
  preferredDate: '',
  preferredTimeSlot: '',
  locationType: '',
  specialRequests: '',
  budget: '',
};

export default function PartyBoatsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [calendarDays, setCalendarDays] = useState([]);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Inquiry modal state
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryBoat, setInquiryBoat] = useState(null);
  const [inquiryForm, setInquiryForm] = useState(INITIAL_INQUIRY_FORM);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 45);

        const startDateStr = today.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        const [boatsResponse, calendarResponse] = await Promise.all([
          api.get(API_ENDPOINTS.BOOKINGS.PARTY_BOATS),
          api.get(`${API_ENDPOINTS.BOOKINGS.CALENDAR_STATUS}?startDate=${startDateStr}&endDate=${endDateStr}`),
        ]);

        setBoats(boatsResponse.data || []);
        setCalendarDays(generateCalendarDays(calendarResponse.data || []));
      } catch (err) {
        console.error('Failed to load party boats:', err);
        setError(err.message || 'Failed to load party boats');
        setCalendarDays(generateCalendarDays([]));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const checkScrollability = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    checkScrollability();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollability);
      return () => el.removeEventListener('scroll', checkScrollability);
    }
  }, [calendarDays]);

  const scrollCalendar = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = 280;
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const handleDateSelect = (index) => {
    if (!calendarDays[index].isClosed) {
      setSelectedDateIndex(index);
    }
  };

  // Open inquiry modal for a specific boat
  const openInquiryModal = (boat, e) => {
    if (e) e.stopPropagation();
    setInquiryBoat(boat);
    setInquiryForm({
      ...INITIAL_INQUIRY_FORM,
      customerName: isAuthenticated && user?.name ? user.name : '',
      customerEmail: isAuthenticated && user?.email ? user.email : '',
      customerPhone: isAuthenticated && user?.phone ? user.phone : '',
    });
    setInquiryError('');
    setInquirySuccess(null);
    setShowInquiryModal(true);
  };

  const closeInquiryModal = () => {
    setShowInquiryModal(false);
    setInquiryBoat(null);
    setInquiryError('');
    setInquirySuccess(null);
  };

  const handleInquiryChange = (field, value) => {
    setInquiryForm(prev => ({ ...prev, [field]: value }));
    if (inquiryError) setInquiryError('');
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!inquiryForm.customerName.trim() || !inquiryForm.customerEmail.trim() || !inquiryForm.customerPhone.trim() || !inquiryForm.eventType) {
      setInquiryError('Please fill in all required fields (Name, Email, Phone, Event Type)');
      return;
    }

    try {
      setInquirySubmitting(true);
      setInquiryError('');

      const payload = {
        customerName: inquiryForm.customerName.trim(),
        customerEmail: inquiryForm.customerEmail.trim(),
        customerPhone: inquiryForm.customerPhone.trim(),
        boatId: inquiryBoat.id || inquiryBoat._id,
        eventType: inquiryForm.eventType,
      };

      if (inquiryForm.numberOfGuests) payload.numberOfGuests = parseInt(inquiryForm.numberOfGuests);
      if (inquiryForm.preferredDate) payload.preferredDate = inquiryForm.preferredDate;
      if (inquiryForm.preferredTimeSlot) payload.preferredTimeSlot = inquiryForm.preferredTimeSlot;
      if (inquiryForm.locationType) payload.locationType = inquiryForm.locationType;
      if (inquiryForm.specialRequests.trim()) payload.specialRequests = inquiryForm.specialRequests.trim();
      if (inquiryForm.budget) payload.budget = parseFloat(inquiryForm.budget);

      const response = await api.post(API_ENDPOINTS.INQUIRIES.CREATE, payload);

      if (response.success) {
        setInquirySuccess(response.data);
      }
    } catch (err) {
      setInquiryError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setInquirySubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Party Boats</h1>
          <p className={styles.heroSubtitle}>
            Celebrate in style on the water. From intimate gatherings to grand celebrations,
            find the perfect party boat for your next event.
          </p>
          <div className={styles.heroActions}>
            <a href="#boats" className={styles.heroButton}>
              Explore Our Fleet
            </a>
            <button
              className={styles.heroButtonOutline}
              onClick={() => {
                if (boats.length > 0) {
                  openInquiryModal(boats[0]);
                }
              }}
            >
              Get Custom Quote
            </button>
          </div>
        </div>
      </section>

      {/* Date Calendar Strip */}
      <section className={styles.calendarSection}>
        <div className={styles.container}>
          <h2 className={styles.calendarTitle}>Check Availability</h2>
          <p className={styles.calendarSubtitle}>Select a date to see available party boats</p>

          <div className={styles.calendarWrapper}>
            {canScrollLeft && (
              <button
                className={`${styles.calendarArrow} ${styles.calendarArrowLeft}`}
                onClick={() => scrollCalendar('left')}
                aria-label="Scroll left"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            <div className={styles.calendarStrip} ref={scrollContainerRef}>
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  className={`${styles.calendarDay} ${selectedDateIndex === index ? styles.calendarDaySelected : ''} ${day.isClosed ? styles.calendarDayClosed : ''} ${day.isToday ? styles.calendarDayToday : ''}`}
                  onClick={() => handleDateSelect(index)}
                  disabled={day.isClosed}
                >
                  <span className={styles.dayName}>{day.dayName}</span>
                  <span className={styles.dateNum}>{day.dateNum}</span>
                  <span className={styles.monthName}>{day.month}</span>
                  {day.isClosed && <span className={styles.closedLabel}>Closed</span>}
                </button>
              ))}
            </div>

            {canScrollRight && (
              <button
                className={`${styles.calendarArrow} ${styles.calendarArrowRight}`}
                onClick={() => scrollCalendar('right')}
                aria-label="Scroll right"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Boats Grid */}
      <section id="boats" className={styles.listing}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Party Boat Fleet</h2>
          <p className={styles.sectionSubtitle}>
            Choose from our premium collection of party boats, each designed for an unforgettable celebration.
          </p>

          {loading && (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner} />
              <p>Loading party boats...</p>
            </div>
          )}

          {error && !loading && (
            <div className={styles.errorContainer}>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className={styles.retryButton}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && boats.length === 0 && (
            <div className={styles.emptyContainer}>
              <p>No party boats available at the moment. Please check back later.</p>
            </div>
          )}

          {!loading && boats.length > 0 && (
            <div className={styles.boatsGrid}>
              {boats.map((boat, index) => {
                const gradient = BOAT_GRADIENTS[index % BOAT_GRADIENTS.length];
                const eventLabels = (boat.eventTypes || []).map(t => EVENT_TYPE_LABELS[t] || t);

                return (
                  <div
                    key={boat.id}
                    className={styles.boatCard}
                    onClick={() => router.push(`/party-boats/${boat.id}`)}
                  >
                    {/* Image */}
                    <div
                      className={styles.boatImage}
                      style={{
                        background: boat.images && boat.images.length > 0
                          ? `url(${boat.images[0]}) center/cover no-repeat`
                          : gradient,
                      }}
                    >
                      {(!boat.images || boat.images.length === 0) && (
                        <div className={styles.boatImageOverlay}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" opacity="0.5">
                            <path d="M3 17L6 14L9 17L15 11L21 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <rect x="2" y="4" width="20" height="16" rx="2" stroke="white" strokeWidth="1.5" />
                          </svg>
                        </div>
                      )}
                      {boat.djIncluded && (
                        <span className={styles.djBadge}>DJ Included</span>
                      )}
                    </div>

                    {/* Boat Info */}
                    <div className={styles.boatInfo}>
                      <div className={styles.boatHeader}>
                        <h3 className={styles.boatName}>{boat.name}</h3>
                        <div className={styles.locationBadges}>
                          {(boat.locationOptions || []).map((loc) => (
                            <span key={loc} className={styles.locationBadge}>
                              {LOCATION_LABELS[loc] || loc}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className={styles.boatCapacity}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={styles.capacityIcon}>
                          <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                          <path d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M16 3.13C17.7699 3.58317 19.0078 5.17799 19.0078 7.005C19.0078 8.83201 17.7699 10.4268 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {boat.capacityMin}-{boat.capacityMax} Guests
                      </p>

                      <p className={styles.boatDescription}>{boat.description}</p>

                      {/* Event Types */}
                      <div className={styles.eventTypes}>
                        {eventLabels.slice(0, MAX_VISIBLE_EVENTS).map((type) => (
                          <span key={type} className={styles.eventPill}>{type}</span>
                        ))}
                        {eventLabels.length > MAX_VISIBLE_EVENTS && (
                          <span className={styles.eventPillMore}>
                            +{eventLabels.length - MAX_VISIBLE_EVENTS} more
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className={styles.priceRow}>
                        <div className={styles.priceInfo}>
                          <span className={styles.priceLabel}>From</span>
                          <span className={styles.priceValue}>{formatCurrency(boat.basePrice)}</span>
                        </div>
                        <span className={styles.priceTax}>+ 18% GST</span>
                      </div>

                      {/* Actions */}
                      <div className={styles.cardActions}>
                        <span className={styles.viewDetailsBtn}>
                          View Details
                        </span>
                        <button
                          className={styles.enquireBtn}
                          onClick={(e) => openInquiryModal(boat, e)}
                        >
                          Enquire Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Choose Your Boat</h3>
              <p className={styles.stepDescription}>
                Browse our fleet and pick the perfect party boat for your event size and style.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Submit an Inquiry</h3>
              <p className={styles.stepDescription}>
                Tell us about your event. Our team will send you a customized quote within 24-48 hours.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Confirm & Celebrate</h3>
              <p className={styles.stepDescription}>
                Accept the quote, pay 50% advance to secure your booking. We handle the rest for an unforgettable event.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Ready to Throw an Unforgettable Party?</h2>
          <p className={styles.ctaDescription}>
            Book your dream party boat today. Custom packages available for every occasion.
          </p>
          <button
            className={styles.ctaButton}
            onClick={() => {
              if (boats.length > 0) {
                openInquiryModal(boats[0]);
              }
            }}
          >
            Get a Custom Quote
          </button>
        </div>
      </section>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className={styles.modalOverlay} onClick={closeInquiryModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeInquiryModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {inquirySuccess ? (
              <div className={styles.inquirySuccessContainer}>
                <div className={styles.successIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#059669" strokeWidth="2" />
                    <path d="M8 12l3 3 5-6" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className={styles.successTitle}>Inquiry Submitted!</h2>
                <p className={styles.successNumber}>
                  Your inquiry number: <strong>{inquirySuccess.inquiryNumber}</strong>
                </p>
                <p className={styles.successMessage}>
                  Thank you for your interest! Our team will review your inquiry and send you a customized quote within 24-48 hours.
                </p>
                <button className={styles.successCloseBtn} onClick={closeInquiryModal}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className={styles.modalTitle}>
                  Request Quote{inquiryBoat ? ` - ${inquiryBoat.name}` : ''}
                </h2>
                <p className={styles.modalSubtitle}>
                  Fill in your details and we will get back to you with a customized quote.
                </p>

                <form onSubmit={handleInquirySubmit} className={styles.inquiryForm}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Name *</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={inquiryForm.customerName}
                        onChange={(e) => handleInquiryChange('customerName', e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Phone *</label>
                      <input
                        type="tel"
                        className={styles.formInput}
                        value={inquiryForm.customerPhone}
                        onChange={(e) => handleInquiryChange('customerPhone', e.target.value)}
                        placeholder="10-digit phone number"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email *</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      value={inquiryForm.customerEmail}
                      onChange={(e) => handleInquiryChange('customerEmail', e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Event Type *</label>
                      <select
                        className={styles.formSelect}
                        value={inquiryForm.eventType}
                        onChange={(e) => handleInquiryChange('eventType', e.target.value)}
                        required
                      >
                        <option value="">Select event type</option>
                        {Object.entries(EVENT_TYPE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Number of Guests</label>
                      <input
                        type="number"
                        className={styles.formInput}
                        value={inquiryForm.numberOfGuests}
                        onChange={(e) => handleInquiryChange('numberOfGuests', e.target.value)}
                        placeholder={inquiryBoat ? `${inquiryBoat.capacityMin}-${inquiryBoat.capacityMax}` : 'Estimated guests'}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Preferred Date</label>
                      <input
                        type="date"
                        className={styles.formInput}
                        value={inquiryForm.preferredDate}
                        onChange={(e) => handleInquiryChange('preferredDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Time Slot</label>
                      <select
                        className={styles.formSelect}
                        value={inquiryForm.preferredTimeSlot}
                        onChange={(e) => handleInquiryChange('preferredTimeSlot', e.target.value)}
                      >
                        <option value="">Select time slot</option>
                        {Object.entries(TIME_SLOT_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Location Preference</label>
                      <select
                        className={styles.formSelect}
                        value={inquiryForm.locationType}
                        onChange={(e) => handleInquiryChange('locationType', e.target.value)}
                      >
                        <option value="">Select location</option>
                        {Object.entries(LOCATION_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Budget (optional)</label>
                      <input
                        type="number"
                        className={styles.formInput}
                        value={inquiryForm.budget}
                        onChange={(e) => handleInquiryChange('budget', e.target.value)}
                        placeholder="Your budget in INR"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Special Requests</label>
                    <textarea
                      className={styles.formTextarea}
                      value={inquiryForm.specialRequests}
                      onChange={(e) => handleInquiryChange('specialRequests', e.target.value)}
                      placeholder="Any special requirements or questions..."
                      rows={3}
                      maxLength={1000}
                    />
                  </div>

                  {inquiryError && (
                    <p className={styles.formError}>{inquiryError}</p>
                  )}

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={inquirySubmitting}
                  >
                    {inquirySubmitting ? 'Submitting...' : 'Submit Inquiry'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
