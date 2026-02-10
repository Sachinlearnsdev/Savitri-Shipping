"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { useAuth } from "@/hooks/useAuth";
import { validateEmail, validatePhone } from "@/utils/validators";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { loginWithEmail, loginWithPhoneSendOTP } = useAuth();

  const [loginMethod, setLoginMethod] = useState("email");

  const [emailData, setEmailData] = useState({
    email: "",
    password: "",
  });

  const [phoneData, setPhoneData] = useState({
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (field, value) => {
    setEmailData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePhoneChange = (value) => {
    setPhoneData({ phone: value });
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const validateEmailLogin = () => {
    const newErrors = {};

    if (!validateEmail(emailData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!emailData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePhoneLogin = () => {
    const newErrors = {};

    if (!validatePhone(phoneData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmailLogin()) return;

    try {
      setLoading(true);
      console.log("📝 Login Page: Submitting email login", {
        email: emailData.email,
        redirect,
      });

      // The redirect happens inside the hook now
      await loginWithEmail(emailData.email, emailData.password, redirect);

      // No need for router.push here - it's handled in the hook with window.location.href
      console.log("✅ Login Page: Login function completed");
    } catch (error) {
      console.error("❌ Login Page: Login failed", error);
      // Error is already shown by the hook
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();

    if (!validatePhoneLogin()) return;

    try {
      setLoading(true);
      await loginWithPhoneSendOTP(phoneData.phone);
      // Manually navigate to verify page with redirect param
      router.push(
        `/verify-phone?phone=${encodeURIComponent(
          phoneData.phone
        )}&type=login&redirect=${encodeURIComponent(redirect)}`
      );
    } catch (error) {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>
            Enter your email and password to access your account
          </p>
        </div>

        {/* Login Method Tabs */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${
              loginMethod === "email" ? styles.active : ""
            }`}
            onClick={() => setLoginMethod("email")}
          >
            Email + Password
          </button>
          <button
            type="button"
            className={`${styles.tab} ${
              loginMethod === "phone" ? styles.active : ""
            }`}
            onClick={() => setLoginMethod("phone")}
          >
            Phone + OTP
          </button>
        </div>

        {/* Email Login Form */}
        {loginMethod === "email" && (
          <form onSubmit={handleEmailSubmit} className={styles.form}>
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={emailData.email}
              onChange={(e) => handleEmailChange("email", e.target.value)}
              error={errors.email}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={emailData.password}
              onChange={(e) => handleEmailChange("password", e.target.value)}
              error={errors.password}
              required
            />

            <Link href="/forgot-password" className={styles.forgotLink}>
              Forgot password?
            </Link>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        )}

        {/* Phone Login Form */}
        {loginMethod === "phone" && (
          <form onSubmit={handlePhoneSubmit} className={styles.form}>
            <Input
              label="Phone Number"
              type="tel"
              placeholder="9876543210"
              value={phoneData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              error={errors.phone}
              hint="10-digit Indian mobile number"
              required
            />

            <div className={styles.otpInfo}>
              <p>We'll send you an OTP to verify your number</p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Send OTP
            </Button>
          </form>
        )}

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Don't have an account?{" "}
            <Link href="/register" className={styles.link}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
