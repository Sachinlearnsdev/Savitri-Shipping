/**
 * Reset Password Page
 * FIXED: Correct API payload fields (password + confirmPassword)
 */

'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import authService from '@/services/auth.service';
import useToast from '@/hooks/useToast';
import { validateOTP, validatePassword, validateConfirmPassword } from '@/utils/validators';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import styles from './page.module.css';
import styles from '../shared-auth.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: showError } = useToast();

  const email = searchParams.get('email');

  const [formData, setFormData] = useState({
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      showError('Email parameter is missing');
      router.push('/forgot-password');
    }
  }, [email, router, showError]);

  const handleChange = (field) => (e) => {
    const value = field === 'otp' 
      ? e.target.value.replace(/\D/g, '').slice(0, 6)
      : e.target.value;
    
    setFormData({ ...formData, [field]: value });
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    const otpValidation = validateOTP(formData.otp);
    if (!otpValidation.valid) {
      newErrors.otp = otpValidation.message;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    const confirmValidation = validateConfirmPassword(
      formData.password, 
      formData.confirmPassword
    );
    if (!confirmValidation.valid) {
      newErrors.confirmPassword = confirmValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    // FIXED: Backend expects { email, otp, password, confirmPassword }
    const { data, error: apiError } = await authService.resetPassword({
      email,
      otp: formData.otp,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    if (apiError) {
      const errorMsg = apiError.message || apiError.error?.message || 'Failed to reset password';
      showError(errorMsg);
      setLoading(false);
      return;
    }

    success('Password reset successfully! Please login with your new password.');
    
    // Redirect to login after 1.5 seconds
    setTimeout(() => {
      router.push('/login');
    }, 1500);

    setLoading(false);
  };

  if (!email) {
    return null;
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.authIcon}>🔐</div>
          <h1 className={styles.authTitle}>Reset Password</h1>
          <p className={styles.authDescription}>
            Enter the OTP sent to <strong>{email}</strong>
            <br />
            and create a new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <Input
            label="OTP Code"
            type="text"
            placeholder="000000"
            value={formData.otp}
            onChange={handleChange('otp')}
            error={errors.otp}
            maxLength={6}
            required
            autoFocus
            hint="Check your email for the 6-digit code"
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange('password')}
            error={errors.password}
            hint="Min 8 characters, 1 uppercase, 1 number, 1 special character"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={errors.confirmPassword}
            required
          />

          <Button 
            type="submit" 
            fullWidth 
            loading={loading} 
            disabled={loading || formData.otp.length !== 6}
          >
            Reset Password
          </Button>
        </form>

        <div className={styles.authDivider}>
          <span>OR</span>
        </div>

        <div className={styles.authFooter}>
          <p>
            Remember your password? <Link href="/login">Login</Link>
          </p>
        </div>

        <div className={styles.homeLink}>
          <Link href="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}