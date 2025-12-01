import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../utils/validators';
import styles from './Login.module.css';

/**
 * Login Page
 * Admin login with email and password
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
    
    if (!validate()) return;
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Navigate to OTP verification with email in state
      navigate('/verify-otp', { state: { email: formData.email } });
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
            Continue
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