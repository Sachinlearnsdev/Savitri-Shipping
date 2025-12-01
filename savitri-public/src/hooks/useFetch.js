/**
 * useFetch Hook
 * Custom hook for data fetching with loading and error states
 */

'use client';
import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';

const useFetch = (url, options = {}) => {
  const {
    method = 'GET',
    body = null,
    dependencies = [],
    immediate = true,
    onSuccess = null,
    onError = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (fetchOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const config = {
        method: fetchOptions.method || method,
        ...fetchOptions.config,
      };

      if (fetchOptions.body || body) {
        config.data = fetchOptions.body || body;
      }

      const response = await api.request({
        url: fetchOptions.url || url,
        ...config,
      });

      setData(response.data);
      setLoading(false);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return { data: response.data, error: null };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      setLoading(false);

      if (onError) {
        onError(errorMessage);
      }

      return { data: null, error: errorMessage };
    }
  }, [url, method, body, onSuccess, onError]);

  // Auto-fetch on mount if immediate is true
  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }
  }, [immediate, ...dependencies]);

  const refetch = useCallback((fetchOptions) => {
    return fetchData(fetchOptions);
  }, [fetchData]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    reset,
  };
};

export default useFetch;