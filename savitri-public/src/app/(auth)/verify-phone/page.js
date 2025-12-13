/**
 * Verify Phone Page
 * FIXED: Uses correct resendOTP endpoint and toast destructuring
 */

"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import authService from "@/services/auth.service";
import useToast from "@/hooks/useToast";
import { validateOTP } from "@/utils/validators";
import { formatPhone } from "@/utils/formatters";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Loader from "@/components/common/Loader";
import styles from "./page.module.css";
import styles from "../shared-auth.module.css";

export default function VerifyPhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: showError, info } = useToast();

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    // Get phone from URL params
    const phoneParam = searchParams.get("phone");
    if (phoneParam) {
      setPhone(phoneParam);
    } else {
      // If no phone, redirect to account
      showError("Phone number not found");
      router.push("/account");
    }
  }, [searchParams, router, showError]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    const otpValidation = validateOTP(otp);
    if (!otpValidation.valid) {
      showError(otpValidation.message);
      return;
    }

    setVerifying(true);

    const { data, error } = await authService.verifyPhone({ phone, otp });

    if (error) {
      const errorMsg =
        error.message || error.error?.message || "Failed to verify phone";
      showError(errorMsg);
      setVerifying(false);
      return;
    }

    success("Phone verified successfully!");

    // Redirect to account after success
    setTimeout(() => {
      router.push("/account");
    }, 1000);
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setLoading(true);

    // FIXED: Use resendOTP with correct parameters
    const { data, error } = await authService.resendOTP({
      identifier: phone,
      type: "phone",
    });

    if (error) {
      const errorMsg =
        error.message || error.error?.message || "Failed to send OTP";
      showError(errorMsg);
    } else {
      info("OTP sent successfully!");
      setCountdown(60);
    }

    setLoading(false);
  };

  if (!phone) {
    return null;
  }

  return (
    <div className={styles.verifyPhonePage}>
      <div className={styles.container}>
        <Link href="/account" className={styles.backButton}>
          <span className={styles.backIcon}>←</span>
          Back to Profile
        </Link>

        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.icon}>📱</div>
            <h1 className={styles.title}>Verify Phone Number</h1>
            <p className={styles.subtitle}>
              We've sent a 6-digit OTP to <strong>{formatPhone(phone)}</strong>
            </p>
            <p className={styles.hint}>
              Note: Using master OTP <code>123456</code> in development
            </p>
          </div>

          <form onSubmit={handleVerify} className={styles.form}>
            <Input
              label="Enter OTP"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={handleOTPChange}
              maxLength={6}
              required
              autoFocus
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={verifying || otp.length !== 6}
              loading={verifying}
            >
              Verify Phone
            </Button>
          </form>

          <div className={styles.footer}>
            <p className={styles.resendText}>
              Didn't receive OTP?{" "}
              <button
                type="button"
                onClick={handleResend}
                className={styles.resendButton}
                disabled={countdown > 0 || loading}
              >
                {loading
                  ? "Sending..."
                  : countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend OTP"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {(loading || verifying) && <Loader />}
    </div>
  );
}
