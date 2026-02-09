'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { API_ENDPOINTS } from '@/utils/constants';
import styles from './page.module.css';

// Fallback gradients for boats without images
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

const generateCalendarDays = (calendarStatuses) => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build a set of closed dates from API data
  const closedDates = new Set();
  if (calendarStatuses) {
    calendarStatuses.forEach((entry) => {
      if (!entry.isOpen) {
        closedDates.add(entry.date);
      }
    });
  }

  for (let i = 0; i < 45; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    days.push({
      date: date,
      dateStr: dateStr,
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

export default function SpeedBoatsPage() {
  const router = useRouter();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const calendarRef = useRef(null);

  // API data
  const [boats, setBoats] = useState([]);
  const [calendarStatuses, setCalendarStatuses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calendarDays = generateCalendarDays(calendarStatuses);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch boats and calendar status in parallel
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 44);
        const startDateStr = today.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        const [boatsResponse, calendarResponse] = await Promise.all([
          api.get(API_ENDPOINTS.BOOKINGS.BOATS),
          api.get(`${API_ENDPOINTS.BOOKINGS.CALENDAR_STATUS}?startDate=${startDateStr}&endDate=${endDateStr}`),
        ]);

        if (boatsResponse.success) {
          setBoats(boatsResponse.data || []);
        }
        if (calendarResponse.success) {
          setCalendarStatuses(calendarResponse.data || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load boats');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const scrollCalendar = (direction) => {
    if (calendarRef.current) {
      const scrollAmount = 280;
      calendarRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleDaySelect = (index) => {
    if (!calendarDays[index].isClosed) {
      setSelectedDayIndex(index);
    }
  };

  // Scroll selected day into view on mount
  useEffect(() => {
    if (calendarRef.current) {
      const selectedEl = calendarRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, []);

  const getBoatImage = (boat, index) => {
    if (boat.images && boat.images.length > 0) {
      const img = boat.images[0];
      return typeof img === 'string' ? img : img.url;
    }
    return null;
  };

  const getBoatGradient = (index) => {
    return BOAT_GRADIENTS[index % BOAT_GRADIENTS.length];
  };

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Speed Boat Rentals</h1>
          <p className={styles.heroSubtitle}>
            Experience the thrill of the open water with our fleet of premium speed boats.
            Professional captain included with every rental.
          </p>
        </div>
      </section>

      {/* Date Calendar Strip */}
      <section className={styles.calendarSection}>
        <div className={styles.container}>
          <h2 className={styles.calendarTitle}>Select a Date</h2>
          <p className={styles.calendarSubtitle}>Browse availability for the next 45 days</p>
          <div className={styles.calendarWrapper}>
            <button
              className={styles.calendarArrow}
              onClick={() => scrollCalendar('left')}
              aria-label="Scroll calendar left"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className={styles.calendarStrip} ref={calendarRef}>
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  data-selected={selectedDayIndex === index ? 'true' : 'false'}
                  className={`${styles.calendarDay} ${selectedDayIndex === index ? styles.calendarDaySelected : ''} ${day.isClosed ? styles.calendarDayClosed : ''} ${day.isToday ? styles.calendarDayToday : ''}`}
                  onClick={() => handleDaySelect(index)}
                  disabled={day.isClosed}
                >
                  <span className={styles.dayName}>{day.dayName}</span>
                  <span className={styles.dayNumber}>{day.dayNumber}</span>
                  <span className={styles.dayMonth}>{day.month}</span>
                  {day.isClosed && <span className={styles.closedLabel}>Closed</span>}
                </button>
              ))}
            </div>
            <button
              className={styles.calendarArrow}
              onClick={() => scrollCalendar('right')}
              aria-label="Scroll calendar right"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p className={styles.selectedDateDisplay}>
            Showing boats for:{' '}
            <strong>
              {calendarDays[selectedDayIndex].date.toLocaleDateString('en-IN', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </strong>
          </p>
        </div>
      </section>

      {/* Boats Grid */}
      <section className={styles.listing}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Fleet</h2>
          <p className={styles.sectionSubtitle}>
            Choose from our selection of speed boats. All rentals include an experienced captain.
          </p>

          {loading ? (
            <div className={styles.loadingState}>
              <p>Loading boats...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className={styles.retryButton}>
                Try Again
              </button>
            </div>
          ) : boats.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No speed boats available at the moment. Please check back later.</p>
            </div>
          ) : (
            <div className={styles.boatsGrid}>
              {boats.map((boat, index) => {
                const boatId = boat.id || boat._id;
                const imageUrl = getBoatImage(boat, index);
                const selectedDate = calendarDays[selectedDayIndex].dateStr;
                return (
                  <div
                    key={boatId}
                    className={styles.boatCard}
                    onClick={() => router.push(`/speed-boats/${boatId}?date=${selectedDate}`)}
                  >
                    <div
                      className={styles.boatImage}
                      style={imageUrl ? {} : { background: getBoatGradient(index) }}
                    >
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={boat.name}
                          className={styles.boatImageImg}
                        />
                      )}
                      {!imageUrl && (
                        <div className={styles.boatImageOverlay}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5">
                            <path d="M2 20L4.5 17.5M4.5 17.5L8.04 13.96C8.47 13.53 9.13 13.44 9.66 13.74L10.34 14.13C10.87 14.43 11.53 14.34 11.96 13.91L15.5 10.37M4.5 17.5H8M15.5 10.37L18.5 7.37M15.5 10.37L18 10.37M22 4L18.5 7.37M18.5 7.37V4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                      <div className={styles.badgeRow}>
                        <span className={styles.capacityBadge}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {boat.capacity} Passengers
                        </span>
                      </div>
                      <span className={styles.statusBadgeAvailable}>Available</span>
                    </div>
                    <div className={styles.boatInfo}>
                      <h3 className={styles.boatName}>{boat.name}</h3>
                      {boat.description && (
                        <p className={styles.boatDescription}>{boat.description}</p>
                      )}

                      <div className={styles.pricingRow}>
                        <span className={styles.actualRate}>{formatCurrency(boat.baseRate)}/hr</span>
                      </div>

                      {boat.features && boat.features.length > 0 && (
                        <div className={styles.featurePills}>
                          {boat.features.slice(0, 3).map((feature, fIdx) => (
                            <span key={fIdx} className={styles.featurePill}>{feature}</span>
                          ))}
                          {boat.features.length > 3 && (
                            <span className={styles.featurePill}>+{boat.features.length - 3} more</span>
                          )}
                        </div>
                      )}

                      <div className={styles.cardActions}>
                        <span className={styles.viewButton}>
                          View Details
                        </span>
                        <button
                          className={styles.bookNowButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/speed-boats/${boatId}/book?date=${selectedDate}`);
                          }}
                        >
                          Book Now
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
      <section className={styles.infoSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepCardTitle}>Choose Your Date</h3>
              <p className={styles.stepDescription}>
                Select your preferred date from our availability calendar. Book up to 45 days in advance.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepCardTitle}>Pick a Boat & Time</h3>
              <p className={styles.stepDescription}>
                Browse our fleet, select your boat, choose a time slot and duration.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepCardTitle}>Confirm & Pay</h3>
              <p className={styles.stepDescription}>
                Review your booking, provide your details, and pay online or at the venue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Ready to Ride the Waves?</h2>
          <p className={styles.ctaDescription}>
            Book your speed boat adventure today! Advance booking up to 45 days. Captain included.
          </p>
          <Link href="/speed-boats" className={styles.ctaButton}>
            Browse All Boats
          </Link>
        </div>
      </section>
    </div>
  );
}
