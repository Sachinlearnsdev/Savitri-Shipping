'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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

const ADD_ON_DESCRIPTIONS = {
  CATERING_VEG: 'Full course veg meal with starters, main course, and desserts',
  CATERING_NONVEG: 'Full course non-veg meal with starters, main course, and desserts',
  LIVE_BAND: 'Professional band for live music performance',
  PHOTOGRAPHER: 'Professional photographer with edited photos delivered',
  DECORATION_STANDARD: 'Balloon and ribbon decoration with theme colors',
};

const BOAT_GRADIENTS = [
  'linear-gradient(135deg, #dc2626, #991b1b)',
  'linear-gradient(135deg, #7c3aed, #5b21b6)',
  'linear-gradient(135deg, #0891b2, #155e75)',
  'linear-gradient(135deg, #d97706, #92400e)',
];

const AVATAR_COLORS = ['#dc2626', '#7c3aed', '#0891b2', '#d97706', '#2563eb', '#059669', '#c026d3', '#0d9488'];

// Default policies (standard across all party boats)
const CANCELLATION_POLICY = { fullRefundDays: 7, partialRefundDays: 3, partialPercent: 50 };
const PAYMENT_TERMS = { advancePercent: 50, remainderDueBeforeDays: 3 };

// Placeholder reviews until a review system is built
const PLACEHOLDER_REVIEWS = [
  { id: 'r1', name: 'Ananya Sharma', rating: 5, date: '2026-01-25', comment: 'Amazing experience! The crew handled everything beautifully. The sound system and lighting were perfect for our celebration.', verified: true },
  { id: 'r2', name: 'Rohit Kapoor', rating: 5, date: '2026-01-10', comment: 'Hosted our corporate event here and everyone was blown away. Already planning our next event. Highly recommended!', verified: true },
  { id: 'r3', name: 'Meera Jain', rating: 4, date: '2025-12-20', comment: 'Great venue for celebrations. Spacious and well-maintained. The crew was very accommodating with our requests.', verified: true },
];

// ==================== HELPERS ====================

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getBoatGradient = (index) => BOAT_GRADIENTS[index % BOAT_GRADIENTS.length];

// ==================== COMPONENT ====================

export default function PartyBoatDetailPage() {
  const params = useParams();
  const { isAuthenticated, user } = useAuthStore();

  // API state
  const [boat, setBoat] = useState(null);
  const [allBoats, setAllBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selection state
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState({});
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [addOnGuestCounts, setAddOnGuestCounts] = useState({});

  // Reviews state
  const [reviews, setReviews] = useState(PLACEHOLDER_REVIEWS);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Set review name from auth
  useEffect(() => {
    if (isAuthenticated && user?.name) {
      setReviewName(user.name);
    }
  }, [isAuthenticated, user]);

  // Fetch boat data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [boatResponse, allBoatsResponse] = await Promise.all([
          api.get(API_ENDPOINTS.BOOKINGS.PARTY_BOAT_BY_ID(params.id)),
          api.get(API_ENDPOINTS.BOOKINGS.PARTY_BOATS),
        ]);

        if (boatResponse.success && boatResponse.data) {
          setBoat(boatResponse.data);
        } else {
          setError('Party boat not found');
        }

        if (allBoatsResponse.success) {
          setAllBoats(allBoatsResponse.data || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load boat details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  // Handlers
  const handleAddOnToggle = (addOnType) => {
    setSelectedAddOns((prev) => {
      const updated = { ...prev };
      if (updated[addOnType]) {
        delete updated[addOnType];
        setAddOnGuestCounts((prevCounts) => {
          const c = { ...prevCounts };
          delete c[addOnType];
          return c;
        });
      } else {
        updated[addOnType] = true;
      }
      return updated;
    });
  };

  const handleGuestCountChange = (addOnType, value) => {
    if (!boat) return;
    const num = Math.max(1, Math.min(boat.capacityMax, parseInt(value) || 1));
    setAddOnGuestCounts((prev) => ({ ...prev, [addOnType]: num }));
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

  const getRatingDistribution = () => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => { dist[r.rating] = (dist[r.rating] || 0) + 1; });
    return dist;
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <p>Loading boat details...</p>
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
              {error || 'The party boat you are looking for does not exist or has been removed.'}
            </p>
            <Link href="/party-boats" className={styles.backLink}>
              Back to Party Boats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const boatId = boat.id || boat._id;
  const otherBoats = allBoats.filter((b) => (b.id || b._id) !== boatId);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const ratingDist = getRatingDistribution();

  // Determine gradient for this boat
  const boatIndex = allBoats.findIndex((b) => (b.id || b._id) === boatId);
  const gradient = getBoatGradient(boatIndex >= 0 ? boatIndex : 0);

  // Check if boat has real images
  const hasImages = boat.images && boat.images.length > 0;
  const mainImage = hasImages ? (typeof boat.images[0] === 'string' ? boat.images[0] : boat.images[0].url) : null;

  // Generate thumbnail gradients
  const thumbnailGradients = [
    gradient,
    gradient.replace('135deg', '225deg'),
    gradient.replace('135deg', '45deg'),
  ];

  // Operating hours from model
  const operatingHours = `${boat.operatingStartTime || '06:00'} - ${boat.operatingEndTime || '00:00'}`;
  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  };
  const operatingHoursDisplay = `${formatTime(boat.operatingStartTime || '06:00')} - ${formatTime(boat.operatingEndTime || '00:00')}`;

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumbBar}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb}>
            <Link href="/party-boats" className={styles.breadcrumbLink}>Party Boats</Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={styles.breadcrumbSep}>
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={styles.breadcrumbCurrent}>{boat.name}</span>
          </nav>
        </div>
      </div>

      <div className={styles.container}>
        {/* Image Gallery */}
        <div className={styles.gallery}>
          <div
            className={styles.galleryMain}
            style={mainImage ? { backgroundImage: `url(${mainImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: gradient }}
          >
            {!mainImage && (
              <div className={styles.galleryOverlay}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" opacity="0.4">
                  <path d="M3 17L6 14L9 17L15 11L21 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="white" strokeWidth="1.5" />
                </svg>
              </div>
            )}
          </div>
          <div className={styles.galleryThumbnails}>
            {hasImages ? (
              boat.images.slice(0, 3).map((img, i) => {
                const url = typeof img === 'string' ? img : img.url;
                return (
                  <div key={i} className={styles.thumbnail} style={{ backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                );
              })
            ) : (
              thumbnailGradients.map((grad, i) => (
                <div key={i} className={styles.thumbnail} style={{ background: grad }}>
                  <div className={styles.thumbnailOverlay}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" opacity="0.4">
                      <path d="M3 17L6 14L9 17L15 11L21 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="2" y="4" width="20" height="16" rx="2" stroke="white" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.detailLayout}>
          {/* Left Column */}
          <div className={styles.detailContent}>
            {/* Boat Info */}
            <section className={styles.infoSection}>
              <h1 className={styles.boatTitle}>{boat.name}</h1>

              <div className={styles.infoMeta}>
                <div className={styles.metaItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                    <path d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 3.13C17.7699 3.58317 19.0078 5.17799 19.0078 7.005C19.0078 8.83201 17.7699 10.4268 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{boat.capacityMin}-{boat.capacityMax} Guests</span>
                </div>

                <div className={styles.metaItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span>{(boat.locationOptions || []).map((l) => LOCATION_LABELS[l] || l).join(' & ')}</span>
                </div>

                <div className={styles.metaItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{operatingHoursDisplay}</span>
                </div>

                {boat.djIncluded && (
                  <span className={styles.djBadge}>DJ Included</span>
                )}
              </div>

              <div className={styles.locationPills}>
                {(boat.locationOptions || []).map((loc) => (
                  <span key={loc} className={styles.locationPill}>
                    {LOCATION_LABELS[loc] || loc}
                  </span>
                ))}
              </div>
            </section>

            {/* Base Package */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Base Package Includes</h2>
              <div className={styles.packageCard}>
                <div className={styles.packageItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Professional DJ & Sound System</span>
                </div>
                <div className={styles.packageItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Basic Lighting Setup</span>
                </div>
                <div className={styles.packageItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Experienced Crew & Staff</span>
                </div>
                <div className={styles.packageItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Safety Equipment & Security</span>
                </div>
              </div>
            </section>

            {/* Time Slots */}
            {boat.timeSlots && boat.timeSlots.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Time Slots</h2>
                <div className={styles.timeSlotsGrid}>
                  {boat.timeSlots.map((slotKey) => {
                    const config = TIME_SLOT_CONFIG[slotKey];
                    if (!config) return null;
                    return (
                      <button
                        key={slotKey}
                        className={`${styles.timeSlotCard} ${selectedTimeSlot === slotKey ? styles.timeSlotSelected : ''}`}
                        onClick={() => setSelectedTimeSlot(slotKey)}
                      >
                        <span className={styles.slotLabel}>{config.label}</span>
                        <span className={styles.slotTime}>{config.time}</span>
                        <span className={styles.slotPrice}>From {formatCurrency(boat.basePrice)}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Add-ons */}
            {boat.addOns && boat.addOns.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Add-ons</h2>
                <p className={styles.sectionHint}>Customize your event with these optional add-ons</p>
                <div className={styles.addOnsGrid}>
                  {boat.addOns.map((addOn) => {
                    const isSelected = !!selectedAddOns[addOn.type];
                    const description = ADD_ON_DESCRIPTIONS[addOn.type] || '';
                    return (
                      <div
                        key={addOn.type}
                        className={`${styles.addOnCard} ${isSelected ? styles.addOnSelected : ''}`}
                        onClick={() => handleAddOnToggle(addOn.type)}
                      >
                        <div className={styles.addOnHeader}>
                          <div className={styles.addOnCheckbox}>
                            {isSelected && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <div className={styles.addOnInfo}>
                            <span className={styles.addOnName}>{addOn.label}</span>
                            <span className={styles.addOnPrice}>
                              {formatCurrency(addOn.price)}
                              {addOn.priceType === 'PER_PERSON' ? '/person' : ''}
                            </span>
                          </div>
                        </div>
                        {description && <p className={styles.addOnDescription}>{description}</p>}
                        {isSelected && addOn.priceType === 'PER_PERSON' && (
                          <div className={styles.addOnGuestInput} onClick={(e) => e.stopPropagation()}>
                            <label className={styles.addOnGuestLabel}>Number of guests:</label>
                            <input
                              type="number"
                              className={styles.guestInput}
                              value={addOnGuestCounts[addOn.type] || boat.capacityMin}
                              onChange={(e) => handleGuestCountChange(addOn.type, e.target.value)}
                              min={1}
                              max={boat.capacityMax}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Event Types */}
            {boat.eventTypes && boat.eventTypes.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Event Types</h2>
                <div className={styles.eventTypesGrid}>
                  {boat.eventTypes.map((type) => (
                    <button
                      key={type}
                      className={`${styles.eventTypeChip} ${selectedEventType === type ? styles.eventTypeSelected : ''}`}
                      onClick={() => setSelectedEventType(type)}
                    >
                      {EVENT_TYPE_LABELS[type] || type}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Description */}
            {boat.description && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>About This Boat</h2>
                <p className={styles.descriptionText}>{boat.description}</p>
              </section>
            )}
          </div>

          {/* Right Column - Pricing & Policies */}
          <div className={styles.detailSidebar}>
            {/* Pricing Display */}
            <div className={styles.pricingCard}>
              <div className={styles.pricingHeader}>
                <span className={styles.pricingFrom}>Starting from</span>
                <span className={styles.pricingAmount}>{formatCurrency(boat.basePrice)}</span>
              </div>
              <p className={styles.pricingNote}>Prices vary by time slot and add-ons</p>
              <p className={styles.pricingGst}>18% GST applicable</p>
              <p className={styles.pricingCustom}>Custom quotes available for special requirements</p>

              <div className={styles.pricingActions}>
                <Link href={(() => {
                  const p = new URLSearchParams();
                  if (selectedTimeSlot) p.set('timeSlot', selectedTimeSlot);
                  if (selectedEventType) p.set('eventType', selectedEventType);
                  const addOnTypes = Object.keys(selectedAddOns).filter(k => selectedAddOns[k]);
                  if (addOnTypes.length > 0) p.set('addOns', addOnTypes.join(','));
                  Object.entries(addOnGuestCounts).forEach(([k, v]) => { if (selectedAddOns[k]) p.set(`guests_${k}`, v); });
                  const qs = p.toString();
                  return `/party-boats/${boatId}/book${qs ? `?${qs}` : ''}`;
                })()} className={styles.bookNowBtn}>
                  Book Now
                </Link>
                <Link href="/contact" className={styles.quoteBtn}>
                  Request Custom Quote
                </Link>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className={styles.policyCard}>
              <h3 className={styles.policyTitle}>Cancellation Policy</h3>
              <div className={styles.policyList}>
                <div className={styles.policyItem}>
                  <span className={styles.policyDot} style={{ backgroundColor: 'var(--color-success)' }}></span>
                  <span>{CANCELLATION_POLICY.fullRefundDays}+ days before: 100% refund</span>
                </div>
                <div className={styles.policyItem}>
                  <span className={styles.policyDot} style={{ backgroundColor: 'var(--color-warning)' }}></span>
                  <span>{CANCELLATION_POLICY.partialRefundDays}-{CANCELLATION_POLICY.fullRefundDays} days before: {CANCELLATION_POLICY.partialPercent}% refund</span>
                </div>
                <div className={styles.policyItem}>
                  <span className={styles.policyDot} style={{ backgroundColor: 'var(--color-error)' }}></span>
                  <span>Less than {CANCELLATION_POLICY.partialRefundDays} days: No refund</span>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className={styles.policyCard}>
              <h3 className={styles.policyTitle}>Payment Terms</h3>
              <div className={styles.policyList}>
                <div className={styles.policyItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{PAYMENT_TERMS.advancePercent}% advance at booking</span>
                </div>
                <div className={styles.policyItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Remaining {100 - PAYMENT_TERMS.advancePercent}% due {PAYMENT_TERMS.remainderDueBeforeDays} days before event</span>
                </div>
              </div>
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
                    ★
                  </span>
                ))}
              </div>
              <span className={styles.ratingBigCount}>{reviews.length} reviews</span>
            </div>
            <div className={styles.ratingDistribution}>
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className={styles.distRow}>
                  <span className={styles.distLabel}>{star}</span>
                  <span className={styles.distStar}>★</span>
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
                        ★
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
                        ★
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
        {otherBoats.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.sectionTitle}>Other Party Boats</h2>
            <div className={styles.relatedScroll}>
              {otherBoats.map((rb, idx) => {
                const rbId = rb.id || rb._id;
                const rbIndex = allBoats.findIndex((b) => (b.id || b._id) === rbId);
                const rbGradient = getBoatGradient(rbIndex >= 0 ? rbIndex : idx);
                const rbImage = rb.images && rb.images.length > 0 ? (typeof rb.images[0] === 'string' ? rb.images[0] : rb.images[0].url) : null;

                return (
                  <Link key={rbId} href={`/party-boats/${rbId}`} className={styles.relatedCard}>
                    <div
                      className={styles.relatedImage}
                      style={rbImage ? { backgroundImage: `url(${rbImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: rbGradient }}
                    >
                      {!rbImage && (
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" opacity="0.4">
                          <path d="M3 17L6 14L9 17L15 11L21 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <rect x="2" y="4" width="20" height="16" rx="2" stroke="white" strokeWidth="1.5" />
                        </svg>
                      )}
                    </div>
                    <div className={styles.relatedInfo}>
                      <h4 className={styles.relatedName}>{rb.name}</h4>
                      <p className={styles.relatedCapacity}>{rb.capacityMin}-{rb.capacityMax} Guests</p>
                      <span className={styles.relatedPrice}>From {formatCurrency(rb.basePrice)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
