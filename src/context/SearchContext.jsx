import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import studentService from '../services/studentService';

const SearchContext = createContext(null);

const defaultFilters = {
  location: '',
  minBudget: '',
  maxBudget: '',
  gender: '',
  roomType: '',
  amenities: [],
  food: null,
  distance: '',
  college: '',
  search: '',
};

export const SearchProvider = ({ children }) => {
  const [filters, setFilters] = useState(defaultFilters);
  const [sortBy, setSortBy] = useState('recommended');

  // Initialize from localStorage
  const [compareList, setCompareList] = useState(() => {
    try {
      const saved = localStorage.getItem('staynear_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favourites, setFavourites] = useState(() => {
    try {
      const saved = localStorage.getItem('staynear_favs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync favourites with backend on login
  useEffect(() => {
    const token = localStorage.getItem('staynear_token');
    if (token) {
      studentService
        .getSavedHostels()
        .then((res) => {
          if (res && Array.isArray(res.data) && res.data.length > 0) {
            const serverIds = res.data.map((item) => String(item.hostelId || item.hostel?._id || item.hostel?.id || item._id));
            setFavourites((prev) => {
              const merged = Array.from(new Set([...prev.map(String), ...serverIds]));
              localStorage.setItem('staynear_favs', JSON.stringify(merged));
              return merged;
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const applyQuickFilter = useCallback((filter) => {
    setFilters((prev) => ({ ...defaultFilters, ...filter }));
  }, []);

  const addToCompare = useCallback((hostel) => {
    if (!hostel) return;
    const hId = String(hostel.id || hostel._id);
    setCompareList((prev) => {
      if (prev.some((h) => String(h.id || h._id) === hId)) return prev;
      if (prev.length >= 3) return prev; // max 3
      const updated = [...prev, hostel];
      localStorage.setItem('staynear_compare', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromCompare = useCallback((hostelId) => {
    const hId = String(hostelId);
    setCompareList((prev) => {
      const updated = prev.filter((h) => String(h.id || h._id) !== hId);
      localStorage.setItem('staynear_compare', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleFavourite = useCallback((hostelId) => {
    if (!hostelId) return;
    const cleanId = String(hostelId);
    setFavourites((prev) => {
      const exists = prev.some((id) => String(id) === cleanId);
      const next = exists
        ? prev.filter((id) => String(id) !== cleanId)
        : [...prev, cleanId];
      
      localStorage.setItem('staynear_favs', JSON.stringify(next));

      // Asynchronously sync with backend if token exists
      const token = localStorage.getItem('staynear_token');
      if (token) {
        if (exists) {
          studentService.unsaveHostel(cleanId).catch(() => {});
        } else {
          studentService.saveHostel(cleanId).catch(() => {});
        }
      }
      return next;
    });
  }, []);

  const isFavourite = useCallback(
    (hostelId) => {
      if (!hostelId) return false;
      const cleanId = String(hostelId);
      return favourites.some((id) => String(id) === cleanId);
    },
    [favourites]
  );

  const isInCompare = useCallback(
    (hostelId) => {
      if (!hostelId) return false;
      const cleanId = String(hostelId);
      return compareList.some((h) => String(h.id || h._id) === cleanId);
    },
    [compareList]
  );

  return (
    <SearchContext.Provider
      value={{
        filters,
        sortBy,
        compareList,
        favourites,
        updateFilters,
        resetFilters,
        applyQuickFilter,
        setSortBy,
        addToCompare,
        removeFromCompare,
        toggleFavourite,
        isFavourite,
        isInCompare,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
};

export default SearchContext;
