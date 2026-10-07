/**
 * AI Filter Validation and Sanitization
 *
 * Ensures that any structured output returned by Gemini is strictly typed,
 * bounded, and stripped of injection or unauthorized parameters before
 * querying the MongoDB database.
 */

const ALLOWED_GENDERS = ['boys', 'girls', 'co-ed', 'any', 'all'];
const KNOWN_AMENITIES = [
  'wifi',
  'high-speed wifi',
  'ac',
  'food',
  'mess',
  'attached washroom',
  'laundry',
  'washing machine',
  'cctv',
  'security',
  '24/7 security',
  'parking',
  'refrigerator',
  'hot water',
  'geyser',
  'gym',
  'study table',
  'wardrobe',
  'power backup',
  'housekeeping',
  'cleaning',
  'balcony',
  'water purifier',
  'ro water',
];

export const validateAndSanitizeAIFilters = (rawFilters = {}) => {
  if (!rawFilters || typeof rawFilters !== 'object') {
    return {
      college: null,
      location: null,
      budgetMin: null,
      budgetMax: null,
      gender: null,
      roomType: null,
      amenities: [],
      food: null,
      maxDistanceKm: null,
      minimumRating: null,
    };
  }

  const sanitized = {};

  // 1. College
  if (typeof rawFilters.college === 'string' && rawFilters.college.trim()) {
    sanitized.college = rawFilters.college.trim().slice(0, 100);
  } else {
    sanitized.college = null;
  }

  // 2. Location / Area
  if (typeof rawFilters.location === 'string' && rawFilters.location.trim()) {
    sanitized.location = rawFilters.location.trim().slice(0, 100);
  } else if (typeof rawFilters.area === 'string' && rawFilters.area.trim()) {
    sanitized.location = rawFilters.area.trim().slice(0, 100);
  } else {
    sanitized.location = null;
  }

  // 3. Budget Min & Max
  if (rawFilters.budgetMin !== undefined && rawFilters.budgetMin !== null) {
    const bMin = Number(rawFilters.budgetMin);
    sanitized.budgetMin = !isNaN(bMin) && bMin >= 0 && bMin <= 100000 ? Math.round(bMin) : null;
  } else {
    sanitized.budgetMin = null;
  }

  if (rawFilters.budgetMax !== undefined && rawFilters.budgetMax !== null) {
    const bMax = Number(rawFilters.budgetMax);
    sanitized.budgetMax = !isNaN(bMax) && bMax >= 0 && bMax <= 100000 ? Math.round(bMax) : null;
  } else {
    sanitized.budgetMax = null;
  }

  // If both min and max exist and min > max, swap or fix
  if (sanitized.budgetMin && sanitized.budgetMax && sanitized.budgetMin > sanitized.budgetMax) {
    const temp = sanitized.budgetMin;
    sanitized.budgetMin = sanitized.budgetMax;
    sanitized.budgetMax = temp;
  }

  // 4. Gender
  if (typeof rawFilters.gender === 'string') {
    const gLower = rawFilters.gender.toLowerCase().trim();
    if (gLower.includes('boy') || gLower.includes('male') || gLower === 'men') {
      sanitized.gender = 'boys';
    } else if (gLower.includes('girl') || gLower.includes('female') || gLower === 'women') {
      sanitized.gender = 'girls';
    } else if (gLower.includes('co-ed') || gLower.includes('both') || gLower.includes('unisex')) {
      sanitized.gender = 'co-ed';
    } else {
      sanitized.gender = null;
    }
  } else {
    sanitized.gender = null;
  }

  // 5. Room Type
  if (typeof rawFilters.roomType === 'string' && rawFilters.roomType.trim()) {
    const rLower = rawFilters.roomType.toLowerCase().trim();
    if (rLower.includes('single') || rLower.includes('1')) {
      sanitized.roomType = 'Single';
    } else if (rLower.includes('double') || rLower.includes('2') || rLower.includes('twin')) {
      sanitized.roomType = 'Double Sharing';
    } else if (rLower.includes('triple') || rLower.includes('3')) {
      sanitized.roomType = 'Triple Sharing';
    } else if (rLower.includes('four') || rLower.includes('4')) {
      sanitized.roomType = 'Four Sharing';
    } else {
      sanitized.roomType = rawFilters.roomType.trim().slice(0, 50);
    }
  } else {
    sanitized.roomType = null;
  }

  // 6. Amenities
  sanitized.amenities = [];
  if (Array.isArray(rawFilters.amenities)) {
    for (const item of rawFilters.amenities) {
      if (typeof item === 'string' && item.trim()) {
        const aClean = item.trim().toLowerCase().slice(0, 40);
        if (!sanitized.amenities.includes(aClean)) {
          sanitized.amenities.push(aClean);
        }
      }
    }
  }

  // 7. Food
  if (rawFilters.food === true || rawFilters.food === false) {
    sanitized.food = rawFilters.food;
  } else if (typeof rawFilters.food === 'string') {
    sanitized.food = rawFilters.food.toLowerCase() === 'true' || rawFilters.food.toLowerCase() === 'yes';
  } else {
    // Check if food was passed inside amenities
    if (sanitized.amenities.some((a) => a === 'food' || a === 'mess' || a === 'meals')) {
      sanitized.food = true;
    } else {
      sanitized.food = null;
    }
  }

  // 8. Distance
  if (rawFilters.maxDistanceKm !== undefined && rawFilters.maxDistanceKm !== null) {
    const d = Number(rawFilters.maxDistanceKm);
    sanitized.maxDistanceKm = !isNaN(d) && d > 0 && d <= 50 ? Number(d.toFixed(1)) : null;
  } else {
    sanitized.maxDistanceKm = null;
  }

  // 9. Minimum Rating
  if (rawFilters.minimumRating !== undefined && rawFilters.minimumRating !== null) {
    const r = Number(rawFilters.minimumRating);
    sanitized.minimumRating = !isNaN(r) && r >= 1 && r <= 5 ? Number(r.toFixed(1)) : null;
  } else {
    sanitized.minimumRating = null;
  }

  return sanitized;
};
