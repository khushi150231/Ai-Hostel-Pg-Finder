import { processAISearch, processAIComparison } from '../services/aiSearchService.js';
import { getPersonalizedRecommendations } from '../services/recommendationService.js';
import { processChatWithGemini, extractRequirementsWithGemini } from '../services/geminiService.js';
import { validateAndSanitizeAIFilters } from '../utils/aiValidation.js';
import { searchHostels } from '../services/hostelSearchService.js';
import { rankHostels } from '../utils/ranking.js';
import { explainRecommendationsWithGemini } from '../services/geminiService.js';

/**
 * @desc    Natural Language AI Search
 * @route   POST /api/ai/search
 * @access  Public (Optionally authenticated)
 */
export const aiSearchHandler = async (req, res, next) => {
  try {
    const { message, query, location } = req.body;
    const searchMessage = message || query;

    if (!searchMessage || typeof searchMessage !== 'string' || !searchMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A search query/message is required in request body.',
      });
    }

    const studentId = req.user ? req.user._id : null;

    const result = await processAISearch({
      message: searchMessage.trim(),
      location: location || {},
      studentId,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Multi-Hostel Comparison Synthesis
 * @route   POST /api/ai/compare
 * @access  Public
 */
export const aiCompareHandler = async (req, res, next) => {
  try {
    const { hostelIds, userPreferences } = req.body;

    if (!hostelIds || !Array.isArray(hostelIds) || hostelIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of at least 2 hostel IDs to compare.',
      });
    }

    const result = await processAIComparison({
      hostelIds,
      userPreferences: userPreferences || {},
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Conversational Housing Assistant
 * @route   POST /api/ai/chat
 * @access  Public (Optionally authenticated)
 */
export const aiChatHandler = async (req, res, next) => {
  try {
    const { message, conversationHistory = [], currentFilters = {} } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message string is required.',
      });
    }

    // 1. Process conversational turn through Gemini
    const chatAnalysis = await processChatWithGemini(
      message.trim(),
      conversationHistory,
      currentFilters
    );

    let dbRecommendations = [];
    let updatedFilters = validateAndSanitizeAIFilters(chatAnalysis.updatedFilters || currentFilters);

    // 2. If chat triggered new criteria, perform DB search and ranking
    if (chatAnalysis.requiresDbSearch !== false) {
      const searchRes = await searchHostels({
        ...updatedFilters,
        limit: 15,
      });

      const candidates = searchRes.data || [];
      const ranked = rankHostels(candidates, updatedFilters);
      const topFive = ranked.slice(0, 5);

      if (topFive.length > 0) {
        const explanations = await explainRecommendationsWithGemini(message, updatedFilters, topFive);
        dbRecommendations = topFive.map((hostel) => {
          const exp = explanations.explanations?.find(
            (e) => e.hostelId === hostel._id?.toString() || e.hostelId === hostel.id
          );
          return {
            hostelId: hostel._id?.toString() || hostel.id,
            hostel,
            matchScore: hostel.matchScore,
            matchBreakdown: hostel.matchBreakdown,
            reason: exp?.reason || `${hostel.name} matches your updated criteria with a ${hostel.matchScore}% score.`,
          };
        });
      }
    }

    res.status(200).json({
      success: true,
      reply: chatAnalysis.reply,
      updatedFilters,
      recommendationsCount: dbRecommendations.length,
      recommendations: dbRecommendations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Personalized Recommendations for Authenticated Student
 * @route   GET /api/ai/recommendations/personalized
 * @access  Private (Student)
 */
export const aiPersonalizedHandler = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const recommendations = await getPersonalizedRecommendations(studentId);
    res.status(200).json(recommendations);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Instant Requirement Extraction for Search Bar Previews
 * @route   POST /api/ai/extract
 * @access  Public
 */
export const aiExtractRequirementsHandler = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const raw = await extractRequirementsWithGemini(message);
    const sanitized = validateAndSanitizeAIFilters(raw);

    res.status(200).json({
      success: true,
      extracted: sanitized,
    });
  } catch (error) {
    next(error);
  }
};
