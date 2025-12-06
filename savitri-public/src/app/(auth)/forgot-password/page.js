/**
 * Forgot Password Page
 */

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import authService from "@/services/auth.service";
import useToast from "@/hooks/useToast";
import { validateEmail } from "@/utils/validators";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import styles from "./page.module.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.message);
      return;
    }

    setLoading(true);

    const { error: apiError } = await authService.forgotPassword({ email });

    if (apiError) {
      showError(apiError.message || "Failed to send reset code");
      setLoading(false);
      return;
    }

    success("Password reset code sent to your email");
    router.push(`/reset-password?email=${encodeURIComponent(email)}`);

    setLoading(false);
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Forgot Password?</h1>
          <p className={styles.authDescription}>
            Enter your email and we'll send you a code to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={handleChange}
            error={error}
            required
          />

          <Button type="submit" fullWidth loading={loading} disabled={loading}>
            Send Reset Code
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
