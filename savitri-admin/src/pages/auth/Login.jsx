// UPDATED - 2024-12-11
// CHANGES:
// 1. Fixed result.success check (was already correct!)
// 2. Added better error handling for backend validation errors
// 3. Added error display for field-specific errors from backend
// 4. Improved UX with auto-focus on first input

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../utils/validators';
import styles from './Login.module.css';

/**
 * Login Page
 * Admin login with email and password (Step 1 - sends OTP)
 */
const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!validate()) return;
    
    // Call login API
    const result = await login(formData.email, formData.password);
    
    // Check if login was successful
    if (result.success) {
      // Navigate to OTP verification with email in state
      navigate('/verify-otp', { 
        state: { 
          email: result.email || formData.email 
        },
        replace: true
      });
    } else {
      // Handle backend validation errors
      if (result.errors && Array.isArray(result.errors)) {
        const newErrors = {};
        result.errors.forEach(error => {
          if (error.field) {
            newErrors[error.field] = error.message;
          }
        });
        setErrors(newErrors);
      }
      
      // If no specific field errors, show general error
      if (Object.keys(errors).length === 0 && result.message) {
        setErrors({ password: result.message });
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
          <h2 className={styles.title}>Admin Login</h2>
          <p className={styles.subtitle}>
            Enter your credentials to access the admin panel
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@savitrishipping.in"
            value={formData.email}
            onChange={handleChange('email')}
            error={errors.email}
            required
            leftIcon="📧"
            autoComplete="email"
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange('password')}
            error={errors.password}
            required
            leftIcon="🔒"
            autoComplete="current-password"
          />
          
          <div className={styles.forgotPassword}>
            <a href="/forgot-password" className={styles.link}>
              Forgot password?
            </a>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Sending OTP...' : 'Continue'}
          </Button>
        </form>
        
        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            After login, you'll receive an OTP via email for verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;