import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import { validateEmail } from '../../utils/validators';
import styles from './Login.module.css';

/**
 * Forgot Password Page
 * Admin can request password reset OTP
 */
const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setEmail(e.target.value);
    // Clear error when user types
    if (errors.email) {
      setErrors({});
    }
  };

  const validate = () => {
    const newErrors = {};

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!validate()) return;

    // Call forgotPassword API
    const result = await forgotPassword(email);

    // Check if request was successful
    if (result.success) {
      // Navigate to reset password with email in state
      navigate('/reset-password', {
        state: { email },
        replace: true
      });
    } else {
      // Handle errors
      if (result.message) {
        setErrors({ email: result.message });
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⛴️</span>
          <h1 className={styles.logoText}>Savitri Shipping</h1>
        </div>

        {/* Title */}
        <div className={styles.header}>
          <h2 className={styles.title}>Forgot Password</h2>
          <p className={styles.subtitle}>
            Enter your email to receive a password reset OTP
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@savitrishipping.in"
            value={email}
            onChange={handleChange}
            error={errors.email}
            required
            leftIcon="📧"
            autoComplete="email"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
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

export default ForgotPassword;
