import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import useUIStore from '../store/uiStore';

/**
 * Custom hook for data fetching with loading and error states
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @param {boolean} options.immediate - Fetch immediately on mount (default: true)
 * @param {object} options.params - Query parameters
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {object} Fetch state and methods
 */
const useFetch = (url, options = {}) => {
  const {
    immediate = true,
    params = {},
    onSuccess,
    onError,
  } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useUIStore();
  
  /**
   * Fetch data from API
   */
  const fetchData = useCallback(async (customParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(url, {
        params: { ...params, ...customParams },
      });
      
      if (response.data.success) {
        setData(response.data.data);
        
        if (onSuccess) {
          onSuccess(response.data.data);
        }
        
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while fetching data';
      setError(errorMessage);
      showError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [url, params, onSuccess, onError, showError]);
  
  /**
   * Refetch data
   */
  const refetch = useCallback((customParams = {}) => {
    return fetchData(customParams);
  }, [fetchData]);
  
  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);
  
  // Fetch data on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);
  
  return {
    data,
    loading,
    error,
    refetch,
    reset,
  };
};

export default useFetch;