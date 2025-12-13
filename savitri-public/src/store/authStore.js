/**
 * Authentication Store (Zustand)
 * HYBRID APPROACH: Uses both localStorage and HTTP-only cookies
 * - localStorage: User data for quick access & offline state
 * - HTTP-only Cookie: Actual JWT token (set by backend)
 * 
 * This provides the best of both worlds:
 * 1. Fast initial render with cached user data
 * 2. Secure token storage in HTTP-only cookie
 * 3. Graceful fallback if cookie expires
 */

'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '@/services/auth.service';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ==================== STATE ====================
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ==================== ACTIONS ====================

      /**
       * Set user (token is in HTTP-only cookie, we only store user data)
       */
      setAuth: (user) => {
        set({
          user,
          isAuthenticated: true,
          error: null,
        });
      },

      /**
       * Clear auth state
       */
      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      /**
       * Set loading state
       */
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      /**
       * Set error
       */
      setError: (error) => {
        set({ error });
      },

      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Update user data
       */
      updateUser: (userData) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...userData };
        set({ user: updatedUser });
      },

      /**
       * Login with email and password
       * Backend returns token in HTTP-only cookie + user data
       */
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        const { data, error } = await authService.login({ email, password });
        
        if (error) {
          const errorMessage = error.message || error.error?.message || 'Login failed';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          return { success: false, error: errorMessage };
        }

        // Backend returns: { success, message, data: { token, customer } }
        // Token is also set in HTTP-only cookie automatically
        const customer = data.data?.customer || data.customer;
        
        if (customer) {
          get().setAuth(customer);
          set({ isLoading: false });
          return { success: true, user: customer };
        } else {
          const errorMessage = 'Invalid response from server';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      /**
       * Login with phone - Step 1: Request OTP
       */
      loginWithPhone: async (phone) => {
        set({ isLoading: true, error: null });
        
        const { data, error } = await authService.loginWithPhone({ phone });
        
        if (error) {
          const errorMessage = error.message || error.error?.message || 'Failed to send OTP';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          return { success: false, error: errorMessage };
        }

        set({ isLoading: false });
        return { success: true, data };
      },

      /**
       * Login with phone - Step 2: Verify OTP
       */
      verifyPhoneLogin: async (phone, otp) => {
        set({ isLoading: true, error: null });
        
        const { data, error } = await authService.verifyPhoneLoginOTP({ phone, otp });
        
        if (error) {
          const errorMessage = error.message || error.error?.message || 'OTP verification failed';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          return { success: false, error: errorMessage };
        }

        // Backend returns: { success, message, data: { token, customer } }
        const customer = data.data?.customer || data.customer;
        
        if (customer) {
          get().setAuth(customer);
          set({ isLoading: false });
          return { success: true, user: customer };
        } else {
          const errorMessage = 'Invalid response from server';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      /**
       * Register new customer
       */
      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        const { data, error } = await authService.register(userData);
        
        if (error) {
          const errorMessage = error.message || error.error?.message || 'Registration failed';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          return { success: false, error: errorMessage };
        }

        set({ isLoading: false });
        return { success: true, data };
      },

      /**
       * Verify email with OTP
       */
      verifyEmail: async (email, otp) => {
        set({ isLoading: true, error: null });
        
        const { data, error } = await authService.verifyEmail({ email, otp });
        
        if (error) {
          const errorMessage = error.message || error.error?.message || 'Email verification failed';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          return { success: false, error: errorMessage };
        }

        set({ isLoading: false });
        return { success: true, data };
      },

      /**
       * Verify phone with OTP
       */
      verifyPhone: async (phone, otp) => {
        set({ isLoading: true, error: null });
        
        const { data, error } = await authService.verifyPhone({ phone, otp });
        
        if (error) {
          const errorMessage = error.message || error.error?.message || 'Phone verification failed';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          return { success: false, error: errorMessage };
        }

        set({ isLoading: false });
        return { success: true, data };
      },

      /**
       * Resend OTP
       */
      resendOTP: async (identifier, type) => {
        set({ isLoading: true, error: null });
        
        const { data, error } = await authService.resendOTP({ identifier, type });
        
        if (error) {
          const errorMessage = error.message || error.error?.message || 'Failed to resend OTP';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
          return { success: false, error: errorMessage };
        }

        set({ isLoading: false });
        return { success: true, data };
      },

      /**
       * Logout
       * Clears HTTP-only cookie on backend + clears local state
       */
      logout: async () => {
        set({ isLoading: true });
        
        // Call backend to clear cookie
        await authService.logout();
        
        // Clear local state
        get().clearAuth();
        
        set({ isLoading: false });
        
        // Redirect to home
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      },

      /**
       * Check authentication status
       * Verifies with backend using HTTP-only cookie
       * This is the "sync" mechanism between localStorage and cookie
       */
      checkAuth: async () => {
        // Don't check if already loading
        if (get().isLoading) return get().isAuthenticated;
        
        set({ isLoading: true });
        
        const { data, error } = await authService.getCurrentUser();
        
        if (error) {
          // Cookie expired or invalid - clear local state
          get().clearAuth();
          set({ isLoading: false });
          return false;
        }

        // Cookie is valid - update/sync user data
        const userData = data.data || data;
        get().setAuth(userData);
        set({ isLoading: false });
        return true;
      },

      /**
       * Initialize auth on app load
       * HYBRID APPROACH:
       * 1. Check localStorage for cached user (fast initial render)
       * 2. Verify with backend using cookie (security check)
       * 3. Sync if needed
       */
      initAuth: async () => {
        // Step 1: Quick check - if we have user in localStorage, set it immediately
        const storedUser = get().user;
        if (storedUser) {
          set({ isAuthenticated: true });
        }
        
        // Step 2: Verify with backend (cookie-based auth)
        // This will sync the state if cookie is still valid
        await get().checkAuth();
      },

      /**
       * Refresh token (if backend supports it)
       */
      refreshToken: async () => {
        const { data, error } = await authService.refreshToken();
        
        if (error) {
          get().clearAuth();
          return false;
        }
        
        // Token is refreshed in cookie automatically
        // Just verify we're still authenticated
        return await get().checkAuth();
      },
    }),
    {
      name: 'auth-storage',
      // Only persist user data, NOT token (token is in HTTP-only cookie)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;