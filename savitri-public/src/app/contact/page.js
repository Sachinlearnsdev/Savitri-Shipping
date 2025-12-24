'use client';

import React, { useState } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import styles from './contact.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Contact form submission will be implemented in Phase 2');
  };

  return (
    <div className={styles.contactPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.subtitle}>
          Have questions? We'd love to hear from you.
        </p>

        <div className={styles.contentGrid}>
          {/* Contact Info */}
          <div className={styles.infoCard}>
            <h2>Get in Touch</h2>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📧</span>
                <div>
                  <h3>Email</h3>
                  <p>info@savitrishipping.in</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📞</span>
                <div>
                  <h3>Phone</h3>
                  <p>+91 98765 43210</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>📍</span>
                <div>
                  <h3>Address</h3>
                  <p>Mumbai, Maharashtra, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={styles.formCard}>
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <Input
                label="Name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
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