import { Hostel } from '../models/Hostel.js';
import { resolveCollegeCoordinates, calculateDistanceKm } from './locationService.js';
import { calculateEffectiveMonthlyCost, computeDataConfidence } from '../utils/ranking.js';

export const searchHostels = async (queryParams = {}) => {
  const {
    budgetMin,
    budgetMax,
    gender,
    roomType,
    amenities,
    food,
    college,
    latitude,
    longitude,
    radius = 12, // default 12 km
    minimumRating,
    sort = 'recommended',
    area,
    page = 1,
    limit = 20,
    search,
    propertyType,
    verificationStatus,
    availabilityStatus,
  } = queryParams;

  let centerLat = latitude ? parseFloat(latitude) : null;
  let centerLng = longitude ? parseFloat(longitude) : null;
  let collegeInfo = null;

  // If college is specified without lat/lng, resolve college coordinates
  if (college && (!centerLat || !centerLng)) {
    collegeInfo = await resolveCollegeCoordinates(college);
    if (collegeInfo) {
      centerLat = collegeInfo.lat;
      centerLng = collegeInfo.lng;
    }
  }

  const query = {};

  // Verification filter (exclude explicitly rejected properties)
  if (verificationStatus) {
    query.verificationStatus = verificationStatus;
  } else {
    query.verificationStatus = { $ne: 'REJECTED' };
  }

  // Availability filter
  if (availabilityStatus) {
    query.availabilityStatus = availabilityStatus;
  }

  // Property Type Filter
  if (propertyType) {
    query.type = propertyType.toUpperCase();
  }

  // 1. Budget Filter: Match on pricing.monthlyRent, pricing.effectiveMonthlyCost, or legacy monthlyRent
  if (budgetMin || budgetMax) {
    const minVal = budgetMin ? Number(budgetMin) : null;
    const maxVal = budgetMax ? Number(budgetMax) : null;

    const priceQuery = {};
    if (minVal !== null) priceQuery.$gte = minVal;
    if (maxVal !== null) priceQuery.$lte = maxVal;

    query.$or = [
      { 'pricing.monthlyRent': priceQuery },
      { 'pricing.effectiveMonthlyCost': priceQuery },
      { monthlyRent: priceQuery },
    ];
  }

  // 2. Gender Filter
  if (gender && gender !== 'any' && gender !== 'all') {
    const g = gender.toUpperCase();
    if (g.includes('BOY') || g === 'MALE') {
      query.gender = { $in: ['BOYS', 'BOYS_AND_GIRLS', 'boys', 'co-living', 'VERIFY'] };
    } else if (g.includes('GIRL') || g === 'FEMALE') {
      query.gender = { $in: ['GIRLS', 'BOYS_AND_GIRLS', 'girls', 'co-living', 'VERIFY'] };
    } else {
      query.gender = { $in: ['BOYS_AND_GIRLS', 'co-living', 'VERIFY'] };
    }
  }

  // 3. Room Type Filter
  if (roomType && roomType !== 'any') {
    const rtUpper = roomType.toUpperCase();
    query.$or = [
      { 'rooms.type': new RegExp(roomType, 'i') },
      { 'roomTypes.roomType': new RegExp(roomType, 'i') },
    ];
  }

  // 4. Amenities Filter
  if (amenities) {
    const amenityList = Array.isArray(amenities)
      ? amenities
      : amenities.split(',').map((a) => a.trim().toLowerCase());
    
    if (amenityList.length > 0) {
      // Check for boolean flags in subdocument or legacy array
      amenityList.forEach((am) => {
        if (am === 'wifi') query.$or = [{ 'amenities.wifi': true }, { amenities: 'wifi' }];
        else if (am === 'ac') query.$or = [{ 'amenities.ac': true }, { amenities: 'ac' }];
        else if (am === 'food') query.$or = [{ 'food.available': true }, { 'food.included': true }, { 'amenities.food': true }, { amenities: 'food' }];
      });
    }
  }

  // 5. Food Filter
  if (food !== undefined && food !== null && food !== '') {
    const isFood = food === 'true' || food === true || food === '1';
    if (isFood) {
      query.$or = [
        { 'food.included': true },
        { 'food.available': true },
        { 'amenities.food': true },
        { amenities: 'food' },
      ];
    }
  }

  // 6. Minimum Rating
  if (minimumRating) {
    query.$or = [
      { 'reviews.rating': { $gte: parseFloat(minimumRating) } },
      { rating: { $gte: parseFloat(minimumRating) } },
    ];
  }

  // 7. Area or Text search
  if (area) {
    query.$or = [
      { 'location.area': new RegExp(area.trim(), 'i') },
      { area: new RegExp(area.trim(), 'i') },
    ];
  }

  if (search) {
    const sRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: sRegex },
      { 'location.area': sRegex },
      { 'location.address': sRegex },
      { area: sRegex },
      { description: sRegex },
    ];
  }

  // 8. Geospatial Filter using MongoDB 2dsphere
  const radiusKm = parseFloat(radius) || 12;
  const useGeospatial = centerLat !== null && centerLng !== null && !isNaN(centerLat) && !isNaN(centerLng);

  if (useGeospatial) {
    const radiusInRadians = radiusKm / 6378.1;
    query.$or = [
      {
        'location.coordinates': {
          $geoWithin: {
            $centerSphere: [[centerLng, centerLat], radiusInRadians],
          },
        },
      },
      {
        location: {
          $geoWithin: {
            $centerSphere: [[centerLng, centerLat], radiusInRadians],
          },
        },
      },
    ];
  }

  // Execute Query
  let hostels = await Hostel.find(query).lean();

  // If strict query yielded 0 and geospatial was active, fall back to campus area without radius constraint
  if (hostels.length === 0 && (centerLat !== null || college)) {
    delete query.$or;
    delete query.location;
    delete query['location.coordinates'];
    hostels = await Hostel.find({ verificationStatus: { $ne: 'REJECTED' } }).limit(25).lean();
  }

  // Normalize fields, distances, dataConfidence & effectiveMonthlyCost
  hostels = hostels.map((h) => {
    const hLng = h.location?.coordinates?.[0] ?? (Array.isArray(h.location) ? h.location[0] : null);
    const hLat = h.location?.coordinates?.[1] ?? (Array.isArray(h.location) ? h.location[1] : null);

    let distanceKm = null;
    if (centerLat !== null && centerLng !== null && hLat !== null && hLng !== null) {
      distanceKm = calculateDistanceKm(centerLat, centerLng, hLat, hLng);
    }

    const effectiveCost = calculateEffectiveMonthlyCost(h);
    const confidence = computeDataConfidence(h);

    return {
      ...h,
      distanceKm,
      targetCollege: collegeInfo?.name || college || null,
      effectiveMonthlyCost: effectiveCost,
      monthlyRent: h.pricing?.monthlyRent ?? h.monthlyRent ?? effectiveCost,
      area: h.location?.area || h.area,
      address: h.location?.address || `${h.location?.area || h.area || 'Vadodara'}, Vadodara`,
      rating: h.reviews?.rating ?? h.rating ?? 4.0,
      reviewCount: h.reviews?.reviewCount ?? h.reviewCount ?? 0,
      dataConfidence: confidence.level,
      dataConfidenceDisclaimer: confidence.disclaimer,
    };
  });

  // Sorting logic
  switch (sort) {
    case 'priceLow':
      hostels.sort((a, b) => a.effectiveMonthlyCost - b.effectiveMonthlyCost);
      break;
    case 'priceHigh':
      hostels.sort((a, b) => b.effectiveMonthlyCost - a.effectiveMonthlyCost);
      break;
    case 'rating':
      hostels.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'nearest':
      if (centerLat !== null && centerLng !== null) {
        hostels.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
      }
      break;
    default: // recommended
      hostels.sort((a, b) => {
        const score = (h) =>
          (h.verificationStatus === 'ADMIN_VERIFIED' ? 4 : h.verificationStatus === 'OWNER_VERIFIED' ? 3 : 1) +
          (h.isFeatured ? 2 : 0) +
          (h.rating || 0);
        return score(b) - score(a);
      });
  }

  const total = hostels.length;
  const skip = (Number(page) - 1) * Number(limit);
  const paginated = hostels.slice(skip, skip + Number(limit));

  return {
    success: true,
    count: paginated.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    center: centerLat ? { lat: centerLat, lng: centerLng, college: collegeInfo?.name || null } : null,
    data: paginated,
  };
};
