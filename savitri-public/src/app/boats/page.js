'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { API_ENDPOINTS } from '@/utils/constants';
import styles from './boats.module.css';

export default function BoatsPage() {
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBoats();
  }, []);

  const fetchBoats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(API_ENDPOINTS.BOOKINGS.BOATS);
      setBoats(response.data?.boats || response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load boats. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={styles.boatsPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Speed Boat Rentals</h1>
          <p className={styles.heroSubtitle}>
            Experience the thrill of the open water with our fleet of well-maintained speed boats.
            Professional captain included with every rental.
          </p>
          <Link href="/book" className={styles.heroButton}>
            Book Now
          </Link>
        </div>
      </section>

      {/* Boats Listing */}
      <section className={styles.listing}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Fleet</h2>
          <p className={styles.sectionSubtitle}>
            Choose from our selection of speed boats. All rentals include an experienced captain.
          </p>

          {/* Loading State */}
          {loading && (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Loading our fleet...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>!</div>
              <p className={styles.errorText}>{error}</p>
              <button onClick={fetchBoats} className={styles.retryButton}>
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && boats.length === 0 && (
            <div className={styles.emptyContainer}>
              <div className={styles.emptyIcon}>&#x1F6A4;</div>
              <h3 className={styles.emptyTitle}>No Boats Available</h3>
              <p className={styles.emptyText}>
                Our fleet is currently being updated. Please check back soon!
              </p>
            </div>
          )}

          {/* Boats Grid */}
          {!loading && !error && boats.length > 0 && (
            <div className={styles.boatsGrid}>
              {boats.map((boat) => (
                <div key={boat.id || boat._id} className={styles.boatCard}>
                  <div className={styles.boatImage}>
                    {boat.images && boat.images.length > 0 ? (
                      <img
                        src={boat.images[0]}
                        alt={boat.name}
                        className={styles.boatImg}
                      />
                    ) : (
                      <div className={styles.boatPlaceholder}>
                        <span className={styles.boatEmoji}>&#x1F6A4;</span>
                      </div>
                    )}
                    {boat.status === 'ACTIVE' && (
                      <span className={styles.availableBadge}>Available</span>
                    )}
                  </div>
                  <div className={styles.boatInfo}>
                    <h3 className={styles.boatName}>{boat.name}</h3>
                    {boat.description && (
                      <p className={styles.boatDescription}>{boat.description}</p>
                    )}
                    <div className={styles.boatDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Capacity</span>
                        <span className={styles.detailValue}>
                          {boat.capacity || boat.maxPassengers || '-'} passengers
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Base Rate</span>
                        <span className={styles.detailValue}>
                          {formatCurrency(boat.baseRate || boat.pricePerHour || 0)}/hr
                        </span>
                      </div>
                    </div>
                    <div className={styles.boatFeatures}>
                      <span className={styles.feature}>Captain Included</span>
                      <span className={styles.feature}>Safety Gear</span>
                      {boat.hasLifeJackets && (
                        <span className={styles.feature}>Life Jackets</span>
                      )}
                    </div>
                    <Link href="/book" className={styles.bookButton}>
                      Book This Boat
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className={styles.infoSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Choose Your Date</h3>
              <p className={styles.stepDescription}>
                Select your preferred date and time slot from our availability calendar.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Select Your Boats</h3>
              <p className={styles.stepDescription}>
                Pick the number of boats and duration for your trip.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Confirm & Pay</h3>
              <p className={styles.stepDescription}>
                Review your booking, provide your details, and confirm. Pay online or at the venue.
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
            Book your speed boat adventure today! Advance booking up to 45 days.
          </p>
          <Link href="/book" className={styles.ctaButton}>
            Book Now
          </Link>
        </div>
      </section>
    </div>
  );
}
