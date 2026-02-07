'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import styles from './page.module.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function PartyBoatConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const bookingId = useMemo(() => {
    return 'PB-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }, []);

  const boat = searchParams.get('boat') || 'Party Boat';
  const eventType = searchParams.get('event') || '';
  const guests = searchParams.get('guests') || '';
  const date = searchParams.get('date') || '';
  const slot = searchParams.get('slot') || '';
  const slotPrice = parseInt(searchParams.get('slotPrice')) || 0;
  const location = searchParams.get('location') || '';
  const name = searchParams.get('name') || '';
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';
  const subtotal = parseInt(searchParams.get('subtotal')) || 0;
  const gst = parseInt(searchParams.get('gst')) || 0;
  const total = parseInt(searchParams.get('total')) || 0;
  const advance = parseInt(searchParams.get('advance')) || 0;
  const remainder = parseInt(searchParams.get('remainder')) || 0;
  const addOnsTotal = parseInt(searchParams.get('addOnsTotal')) || 0;
  const capacity = searchParams.get('capacity') || '';
  const requests = searchParams.get('requests') || '';

  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Not available';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Success Banner */}
        <div className={styles.successBanner}>
          <div className={styles.successIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className={styles.successTitle}>Event Booked!</h1>
          <p className={styles.successSubtitle}>
            Your party boat has been reserved successfully
          </p>
          <div className={styles.bookingIdBadge}>
            Booking ID: <strong>{bookingId}</strong>
          </div>
        </div>

        {/* Confirmation Card */}
        <div className={styles.confirmCard}>
          {/* Event Details */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Event Details
            </h2>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Boat</span>
                <span className={styles.detailValue}>{boat}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Event Type</span>
                <span className={styles.detailValue}>{eventType || 'Not specified'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Guests</span>
                <span className={styles.detailValue}>{guests} (Capacity: {capacity})</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Date</span>
                <span className={styles.detailValue}>{formattedDate}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Time Slot</span>
                <span className={styles.detailValue}>{slot || 'Not selected'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Location</span>
                <span className={styles.detailValue}>{location || 'Not selected'}</span>
              </div>
            </div>
            {requests && (
              <div className={styles.requestsBox}>
                <span className={styles.detailLabel}>Special Requests</span>
                <p className={styles.requestsText}>{requests}</p>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Customer Information
            </h2>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Name</span>
                <span className={styles.detailValue}>{name}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue}>{email}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Phone</span>
                <span className={styles.detailValue}>{phone}</span>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Price Breakdown
            </h2>
            <div className={styles.priceList}>
              {slotPrice > 0 && (
                <div className={styles.priceRow}>
                  <span>Time Slot</span>
                  <span>{formatCurrency(slotPrice)}</span>
                </div>
              )}
              {addOnsTotal > 0 && (
                <div className={styles.priceRow}>
                  <span>Add-ons</span>
                  <span>{formatCurrency(addOnsTotal)}</span>
                </div>
              )}
              <div className={styles.priceRow}>
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className={styles.priceRow}>
                <span>GST (18%)</span>
                <span>{formatCurrency(gst)}</span>
              </div>
              <div className={`${styles.priceRow} ${styles.priceTotal}`}>
                <span>Total Amount</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Payment Terms */}
            {advance > 0 && (
              <div className={styles.paymentTerms}>
                <div className={styles.paymentRow}>
                  <span>Advance Payment (Due Now)</span>
                  <span className={styles.paymentHighlight}>{formatCurrency(advance)}</span>
                </div>
                <div className={styles.paymentRow}>
                  <span>Remainder (Due Before Event)</span>
                  <span>{formatCurrency(remainder)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Note */}
        <div className={styles.infoNote}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01" strokeLinecap="round"/>
          </svg>
          <p>A confirmation email has been sent to <strong>{email}</strong>. Our team will contact you within 24 hours to finalize event details.</p>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <Link href="/" className={styles.homeBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Go to Homepage
          </Link>
          <Link href="/account/bookings" className={styles.bookingsBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
            </svg>
            View My Bookings
          </Link>
          <button className={styles.printBtn} onClick={() => window.print()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="6" y="14" width="12" height="8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
