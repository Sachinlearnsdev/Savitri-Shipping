import { create } from 'zustand';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Theme modes:
 * - 'light': Always light mode
 * - 'dark': Always dark mode
 * - 'system': Follow OS/browser preference
 * - 'auto': 6AM-6PM light, 6PM-6AM dark
 */

const THEME_MODES = ['light', 'dark', 'system', 'auto'];

/**
 * Resolve the effective theme ('light' or 'dark') based on the selected mode.
 */
const resolveTheme = (mode) => {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';

  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  if (mode === 'auto') {
    const hour = new Date().getHours();
    return (hour >= 6 && hour < 18) ? 'light' : 'dark';
  }

  return 'light';
};

/**
 * Apply the resolved theme to the document root element.
 */
const applyTheme = (mode) => {
  const resolved = resolveTheme(mode);
  document.documentElement.setAttribute('data-theme', resolved);
  return resolved;
};

/**
 * Theme Store
 * Manages theme mode and applies it to the DOM.
 */
const useThemeStore = create((set, get) => {
  // Read stored preference on creation
  const storedMode = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  const validMode = THEME_MODES.includes(storedMode) ? storedMode : 'light';

  // Apply immediately on store creation
  const initialResolved = applyTheme(validMode);

  // Listen for system preference changes when mode is 'system'
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    const currentMode = get().mode;
    if (currentMode === 'system') {
      const resolved = applyTheme('system');
      set({ resolvedTheme: resolved });
    }
  });

  // For 'auto' mode, check every minute if the theme should change
  setInterval(() => {
    const currentMode = get().mode;
    if (currentMode === 'auto') {
      const resolved = applyTheme('auto');
      set({ resolvedTheme: resolved });
    }
  }, 60000);

  return {
    mode: validMode,
    resolvedTheme: initialResolved,

    /**
     * Set theme mode
     * @param {string} mode - 'light', 'dark', 'system', or 'auto'
     */
    setTheme: (mode) => {
      if (!THEME_MODES.includes(mode)) return;
      localStorage.setItem(STORAGE_KEYS.THEME, mode);
      const resolved = applyTheme(mode);
      set({ mode, resolvedTheme: resolved });
    },

    /**
     * Simple toggle between light and dark (for header button)
     */
    toggleLightDark: () => {
      const current = get().resolvedTheme;
      get().setTheme(current === 'dark' ? 'light' : 'dark');
    },

    /**
     * Cycle through theme modes: light -> dark -> system -> auto -> light
     */
    cycleTheme: () => {
      const currentMode = get().mode;
      const currentIndex = THEME_MODES.indexOf(currentMode);
      const nextIndex = (currentIndex + 1) % THEME_MODES.length;
      get().setTheme(THEME_MODES[nextIndex]);
    },

    /**
     * Get available theme modes
     */
    getThemeModes: () => THEME_MODES,
  };
});

export default useThemeStore;
