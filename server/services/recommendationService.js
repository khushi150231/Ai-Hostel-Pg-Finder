import { Student } from '../models/Student.js';
import { Favourite } from '../models/Favourite.js';
import { Search } from '../models/Search.js';
import { Hostel } from '../models/Hostel.js';
import { searchHostels } from './hostelSearchService.js';
import { rankHostels } from '../utils/ranking.js';
import { explainRecommendationsWithGemini } from './geminiService.js';

/**
 * Generate Personalized Recommendations for Authenticated Student (Requirement 16)
 */
export const getPersonalizedRecommendations = async (studentId) => {
  if (!studentId) {
    throw new Error('Student ID is required for personalized recommendations');
  }

  // 1. Fetch Student Profile
  const student = await Student.findById(studentId).lean();
  if (!student) {
    throw new Error('Student not found');
  }

  // 2. Fetch Recent Searches & Favourites
  const [recentSearches, favourites] = await Promise.all([
    Search.find({ studentId }).sort({ createdAt: -1 }).limit(5).lean(),
    Favourite.find({ studentId }).populate('hostelId').lean(),
  ]);

  // 3. Build unified preferences profile
  const preferences = {
    college: student.college || recentSearches[0]?.extractedRequirements?.college || 'Vadodara Campus',
    budgetMin: student.preferredBudgetMin || recentSearches[0]?.extractedRequirements?.budgetMin || null,
    budgetMax: student.preferredBudgetMax || student.budget || recentSearches[0]?.extractedRequirements?.budgetMax || null,
    gender: student.gender || student.preferredGender || null,
    roomType: student.preferredRoomType || null,
    amenities: student.preferredAmenities || ['wifi', 'food'],
    maxDistanceKm: student.preferredDistanceKm || 5,
  };

  // 4. Query Database
  const dbResults = await searchHostels({
    college: preferences.college,
    budgetMax: preferences.budgetMax,
    gender: preferences.gender,
    roomType: preferences.roomType,
    limit: 30,
  });

  let candidates = dbResults.data || [];

  if (candidates.length === 0) {
    // If strict match yields none, query broader list for the campus/area
    const broader = await searchHostels({
      college: preferences.college,
      limit: 20,
    });
    candidates = broader.data || [];
  }

  // 5. Deterministic Ranking
  const ranked = rankHostels(candidates, preferences);
  const topRecommendations = ranked.slice(0, 5);

  // 6. Grounded Gemini AI Explanation
  const querySummary = `Personalized for ${student.name} studying at ${preferences.college} with budget around ₹${preferences.budgetMax || 'standard'}`;
  const aiExplanation = await explainRecommendationsWithGemini(querySummary, preferences, topRecommendations);

  // 7. Format results
  const formatted = topRecommendations.map((hostel) => {
    const exp = aiExplanation.explanations?.find(
      (e) => e.hostelId === hostel._id?.toString() || e.hostelId === hostel.id
    );
    const isFavorited = favourites.some((f) => f.hostelId?._id?.toString() === hostel._id?.toString());

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
      isFavorited,
      reason: exp?.reason || `${hostel.name} aligns with your profile at ${preferences.college} with a ${hostel.matchScore}% suitability score.`,
    };
  });

  return {
    success: true,
    student: {
      name: student.fullName || student.name,
      college: student.college,
      budget: student.budgetMax || student.budget,
    },
    preferences,
    totalRecommendations: formatted.length,
    recommendations: formatted,
    summary: aiExplanation.summary || `Top ${formatted.length} personalized recommendations for ${student.fullName || student.name}.`,
    bestMatchAdvice: aiExplanation.bestMatchAdvice,
    disclaimer: aiExplanation.disclaimer || 'Availability and prices should be confirmed with the property because listings can change.',
    suggestions: aiExplanation.suggestions || [],
  };
};
