"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/utils/helpers";

/**
 * useAuth Hook
 * Provides authentication methods and state
 */
export const useAuth = () => {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    setUser,
    login,
    logout,
    updateUser,
    setLoading,
  } = useAuthStore();
  const { showSuccess, showError } = useUIStore();

  /**
   * Register new user
   * @param {object} data - Registration data
   * @returns {Promise}
   */
  const register = async (data) => {
    try {
      setLoading(true);
      const response = await authService.register(data);
      showSuccess(
        response.message || "Registration successful! Please verify your email."
      );
      return response;
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login with email and password
   * @param {string} email - Email address
   * @param {string} password - Password
   * @param {string} redirectTo - Redirect path after login
   * @returns {Promise}
   */
  const loginWithEmail = async (
    email,
    password,
    redirectTo = "/account/dashboard"
  ) => {
    try {
      console.log('🔐 useAuth: Starting email login', { email, redirectTo });
      setLoading(true);
      
      const response = await authService.login(email, password);
      console.log('📨 useAuth: Login response received', response);

      if (response.data?.token && response.data?.customer) {
        // CRITICAL: Await login to ensure cookie is written
        await login(response.data.customer, response.data.token);
        
        console.log('✅ useAuth: User logged in, cookie written');
        console.log('🔄 useAuth: Redirecting to:', redirectTo);
        
        showSuccess("Login successful! Redirecting...");

        // Use window.location.assign for full page reload
        // This ensures middleware sees the new cookie
        window.location.assign(redirectTo);
        
        return response;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ useAuth: Login error', error);
      const message = getErrorMessage(error);
      showError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login with phone - Step 1 (send OTP)
   * @param {string} phone - Phone number
   * @returns {Promise}
   */
  const loginWithPhoneSendOTP = async (phone) => {
    try {
      setLoading(true);
      const response = await authService.loginPhone(phone);
      showSuccess(response.message || "OTP sent to your phone");
      return response;
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login with phone - Step 2 (verify OTP)
   * @param {string} phone - Phone number
   * @param {string} otp - OTP code
   * @param {string} redirectTo - Redirect path after login
   * @returns {Promise}
   */
  const loginWithPhoneVerifyOTP = async (
    phone,
    otp,
    redirectTo = "/account/dashboard"
  ) => {
    try {
      console.log('🔐 useAuth: Verifying phone OTP', { phone, redirectTo });
      setLoading(true);
      
      const response = await authService.verifyLoginOTP(phone, otp);
      console.log('📨 useAuth: OTP verification response', response);

      if (response.data?.token && response.data?.customer) {
        await login(response.data.customer, response.data.token);
        
        console.log('✅ useAuth: Phone login successful, cookie written');
        showSuccess("Login successful! Redirecting...");

        window.location.assign(redirectTo);
        
        return response;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ useAuth: Phone OTP error', error);
      const message = getErrorMessage(error);
      showError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout
   * @returns {Promise}
   */
  const handleLogout = async () => {
    try {
      console.log('🚪 useAuth: Starting logout');
      setLoading(true);
      
      await authService.logout();
      logout();
      
      console.log('✅ useAuth: Logout successful');
      showSuccess("Logged out successfully");

      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (error) {
      console.error('❌ useAuth: Logout error', error);
      // Logout locally even if API fails
      logout();
      const message = getErrorMessage(error);
      showError(message);

      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify email with OTP
   * @param {string} email - Email address
   * @param {string} otp - OTP code
   * @returns {Promise}
   */
  const verifyEmail = async (email, otp) => {
    try {
      setLoading(true);
      const response = await authService.verifyEmail(email, otp);
      showSuccess(response.message || "Email verified successfully!");
      return response;
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify phone with OTP
   * @param {string} phone - Phone number
   * @param {string} otp - OTP code
   * @returns {Promise}
   */
  const verifyPhone = async (phone, otp) => {
    try {
      setLoading(true);
      const response = await authService.verifyPhone(phone, otp);
      showSuccess(response.message || "Phone verified successfully!");
      return response;
    } catch (error) {
      const message = getErrorMessage(error);
      showError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Forgot password - Send reset OTP
   * @param {string} email - Email address
   * @returns {Promise}
   */
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await authService.forgotPassword(email);
      showSuccess(response.message || "Password reset OTP sent to your email");
      return response;
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password with OTP
   * @param {object} data - Reset data
   * @returns {Promise}
   */
  const resetPassword = async (data) => {
    try {
      setLoading(true);
      const response = await authService.resetPassword(data);
      showSuccess(response.message || "Password reset successfully!");
      return response;
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP
   * @param {string} identifier - Email or phone
   * @param {string} type - OTP type
   * @returns {Promise}
   */
  const resendOTP = async (identifier, type) => {
    try {
      setLoading(true);
      const response = await authService.resendOTP(identifier, type);
      showSuccess(response.message || "OTP sent successfully");
      return response;
    } catch (error) {
      const message = getErrorMessage(error);
      showError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    user,
    isAuthenticated,

    // Methods
    register,
    loginWithEmail,
    loginWithPhoneSendOTP,
    loginWithPhoneVerifyOTP,
    logout: handleLogout,
    verifyEmail,
    verifyPhone,
    forgotPassword,
    resetPassword,
    resendOTP,
    updateUser,
  };
};

export default useAuth;