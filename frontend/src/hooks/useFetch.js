import { useState, useEffect } from 'react';

/**
 * Custom hook to execute and manage state for an API fetch call.
 * @param {Function} apiFunc Axios request promise factory function.
 * @returns {Object} { data, loading, error, refetch }
 */
export const useFetch = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiFunc();
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};
