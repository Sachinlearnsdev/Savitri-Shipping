import { create } from 'zustand';
import { getNotificationCounts } from '../services/notifications.service';

const useNotificationStore = create((set, get) => ({
  counts: {
    pendingReviews: 0,
    pendingBookings: 0,
    pendingPartyBookings: 0,
    total: 0,
  },
  lastFetched: null,

  fetchCounts: async () => {
    try {
      const response = await getNotificationCounts();
      if (response.success) {
        set({
          counts: response.data,
          lastFetched: Date.now(),
        });
      }
    } catch {
      // Silently fail - notification counts are non-critical
    }
  },

  getCount: (key) => {
    return get().counts[key] || 0;
  },

  resetCounts: () => {
    set({
      counts: { pendingReviews: 0, pendingBookings: 0, pendingPartyBookings: 0, total: 0 },
      lastFetched: null,
    });
  },
}));

export default useNotificationStore;
