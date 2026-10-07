import { College } from '../models/College.js';

// Pre-calibrated landmark coordinates for Vadodara
export const VADODARA_COLLEGES = {
  'parul university': { lat: 22.2965, lng: 73.0169, name: 'Parul University' },
  'parul': { lat: 22.2965, lng: 73.0169, name: 'Parul University' },
  'ms university': { lat: 22.3225, lng: 73.186, name: 'MS University' },
  'msu': { lat: 22.3225, lng: 73.186, name: 'MS University' },
  'itm universe': { lat: 22.3561, lng: 73.1928, name: 'ITM Universe' },
  'itm': { lat: 22.3561, lng: 73.1928, name: 'ITM Universe' },
  'navrachana university': { lat: 22.368, lng: 73.1415, name: 'Navrachana University' },
  'sigma university': { lat: 22.3582, lng: 73.3421, name: 'Sigma University' },
  'gsfc university': { lat: 22.3695, lng: 73.1612, name: 'GSFC University' },
};

/**
 * Calculate distance between two lat/lng coordinates in km using Haversine formula
 */
export const calculateDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

/**
 * Resolve college coordinates by college name or ID
 */
export const resolveCollegeCoordinates = async (collegeIdentifier) => {
  if (!collegeIdentifier) return null;
  const normalized = collegeIdentifier.toLowerCase().trim();

  // 1. Try pre-calibrated dict
  if (VADODARA_COLLEGES[normalized]) {
    return VADODARA_COLLEGES[normalized];
  }

  // 2. Query MongoDB College collection
  try {
    const college = await College.findOne({
      $or: [
        { name: new RegExp(collegeIdentifier, 'i') },
        ...(collegeIdentifier.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: collegeIdentifier }] : []),
      ],
    });

    if (college) {
      return {
        lat: college.latitude,
        lng: college.longitude,
        name: college.name,
        id: college._id,
      };
    }
  } catch (err) {
    console.warn('Error querying college in locationService:', err.message);
  }

  return null;
};
