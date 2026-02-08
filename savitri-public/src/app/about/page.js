'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { API_ENDPOINTS } from '@/utils/constants';
import styles from './about.module.css';

const AVATAR_COLORS = ['#dc2626', '#7c3aed', '#0891b2', '#d97706', '#2563eb', '#059669', '#c026d3', '#0d9488'];

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export default function AboutPage() {
  const { isAuthenticated, user } = useAuthStore();
  const searchParams = useSearchParams();
  const reviewsSectionRef = useRef(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user?.name) {
      setReviewName(user.name);
    }
  }, [isAuthenticated, user]);

  // Auto-open review form if ?writeReview=true
  useEffect(() => {
    if (searchParams.get('writeReview') === 'true') {
      setShowReviewForm(true);
      setTimeout(() => {
        reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await api.get(`${API_ENDPOINTS.REVIEWS.LIST}?type=COMPANY&limit=20`);
        if (response.success && response.data) {
          const reviewsData = Array.isArray(response.data) ? response.data : (response.data.reviews || []);
          setReviews(reviewsData.map((r) => ({
            id: r.id || r._id,
            name: r.customerName || 'Anonymous',
            rating: r.rating,
            date: r.createdAt,
            comment: r.comment,
            verified: r.isVerified || false,
          })));
        }
      } catch {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewRating === 0 || !reviewName.trim() || !reviewComment.trim()) return;

    try {
      setReviewSubmitting(true);
      setReviewError('');

      const response = await api.post(API_ENDPOINTS.REVIEWS.CREATE, {
        reviewType: 'COMPANY',
        rating: reviewRating,
        comment: reviewComment.trim(),
        customerName: reviewName.trim(),
      });

      if (response.success) {
        const r = response.data;
        setReviews((prev) => [{
          id: r.id || r._id || `user-${Date.now()}`,
          name: r.customerName || reviewName.trim(),
          rating: r.rating || reviewRating,
          date: r.createdAt || new Date().toISOString(),
          comment: r.comment || reviewComment.trim(),
          verified: r.isVerified || false,
        }, ...prev]);
        setReviewSubmitted(true);
        setReviewComment('');
        setReviewRating(0);
        setTimeout(() => {
          setReviewSubmitted(false);
          setShowReviewForm(false);
        }, 3000);
      }
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const getRatingDistribution = () => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => { dist[r.rating] = (dist[r.rating] || 0) + 1; });
    return dist;
  };

  const distribution = getRatingDistribution();

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>About Savitri Shipping</h1>
        <p className={styles.heroSubtitle}>
          Your trusted partner for premium boat rentals in Mumbai since 2015
        </p>
      </section>

      <div className={styles.container}>
        {/* Story */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Our Story</h2>
          <p className={styles.text}>
            Savitri Shipping was founded with a simple mission &mdash; to make Mumbai&apos;s beautiful
            coastline accessible to everyone. What started as a small fleet of two boats has grown into
            a premier water transport and entertainment company serving thousands of customers every year.
          </p>
          <p className={styles.text}>
            Based in Mumbai, Maharashtra, we specialize in speed boat rentals and party boat experiences.
            Our fleet of well-maintained vessels, combined with professional crews, ensures every trip
            is safe, comfortable, and memorable.
          </p>
        </section>

        {/* Services */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>What We Offer</h2>
          <div className={styles.cardsGrid}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5">
                  <path d="M2 20L4.5 17.5M4.5 17.5L8.04 13.96C8.47 13.53 9.13 13.44 9.66 13.74L10.34 14.13C10.87 14.43 11.53 14.34 11.96 13.91L15.5 10.37M4.5 17.5H8M15.5 10.37L18.5 7.37M15.5 10.37L18 10.37M22 4L18.5 7.37M18.5 7.37V4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Speed Boat Rentals</h3>
              <p className={styles.cardText}>
                Hourly rentals for groups of 6-12. Captain included with every booking. Perfect for
                quick adventures and sightseeing along the Mumbai coast.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="1.5">
                  <path d="M12 2L14.5 9H22L16 13.5L18 21L12 17L6 21L8 13.5L2 9H9.5L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className={styles.cardTitle}>Party Boat Experiences</h3>
              <p className={styles.cardText}>
                Host weddings, birthdays, corporate events, and celebrations on our spacious party boats.
                DJ, catering, decoration &mdash; we handle everything.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Our Values</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2">
                  <path d="M12 22S20 18 20 12V5L12 2 4 5V12C4 18 12 22 12 22Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className={styles.valueTitle}>Safety First</h3>
                <p className={styles.valueText}>Regular vessel inspections and certified crew for your peace of mind.</p>
              </div>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                  <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h3 className={styles.valueTitle}>Reliability</h3>
                <p className={styles.valueText}>On-time departures, well-maintained fleet, and consistent service quality.</p>
              </div>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2">
                  <path d="M12 1V23M17 5H9.5C8.57 5 7.68 5.37 7.02 6.02 6.37 6.68 6 7.57 6 8.5 6 9.43 6.37 10.32 7.02 10.98 7.68 11.63 8.57 12 9.5 12H14.5C15.43 12 16.32 12.37 16.98 13.02 17.63 13.68 18 14.57 18 15.5 18 16.43 17.63 17.32 16.98 17.98 16.32 18.63 15.43 19 14.5 19H6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className={styles.valueTitle}>Transparent Pricing</h3>
                <p className={styles.valueText}>No hidden charges. See exact pricing before you book, including all taxes.</p>
              </div>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.valueIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className={styles.valueTitle}>Customer First</h3>
                <p className={styles.valueText}>Dedicated support, flexible booking, and hassle-free cancellations.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className={styles.section} ref={reviewsSectionRef}>
          <div className={styles.reviewsHeader}>
            <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
            {!showReviewForm && !reviewSubmitted && (
              <button className={styles.writeReviewBtn} onClick={() => setShowReviewForm(true)}>
                Write a Review
              </button>
            )}
          </div>

          {/* Rating Summary */}
          {!reviewsLoading && reviews.length > 0 && (
            <div className={styles.ratingSummary}>
              <div className={styles.ratingBig}>
                <span className={styles.ratingNumber}>{avgRating}</span>
                <div className={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={parseFloat(avgRating) >= star ? styles.starFilled : styles.starEmpty}>
                      &#9733;
                    </span>
                  ))}
                </div>
                <span className={styles.ratingCount}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
              </div>
              <div className={styles.ratingBars}>
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className={styles.ratingBarRow}>
                    <span className={styles.ratingBarLabel}>{star}</span>
                    <span className={styles.ratingBarStar}>&#9733;</span>
                    <div className={styles.ratingBarTrack}>
                      <div
                        className={styles.ratingBarFill}
                        style={{ width: reviews.length > 0 ? `${(distribution[star] / reviews.length) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className={styles.ratingBarCount}>{distribution[star]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <div className={styles.reviewFormCard}>
              {reviewSubmitted ? (
                <div className={styles.reviewSuccess}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>Thank you for your review!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  <h3 className={styles.reviewFormTitle}>Share Your Experience</h3>
                  <div className={styles.reviewFormStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`${styles.reviewStarBtn} ${(reviewHoverRating || reviewRating) >= star ? styles.starActive : ''}`}
                        onMouseEnter={() => setReviewHoverRating(star)}
                        onMouseLeave={() => setReviewHoverRating(0)}
                        onClick={() => setReviewRating(star)}
                      >
                        &#9733;
                      </button>
                    ))}
                    {reviewRating > 0 && (
                      <span className={styles.ratingLabel}>
                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    className={styles.reviewInput}
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Your name"
                    maxLength={50}
                    disabled={isAuthenticated && !!user?.name}
                  />
                  <div className={styles.reviewTextareaWrap}>
                    <textarea
                      className={styles.reviewTextarea}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Tell us about your experience with Savitri Shipping..."
                      rows={4}
                      maxLength={500}
                    />
                    <span className={styles.reviewCharCount}>{reviewComment.length}/500</span>
                  </div>
                  {reviewError && <p className={styles.reviewError}>{reviewError}</p>}
                  <div className={styles.reviewFormActions}>
                    <button
                      type="submit"
                      className={styles.reviewSubmitBtn}
                      disabled={!reviewRating || !reviewName.trim() || !reviewComment.trim() || reviewSubmitting}
                    >
                      {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <button
                      type="button"
                      className={styles.reviewCancelBtn}
                      onClick={() => setShowReviewForm(false)}
                      disabled={reviewSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Reviews List */}
          <div className={styles.reviewsList}>
            {reviewsLoading ? (
              <p className={styles.reviewsEmpty}>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className={styles.reviewsEmpty}>No reviews yet. Be the first to share your experience!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewAvatar} style={{ backgroundColor: getAvatarColor(review.name) }}>
                    {review.name.charAt(0)}
                  </div>
                  <div className={styles.reviewBody}>
                    <div className={styles.reviewTop}>
                      <div className={styles.reviewerInfo}>
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
              ))
            )}
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Ready to Experience Mumbai Waters?</h2>
          <p className={styles.ctaText}>
            Book your next adventure with Savitri Shipping today.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/speed-boats" className={styles.ctaPrimary}>Browse Speed Boats</Link>
            <Link href="/contact" className={styles.ctaSecondary}>Contact Us</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
