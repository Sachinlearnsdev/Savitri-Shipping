/**
 * Login Page
 * FIXED: Template literals, removed OTP flow (not in current backend API)
 */

'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import { validateEmail, validatePassword } from '@/utils/validators';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import styles from './page.module.css';
import styles from '../shared-auth.module.css';


export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth({ requireGuest: true });
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      success('Login successful!');
      
      // Redirect to intended page or account dashboard
      const redirect = searchParams.get('redirect') || '/account';
      router.push(redirect);
    } else {
      showError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Welcome Back</h1>
          <p className={styles.authDescription}>
            Login to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
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
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange('password')}
            error={errors.password}
            required
          />

          <div className={styles.formFooter}>
            <Link href="/forgot-password" className={styles.forgotLink}>
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Login
          </Button>
        </form>

        <div className={styles.authDivider}>
          <span>OR</span>
        </div>

        <div className={styles.alternativeLogin}>
          <Link href="/login-phone">
            <Button variant="outline" fullWidth>
              Login with Phone OTP
            </Button>
          </Link>
        </div>

        <div className={styles.authFooter}>
          <p>
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