/**
 * Verify Email Page
 */

'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import authService from '@/services/auth.service';
import useToast from '@/hooks/useToast';
import { validateOTP } from '@/utils/validators';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import styles from '../login/page.module.css';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: showError, info } = useToast();

  const email = searchParams.get('email');

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) {
      showError('Email parameter is missing');
      router.push('/register');
    }
  }, [email, router, showError]);

  const handleChange = (e) => {
    setOtp(e.target.value);
    if (error) setError('');
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    const otpValidation = validateOTP(otp);
    if (!otpValidation.valid) {
      setError(otpValidation.message);
      return;
    }

    setLoading(true);

    const { data, error: apiError } = await authService.verifyEmail({
      email,
      otp,
    });

    if (apiError) {
      showError(apiError.message || 'Verification failed');
      setLoading(false);
      return;
    }

    success('Email verified successfully!');
    
    // Check if phone verification is also required
    if (data.phoneVerificationRequired) {
      router.push(`/verify-phone?email=${encodeURIComponent(email)}`);
    } else {
      router.push('/login');
    }

    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);

    const { error: apiError } = await authService.resendEmailOTP({ email });

    if (apiError) {
      showError(apiError.message || 'Failed to resend OTP');
    } else {
      info('OTP has been resent to your email');
    }

    setResending(false);
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Verify Your Email</h1>
          <p className={styles.authDescription}>
            We've sent a 6-digit code to<br />
            <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerify} className={styles.authForm}>
          <Input
            label="Enter OTP"
            type="text"
            placeholder="000000"
            value={otp}
            onChange={handleChange}
            error={error}
            maxLength={6}
            required
            hint="Check your email inbox and spam folder"
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Verify Email
          </Button>
        </form>

        <div className={styles.authDivider}>
          <span>OR</span>
        </div>

        <div className={styles.authFooter}>
          <p>
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontWeight: 'var(--font-weight-semibold)',
                cursor: resending ? 'not-allowed' : 'pointer',
                opacity: resending ? 0.6 : 1,
              }}
            >
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
          </p>
        </div>

        <div className={styles.homeLink}>
          <Link href="/login">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}