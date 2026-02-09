'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { API_ENDPOINTS } from '@/utils/constants';
import styles from './page.module.css';

const HERO_SLIDES = [
  {
    gradient: 'linear-gradient(135deg, #0891b2 0%, #064e3b 100%)',
    title: 'Experience Mumbai Waters Like Never Before',
    subtitle: 'Premium speed boat rentals with professional captains. Book your adventure today.',
    primaryCta: { label: 'Explore Speed Boats', href: '/speed-boats' },
    secondaryCta: { label: 'Plan a Party', href: '/party-boats' },
  },
  {
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #1e1b4b 100%)',
    title: 'Host Unforgettable Events on Water',
    subtitle: 'Weddings, birthdays, corporate events — our party boats make every celebration special.',
    primaryCta: { label: 'View Party Boats', href: '/party-boats' },
    secondaryCta: { label: 'Contact Us', href: '/contact' },
  },
  {
    gradient: 'linear-gradient(135deg, #d97706 0%, #78350f 100%)',
    title: 'Your Gateway to the Arabian Sea',
    subtitle: 'Safe, reliable, and affordable boat rental services. Over 10 years serving Mumbai.',
    primaryCta: { label: 'Book Now', href: '/speed-boats' },
    secondaryCta: { label: 'Learn More', href: '/about' },
  },
];

const DEFAULT_STATS = [
  { value: '10+', label: 'Years Experience' },
  { value: '5,000+', label: 'Happy Customers' },
  { value: '10+', label: 'Boats in Fleet' },
  { value: '500+', label: 'Events Hosted' },
];

const FEATURED_BOATS = [
  { id: 'sb-1', name: 'Sea Hawk', type: 'speed', capacity: '8 Passengers', baseRate: 3000, actualRate: 2500, rating: 4.8, reviewCount: 45, gradient: 'linear-gradient(135deg, #0891b2, #0e7490)', href: '/speed-boats/sb-1' },
  { id: 'sb-3', name: 'Wave Runner', type: 'speed', capacity: '10 Passengers', baseRate: 4000, actualRate: 3500, rating: 4.9, reviewCount: 67, gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)', href: '/speed-boats/sb-3' },
  { id: 'pb-1', name: 'Royal Celebration', type: 'party', capacity: '50-150 Guests', baseRate: null, actualRate: 75000, rating: 4.9, reviewCount: 34, gradient: 'linear-gradient(135deg, #7c3aed, #5b21b6)', href: '/party-boats/pb-1' },
  { id: 'pb-2', name: 'Star Night', type: 'party', capacity: '30-80 Guests', baseRate: null, actualRate: 45000, rating: 4.7, reviewCount: 28, gradient: 'linear-gradient(135deg, #d97706, #b45309)', href: '/party-boats/pb-2' },
];


const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format a stat number for display with '+' suffix
 * e.g., 5000 -> "5,000+", 10 -> "10+"
 */
const formatStatValue = (num) => {
  if (num == null || num === 0) return '0';
  return new Intl.NumberFormat('en-IN').format(num) + '+';
};

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [stats, setStats] = useState(DEFAULT_STATS);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch public stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.PUBLIC.STATS);
        if (response.success && response.data) {
          const d = response.data;
          setStats([
            { value: formatStatValue(d.yearsExperience), label: 'Years Experience' },
            { value: formatStatValue(d.happyCustomers), label: 'Happy Customers' },
            { value: formatStatValue(d.boatsInFleet), label: 'Boats in Fleet' },
            { value: formatStatValue(d.eventsHosted), label: 'Events Hosted' },
          ]);
        }
      } catch {
        // Silently fail - keep default stats
      }
    };

    fetchStats();
  }, []);

  // Fetch company reviews for testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setTestimonialsLoading(true);
        const response = await api.get(`${API_ENDPOINTS.REVIEWS.LIST}?type=COMPANY&limit=6`);
        if (response.success && response.data) {
          const reviewsData = Array.isArray(response.data) ? response.data : (response.data.reviews || []);
          setTestimonials(reviewsData);
        }
      } catch {
        // Silently fail - testimonials section will show empty state
        setTestimonials([]);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <div className={styles.homepage}>
      {/* Hero Carousel */}
      <section className={styles.hero}>
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`${styles.heroSlide} ${index === currentSlide ? styles.heroSlideActive : ''}`}
            style={{ background: slide.gradient }}
          >
            <div className={styles.heroOverlay} />
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>{slide.title}</h1>
              <p className={styles.heroSubtitle}>{slide.subtitle}</p>
              <div className={styles.heroActions}>
                <Link href={slide.primaryCta.href} className={styles.primaryButton}>
                  {slide.primaryCta.label}
                </Link>
                <Link href={slide.secondaryCta.href} className={styles.secondaryButton}>
                  {slide.secondaryCta.label}
                </Link>
              </div>
            </div>
          </div>
        ))}
        <div className={styles.heroDots}>
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              className={`${styles.heroDot} ${index === currentSlide ? styles.heroDotActive : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className={styles.statsBar}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statItem}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={styles.services}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Services</h2>
          <p className={styles.sectionSubtitle}>Choose from our premium water transport and entertainment options</p>
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5">
                  <path d="M2 20L4.5 17.5M4.5 17.5L8.04 13.96C8.47 13.53 9.13 13.44 9.66 13.74L10.34 14.13C10.87 14.43 11.53 14.34 11.96 13.91L15.5 10.37M4.5 17.5H8M15.5 10.37L18.5 7.37M15.5 10.37L18 10.37M22 4L18.5 7.37M18.5 7.37V4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className={styles.serviceTitle}>Speed Boats</h3>
              <p className={styles.serviceDescription}>
                Rent speed boats by the hour for quick and thrilling water adventures. Professional captain included with every booking.
              </p>
              <ul className={styles.serviceFeatures}>
                <li>6-12 passenger capacity</li>
                <li>Hourly rentals from &#x20B9;1,800/hr</li>
                <li>Professional captain included</li>
                <li>Safety gear provided</li>
              </ul>
              <Link href="/speed-boats" className={styles.serviceLink}>
                View Speed Boats &rarr;
              </Link>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="1.5">
                  <path d="M12 2L14.5 9H22L16 13.5L18 21L12 17L6 21L8 13.5L2 9H9.5L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className={styles.serviceTitle}>Party Boats</h3>
              <p className={styles.serviceDescription}>
                Host memorable events on our spacious party boats. Weddings, birthdays, corporate events &mdash; we handle it all.
              </p>
              <ul className={styles.serviceFeatures}>
                <li>30-200 guest capacity</li>
                <li>DJ included with every booking</li>
                <li>Catering &amp; decoration add-ons</li>
                <li>Harbor or cruise options</li>
              </ul>
              <Link href="/party-boats" className={styles.serviceLink}>
                View Party Boats &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Boats */}
      <section className={styles.featured}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Popular Boats</h2>
          <p className={styles.sectionSubtitle}>Our most booked boats across speed and party categories</p>
          <div className={styles.featuredGrid}>
            {FEATURED_BOATS.map((boat) => (
              <Link key={boat.id} href={boat.href} className={styles.boatCard}>
                <div className={styles.boatImage} style={{ background: boat.gradient }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
                    <path d="M2 20L4.5 17.5M4.5 17.5L8.04 13.96C8.47 13.53 9.13 13.44 9.66 13.74L10.34 14.13C10.87 14.43 11.53 14.34 11.96 13.91L15.5 10.37M4.5 17.5H8M15.5 10.37L18.5 7.37M15.5 10.37L18 10.37M22 4L18.5 7.37M18.5 7.37V4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className={`${styles.boatTypeBadge} ${boat.type === 'party' ? styles.boatTypeBadgeParty : ''}`}>
                    {boat.type === 'speed' ? 'Speed Boat' : 'Party Boat'}
                  </span>
                </div>
                <div className={styles.boatInfo}>
                  <div className={styles.boatNameRow}>
                    <h3 className={styles.boatName}>{boat.name}</h3>
                    <div className={styles.boatRating}>
                      <span className={styles.star}>&#9733;</span>
                      <span>{boat.rating}</span>
                      <span className={styles.boatReviewCount}>({boat.reviewCount})</span>
                    </div>
                  </div>
                  <p className={styles.boatCapacity}>{boat.capacity}</p>
                  <div className={styles.boatPricing}>
                    {boat.baseRate ? (
                      <>
                        <span className={styles.boatBaseRate}>{formatCurrency(boat.baseRate)}/hr</span>
                        <span className={styles.boatActualRate}>{formatCurrency(boat.actualRate)}/hr</span>
                      </>
                    ) : (
                      <span className={styles.boatActualRate}>From {formatCurrency(boat.actualRate)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSubtitle}>Book your perfect boat experience in 3 simple steps</p>
          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Choose Your Boat</h3>
              <p className={styles.stepDescription}>
                Browse our fleet of speed boats and party boats. Compare features, capacity, and pricing.
              </p>
            </div>
            <div className={styles.stepConnector}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--border-color)" strokeWidth="2">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Pick Date &amp; Time</h3>
              <p className={styles.stepDescription}>
                Select your preferred date and time slot. Check real-time availability on our calendar.
              </p>
            </div>
            <div className={styles.stepConnector}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--border-color)" strokeWidth="2">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Book &amp; Enjoy</h3>
              <p className={styles.stepDescription}>
                Confirm your booking with easy payment options. Show up and enjoy the ride!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
          <p className={styles.sectionSubtitle}>Real experiences from real customers</p>
          <div className={styles.reviewCta}>
            <Link href="/about?writeReview=true" className={styles.writeReviewLink}>
              Write a Review &rarr;
            </Link>
          </div>
          {testimonialsLoading ? (
            <div className={styles.testimonialsGrid}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.testimonialCard} style={{ opacity: 0.5 }}>
                  <div className={styles.testimonialStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={styles.starEmpty}>&#9733;</span>
                    ))}
                  </div>
                  <p className={styles.testimonialText} style={{ color: 'var(--text-tertiary)' }}>Loading...</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.testimonialAvatar} style={{ backgroundColor: 'var(--border-color)' }}>&nbsp;</div>
                    <div>
                      <div className={styles.testimonialName} style={{ color: 'var(--text-tertiary)' }}>---</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--spacing-8) 0' }}>
              No reviews yet. Be the first to share your experience!
            </p>
          ) : (
            <div className={styles.testimonialsGrid}>
              {testimonials.map((t, index) => (
                <div key={t.id || index} className={styles.testimonialCard}>
                  <div className={styles.testimonialStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= t.rating ? styles.starFilled : styles.starEmpty}>&#9733;</span>
                    ))}
                  </div>
                  <p className={styles.testimonialText}>&ldquo;{t.comment}&rdquo;</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.testimonialAvatar}>{(t.customerName || 'A').charAt(0)}</div>
                    <div>
                      <div className={styles.testimonialName}>{t.customerName || 'Anonymous'}</div>
                      {t.isVerified && <div className={styles.testimonialLocation}>Verified Customer</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Ready to Set Sail?</h2>
          <p className={styles.ctaDescription}>
            Whether it&apos;s a quick speed boat ride or an unforgettable party on the water,
            we&apos;ve got the perfect boat for you.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/speed-boats" className={styles.ctaButton}>
              Book a Speed Boat
            </Link>
            <Link href="/party-boats" className={styles.ctaButtonOutline}>
              Plan a Party
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
