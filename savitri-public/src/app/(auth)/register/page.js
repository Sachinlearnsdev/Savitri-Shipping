/**
 * Register Page
 * FIXED: Added confirmPassword to API call, template literals
 */

'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import { 
  validateEmail, 
  validatePassword, 
  validateConfirmPassword,
  validateName, 
  validatePhone 
} from '@/utils/validators';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Checkbox from '@/components/common/Checkbox';
import styles from '../login/page.module.css';
import styles from '../shared-auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth({ requireGuest: true });
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    const nameValidation = validateName(formData.name);
    if (!nameValidation.valid) {
      newErrors.name = nameValidation.message;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message;
    }

    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.valid) {
      newErrors.phone = phoneValidation.message;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    const confirmValidation = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (!confirmValidation.valid) {
      newErrors.confirmPassword = confirmValidation.message;
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    
    // Backend expects: { name, email, phone, password, confirmPassword }
    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.confirmPassword, // FIXED: Added this
    });
    
    if (result.success) {
      success('Registration successful! Please verify your email.');
      // Redirect to email verification page
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } else {
      showError(result.error || 'Registration failed');
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Create Account</h1>
          <p className={styles.authDescription}>
            Sign up to start booking
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange('name')}
            error={errors.name}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange('email')}
            error={errors.email}
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="9876543210"
            value={formData.phone}
            onChange={handleChange('phone')}
            error={errors.phone}
            hint="Indian mobile number (10 digits)"
            required
          />

          <Input
            label="Password"
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

          <Checkbox
            label={
              <>
                I agree to the{' '}
                <Link href="/terms" style={{ color: 'var(--color-primary)' }}>
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" style={{ color: 'var(--color-primary)' }}>
                  Privacy Policy
                </Link>
              </>
            }
            checked={formData.agreeToTerms}
            onChange={handleChange('agreeToTerms')}
            error={errors.agreeToTerms}
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Sign Up
          </Button>
        </form>

        <div className={styles.authDivider}>
          <span>OR</span>
        </div>

        <div className={styles.authFooter}>
          <p>
            Already have an account?{' '}
            <Link href="/login">Login</Link>
          </p>
        </div>

        <div className={styles.homeLink}>
          <Link href="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}