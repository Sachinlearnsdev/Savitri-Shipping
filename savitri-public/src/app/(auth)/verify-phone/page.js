'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useAuth } from '@/hooks/useAuth';
import { validateOTP } from '@/utils/validators';
import { MASTER_OTP } from '@/utils/constants';
import { formatPhone } from '@/utils/formatters';
import styles from './verify-phone.module.css';

export default function VerifyPhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');
  const type = searchParams.get('type'); // 'register' or 'login'
  const redirect = searchParams.get('redirect') || '/';
  const { verifyPhone, loginWithPhoneVerifyOTP } = useAuth();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!phone) {
      router.push('/login');
    }
  }, [phone, router]);

  const handleOtpChange = (value) => {
    setOtp(value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateOTP(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    // Master OTP bypass for phone (SMS not configured)
    if (otp === MASTER_OTP) {
      try {
        setLoading(true);
        
        if (type === 'login') {
          // Phone login - redirect handled in hook
          await loginWithPhoneVerifyOTP(phone, otp, redirect);
        } else {
          // Phone verification after registration
          await verifyPhone(phone, otp);
          router.push('/login');
        }
      } catch (error) {
        setError('Verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Invalid OTP. Use master OTP: 123456');
    }
  };

  return (
    <div className={styles.verifyPhonePage}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>
          <h1 className={styles.title}>Verify Your Phone</h1>
          <p className={styles.subtitle}>
            Enter the OTP sent to
            <br />
            <strong>{formatPhone(phone)}</strong>
          </p>
        </div>

        <div className={styles.masterOtpNote}>
          <p>
            <strong>Note:</strong> SMS is not configured yet. Use master OTP: <strong>123456</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Enter OTP"
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => handleOtpChange(e.target.value)}
            error={error}
            maxLength={6}
            autoFocus
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Verify Phone
          </Button>
        </form>
      </div>
    </div>
  );
}