import api from './api';
import { MOCK_HOSTELS } from '../data/mockData';

// Helper to normalize backend hostel fields to match frontend component properties
export const normalizeHostel = (h) => {
  if (!h) return h;

  // Convert amenities subdocument or array to clean string array
  let amenityList = [];
  if (Array.isArray(h.amenities)) {
    amenityList = h.amenities;
  } else if (typeof h.amenities === 'object' && h.amenities !== null) {
    amenityList = Object.keys(h.amenities).filter((k) => h.amenities[k] === true);
  } else if (Array.isArray(h.amenityList)) {
    amenityList = h.amenityList;
  }

  // Normalize gender to lowercase for consistent badge styling
  const rawGender = (h.gender || 'BOYS').toUpperCase();
  let genderDisplay = 'boys';
  if (rawGender.includes('GIRL') || rawGender === 'FEMALE') {
    genderDisplay = 'girls';
  } else if (rawGender.includes('BOY') && rawGender.includes('GIRL')) {
    genderDisplay = 'co-living';
  } else if (rawGender === 'CO_LIVING' || rawGender === 'CO-ED' || rawGender === 'BOTH') {
    genderDisplay = 'co-living';
  } else if (rawGender.includes('BOY') || rawGender === 'MALE') {
    genderDisplay = 'boys';
  } else {
    genderDisplay = 'boys';
  }

  // Compute display price from pricing subdocument, effectiveMonthlyCost, or fallback
  const effectivePrice =
    h.effectiveMonthlyCost ||
    h.pricing?.effectiveMonthlyCost ||
    h.pricing?.monthlyRent ||
    h.monthlyRent ||
    h.startingPrice ||
    h.rooms?.[0]?.price ||
    h.roomTypes?.[0]?.price ||
    4500;

  // Normalize location
  const area = h.location?.area || h.area || 'Vadodara';
  const city = h.location?.city || h.city || 'Vadodara';
  const address = h.location?.address || h.address || `${area}, ${city}`;
  const coordinates = h.location?.coordinates || (h.latitude && h.longitude ? [h.longitude, h.latitude] : [73.1812, 22.3072]);

  // Normalize rating & reviews
  const rating = Number(h.reviews?.rating ?? h.rating ?? 4.0);
  const reviewCount = Number(h.reviews?.reviewCount ?? h.reviewCount ?? h.reviewsCount ?? 0);

  // Normalize verified status
  const isVerified =
    h.verificationStatus === 'ADMIN_VERIFIED' ||
    h.verificationStatus === 'OWNER_VERIFIED' ||
    h.verificationStatus === 'SOURCE_LISTED' ||
    h.verified === true;

  // Normalize college distances
  const collegeDistances = {};
  if (Array.isArray(h.collegeDistances)) {
    h.collegeDistances.forEach((curr) => {
      const name = (curr.collegeName || '').toLowerCase();
      if (name.includes('parul')) collegeDistances.parul = curr.distanceKm;
      else if (name.includes('ms') || name.includes('baroda')) collegeDistances.ms = curr.distanceKm;
      else if (name.includes('itm')) collegeDistances.itm = curr.distanceKm;
      else if (name.includes('navrachana')) collegeDistances.navrachana = curr.distanceKm;
      else if (name.includes('sigma')) collegeDistances.sigma = curr.distanceKm;
      else if (name.includes('gsfc')) collegeDistances.gsfc = curr.distanceKm;
    });
  }

  return {
    ...h,
    id: h._id || h.id,
    _id: h._id || h.id,
    name: h.name || 'Student Accommodation',
    slug: h.slug || (h.name ? h.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : String(h._id || h.id)),
    area,
    city,
    address,
    coordinates,
    gender: genderDisplay,
    rawGender: h.gender,
    startingPrice: effectivePrice,
    monthlyRent: effectivePrice,
    effectiveMonthlyCost: effectivePrice,
    amenities: amenityList,
    rating,
    reviewCount,
    reviewsCount: reviewCount,
    verified: isVerified,
    distanceFromColleges: collegeDistances,
    images: Array.isArray(h.images) && h.images.length > 0
      ? h.images
      : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'],
  };
};

export const hostelService = {
  async getHostels(filters = {}, sortBy = 'recommended') {
    try {
      const cleanFilters = { ...filters };
      // Remove empty values
      Object.keys(cleanFilters).forEach((k) => {
        if (cleanFilters[k] === '' || cleanFilters[k] === null || cleanFilters[k] === undefined) {
          delete cleanFilters[k];
        }
      });

      const params = { ...cleanFilters, sort: sortBy };
      const response = await api.get('/hostels/search', { params });
      const rawData = response.data.data || [];
      const items = rawData.map(normalizeHostel);
      return { data: items, total: response.data.total || items.length };
    } catch (err) {
      console.warn('Backend query failed, falling back to local dataset:', err.message);
      let filtered = [...MOCK_HOSTELS];
      if (filters.gender && filters.gender !== 'any') {
        filtered = filtered.filter((h) => h.gender === filters.gender);
      }
      if (filters.maxBudget) {
        filtered = filtered.filter((h) => h.startingPrice <= Number(filters.maxBudget));
      }
      if (filters.area) {
        const a = filters.area.toLowerCase();
        filtered = filtered.filter((h) => h.area.toLowerCase().includes(a));
      }
      return { data: filtered.map(normalizeHostel), total: filtered.length };
    }
  },

  async getFeaturedHostels() {
    try {
      const response = await api.get('/hostels/featured');
      const items = (response.data.data || []).map(normalizeHostel);
      return { data: items };
    } catch (err) {
      console.warn('Backend featured query failed, using fallback:', err.message);
      return { data: MOCK_HOSTELS.filter((h) => h.featured).map(normalizeHostel) };
    }
  },

  async getHostelById(id) {
    try {
      const response = await api.get(`/hostels/${id}`);
      return { data: normalizeHostel(response.data.data) };
    } catch (err) {
      console.warn('Backend getHostelById failed, using fallback:', err.message);
      const found = MOCK_HOSTELS.find((h) => h.id === Number(id) || h.slug === id || h._id === id);
      if (!found) throw new Error('Hostel not found');
      return { data: normalizeHostel(found) };
    }
  },

  async searchHostels(query) {
    try {
      const response = await api.get('/hostels/search', { params: { search: query } });
      const items = (response.data.data || []).map(normalizeHostel);
      return { data: items };
    } catch (err) {
      console.warn('Backend search query failed, using fallback:', err.message);
      const q = query.toLowerCase();
      const results = MOCK_HOSTELS.filter(
        (h) => h.name.toLowerCase().includes(q) || h.area.toLowerCase().includes(q)
      );
      return { data: results.map(normalizeHostel) };
    }
  },

  async addHostel(hostelData) {
    try {
      const response = await api.post('/hostels', hostelData);
      return { data: normalizeHostel(response.data.data), message: response.data.message };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to create hostel listing');
    }
  },

  async updateHostel(id, hostelData) {
    try {
      const response = await api.put(`/hostels/${id}`, hostelData);
      return { data: normalizeHostel(response.data.data), message: response.data.message };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update hostel listing');
    }
  },

  async deleteHostel(id) {
    try {
      const response = await api.delete(`/hostels/${id}`);
      return { message: response.data.message };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete hostel listing');
    }
  },
};

export default hostelService;
