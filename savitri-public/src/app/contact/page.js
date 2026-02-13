'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import styles from './contact.module.css';

function ContactForm() {
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    const updates = {};

    // Pre-fill from URL params (party boat inquiry)
    const subject = searchParams.get('subject');
    const message = searchParams.get('message');
    if (subject) updates.subject = subject;
    if (message) updates.message = message;

    // Pre-fill from logged-in user
    if (isAuthenticated && user) {
      if (user.name) updates.name = user.name;
      if (user.email) updates.email = user.email;
    }

    if (Object.keys(updates).length > 0) {
      setFormData((prev) => ({ ...prev, ...updates }));
    }
  }, [searchParams, isAuthenticated, user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you shortly.');
  };

  const isUserField = isAuthenticated && user;

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Get in Touch</h1>
          <p className={styles.heroSubtitle}>
            Have questions about our boats or services? We&apos;re here to help you plan the perfect experience on the water.
          </p>
        </div>
      </section>

      <div className={styles.container}>
        {/* Info Cards Grid */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIconWrap}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7L13.03 12.7C12.71 12.9 12.36 13 12 13C11.64 13 11.29 12.9 10.97 12.7L2 7" />
              </svg>
            </div>
            <h3 className={styles.infoCardTitle}>Email Us</h3>
            <a href="mailto:info@savitrishipping.in" className={styles.infoCardValue}>
              info@savitrishipping.in
            </a>
            <p className={styles.infoCardDetail}>We reply within 24 hours</p>
          </div>

          <div className={styles.infoCard}>
            <div className={`${styles.infoIconWrap} ${styles.infoIconPhone}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <h3 className={styles.infoCardTitle}>Call Us</h3>
            <a href="tel:+919876543210" className={styles.infoCardValue}>
              +91 98765 43210
            </a>
            <p className={styles.infoCardDetail}>Available during working hours</p>
          </div>

          <div className={styles.infoCard}>
            <div className={`${styles.infoIconWrap} ${styles.infoIconLocation}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 className={styles.infoCardTitle}>Visit Us</h3>
            <p className={styles.infoCardValue}>Mumbai, Maharashtra</p>
            <p className={styles.infoCardDetail}>India</p>
          </div>

          <div className={styles.infoCard}>
            <div className={`${styles.infoIconWrap} ${styles.infoIconClock}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3 className={styles.infoCardTitle}>Working Hours</h3>
            <p className={styles.infoCardValue}>Mon - Sun</p>
            <p className={styles.infoCardDetail}>6:00 AM - 10:00 PM</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Send us a Message</h2>
              <p className={styles.formSubtitle}>Fill out the form below and we&apos;ll get back to you as soon as possible.</p>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <Input
                  label="Name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={!!isUserField}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={!!isUserField}
                  required
                />
              </div>

              <Input
                label="Subject"
                type="text"
                placeholder="What is this regarding?"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                required
              />

              <Textarea
                label="Message"
                placeholder="Tell us more about your inquiry..."
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                rows={6}
                required
              />

              <Button type="submit" variant="primary" fullWidth>
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <ContactForm />
    </Suspense>
  );
}
