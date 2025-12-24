import { create } from 'zustand';

/**
 * Vehicle Store
 * Manages saved vehicles state
 */
export const useVehicleStore = create((set, get) => ({
  // State
  vehicles: [],
  isLoading: false,
  error: null,
  
  /**
   * Set vehicles list
   * @param {array} vehicles - Array of vehicles
   */
  setVehicles: (vehicles) => {
    set({ vehicles, error: null });
  },
  
  /**
   * Add new vehicle
   * @param {object} vehicle - Vehicle data
   */
  addVehicle: (vehicle) => {
    set((state) => ({
      vehicles: [...state.vehicles, vehicle],
    }));
  },
  
  /**
   * Update vehicle by ID
   * @param {string} id - Vehicle ID
   * @param {object} updates - Updated vehicle data
   */
  updateVehicle: (id, updates) => {
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    }));
  },
  
  /**
   * Delete vehicle by ID
   * @param {string} id - Vehicle ID
   */
  deleteVehicle: (id) => {
    set((state) => ({
      vehicles: state.vehicles.filter((v) => v.id !== id),
    }));
  },
  
  /**
   * Set default vehicle
   * @param {string} id - Vehicle ID
   */
  setDefaultVehicle: (id) => {
    set((state) => ({
      vehicles: state.vehicles.map((v) => ({
        ...v,
        isDefault: v.id === id,
      })),
    }));
  },
  
  /**
   * Get default vehicle
   * @returns {object|null}
   */
  getDefaultVehicle: () => {
    const vehicles = get().vehicles;
    return vehicles.find((v) => v.isDefault) || null;
  },
  
  /**
   * Get vehicle by ID
   * @param {string} id - Vehicle ID
   * @returns {object|null}
   */
  getVehicleById: (id) => {
    const vehicles = get().vehicles;
    return vehicles.find((v) => v.id === id) || null;
  },
  
  /**
   * Set loading state
   * @param {boolean} isLoading - Loading state
   */
  setLoading: (isLoading) => {
    set({ isLoading });
  },
  
  /**
   * Set error
   * @param {string} error - Error message
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
   * Clear all vehicles
   */
  clearVehicles: () => {
    set({ vehicles: [], error: null });
  },
}));