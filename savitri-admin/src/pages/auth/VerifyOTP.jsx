// UPDATED - 2024-12-11
// CHANGES:
// 1. Added useEffect to handle redirect if no email
// 2. Added OTP resend functionality
// 3. Added countdown timer for resend
// 4. Improved error handling
// 5. Added auto-focus on OTP input

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import { adminLogin } from '../../services/auth.service';
import useUIStore from '../../store/uiStore';
import styles from './Login.module.css';

/**
 * Verify OTP Page
 * Second step of admin login - verify OTP sent to email
 */
const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP, isLoading } = useAuth();
  const { showSuccess, showError } = useUIStore();
  
  const email = location.state?.email;
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Redirect to login if no email
  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);
  
  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate OTP
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    // Call verify OTP API
    const result = await verifyOTP(email, otp);
    
    // Show error if verification failed
    if (!result.success) {
      setError(result.message || 'Invalid OTP. Please try again.');
    }
    // Success case is handled in useAuth hook (redirects to dashboard)
  };
  
  const handleResendOTP = async () => {
    if (countdown > 0 || resending) return;
    
    try {
      setResending(true);
      
      // Extract password from location state if available
      const password = location.state?.password;
      
      if (!password) {
        showError('Session expired. Please login again.');
        navigate('/login', { replace: true });
        return;
      }
      
      // Call login API again to resend OTP
      const result = await adminLogin(email, password);
      
      if (result.success) {
        showSuccess('OTP resent successfully');
        setCountdown(60); // 60 seconds cooldown
        setOtp(''); // Clear OTP field
        setError('');
      } else {
        showError(result.message || 'Failed to resend OTP');
      }
    } catch (err) {
      showError('Failed to resend OTP. Please try again.');
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
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🔐</span>
        </div>
        
        <div className={styles.header}>
          <h2 className={styles.title}>Verify OTP</h2>
          <p className={styles.subtitle}>
            Enter the 6-digit code sent to<br />
            <strong>{email}</strong>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="OTP Code"
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
              setError('');
            }}
            error={error}
            required
            maxLength={6}
            leftIcon="🔢"
            autoFocus
            autoComplete="one-time-code"
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
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify & Login'}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={() => navigate('/login')}
            disabled={isLoading}
          >
            Back to Login
          </Button>
        </form>
        
        {/* Help Text */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Didn't receive the code? Check your spam folder or click "Resend OTP"
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;