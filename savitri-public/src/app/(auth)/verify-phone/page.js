/**
 * Verify Phone Page
 */

'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import authService from '@/services/auth.service';
import useToast from '@/hooks/useToast';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Loader from '@/components/common/Loader';
import styles from './page.module.css';

export default function VerifyPhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    // Get phone from URL params
    const phoneParam = searchParams.get('phone');
    if (phoneParam) {
      setPhone(phoneParam);
    } else {
      // If no phone, redirect to profile
      showToast('Phone number not found', 'error');
      router.push('/account');
    }
  }, [searchParams, router, showToast]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otp) {
      showToast('Please enter OTP', 'error');
      return;
    }

    if (otp.length !== 6) {
      showToast('OTP must be 6 digits', 'error');
      return;
    }

    setVerifying(true);

    try {
      await authService.verifyPhone({ phone, otp });
      showToast('Phone verified successfully!', 'success');
      
      // Redirect to profile after 1 second
      setTimeout(() => {
        router.push('/account');
      }, 1000);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to verify phone', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setCanResend(false);
    setResendTimer(60);

    try {
      await authService.sendPhoneOTP({ phone });
      showToast('OTP sent successfully!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to send OTP', 'error');
      setCanResend(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.verifyPhonePage}>
      <div className={styles.container}>
        <Link href="/account" className={styles.backButton}>
          <span className={styles.backIcon}>←</span>
          Back to Profile
        </Link>

        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.icon}>
              📱
            </div>
            <h1 className={styles.title}>Verify Phone Number</h1>
            <p className={styles.subtitle}>
              We've sent a 6-digit OTP to <strong>{phone}</strong>
            </p>
          </div>

          <form onSubmit={handleVerify} className={styles.form}>
            <Input
              label="Enter OTP"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
              autoFocus
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={verifying || otp.length !== 6}
            >
              {verifying ? 'Verifying...' : 'Verify Phone'}
            </Button>
          </form>

          <div className={styles.footer}>
            <p className={styles.resendText}>
              Didn't receive OTP?{' '}
              <button
                type="button"
                onClick={handleResend}
                className={`${styles.resendLink} ${!canResend ? styles.disabled : ''}`}
                disabled={!canResend || loading}
              >
                {loading ? (
                  'Sending...'
                ) : canResend ? (
                  'Resend OTP'
                ) : (
                  `Resend in ${resendTimer}s`
                )}
              </button>
            </p>
          </div>
        </div>
      </div>

      {(loading || verifying) && <Loader />}
    </div>
  );
}