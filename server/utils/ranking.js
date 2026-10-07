/**
 * Deterministic Hostel Ranking & Match Score Engine for Vadodara StayNear
 *
 * Scoring Breakdown (Section 11):
 * - Budget Fit:         30% (Calculated using Effective Monthly Cost)
 * - Distance to Campus: 25%
 * - Required Amenities: 20%
 * - Room Type Match:    10%
 * - Resident Rating:    10%
 * - Food Match:          5%
 * --------------------------------
 * Total:               100%
 */

/**
 * Calculate effective monthly cost:
 * effectiveMonthlyCost = rent + mandatoryFood + mandatoryElectricity + mandatoryMaintenance + mandatoryOtherCharges
 */
export const calculateEffectiveMonthlyCost = (hostel) => {
  if (hostel?.pricing?.effectiveMonthlyCost) {
    return hostel.pricing.effectiveMonthlyCost;
  }
  const rent = hostel?.pricing?.monthlyRent ?? hostel?.monthlyRent ?? 0;
  const food = hostel?.pricing?.food ?? 0;
  const elec = hostel?.pricing?.electricity ?? 0;
  const maint = hostel?.pricing?.maintenance ?? 0;
  const other = hostel?.pricing?.otherMandatoryCharges ?? 0;

  return rent + food + elec + maint + other;
};

/**
 * Compute Data Confidence Level based on verification status and verified timestamp
 */
export const computeDataConfidence = (hostel) => {
  const status = hostel.verificationStatus || 'SOURCE_LISTED';
  const lastVerified = hostel.lastVerifiedAt ? new Date(hostel.lastVerifiedAt) : null;
  const now = new Date();

  // If unverified or unknown availability
  if (status === 'UNVERIFIED' || hostel.availabilityStatus === 'UNKNOWN') {
    return {
      level: 'Low',
      disclaimer: 'Listing details and availability need confirmation with property management.',
    };
  }

  // Check staleness (e.g. older than 180 days)
  if (lastVerified) {
    const diffDays = (now - lastVerified) / (1000 * 60 * 60 * 24);
    if (diffDays > 180) {
      return {
        level: 'Low',
        disclaimer: 'Information has not been verified recently. We advise confirming current pricing and availability.',
      };
    }
  }

  if (status === 'ADMIN_VERIFIED' || status === 'OWNER_VERIFIED') {
    return {
      level: 'High',
      disclaimer: 'Verified directly with property owner / management records.',
    };
  }

  return {
    level: 'Medium',
    disclaimer: 'Verified from reliable public & institutional accommodation records.',
  };
};

/**
 * Deterministic calculation of single hostel match score
 */
export const calculateHostelMatchScore = (hostel, requirements = {}) => {
  const breakdown = {
    budget: 0,
    distance: 0,
    amenities: 0,
    roomType: 0,
    rating: 0,
    food: 0,
  };

  const {
    budgetMin,
    budgetMax,
    maxDistanceKm,
    amenities = [],
    roomType,
    minimumRating,
    food,
    gender,
  } = requirements;

  // 1. Strict Gender compatibility check
  if (gender && gender !== 'any' && gender !== 'all') {
    const reqNorm = gender.toUpperCase().trim();
    const hostelGender = (hostel.gender || '').toUpperCase().trim();

    if (
      hostelGender !== 'VERIFY' &&
      hostelGender !== 'BOYS_AND_GIRLS' &&
      hostelGender !== 'CO_LIVING' &&
      hostelGender !== 'CO-ED'
    ) {
      if (
        (reqNorm.includes('BOY') || reqNorm.includes('MALE')) &&
        !hostelGender.includes('BOY')
      ) {
        return { totalScore: 0, breakdown, isGenderMatch: false };
      }
      if (
        (reqNorm.includes('GIRL') || reqNorm.includes('FEMALE')) &&
        !hostelGender.includes('GIRL')
      ) {
        return { totalScore: 0, breakdown, isGenderMatch: false };
      }
    }
  }

  // 2. Budget Score (30% Weight) based on Effective Monthly Cost
  const effectiveCost = calculateEffectiveMonthlyCost(hostel);
  if (!budgetMax && !budgetMin) {
    breakdown.budget = 30; // default full marks if no budget constraint passed
  } else {
    const targetMax = budgetMax ? Number(budgetMax) : Infinity;
    const targetMin = budgetMin ? Number(budgetMin) : 0;

    if (effectiveCost <= targetMax && effectiveCost >= targetMin) {
      breakdown.budget = 30;
    } else if (effectiveCost > targetMax) {
      // Linear penalty for exceeding max budget
      const overPct = (effectiveCost - targetMax) / targetMax;
      if (overPct <= 0.1) breakdown.budget = 22;
      else if (overPct <= 0.25) breakdown.budget = 14;
      else if (overPct <= 0.4) breakdown.budget = 6;
      else breakdown.budget = 0;
    } else {
      // Below min budget
      breakdown.budget = 28;
    }
  }

  // 3. Distance Score (25% Weight)
  const distance = typeof hostel.distanceKm === 'number' ? hostel.distanceKm : null;
  if (distance === null) {
    breakdown.distance = 20; // Default baseline if distance is unknown
  } else {
    const maxAllowedDistance = maxDistanceKm ? Number(maxDistanceKm) : 5;
    if (distance <= 1.0) {
      breakdown.distance = 25; // Walking distance <= 1km
    } else if (distance <= 2.5) {
      breakdown.distance = 23;
    } else if (distance <= maxAllowedDistance) {
      const ratio = 1 - distance / (maxAllowedDistance * 1.5);
      breakdown.distance = Math.max(10, Math.round(ratio * 25));
    } else if (distance <= maxAllowedDistance * 1.5) {
      breakdown.distance = 8;
    } else {
      breakdown.distance = 2;
    }
  }

  // 4. Required Amenities Score (20% Weight)
  const reqAmenities = Array.isArray(amenities)
    ? amenities.map((a) => a.toLowerCase().trim())
    : [];

  const hostelAmenityMap = hostel.amenities || {};
  const hostelAmenityList = Array.isArray(hostel.amenities)
    ? hostel.amenities.map((a) => a.toLowerCase().trim())
    : [];

  if (reqAmenities.length === 0) {
    let activeCount = hostelAmenityList.length;
    if (typeof hostelAmenityMap === 'object' && !Array.isArray(hostelAmenityMap)) {
      activeCount += Object.values(hostelAmenityMap).filter((v) => v === true).length;
    }
    breakdown.amenities = Math.min(20, Math.max(12, Math.round((activeCount / 8) * 20)));
  } else {
    let matched = 0;
    for (const req of reqAmenities) {
      let found = false;
      // Check object keys
      if (hostelAmenityMap[req] === true) {
        found = true;
      } else if (req === 'food' && (hostel.food?.included || hostel.food?.available)) {
        found = true;
      } else if (req === 'wifi' && hostelAmenityMap.wifi) {
        found = true;
      } else if (req === 'ac' && hostelAmenityMap.ac) {
        found = true;
      } else if (req.includes('washroom') && hostelAmenityMap.geyser) {
        found = true;
      } else if (
        hostelAmenityList.some((ha) => ha.includes(req) || req.includes(ha))
      ) {
        found = true;
      }

      if (found) matched++;
    }
    const ratio = matched / reqAmenities.length;
    breakdown.amenities = Math.round(ratio * 20);
  }

  // 5. Room Type Score (10% Weight)
  if (!roomType || roomType === 'any' || roomType === 'all') {
    breakdown.roomType = 10;
  } else {
    const reqRoomNorm = roomType.toLowerCase().replace(/[\s-_]/g, '');
    const rooms = hostel.rooms || [];
    const legacyRoomTypes = hostel.roomTypes || [];

    const hasMatchingRoom =
      rooms.some((r) => (r.type || '').toLowerCase().replace(/[\s-_]/g, '').includes(reqRoomNorm)) ||
      legacyRoomTypes.some((rt) =>
        (rt.roomType || '').toLowerCase().replace(/[\s-_]/g, '').includes(reqRoomNorm)
      );

    breakdown.roomType = hasMatchingRoom ? 10 : 4;
  }

  // 6. Resident Rating Score (10% Weight)
  const rating = hostel.reviews?.rating ?? hostel.rating ?? 4.0;
  const minRating = minimumRating ? Number(minimumRating) : 0;

  if (rating >= 4.7) breakdown.rating = 10;
  else if (rating >= 4.3) breakdown.rating = 9;
  else if (rating >= 3.8) breakdown.rating = 7;
  else if (rating >= 3.2) breakdown.rating = 5;
  else breakdown.rating = 3;

  if (minRating > 0 && rating < minRating) {
    breakdown.rating = Math.max(0, breakdown.rating - 5);
  }

  // 7. Food Score (5% Weight)
  const isFoodReq =
    food === true ||
    food === 'true' ||
    reqAmenities.includes('food') ||
    reqAmenities.includes('mess') ||
    reqAmenities.includes('meals');

  const hasFood = Boolean(
    hostel.food?.included ||
    hostel.food?.available ||
    hostelAmenityMap.food === true ||
    hostelAmenityList.some((a) => a.includes('food') || a.includes('mess'))
  );

  if (isFoodReq) {
    breakdown.food = hasFood ? 5 : 0;
  } else {
    breakdown.food = hasFood ? 5 : 3;
  }

  // Total Deterministic Score (0 - 100)
  const totalScore = Math.min(
    100,
    Math.max(
      0,
      breakdown.budget +
        breakdown.distance +
        breakdown.amenities +
        breakdown.roomType +
        breakdown.rating +
        breakdown.food
    )
  );

  return {
    totalScore,
    breakdown,
    isGenderMatch: true,
    effectiveMonthlyCost: effectiveCost,
  };
};

/**
 * Assign AI Recommendation Categories (Section 14)
 */
export const assignRecommendationCategories = (rankedHostels = []) => {
  if (!rankedHostels || rankedHostels.length === 0) return rankedHostels;

  const results = rankedHostels.map((h) => ({ ...h, categories: [] }));

  // Best Overall
  if (results[0] && results[0].matchScore >= 75) {
    results[0].categories.push('Best Overall');
  }

  // Best Budget (lowest effective monthly cost with good score)
  const sortedByEffectiveCost = [...results]
    .filter((h) => h.effectiveMonthlyCost > 0)
    .sort((a, b) => a.effectiveMonthlyCost - b.effectiveMonthlyCost);
  if (sortedByEffectiveCost[0]) {
    sortedByEffectiveCost[0].categories.push('Best Budget');
  }

  // Best Near College (closest distance)
  const withDistance = results.filter(
    (h) => typeof h.distanceKm === 'number' && h.distanceKm >= 0
  );
  if (withDistance.length > 0) {
    withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
    if (!withDistance[0].categories.includes('Best Near College')) {
      withDistance[0].categories.push('Best Near College');
    }
  }

  // Best for Food
  const foodEligible = results.filter(
    (h) => h.food?.included === true || h.food?.available === true
  );
  if (foodEligible.length > 0) {
    foodEligible.sort(
      (a, b) =>
        (b.reviews?.food || b.reviews?.rating || 4.0) -
        (a.reviews?.food || a.reviews?.rating || 4.0)
    );
    if (!foodEligible[0].categories.includes('Best for Food')) {
      foodEligible[0].categories.push('Best for Food');
    }
  }

  // Best for Amenities
  const amenitiesEligible = results.filter(
    (h) => h.matchBreakdown?.amenities >= 16
  );
  if (amenitiesEligible.length > 0) {
    if (!amenitiesEligible[0].categories.includes('Best for Amenities')) {
      amenitiesEligible[0].categories.push('Best for Amenities');
    }
  }

  // Best for Girls / Best for Boys
  results.forEach((h) => {
    const g = (h.gender || '').toUpperCase();
    if (g === 'GIRLS' && !h.categories.includes('Best for Girls') && h.matchScore >= 80) {
      h.categories.push('Best for Girls');
    } else if (g === 'BOYS' && !h.categories.includes('Best for Boys') && h.matchScore >= 80) {
      h.categories.push('Best for Boys');
    }
  });

  // Best Value for Money
  const valueForMoney = results.find(
    (h) =>
      h.matchScore >= 80 &&
      h.effectiveMonthlyCost &&
      h.effectiveMonthlyCost <= 7000 &&
      !h.categories.includes('Best Budget')
  );
  if (valueForMoney) {
    valueForMoney.categories.push('Best Value for Money');
  }

  return results;
};

/**
 * Rank hostels deterministically and enrich with data confidence & categories
 */
export const rankHostels = (hostels = [], requirements = {}) => {
  const scored = hostels.map((hostel) => {
    const match = calculateHostelMatchScore(hostel, requirements);
    const confidence = computeDataConfidence(hostel);
    const effectiveCost = calculateEffectiveMonthlyCost(hostel);

    return {
      ...hostel,
      matchScore: match.totalScore,
      matchBreakdown: match.breakdown,
      isGenderMatch: match.isGenderMatch,
      effectiveMonthlyCost: effectiveCost,
      dataConfidence: confidence.level,
      dataConfidenceDisclaimer: confidence.disclaimer,
    };
  });

  // Filter out strict gender mismatches
  const valid = scored.filter((h) => h.isGenderMatch !== false);

  // Sort descending by matchScore
  valid.sort((a, b) => b.matchScore - a.matchScore);

  // Assign categories to top candidates
  return assignRecommendationCategories(valid);
};
