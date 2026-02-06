'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { useAuth } from '@/hooks/useAuth';
import { validateOTP, validatePassword } from '@/utils/validators';
import styles from './reset-password.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { resetPassword, forgotPassword } = useAuth();

  const [formData, setFormData] = useState({
    otp: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!email) {
      router.push('/forgot-password');
    }
  }, [email, router]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!validateOTP(formData.otp)) {
      newErrors.otp = 'Please enter a valid 6-digit OTP';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = 'Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      await resetPassword({
        email,
        otp: formData.otp,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      router.push('/login');
    } catch (error) {
      setErrors({ otp: 'Invalid or expired OTP. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || resending) return;

    try {
      setResending(true);
      await forgotPassword(email);
      setCountdown(60);
      setFormData((prev) => ({ ...prev, otp: '' }));
      setErrors({});
    } catch (err) {
      setErrors({ otp: 'Failed to resend OTP. Please try again.' });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.resetPasswordPage}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>🔑</div>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>
            Enter the OTP sent to <strong>{email}</strong>
            <br />
            and create a new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="OTP Code"
            type="text"
            placeholder="123456"
            value={formData.otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              handleChange('otp', value);
            }}
            error={errors.otp}
            maxLength={6}
            autoFocus
            required
          />

          {/* Resend OTP */}
          <div className={styles.resendContainer}>
            {countdown > 0 ? (
              <p className={styles.resendText}>
                Resend OTP in {countdown}s
              </p>
            ) : (
              <button
                type="button"
                className={styles.resendButton}
                onClick={handleResendOTP}
                disabled={resending}
              >
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Reset Password
          </Button>
        </form>

        <div className={styles.footer}>
          <Link href="/login" className={styles.backLink}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
