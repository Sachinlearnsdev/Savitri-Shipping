/**
 * Reset Password Page
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import authService from "@/services/auth.service";
import useToast from "@/hooks/useToast";
import { validateOTP, validatePassword } from "@/utils/validators";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import styles from "./page.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: showError } = useToast();

  const email = searchParams.get("email");

  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      showError("Email parameter is missing");
      router.push("/forgot-password");
    }
  }, [email, router, showError]);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    const otpValidation = validateOTP(formData.otp);
    if (!otpValidation.valid) {
      newErrors.otp = otpValidation.message;
    }

    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.valid) {
      newErrors.newPassword = passwordValidation.message;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    const { error: apiError } = await authService.resetPassword({
      email,
      otp: formData.otp,
      newPassword: formData.newPassword,
    });

    if (apiError) {
      showError(apiError.message || "Failed to reset password");
      setLoading(false);
      return;
    }

    success(
      "Password reset successfully! Please login with your new password."
    );
    router.push("/login");

    setLoading(false);
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Reset Password</h1>
          <p className={styles.authDescription}>
            Enter the code sent to your email and create a new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <Input
            label="OTP Code"
            type="text"
            placeholder="000000"
            value={formData.otp}
            onChange={handleChange("otp")}
            error={errors.otp}
            maxLength={6}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Create a strong password"
            value={formData.newPassword}
            onChange={handleChange("newPassword")}
            error={errors.newPassword}
            hint="Min 8 characters, 1 uppercase, 1 number, 1 special character"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
            error={errors.confirmPassword}
            required
          />

          <Button type="submit" fullWidth loading={loading} disabled={loading}>
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
