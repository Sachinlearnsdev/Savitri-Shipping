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
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Contact Us</h1>
        <p className={styles.heroSubtitle}>Have questions? We&apos;d love to hear from you.</p>
      </section>

      <div className={styles.container}>
        <div className={styles.contentGrid}>
          {/* Contact Info */}
          <div className={styles.infoCard}>
            <h2 className={styles.cardTitle}>Get in Touch</h2>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 7L13.03 12.7C12.71 12.9 12.36 13 12 13C11.64 13 11.29 12.9 10.97 12.7L2 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3>Email</h3>
                  <a href="mailto:info@savitrishipping.in" className={styles.link}>info@savitrishipping.in</a>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                    <path d="M22 16.92V19.92C22 20.48 21.56 20.93 21 20.97C20.74 20.99 20.48 21 20.22 21C10.76 21 3 13.24 3 3.78C3 3.52 3.01 3.26 3.03 3C3.07 2.44 3.52 2 4.08 2H7.08C7.56 2 7.97 2.34 8.05 2.81C8.14 3.39 8.3 3.95 8.53 4.48L7.01 6C8.24 8.39 10.11 10.26 12.5 11.49L14.02 9.97C14.55 10.2 15.11 10.36 15.69 10.45C16.16 10.53 16.5 10.94 16.5 11.42V16.92C16.5 17.47 16.97 17.92 17.52 17.92H22Z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3>Phone</h3>
                  <a href="tel:+919876543210" className={styles.link}>+91 98765 43210</a>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                    <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3>Address</h3>
                  <p>Mumbai, Maharashtra, India</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 6V12L16 14" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3>Working Hours</h3>
                  <p>Mon - Sun: 6:00 AM - 10:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={styles.formCard}>
            <h2 className={styles.cardTitle}>Send us a Message</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <Input
                label="Name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={!!isUserField}
                required
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={!!isUserField}
                required
              />

              <Input
                label="Subject"
                type="text"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                required
              />

              <Textarea
                label="Message"
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
