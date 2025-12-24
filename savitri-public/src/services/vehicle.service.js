import { api } from './api';
import { API_ENDPOINTS } from '@/utils/constants';

/**
 * Vehicle Service
 * Handles all saved vehicles API calls
 */
export const vehicleService = {
  /**
   * Get all saved vehicles
   * @returns {Promise}
   */
  getVehicles: async () => {
    return api.get(API_ENDPOINTS.VEHICLES.LIST);
  },

  /**
   * Create new saved vehicle
   * @param {object} data - Vehicle data
   * @returns {Promise}
   */
  createVehicle: async (data) => {
    return api.post(API_ENDPOINTS.VEHICLES.CREATE, data);
  },

  /**
   * Update saved vehicle
   * @param {string} id - Vehicle ID
   * @param {object} data - Updated vehicle data
   * @returns {Promise}
   */
  updateVehicle: async (id, data) => {
    return api.put(API_ENDPOINTS.VEHICLES.UPDATE(id), data);
  },

  /**
   * Delete saved vehicle
   * @param {string} id - Vehicle ID
   * @returns {Promise}
   */
  deleteVehicle: async (id) => {
    return api.delete(API_ENDPOINTS.VEHICLES.DELETE(id));
  },

  /**
   * Set vehicle as default
   * @param {string} id - Vehicle ID
   * @returns {Promise}
   */
  setDefaultVehicle: async (id) => {
    return api.patch(API_ENDPOINTS.VEHICLES.UPDATE(id), { isDefault: true });
  },
};

export default vehicleService;