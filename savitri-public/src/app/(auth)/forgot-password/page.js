/**
 * Forgot Password Page
 * Step 1: Request OTP to email
 */

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import authService from '@/services/auth.service';
import useToast from '@/hooks/useToast';
import { validateEmail } from '@/utils/validators';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import styles from './page.module.css';
import styles from '../shared-auth.module.css';


export default function ForgotPasswordPage() {
  const router = useRouter();
  const { success, error: showError, info } = useToast();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const validate = () => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.message);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    const { data, error: apiError } = await authService.forgotPassword({ email });

    if (apiError) {
      const errorMsg = apiError.message || apiError.error?.message || 'Failed to send OTP';
      showError(errorMsg);
      setLoading(false);
      return;
    }

    success('Password reset OTP sent to your email!');
    setOtpSent(true);

    // Redirect to reset password page after 1 second
    setTimeout(() => {
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    }, 1000);

    setLoading(false);
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.authIcon}>🔑</div>
          <h1 className={styles.authTitle}>Forgot Password?</h1>
          <p className={styles.authDescription}>
            {otpSent 
              ? 'OTP sent! Redirecting...'
              : 'Enter your email and we\'ll send you a code to reset your password'
            }
          </p>
        </div>

        {!otpSent && (
          <form onSubmit={handleSubmit} className={styles.authForm}>
            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={handleChange}
              error={error}
              required
              autoFocus
              hint="Enter the email you used to register"
            />

            <Button 
              type="submit" 
              fullWidth 
              loading={loading} 
              disabled={loading}
            >
              Send Reset Code
            </Button>
          </form>
        )}

        {otpSent && (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✓</div>
            <p>Check your email for the reset code</p>
          </div>
        )}

        <div className={styles.authDivider}>
          <span>OR</span>
        </div>

        <div className={styles.authFooter}>
          <p>
            Remember your password? <Link href="/login">Login</Link>
          </p>
          <p style={{ marginTop: 'var(--spacing-2)' }}>
            Don't have an account? <Link href="/register">Sign Up</Link>
          </p>
        </div>

        <div className={styles.homeLink}>
          <Link href="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}