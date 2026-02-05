import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import { validatePassword } from '../../utils/validators';
import useUIStore from '../../store/uiStore';
import styles from './Login.module.css';

/**
 * Reset Password Page
 * Admin can reset password with OTP
 */
const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword, forgotPassword, isLoading } = useAuth();
  const { showSuccess } = useUIStore();

  const email = location.state?.email;

  const [formData, setFormData] = useState({
    otp: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Redirect to forgot-password if no email
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Validate OTP
    if (!formData.otp || formData.otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!validate()) return;

    // Call resetPassword API
    const result = await resetPassword(
      email,
      formData.otp,
      formData.password,
      formData.confirmPassword
    );

    // Check if reset was successful
    if (result.success) {
      showSuccess('Password reset successfully. Please login with your new password.');
      // Navigate to login
      navigate('/login', { replace: true });
    } else {
      // Handle errors
      if (result.errors && Array.isArray(result.errors)) {
        const newErrors = {};
        result.errors.forEach(error => {
          if (error.field) {
            newErrors[error.field] = error.message;
          }
        });
        setErrors(newErrors);
      } else if (result.message) {
        setErrors({ otp: result.message });
      }
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || resending) return;

    try {
      setResending(true);

      // Call forgotPassword API again to resend OTP
      const result = await forgotPassword(email);

      if (result.success) {
        showSuccess('OTP resent successfully');
        setCountdown(60); // 60 seconds cooldown
        setFormData(prev => ({ ...prev, otp: '' })); // Clear OTP field
        setErrors({});
      }
    } catch (err) {
      setErrors({ otp: 'Failed to resend OTP. Please try again.' });
    } finally {
      setResending(false);
    }
  };

  // Don't render if no email (will redirect)
  if (!email) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🔐</span>
          <h1 className={styles.logoText}>Savitri Shipping</h1>
        </div>

        {/* Title */}
        <div className={styles.header}>
          <h2 className={styles.title}>Reset Password</h2>
          <p className={styles.subtitle}>
            OTP sent to: <strong>{email}</strong>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="OTP Code"
            type="text"
            placeholder="000000"
            value={formData.otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setFormData(prev => ({ ...prev, otp: value }));
              if (errors.otp) {
                setErrors(prev => ({ ...prev, otp: '' }));
              }
            }}
            error={errors.otp}
            required
            maxLength={6}
            leftIcon="🔢"
            autoFocus
            autoComplete="one-time-code"
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={formData.password}
            onChange={handleChange('password')}
            error={errors.password}
            required
            leftIcon="🔒"
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={errors.confirmPassword}
            required
            leftIcon="🔒"
            autoComplete="new-password"
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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <a href="/login" className={styles.link}>
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
