import { Hostel } from '../models/Hostel.js';
import { College } from '../models/College.js';
import { Search } from '../models/Search.js';
import { searchHostels as dbSearchHostels } from './hostelSearchService.js';
import { resolveCollegeCoordinates, calculateDistanceKm } from './locationService.js';
import { extractRequirementsWithGemini, explainRecommendationsWithGemini, compareHostelsWithGemini } from './geminiService.js';
import { validateAndSanitizeAIFilters } from '../utils/aiValidation.js';
import { rankHostels } from '../utils/ranking.js';

/**
 * ============================================================================
 * CONTROLLED BACKEND DATABASE ACCESS FUNCTIONS (Requirement 11)
 * ============================================================================
 */

export const searchHostels = async (filters = {}) => {
  return await dbSearchHostels(filters);
};

export const getHostelDetails = async (hostelId) => {
  const hostel = await Hostel.findById(hostelId).populate('ownerId', 'name email phone companyName').lean();
  return hostel;
};

export const findNearbyHostels = async (latitude, longitude, radius = 5) => {
  return await dbSearchHostels({
    latitude,
    longitude,
    radius,
    sort: 'nearest',
  });
};

export const compareHostels = async (hostelIds = []) => {
  if (!Array.isArray(hostelIds) || hostelIds.length === 0) {
    return [];
  }
  const cleanIds = hostelIds.slice(0, 4); // Max 4 for comparative table
  const hostels = await Hostel.find({ _id: { $in: cleanIds } }).lean();
  return hostels;
};

export const getHostelsByCollege = async (collegeIdentifier, radius = 7) => {
  const college = await resolveCollegeCoordinates(collegeIdentifier);
  if (!college) {
    return { success: false, message: 'College not found in Vadodara database' };
  }
  return await dbSearchHostels({
    latitude: college.lat,
    longitude: college.lng,
    radius,
    college: college.name,
    sort: 'nearest',
  });
};

/**
 * ============================================================================
 * AI NATURAL LANGUAGE SEARCH & RECOMMENDATION PIPELINE (Requirement 2 - 8, 13, 14)
 * ============================================================================
 */

export const processAISearch = async ({ message, location = {}, studentId = null, userPreferences = {} }) => {
  if (!message || typeof message !== 'string') {
    throw new Error('Search message is required');
  }

  // 1. Natural Language Requirement Extraction via Gemini
  const rawExtracted = await extractRequirementsWithGemini(message);

  // 2. Node.js Strict Validation & Sanitization
  const validatedFilters = validateAndSanitizeAIFilters(rawExtracted);

  // If user passed browser geolocation coordinates, attach them
  if (location.latitude && location.longitude) {
    validatedFilters.latitude = location.latitude;
    validatedFilters.longitude = location.longitude;
  }

  // 3. Query Database for Candidate Hostels
  const searchResults = await searchHostels({
    ...validatedFilters,
    limit: 50, // Fetch candidates for ranking
  });

  let candidates = searchResults.data || [];
  let isRelaxedSearch = false;
  let relaxedExplanation = null;

  // 4. Handle No Results / Relaxation Fallback (Requirement 13)
  if (candidates.length === 0) {
    // Attempt relaxed query: expand budget by 20% or widen radius to 10km or drop strict amenity filters
    const relaxedFilters = { ...validatedFilters };
    if (relaxedFilters.budgetMax) {
      relaxedFilters.budgetMax = Math.round(relaxedFilters.budgetMax * 1.25);
    }
    relaxedFilters.amenities = []; // relax amenity constraint
    relaxedFilters.radius = 12;

    const relaxedResults = await searchHostels(relaxedFilters);
    if (relaxedResults.data && relaxedResults.data.length > 0) {
      candidates = relaxedResults.data;
      isRelaxedSearch = true;
      relaxedExplanation = `No exact matches were found for your strict budget of ₹${validatedFilters.budgetMax || 'specified'}. We found ${candidates.length} verified alternatives with slightly adjusted budget/distance.`;
    }
  }

  // 5. Deterministic Ranking Engine (Requirement 7)
  const rankedHostels = rankHostels(candidates, validatedFilters);

  // 6. Select Top 5 Candidates for Grounded Explanation
  const topCandidates = rankedHostels.slice(0, 5);

  // 7. Grounded Explanation Generation via Gemini (Requirement 8, 12)
  const aiExplanation = await explainRecommendationsWithGemini(message, validatedFilters, topCandidates);

  // 8. Construct Final Structured AI Response
  const formattedRecommendations = topCandidates.map((hostel) => {
    const matchedExplanation = aiExplanation.explanations?.find(
      (exp) => exp.hostelId === hostel._id?.toString() || exp.hostelId === hostel.id
    );

    return {
      hostelId: hostel._id?.toString() || hostel.id,
      hostel,
      matchScore: hostel.matchScore,
      matchBreakdown: hostel.matchBreakdown,
      categories: hostel.categories || [],
      effectiveMonthlyCost: hostel.effectiveMonthlyCost,
      dataConfidence: hostel.dataConfidence || 'Medium',
      dataConfidenceDisclaimer: hostel.dataConfidenceDisclaimer || 'Verified listing.',
      verificationStatus: hostel.verificationStatus || 'SOURCE_LISTED',
      availabilityStatus: hostel.availabilityStatus || 'UNKNOWN',
      lastVerifiedAt: hostel.lastVerifiedAt,
      reason: matchedExplanation?.reason || `${hostel.name} is a strong ${hostel.matchScore}% match for your preferences in Vadodara.`,
    };
  });

  const bestMatch = formattedRecommendations[0] || null;

  // 9. Persist Search History for Future Personalization (Requirement 17)
  if (studentId) {
    try {
      await Search.create({
        studentId,
        query: message,
        filters: validatedFilters,
        extractedRequirements: validatedFilters,
        resultsCount: rankedHostels.length,
        selectedHostel: bestMatch?.hostelId || null,
      });
    } catch (dbErr) {
      console.warn('[AI Search] Failed to log student search history:', dbErr.message);
    }
  }

  return {
    success: true,
    originalQuery: message,
    extractedRequirements: validatedFilters,
    isRelaxedSearch,
    relaxedNotice: relaxedExplanation,
    summary: aiExplanation.summary || `Found ${topCandidates.length} matching accommodations in Vadodara.`,
    totalFound: rankedHostels.length,
    recommendations: formattedRecommendations,
    bestMatch,
    bestMatchAdvice: aiExplanation.bestMatchAdvice || (bestMatch ? `${bestMatch.hostel.name} is your top recommendation.` : null),
    disclaimer: aiExplanation.disclaimer || 'Availability and prices should be confirmed with the property because listings can change.',
    suggestions: aiExplanation.suggestions || [],
  };
};

/**
 * ============================================================================
 * AI COMPARISON PIPELINE (Requirement 9)
 * ============================================================================
 */

export const processAIComparison = async ({ hostelIds = [], userPreferences = {} }) => {
  if (!Array.isArray(hostelIds) || hostelIds.length < 2) {
    throw new Error('Please select at least 2 hostels to compare.');
  }

  // 1. Fetch actual database records
  const hostels = await compareHostels(hostelIds);
  if (hostels.length === 0) {
    throw new Error('None of the requested hostels were found in the database.');
  }

  // 2. Perform Grounded Gemini Comparison Synthesis
  const comparison = await compareHostelsWithGemini(hostels, userPreferences);

  return {
    success: true,
    comparedCount: hostels.length,
    hostels,
    comparison,
  };
};
