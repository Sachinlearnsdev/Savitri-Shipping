import { useState, useEffect } from 'react';
import { getErrorMessage } from '@/utils/helpers';

/**
 * useFetch Hook
 * Generic data fetching hook with loading and error states
 * 
 * @param {Function} fetchFunction - Async function to fetch data
 * @param {boolean} immediate - Whether to fetch immediately on mount
 * @returns {object} { data, loading, error, refetch }
 */
export const useFetch = (fetchFunction, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchFunction();
      
      setData(response.data || response);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useFetch;