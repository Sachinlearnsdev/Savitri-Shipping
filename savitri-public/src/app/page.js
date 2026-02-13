'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { API_ENDPOINTS } from '@/utils/constants';
import styles from './page.module.css';

const DEFAULT_STATS = [
  { value: 10, label: 'Years Experience', suffix: '+' },
  { value: 5000, label: 'Happy Customers', suffix: '+' },
  { value: 10, label: 'Boats in Fleet', suffix: '+' },
  { value: 500, label: 'Events Hosted', suffix: '+' },
];

const WHY_CHOOSE_US = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: 'Safety First',
    description: 'Coast guard certified vessels with all safety equipment. Your security is our top priority on every voyage.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: 'Expert Captains',
    description: 'Experienced, licensed captains who know Mumbai waters inside out. Professional service guaranteed.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    title: 'Best Prices',
    description: 'Competitive pricing with no hidden charges. Transparent billing and flexible payment options available.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        <circle cx="12" cy="12" r="3" strokeDasharray="2 2" />
      </svg>
    ),
    title: '24/7 Support',
    description: 'Round-the-clock customer support. Reach us anytime for bookings, queries, or assistance.',
  },
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
 * Animated counter component for stats
 */
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const increment = target / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  const formatted = new Intl.NumberFormat('en-IN').format(count);
  return <span ref={ref}>{formatted}{suffix}</span>;
}

export default function HomePage() {
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [promoBanner, setPromoBanner] = useState(null);

  // Fetch public stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.PUBLIC.STATS);
        if (response.success && response.data) {
          const d = response.data;
          setStats([
            { value: d.yearsExperience || 10, label: 'Years Experience', suffix: '+' },
            { value: d.happyCustomers || 5000, label: 'Happy Customers', suffix: '+' },
            { value: d.boatsInFleet || 10, label: 'Boats in Fleet', suffix: '+' },
            { value: d.eventsHosted || 500, label: 'Events Hosted', suffix: '+' },
          ]);
        }
      } catch {
        // Silently fail - keep default stats
      }
    };

    fetchStats();
  }, []);

  // Fetch content settings (for promo banner)
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.PUBLIC.CONTENT);
        if (response.success && response.data) {
          const content = response.data;
          if (content.promoBanner) {
            setPromoBanner(content.promoBanner);
          }
        }
      } catch {
        // Silently fail - no promo banner
      }
    };

    fetchContent();
  }, []);

  // Fetch company reviews for testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setTestimonialsLoading(true);
        const response = await api.get(`${API_ENDPOINTS.REVIEWS.LIST}?type=COMPANY&limit=3`);
        if (response.success && response.data) {
          const reviewsData = Array.isArray(response.data) ? response.data : (response.data.reviews || []);
          setTestimonials(reviewsData.slice(0, 3));
        }
      } catch {
        setTestimonials([]);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <div className={styles.homepage}>
      {/* Promotional Banner */}
      {promoBanner?.enabled && promoBanner?.text && (
        <div className={styles.promoBanner} style={{ backgroundColor: promoBanner.backgroundColor || '#0891b2' }}>
          <div className={styles.promoBannerContent}>
            <span className={styles.promoBannerText}>{promoBanner.text}</span>
            {promoBanner.couponCode && (
              <span className={styles.promoBannerCode}>{promoBanner.couponCode}</span>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Experience the Waters of Mumbai</h1>
          <p className={styles.heroSubtitle}>
            Premium boat rentals for speed adventures &amp; unforgettable celebrations
          </p>
          <div className={styles.heroActions}>
            <Link href="/speed-boats" className={styles.primaryButton}>
              Explore Speed Boats
            </Link>
            <Link href="/party-boats" className={styles.secondaryButton}>
              Plan a Party
            </Link>
          </div>
        </div>
        {/* Animated wave at bottom */}
        <div className={styles.waveContainer}>
          <svg className={styles.wave} viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z" className={styles.wavePath1} />
            <path d="M0,80 C240,20 480,100 720,40 C960,0 1200,80 1440,40 L1440,120 L0,120 Z" className={styles.wavePath2} />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statValue}>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className={styles.statLabel}>{stat.label}</div>
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
              <div className={styles.serviceIconWrap}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 20L4.5 17.5M4.5 17.5L8.04 13.96C8.47 13.53 9.13 13.44 9.66 13.74L10.34 14.13C10.87 14.43 11.53 14.34 11.96 13.91L15.5 10.37M4.5 17.5H8M15.5 10.37L18.5 7.37M15.5 10.37L18 10.37M22 4L18.5 7.37M18.5 7.37V4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className={styles.serviceTitle}>Speed Boats</h3>
              <p className={styles.serviceDescription}>
                Rent speed boats by the hour for quick and thrilling water adventures. Professional captain included with every booking.
              </p>
              <div className={styles.servicePrice}>Starting from {formatCurrency(1800)}/hr</div>
              <Link href="/speed-boats" className={styles.serviceButton}>
                View Boats
              </Link>
            </div>
            <div className={styles.serviceCard}>
              <div className={`${styles.serviceIconWrap} ${styles.serviceIconParty}`}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L14.5 9H22L16 13.5L18 21L12 17L6 21L8 13.5L2 9H9.5L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className={styles.serviceTitle}>Party Boats</h3>
              <p className={styles.serviceDescription}>
                Host memorable events on our spacious party boats. Weddings, birthdays, corporate events &mdash; we handle it all.
              </p>
              <div className={styles.servicePrice}>Starting from {formatCurrency(45000)}</div>
              <Link href="/party-boats" className={`${styles.serviceButton} ${styles.serviceButtonParty}`}>
                Explore
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className={styles.whyChooseUs}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Choose Us</h2>
          <p className={styles.sectionSubtitle}>Trusted by thousands of customers across Mumbai</p>
          <div className={styles.featuresGrid}>
            {WHY_CHOOSE_US.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
          <p className={styles.sectionSubtitle}>Real experiences from real customers</p>
          {testimonialsLoading ? (
            <div className={styles.testimonialsGrid}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={`${styles.testimonialCard} ${styles.testimonialCardSkeleton}`}>
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
            <p className={styles.emptyTestimonials}>
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
                      {t.isVerified && <div className={styles.testimonialBadge}>Verified Customer</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Ready for an Adventure?</h2>
          <p className={styles.ctaDescription}>
            Whether it&apos;s a quick speed boat ride or an unforgettable party on the water,
            we&apos;ve got the perfect boat for you.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/speed-boats" className={styles.ctaButton}>
              Book Now
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
