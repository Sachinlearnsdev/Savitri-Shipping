import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/utils/constants";
import {
  saveToStorage,
  removeFromStorage,
  setCookie,
  deleteCookie,
} from "@/utils/helpers";

/**
 * Auth Store
 * Manages authentication state with localStorage + Cookie fallback
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,

      /**
       * Set user and mark as authenticated
       * @param {object} user - User data
       */
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });

        // Save to localStorage for persistence
        if (user) {
          saveToStorage(STORAGE_KEYS.USER, user);
        } else {
          removeFromStorage(STORAGE_KEYS.USER);
        }
      },

      /**
       * Set auth token (saves to both localStorage AND cookies)
       * @param {string} token - JWT token
       */
      setToken: (token) => {
        if (token) {
          // Save to localStorage
          saveToStorage(STORAGE_KEYS.AUTH_TOKEN, token);

          // IMPORTANT: Also save to cookies for middleware
          setCookie("auth_token", token, 30); // 30 days
        } else {
          // Remove from both storages
          removeFromStorage(STORAGE_KEYS.AUTH_TOKEN);
          deleteCookie("auth_token");
        }
      },

      /**
       * Login - Set user and token (ASYNC to ensure cookie write)
       * @param {object} user - User data
       * @param {string} token - JWT token
       */
      login: async (user, token) => {
        console.log("🔐 AuthStore: Logging in user", {
          user,
          hasToken: !!token,
        });

        // Set user first
        get().setUser(user);

        // Then set token (saves to localStorage + cookies)
        get().setToken(token);

        // Update state
        set({
          user,
          isAuthenticated: true,
        });

        // CRITICAL: Force browser to commit cookies before returning
        await new Promise((resolve) => setTimeout(resolve, 0));

        console.log("✅ AuthStore: Login complete (cookie written)", {
          isAuthenticated: get().isAuthenticated,
          user: get().user,
        });
      },

      /**
       * Logout - Clear user and token
       */
      logout: () => {
        console.log("🚪 AuthStore: Logging out user");

        set({
          user: null,
          isAuthenticated: false,
        });

        // Remove from localStorage
        removeFromStorage(STORAGE_KEYS.USER);
        removeFromStorage(STORAGE_KEYS.AUTH_TOKEN);

        // Remove from cookies
        deleteCookie("auth_token");

        console.log("✅ AuthStore: Logout complete");
      },

      /**
       * Update user data
       * @param {object} updates - Partial user data
       */
      updateUser: (updates) => {
        const currentUser = get().user;

        if (!currentUser) return;

        const updatedUser = { ...currentUser, ...updates };

        set({ user: updatedUser });
        saveToStorage(STORAGE_KEYS.USER, updatedUser);
      },

      /**
       * Set loading state
       * @param {boolean} isLoading - Loading state
       */
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      /**
       * Check if user has verified email
       * @returns {boolean}
       */
      isEmailVerified: () => {
        const user = get().user;
        return user?.emailVerified || false;
      },

      /**
       * Check if user has verified phone
       * @returns {boolean}
       */
      isPhoneVerified: () => {
        const user = get().user;
        return user?.phoneVerified || false;
      },

      /**
       * Mark email as verified
       */
      markEmailVerified: () => {
        get().updateUser({ emailVerified: true });
      },

      /**
       * Mark phone as verified
       */
      markPhoneVerified: () => {
        get().updateUser({ phoneVerified: true });
      },
    }),
    {
      name: "savitri-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);