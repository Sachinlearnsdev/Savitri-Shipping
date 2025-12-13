/**
 * Phone Login Page
 * Two-step process: Request OTP → Verify OTP
 */

'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import { validatePhone, validateOTP } from '@/utils/validators';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import styles from '../login/page.module.css';
import styles from '../shared-auth.module.css';

export default function PhoneLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithPhone, verifyPhoneLogin } = useAuth({ requireGuest: true });
  const { success, error: showError } = useToast();

  const [step, setStep] = useState(1); // 1 = Enter phone, 2 = Enter OTP
  const [phone, setPhone] = useState('');
  const [otp, setOTP] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend OTP
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    if (errors.phone) {
      setErrors({ ...errors, phone: '' });
    }
  };

  const handleOTPChange = (e) => {
    setOTP(e.target.value);
    if (errors.otp) {
      setErrors({ ...errors, otp: '' });
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      setErrors({ phone: phoneValidation.message });
      return;
    }

    setLoading(true);

    const result = await loginWithPhone(phone);

    if (result.success) {
      success('OTP sent to your phone');
      setStep(2);
      startCountdown();
    } else {
      showError(result.error || 'Failed to send OTP');
    }

    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    const otpValidation = validateOTP(otp);
    if (!otpValidation.valid) {
      setErrors({ otp: otpValidation.message });
      return;
    }

    setLoading(true);

    const result = await verifyPhoneLogin(phone, otp);

    if (result.success) {
      success('Login successful!');
      const redirect = searchParams.get('redirect') || '/account';
      router.push(redirect);
    } else {
      showError(result.error || 'Invalid OTP');
    }

    setLoading(false);
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setLoading(true);

    const result = await loginWithPhone(phone);

    if (result.success) {
      success('OTP resent to your phone');
      startCountdown();
    } else {
      showError(result.error || 'Failed to resend OTP');
    }

    setLoading(false);
  };

  const handleBack = () => {
    setStep(1);
    setOTP('');
    setErrors({});
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>
            {step === 1 ? 'Phone Login' : 'Verify OTP'}
          </h1>
          <p className={styles.authDescription}>
            {step === 1 
              ? 'Enter your phone number to receive OTP' 
              : `OTP sent to +91 ${phone.slice(0, 5)} ${phone.slice(5)}`
            }
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className={styles.authForm}>
            <Input
              label="Phone Number"
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={handlePhoneChange}
              error={errors.phone}
              hint="Indian mobile number (10 digits)"
              required
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Send OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className={styles.authForm}>
            <Input
              label="Enter OTP"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={handleOTPChange}
              error={errors.otp}
              hint="6-digit OTP sent to your phone"
              maxLength={6}
              required
            />

            <div className={styles.otpActions}>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || loading}
                className={styles.resendButton}
              >
                {countdown > 0 
                  ? `Resend OTP in ${countdown}s` 
                  : 'Resend OTP'
                }
              </button>

              <button
                type="button"
                onClick={handleBack}
                className={styles.backButton}
              >
                Change Number
              </button>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Verify & Login
            </Button>
          </form>
        )}

        <div className={styles.authDivider}>
          <span>OR</span>
        </div>

        <div className={styles.authFooter}>
          <p>
            <Link href="/login">Login with Email & Password</Link>
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            Don't have an account?{' '}
            <Link href="/register">Sign Up</Link>
          </p>
        </div>

        <div className={styles.homeLink}>
          <Link href="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}