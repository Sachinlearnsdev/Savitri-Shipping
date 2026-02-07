'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { API_ENDPOINTS } from '@/utils/constants';
import styles from './page.module.css';

// ==================== STATIC DATA (Reviews - keep until review system is built) ====================

const SAMPLE_REVIEWS = [
  { id: 'r1', name: 'Rahul Sharma', rating: 5, date: '2026-01-28', comment: 'Amazing experience! The boat is a beast on water. Captain was very professional and the safety gear was top-notch. Will definitely book again.', verified: true },
  { id: 'r2', name: 'Priya Patel', rating: 5, date: '2026-01-15', comment: 'Took my family for a ride and everyone loved it. Great value for money.', verified: true },
  { id: 'r3', name: 'Amit Kumar', rating: 4, date: '2025-12-20', comment: 'Good boat, smooth ride. The sun canopy was helpful since it was quite hot.', verified: true },
];

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

const AVATAR_COLORS = ['#0891b2', '#059669', '#7c3aed', '#d97706', '#2563eb', '#dc2626', '#0d9488', '#c026d3'];

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// ==================== COMPONENT ====================

export default function SpeedBoatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();

  // API data
  const [boat, setBoat] = useState(null);
  const [allBoats, setAllBoats] = useState([]);
  const [calendarStatuses, setCalendarStatuses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Available slots from API
  const [availableSlots, setAvailableSlots] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Pricing from API
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Calendar state
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      // We'll resolve this after calendar data loads
      return -1; // temporary
    }
    return 0;
  });

  // Duration & slot state
  const [duration, setDuration] = useState(2);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customHours, setCustomHours] = useState(5);
  const [selectedSlotTime, setSelectedSlotTime] = useState(null);
  const [activeThumb, setActiveThumb] = useState(0);

  const effectiveDuration = isCustomDuration ? customHours : duration;

  // Reviews state (hardcoded)
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState(isAuthenticated && user?.name ? user.name : '');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const calendarDays = generateCalendarDays(calendarStatuses);

  // Fetch boat detail, calendar, and all boats on mount
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

        const [boatResponse, calendarResponse, boatsResponse] = await Promise.all([
          api.get(API_ENDPOINTS.BOOKINGS.BOAT_BY_ID(params.id)),
          api.get(`${API_ENDPOINTS.BOOKINGS.CALENDAR_STATUS}?startDate=${startDateStr}&endDate=${endDateStr}`),
          api.get(API_ENDPOINTS.BOOKINGS.BOATS),
        ]);

        if (boatResponse.success) setBoat(boatResponse.data);
        if (calendarResponse.success) setCalendarStatuses(calendarResponse.data || []);
        if (boatsResponse.success) setAllBoats(boatsResponse.data || []);

        // Resolve date param to day index
        const dateParam = searchParams.get('date');
        if (dateParam) {
          const days = generateCalendarDays(calendarResponse.data || []);
          const idx = days.findIndex((d) => d.dateStr === dateParam);
          if (idx >= 0) setSelectedDayIndex(idx);
          else setSelectedDayIndex(0);
        } else {
          setSelectedDayIndex(0);
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
    if (selectedDayIndex < 0 || !calendarDays[selectedDayIndex] || calendarDays[selectedDayIndex].isClosed) return;

    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        const dateStr = calendarDays[selectedDayIndex].dateStr;
        const response = await api.get(`${API_ENDPOINTS.BOOKINGS.AVAILABLE_SLOTS}?date=${dateStr}&numberOfBoats=1`);
        if (response.success) {
          setAvailableSlots(response.data);
        }
      } catch {
        setAvailableSlots(null);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
    setSelectedSlotTime(null);
    setPricing(null);
  }, [selectedDayIndex, calendarStatuses]);

  // Fetch pricing when slot is selected
  useEffect(() => {
    if (!selectedSlotTime || selectedDayIndex < 0) return;

    const fetchPricing = async () => {
      try {
        setPricingLoading(true);
        const dateStr = calendarDays[selectedDayIndex].dateStr;
        const response = await api.post(API_ENDPOINTS.BOOKINGS.CALCULATE_PRICE, {
          date: dateStr,
          startTime: selectedSlotTime,
          duration: effectiveDuration,
          numberOfBoats: 1,
        });
        if (response.success) {
          setPricing(response.data);
        }
      } catch {
        setPricing(null);
      } finally {
        setPricingLoading(false);
      }
    };

    fetchPricing();
  }, [selectedSlotTime, effectiveDuration]);

  const DAYS_PER_PAGE = 7;
  const totalWeeks = Math.ceil(calendarDays.length / DAYS_PER_PAGE);
  const visibleDays = calendarDays.slice(
    weekOffset * DAYS_PER_PAGE,
    (weekOffset + 1) * DAYS_PER_PAGE
  );

  const handleDaySelect = (index) => {
    if (!calendarDays[index].isClosed) {
      setSelectedDayIndex(index);
      setSelectedSlotTime(null);
      setPricing(null);
    }
  };

  const handleDurationChange = (value) => {
    setIsCustomDuration(false);
    setDuration(value);
    setSelectedSlotTime(null);
    setPricing(null);
  };

  const handleCustomDuration = () => {
    setIsCustomDuration(true);
    setSelectedSlotTime(null);
    setPricing(null);
  };

  const handleCustomHoursChange = (val) => {
    const num = Math.max(0.5, Math.min(8, parseFloat(val) || 1));
    setCustomHours(num);
    setSelectedSlotTime(null);
    setPricing(null);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (reviewRating === 0 || !reviewName.trim() || !reviewComment.trim()) return;
    const newReview = {
      id: `user-${Date.now()}`,
      name: reviewName.trim(),
      rating: reviewRating,
      date: new Date().toISOString().split('T')[0],
      comment: reviewComment.trim(),
      verified: false,
    };
    setReviews((prev) => [newReview, ...prev]);
    setReviewSubmitted(true);
    setReviewComment('');
    setReviewRating(0);
    setTimeout(() => {
      setReviewSubmitted(false);
      setShowReviewForm(false);
    }, 3000);
  };

  // Compute time slots from API data
  const getComputedSlots = () => {
    if (!availableSlots || !availableSlots.slots) return [];
    const slots = availableSlots.slots;
    const blocks = Math.round(effectiveDuration * 2);
    const result = [];

    for (let i = 0; i <= slots.length - blocks; i++) {
      const range = slots.slice(i, i + blocks);
      const allAvailable = range.every((s) => s.isAvailable);
      const startTime = range[0].time;
      const endTime = addHoursToTime(startTime, effectiveDuration);
      result.push({
        startTime,
        label: `${formatTime12(startTime)} - ${formatTime12(endTime)}`,
        available: allAvailable,
      });
    }
    return result;
  };

  const computedSlots = getComputedSlots();

  // Rating distribution
  const getRatingDistribution = () => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => { dist[r.rating] = (dist[r.rating] || 0) + 1; });
    return dist;
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const ratingDist = getRatingDistribution();

  // Build Book Now URL
  const buildBookUrl = () => {
    const urlParams = new URLSearchParams();
    if (selectedDayIndex >= 0 && calendarDays[selectedDayIndex]) {
      urlParams.set('date', calendarDays[selectedDayIndex].dateStr);
    }
    urlParams.set('duration', effectiveDuration);
    if (selectedSlotTime) urlParams.set('startTime', selectedSlotTime);
    const qs = urlParams.toString();
    return `/speed-boats/${params.id}/book${qs ? `?${qs}` : ''}`;
  };

  // Image helpers
  const getBoatImages = () => {
    if (!boat) return [];
    if (boat.images && boat.images.length > 0) {
      return boat.images.map((img) => (typeof img === 'string' ? img : img.url));
    }
    return [];
  };

  const boatGradient = BOAT_GRADIENTS[0];
  const images = getBoatImages();

  // Loading state
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !boat) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <div className={styles.notFoundIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
              <path d="M2 20L4.5 17.5M4.5 17.5L8.04 13.96C8.47 13.53 9.13 13.44 9.66 13.74L10.34 14.13C10.87 14.43 11.53 14.34 11.96 13.91L15.5 10.37M4.5 17.5H8M15.5 10.37L18.5 7.37M15.5 10.37L18 10.37M22 4L18.5 7.37M18.5 7.37V4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className={styles.notFoundTitle}>{error || 'Boat Not Found'}</h1>
          <p className={styles.notFoundText}>
            The speed boat you are looking for does not exist or has been removed.
          </p>
          <Link href="/speed-boats" className={styles.notFoundButton}>
            Back to All Boats
          </Link>
        </div>
      </div>
    );
  }

  const relatedBoats = allBoats.filter((b) => (b.id || b._id) !== params.id).slice(0, 3);

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className={styles.container}>
          <Link href="/speed-boats" className={styles.breadcrumbLink}>Speed Boats</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{boat.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.detailLayout}>

          {/* Left Column - Gallery + Info */}
          <div className={styles.leftColumn}>

            {/* Image Gallery */}
            <div className={styles.gallery}>
              <div
                className={styles.mainImage}
                style={images.length > 0 ? {} : { background: boatGradient }}
              >
                {images.length > 0 ? (
                  <img
                    src={images[activeThumb] || images[0]}
                    alt={boat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className={styles.mainImageOverlay}>
                    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2">
                      <path d="M2 20L4.5 17.5M4.5 17.5L8.04 13.96C8.47 13.53 9.13 13.44 9.66 13.74L10.34 14.13C10.87 14.43 11.53 14.34 11.96 13.91L15.5 10.37M4.5 17.5H8M15.5 10.37L18.5 7.37M15.5 10.37L18 10.37M22 4L18.5 7.37M18.5 7.37V4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className={styles.mainImageLabel}>{boat.name}</span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className={styles.thumbnailRow}>
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      className={`${styles.thumbnail} ${activeThumb === idx ? styles.thumbnailActive : ''}`}
                      onClick={() => setActiveThumb(idx)}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                    </button>
                  ))}
                </div>
              )}
              {images.length === 0 && (
                <div className={styles.thumbnailRow}>
                  {[boatGradient, boatGradient.replace('135deg', '45deg'), boatGradient.replace('135deg', '225deg'), boatGradient.replace('135deg', '315deg')].map((grad, idx) => (
                    <button
                      key={idx}
                      className={`${styles.thumbnail} ${activeThumb === idx ? styles.thumbnailActive : ''}`}
                      style={{ background: grad }}
                      onClick={() => setActiveThumb(idx)}
                      aria-label={`View image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Boat Info Card */}
            <div className={styles.infoCard}>
              <div className={styles.infoHeader}>
                <div>
                  <h1 className={styles.boatName}>{boat.name}</h1>
                  {boat.registrationNumber && (
                    <span className={styles.regBadge}>{boat.registrationNumber}</span>
                  )}
                </div>
              </div>

              <div className={styles.infoMeta}>
                <div className={styles.metaItem}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{boat.capacity} Passengers</span>
                </div>
                <div className={styles.captainBadge}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Captain Included
                </div>
              </div>
            </div>

            {/* Description */}
            {boat.description && (
              <div className={styles.descriptionCard}>
                <h2 className={styles.sectionHeading}>About This Boat</h2>
                <p className={styles.descriptionText}>{boat.description}</p>
              </div>
            )}

            {/* Features */}
            {boat.features && boat.features.length > 0 && (
              <div className={styles.featuresCard}>
                <h2 className={styles.sectionHeading}>Features & Amenities</h2>
                <div className={styles.featuresList}>
                  {boat.features.map((feature, idx) => (
                    <div key={idx} className={styles.featureItem}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancellation Policy */}
            <div className={styles.policyCard}>
              <h2 className={styles.sectionHeading}>Cancellation Policy</h2>
              <div className={styles.policyList}>
                <div className={styles.policyItem}>
                  <span className={styles.policyDot} style={{ backgroundColor: 'var(--color-success)' }}></span>
                  <div>
                    <strong>24+ hours before:</strong> 100% refund
                  </div>
                </div>
                <div className={styles.policyItem}>
                  <span className={styles.policyDot} style={{ backgroundColor: 'var(--color-warning)' }}></span>
                  <div>
                    <strong>12-24 hours before:</strong> 50% refund
                  </div>
                </div>
                <div className={styles.policyItem}>
                  <span className={styles.policyDot} style={{ backgroundColor: 'var(--color-error)' }}></span>
                  <div>
                    <strong>Less than 12 hours:</strong> No refund
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing + Slots */}
          <div className={styles.rightColumn}>
            <div className={styles.pricingCard}>
              <div className={styles.pricingHeader}>
                <span className={styles.priceActual}>{formatCurrency(boat.baseRate)}<span className={styles.priceUnit}>/hr</span></span>
              </div>
              <p className={styles.gstNote}>+ 18% GST applicable</p>

              {/* Date Calendar (Paginated Week View) */}
              <div className={styles.slotSection}>
                <h3 className={styles.slotSectionTitle}>Select Date</h3>
                <div className={styles.calendarNav}>
                  <button
                    className={styles.calNavBtn}
                    onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                    disabled={weekOffset === 0}
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <span className={styles.calNavLabel}>
                    {visibleDays[0]?.month} {visibleDays[0]?.dayNumber} &ndash; {visibleDays[visibleDays.length - 1]?.month} {visibleDays[visibleDays.length - 1]?.dayNumber}
                  </span>
                  <button
                    className={styles.calNavBtn}
                    onClick={() => setWeekOffset(Math.min(totalWeeks - 1, weekOffset + 1))}
                    disabled={weekOffset >= totalWeeks - 1}
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div className={styles.miniCalGrid}>
                  {visibleDays.map((day, localIdx) => {
                    const globalIdx = weekOffset * DAYS_PER_PAGE + localIdx;
                    return (
                      <button
                        key={globalIdx}
                        className={`${styles.miniCalDay} ${selectedDayIndex === globalIdx ? styles.miniCalDaySelected : ''} ${day.isClosed ? styles.miniCalDayClosed : ''} ${day.isToday ? styles.miniCalDayToday : ''}`}
                        onClick={() => handleDaySelect(globalIdx)}
                        disabled={day.isClosed}
                      >
                        <span className={styles.miniDayName}>{day.dayName}</span>
                        <span className={styles.miniDayNum}>{day.dayNumber}</span>
                        <span className={styles.miniDayMonth}>{day.month}</span>
                        {day.isClosed && <span className={styles.miniClosedLabel}>Closed</span>}
                      </button>
                    );
                  })}
                </div>
                {selectedDayIndex >= 0 && calendarDays[selectedDayIndex] && (
                  <p className={styles.selectedDateLabel}>
                    {calendarDays[selectedDayIndex].date.toLocaleDateString('en-IN', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                    })}
                  </p>
                )}
              </div>

              {/* Duration Selection */}
              <div className={styles.slotSection}>
                <h3 className={styles.slotSectionTitle}>Select Duration</h3>
                <div className={styles.durationPills}>
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`${styles.durationPill} ${!isCustomDuration && duration === opt.value ? styles.durationPillActive : ''}`}
                      onClick={() => handleDurationChange(opt.value)}
                    >
                      {opt.label}
                      {opt.value === 2 && <span className={styles.pillBadge}>Popular</span>}
                    </button>
                  ))}
                  <button
                    className={`${styles.durationPill} ${isCustomDuration ? styles.durationPillActive : ''}`}
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

              {/* Available Time Slots */}
              <div className={styles.slotSection}>
                <h3 className={styles.slotSectionTitle}>Available {effectiveDuration}-Hour Slots</h3>
                {slotsLoading ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-4) 0' }}>
                    Loading available slots...
                  </p>
                ) : availableSlots && !availableSlots.open ? (
                  <p className={styles.noSlotsMsg}>This day is closed for operations.</p>
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
                        <span className={styles.slotTime}>{slot.label}</span>
                        {!slot.available && <span className={styles.slotBookedLabel}>Booked</span>}
                      </button>
                    ))}
                    {computedSlots.length === 0 && !slotsLoading && (
                      <p className={styles.noSlotsMsg}>No slots available for {effectiveDuration}-hour duration</p>
                    )}
                  </div>
                )}
              </div>

              {/* Estimated Price */}
              <div className={styles.estimateBox}>
                <div className={styles.estimateRow}>
                  <span>Estimated Total</span>
                  <span className={styles.estimateAmount}>
                    {pricingLoading ? '...' :
                      pricing ? formatCurrency(pricing.totalAmount || pricing.subtotal) :
                      formatCurrency(boat.baseRate * effectiveDuration)}
                  </span>
                </div>
                <p className={styles.estimateNote}>+ 18% GST</p>
              </div>

              {/* Book Now CTA */}
              <Link
                href={buildBookUrl()}
                className={styles.bookNowButton}
              >
                Book Now - {formatCurrency(boat.baseRate)}/hr
              </Link>
              <p className={styles.bookNote}>
                No payment required yet. Review details on next step.
              </p>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <section className={styles.reviewsSection}>
          <div className={styles.reviewsOverview}>
            <div className={styles.ratingBig}>
              <span className={styles.ratingBigNumber}>{avgRating}</span>
              <div className={styles.ratingBigStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={parseFloat(avgRating) >= star ? styles.starFilled : styles.starEmpty}>
                    &#9733;
                  </span>
                ))}
              </div>
              <span className={styles.ratingBigCount}>{reviews.length} reviews</span>
            </div>

            <div className={styles.ratingDistribution}>
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className={styles.distRow}>
                  <span className={styles.distLabel}>{star}</span>
                  <span className={styles.distStar}>&#9733;</span>
                  <div className={styles.distBarBg}>
                    <div
                      className={styles.distBarFill}
                      style={{ width: reviews.length > 0 ? `${(ratingDist[star] / reviews.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className={styles.distCount}>{ratingDist[star]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Write a Review */}
          <div className={styles.writeReviewSection}>
            {!showReviewForm ? (
              <button className={styles.writeReviewBtn} onClick={() => setShowReviewForm(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Write a Review
              </button>
            ) : (
              <form className={styles.reviewForm} onSubmit={handleSubmitReview}>
                <h3 className={styles.reviewFormTitle}>Share Your Experience</h3>
                {reviewSubmitted && (
                  <div className={styles.reviewSuccessMsg}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Thank you! Your review has been submitted.
                  </div>
                )}
                <div className={styles.reviewFormGroup}>
                  <label className={styles.reviewFormLabel}>Your Rating</label>
                  <div className={styles.starSelector}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`${styles.starBtn} ${(reviewHoverRating || reviewRating) >= star ? styles.starBtnActive : ''}`}
                        onMouseEnter={() => setReviewHoverRating(star)}
                        onMouseLeave={() => setReviewHoverRating(0)}
                        onClick={() => setReviewRating(star)}
                      >
                        &#9733;
                      </button>
                    ))}
                    {reviewRating > 0 && (
                      <span className={styles.starRatingLabel}>
                        {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][reviewRating]}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.reviewFormGroup}>
                  <label className={styles.reviewFormLabel}>Your Name</label>
                  <input
                    type="text"
                    className={styles.reviewFormInput}
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={isAuthenticated && user?.name}
                  />
                </div>
                <div className={styles.reviewFormGroup}>
                  <label className={styles.reviewFormLabel}>Your Review</label>
                  <textarea
                    className={styles.reviewFormTextarea}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us about your experience..."
                    rows={4}
                    maxLength={500}
                  />
                  <span className={styles.reviewCharCount}>{reviewComment.length}/500</span>
                </div>
                <div className={styles.reviewFormActions}>
                  <button type="submit" className={styles.reviewSubmitBtn} disabled={!reviewRating || !reviewName.trim() || !reviewComment.trim()}>
                    Submit Review
                  </button>
                  <button type="button" className={styles.reviewCancelBtn} onClick={() => setShowReviewForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Reviews List */}
          <div className={styles.reviewsList}>
            {reviews.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewCardLeft}>
                  <div className={styles.reviewerAvatar} style={{ backgroundColor: getAvatarColor(review.name) }}>
                    {review.name.charAt(0)}
                  </div>
                </div>
                <div className={styles.reviewCardBody}>
                  <div className={styles.reviewCardTop}>
                    <div className={styles.reviewerDetails}>
                      <span className={styles.reviewerName}>{review.name}</span>
                      {review.verified && (
                        <span className={styles.verifiedBadge}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                    <span className={styles.reviewDate}>
                      {new Date(review.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={review.rating >= star ? styles.starFilled : styles.starEmpty}>
                        &#9733;
                      </span>
                    ))}
                  </div>
                  <p className={styles.reviewComment}>{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related Boats */}
        {relatedBoats.length > 0 && (
          <div className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>Other Boats You May Like</h2>
            <div className={styles.relatedGrid}>
              {relatedBoats.map((rb, idx) => {
                const rbId = rb.id || rb._id;
                const rbImage = rb.images && rb.images.length > 0 ? (typeof rb.images[0] === 'string' ? rb.images[0] : rb.images[0].url) : null;
                return (
                  <Link key={rbId} href={`/speed-boats/${rbId}`} className={styles.relatedCard}>
                    <div className={styles.relatedImage} style={rbImage ? {} : { background: BOAT_GRADIENTS[idx % BOAT_GRADIENTS.length] }}>
                      {rbImage ? (
                        <img src={rbImage} alt={rb.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
                          <path d="M2 20L4.5 17.5M4.5 17.5L8.04 13.96C8.47 13.53 9.13 13.44 9.66 13.74L10.34 14.13C10.87 14.43 11.53 14.34 11.96 13.91L15.5 10.37M4.5 17.5H8M15.5 10.37L18.5 7.37M15.5 10.37L18 10.37M22 4L18.5 7.37M18.5 7.37V4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className={styles.relatedInfo}>
                      <h3 className={styles.relatedName}>{rb.name}</h3>
                      <p className={styles.relatedCapacity}>{rb.capacity} Passengers</p>
                      <p className={styles.relatedPrice}>{formatCurrency(rb.baseRate)}/hr</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
