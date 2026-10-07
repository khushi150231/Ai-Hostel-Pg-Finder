import { useState, useEffect, useCallback } from 'react';
import { hostelService } from '../services/hostelService';

export const useHostels = (initialFilters = {}, initialSort = 'recommended') => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchHostels = useCallback(async (filters, sortBy) => {
    setLoading(true);
    setError(null);
    try {
      const res = await hostelService.getHostels(filters, sortBy);
      setHostels(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err.message || 'Failed to load hostels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHostels(initialFilters, initialSort);
  }, []);

  return { hostels, loading, error, total, refetch: fetchHostels };
};
