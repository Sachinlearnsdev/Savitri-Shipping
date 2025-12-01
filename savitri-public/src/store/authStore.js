/**
 * Authentication Store (Zustand)
 * Global state management for authentication
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
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ==================== ACTIONS ====================

      /**
       * Set user and token
       */
      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
        });

        // Store token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('customerToken', token);
          localStorage.setItem('customerUser', JSON.stringify(user));
        }
      },

      /**
       * Clear auth state
       */
      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });

        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('customerToken');
          localStorage.removeItem('customerUser');
        }
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

        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('customerUser', JSON.stringify(updatedUser));
        }
      },

      /**
       * Login
       */
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        const { data, error } = await authService.login({ email, password });

        if (error) {
          set({ isLoading: false, error: error.message || 'Login failed' });
          return { success: false, error };
        }

        // If 2FA required, return needsOTP flag
        if (data.needsOTP) {
          set({ isLoading: false });
          return { success: true, needsOTP: true };
        }

        // Set auth state
        get().setAuth(data.user, data.token);
        set({ isLoading: false });

        return { success: true };
      },

      /**
       * Verify login OTP
       */
      verifyLoginOTP: async (email, otp) => {
        set({ isLoading: true, error: null });

        const { data, error } = await authService.verifyLoginOTP({ email, otp });

        if (error) {
          set({ isLoading: false, error: error.message || 'OTP verification failed' });
          return { success: false, error };
        }

        get().setAuth(data.user, data.token);
        set({ isLoading: false });

        return { success: true };
      },

      /**
       * Register
       */
      register: async (userData) => {
        set({ isLoading: true, error: null });

        const { data, error } = await authService.register(userData);

        if (error) {
          set({ isLoading: false, error: error.message || 'Registration failed' });
          return { success: false, error };
        }

        set({ isLoading: false });
        return { success: true, data };
      },

      /**
       * Logout
       */
      logout: async () => {
        set({ isLoading: true });

        await authService.logout();

        get().clearAuth();
        set({ isLoading: false });

        // Redirect to home
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      },

      /**
       * Check authentication status
       */
      checkAuth: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('customerToken') : null;

        if (!token) {
          get().clearAuth();
          return false;
        }

        set({ isLoading: true });

        const { data, error } = await authService.getCurrentUser();

        if (error) {
          get().clearAuth();
          set({ isLoading: false });
          return false;
        }

        get().setAuth(data.user, token);
        set({ isLoading: false });

        return true;
      },

      /**
       * Refresh token
       */
      refreshToken: async () => {
        const { data, error } = await authService.refreshToken();

        if (error) {
          get().clearAuth();
          return false;
        }

        if (data.token) {
          const currentUser = get().user;
          get().setAuth(currentUser, data.token);
        }

        return true;
      },

      /**
       * Initialize auth from localStorage
       */
      initAuth: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('customerToken');
          const userStr = localStorage.getItem('customerUser');

          if (token && userStr) {
            try {
              const user = JSON.parse(userStr);
              set({
                user,
                token,
                isAuthenticated: true,
              });
            } catch (error) {
              console.error('Failed to parse user data:', error);
              get().clearAuth();
            }
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;