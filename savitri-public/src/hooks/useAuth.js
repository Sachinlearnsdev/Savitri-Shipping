/**
 * useAuth Hook
 * Custom hook for authentication
 */

'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';

const useAuth = (options = {}) => {
  const {
    requireAuth = false,
    requireGuest = false,
    redirectTo = null,
  } = options;

  const router = useRouter();
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    setAuth,
    clearAuth,
    setLoading,
    setError,
    clearError,
    updateUser,
    login,
    verifyLoginOTP,
    register,
    logout,
    checkAuth,
    refreshToken,
    initAuth,
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Handle required authentication
  useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [requireAuth, isAuthenticated, isLoading, router]);

  // Handle guest-only pages
  useEffect(() => {
    if (requireGuest && !isLoading && isAuthenticated) {
      router.push(redirectTo || '/account');
    }
  }, [requireGuest, isAuthenticated, isLoading, router, redirectTo]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    setAuth,
    clearAuth,
    setLoading,
    setError,
    clearError,
    updateUser,
    login,
    verifyLoginOTP,
    register,
    logout,
    checkAuth,
    refreshToken,

    // Utilities
    isAdmin: user?.role === 'ADMIN',
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
    userPhone: user?.phone,
    userAvatar: user?.avatar,
    emailVerified: user?.emailVerified,
    phoneVerified: user?.phoneVerified,
  };
};

export default useAuth;