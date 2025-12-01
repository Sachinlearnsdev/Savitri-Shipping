import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import styles from './Login.module.css';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP, isLoading } = useAuth();
  const email = location.state?.email;
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  
  if (!email) {
    navigate('/login');
    return null;
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    const result = await verifyOTP(email, otp);
    
    if (!result.success) {
      setError(result.message || 'Invalid OTP. Please try again.');
    }
  };
  
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
          />
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            Verify & Login
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;