import api from './api';
import { MOCK_HOSTELS } from '../data/mockData';

// Helper to ensure uniform hostel object structure between MongoDB and frontend
const normalizeHostel = (hostel) => {
  if (!hostel) return null;
  return {
    ...hostel,
    id: hostel._id?.toString() || hostel.id,
    startingPrice: hostel.monthlyRent || hostel.startingPrice || 6000,
    price: hostel.monthlyRent || hostel.startingPrice || 6000,
    verified: hostel.verificationStatus === 'VERIFIED' || hostel.verified || false,
    images: hostel.images && hostel.images.length > 0 ? hostel.images : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'],
    food: typeof hostel.food === 'object' ? hostel.food : { included: false, messAvailable: false, type: 'Veg' },
    distanceFromColleges: hostel.distanceFromColleges || {
      parul: hostel.distanceKm || 2.0,
      ms: hostel.distanceKm || 3.5,
      itm: hostel.distanceKm || 5.0,
    },
  };
};

export const aiService = {
  /**
   * 1. Natural Language AI Search
   * POST /api/ai/search
   */
  async queryAI(message, location = {}) {
    try {
      const response = await api.post('/ai/search', {
        message,
        location,
      });

      if (response.data && response.data.success) {
        const { recommendations, extractedRequirements, summary, bestMatch, suggestions, isRelaxedSearch, relaxedNotice } = response.data;
        return {
          query: message,
          filters: extractedRequirements,
          isRelaxedSearch,
          relaxedNotice,
          summary,
          bestMatch,
          suggestions: suggestions || [],
          recommendations: (recommendations || []).map((rec) => ({
            hostel: normalizeHostel(rec.hostel),
            matchPercent: rec.matchScore,
            matchScore: rec.matchScore,
            matchBreakdown: rec.matchBreakdown,
            reason: rec.reason,
          })),
        };
      }
    } catch (err) {
      console.warn('[AI Service] Backend AI search endpoint failed, using fallback:', err.message);
    }

    // Client-side fallback if backend server is unreachable
    return fallbackClientSearch(message);
  },

  /**
   * 2. AI Multi-Hostel Comparison Synthesis
   * POST /api/ai/compare
   */
  async compareHostels(hostelIds, userPreferences = {}) {
    try {
      const response = await api.post('/ai/compare', {
        hostelIds,
        userPreferences,
      });

      if (response.data && response.data.success) {
        const { comparison, hostels } = response.data;
        return {
          comparison: comparison.finalRecommendation || comparison.bestOverall?.reason,
          detailedComparison: comparison,
          hostels: (hostels || []).map(normalizeHostel),
          winner: comparison.bestOverall?.hostelId,
        };
      }
    } catch (err) {
      console.warn('[AI Service] Backend AI compare endpoint failed, using fallback:', err.message);
    }

    // Client-side fallback
    const selected = hostelIds
      .map((id) => MOCK_HOSTELS.find((h) => h.id === id || h._id === id))
      .filter(Boolean);

    if (selected.length < 2) {
      return { comparison: 'Please select at least 2 hostels to compare.' };
    }

    const cheapest = selected.reduce((a, b) => (a.startingPrice < b.startingPrice ? a : b));
    const highestRated = selected.reduce((a, b) => (a.rating > b.rating ? a : b));

    return {
      comparison: `${cheapest.name} offers the best budget value at ₹${cheapest.startingPrice.toLocaleString('en-IN')}/month. ${highestRated.name} is the top rated with ${highestRated.rating}★ and rich amenities.`,
      detailedComparison: {
        bestOverall: { hostelId: highestRated.id, hostelName: highestRated.name, reason: `${highestRated.name} has the highest resident satisfaction.` },
        bestBudget: { hostelId: cheapest.id, hostelName: cheapest.name, reason: `Most economical monthly rent at ₹${cheapest.startingPrice}.` },
        finalRecommendation: `For budget focus, choose ${cheapest.name}. For quality and facilities, choose ${highestRated.name}.`,
      },
      winner: highestRated.id,
    };
  },

  /**
   * 3. Conversational Housing Assistant
   * POST /api/ai/chat
   */
  async sendChatMessage(message, conversationHistory = [], currentFilters = {}) {
    try {
      const response = await api.post('/ai/chat', {
        message,
        conversationHistory,
        currentFilters,
      });

      if (response.data && response.data.success) {
        return {
          reply: response.data.reply,
          updatedFilters: response.data.updatedFilters,
          recommendations: (response.data.recommendations || []).map((rec) => ({
            hostel: normalizeHostel(rec.hostel),
            matchScore: rec.matchScore,
            reason: rec.reason,
          })),
        };
      }
    } catch (err) {
      console.warn('[AI Service] Chat endpoint failed, using fallback:', err.message);
    }

    // Client chat fallback with domain knowledge
    const clientKnowledge = getKnowledgeAnswer(message);
    return {
      reply: clientKnowledge.reply,
      updatedFilters: currentFilters,
      recommendations: clientKnowledge.recommendations,
    };
  },

  /**
   * 4. Personalized Recommendations for Logged-In Student
   * GET /api/ai/recommendations/personalized
   */
  async getPersonalizedRecommendations() {
    try {
      const response = await api.get('/ai/recommendations/personalized');
      if (response.data && response.data.success) {
        return {
          ...response.data,
          recommendations: (response.data.recommendations || []).map((rec) => ({
            ...rec,
            hostel: normalizeHostel(rec.hostel),
          })),
        };
      }
    } catch (err) {
      console.warn('[AI Service] Personalized recommendations endpoint failed:', err.message);
    }
    return null;
  },

  /**
   * 5. Standalone Requirement Extraction for Live Search Box Previews
   * POST /api/ai/extract
   */
  async extractRequirements(message) {
    try {
      const response = await api.post('/ai/extract', { message });
      if (response.data && response.data.success) {
        return response.data.extracted;
      }
    } catch {
      // Ignore
    }
    return null;
  },
};

// Domain knowledge answer builder for student housing queries
const getKnowledgeAnswer = (prompt = '') => {
  const text = prompt.toLowerCase();
  let reply = '';
  let filterFn = () => true;

  if (text.includes('curfew') || text.includes('gate timing') || text.includes('gate close') || text.includes('timing')) {
    reply = `🕒 **Curfew & Gate Timings in Vadodara Hostels:**\n\n` +
      `• **Standard Gate Timings:** Most boys hostels close between **10:00 PM – 10:30 PM**, and girls hostels close between **9:30 PM – 10:00 PM** for safety.\n` +
      `• **Late Entry Passes:** Available for exam preparation, college library sessions, or project work with prior warden approval & parent consent SMS.\n` +
      `• **Safety:** 24/7 CCTV surveillance and biometric/RFID card tracking for all residents.`;
  } else if (text.includes('food') || text.includes('mess') || text.includes('meal') || text.includes('jain') || text.includes('veg')) {
    reply = `🍽️ **Food & Mess Inclusions:**\n\n` +
      `• **3-4 Meals Daily:** Breakfast (Poha, Upma, Thepla, Tea), Lunch (Roti, 2 Sabzis, Dal, Rice, Chaas), Snacks & Dinner (Gujarati/Punjabi specials).\n` +
      `• **100% Pure Veg & Jain Options:** Over 95% of student stays in Vadodara are pure vegetarian with dedicated Jain meal arrangements.\n` +
      `• **RO Purified Water:** Cold & regular purified drinking water stations on all floors.`;
    filterFn = (h) => h.food?.included || (Array.isArray(h.amenities) && h.amenities.includes('food'));
  } else if (text.includes('single') || text.includes('double') || text.includes('sharing') || text.includes('room type')) {
    reply = `🛏️ **Room Sharing & Budget Guide in Vadodara:**\n\n` +
      `• **Single Room (Private):** ₹7,000 – ₹16,000/mo (Private study desk, wardrobe, optional AC).\n` +
      `• **Double Sharing:** ₹4,500 – ₹8,500/mo per bed (Most popular & balanced choice).\n` +
      `• **Triple & 4-Sharing:** ₹3,200 – ₹5,500/mo per bed (Budget-friendly, often includes mess meals).\n` +
      `• **Luxury Studio/Co-Living:** ₹14,000 – ₹24,000/mo (Full privacy, modern lounge, kitchenette).`;
  } else if (text.includes('deposit') || text.includes('rent') || text.includes('cost') || text.includes('electricity')) {
    reply = `💰 **Deposit & Rent Transparency:**\n\n` +
      `• **Security Deposit:** Typically **1 to 2 months rent**, 100% refundable upon 30-day move-out notice.\n` +
      `• **Electricity Charges:** Normal lights/fans included; AC units billed via sub-meter (approx. ₹8-₹10/unit).\n` +
      `• **Zero Brokerage:** Connect with verified hostel managers directly without paying broker commissions.`;
  } else if (text.includes('parul')) {
    reply = `🎓 **Stays Near Parul University (Limda / Waghodia Road):**\n\n` +
      `• Located in Limda corridor (0.5 – 2 km from campus) with direct auto and bus shuttle connectivity.\n` +
      `• High availability of boys & girls PGs with 3-time meals included from ₹4,500 to ₹12,000/mo.`;
    filterFn = (h) => h.targetCollege === 'Parul University' || h.name?.toLowerCase().includes('parul') || h.area?.toLowerCase().includes('waghodia') || h.area?.toLowerCase().includes('limda');
  } else if (text.includes('msu') || text.includes('ms university') || text.includes('fatehgunj')) {
    reply = `🏛️ **Stays Near MS University (Fatehgunj / Sayajigunj / Alkapuri):**\n\n` +
      `• Walking distance to Arts, Science, Commerce, and FTE faculties in historic student hubs.\n` +
      `• Surrounded by student libraries, cafes, and easy rail/bus transit.`;
    filterFn = (h) => h.targetCollege === 'MS University' || h.area?.toLowerCase().includes('fatehgunj') || h.area?.toLowerCase().includes('sayaji') || h.area?.toLowerCase().includes('alkapuri');
  } else {
    reply = `👋 **Here are the top verified student accommodations in Vadodara for your query:**\n\n` +
      `All listings include verified security, Wi-Fi, clean water, and direct owner contact with **0% brokerage**.\n\n` +
      `Feel free to ask me anything about **food, curfew timings, room sharing, or college proximity**!`;
  }

  const matches = MOCK_HOSTELS.filter(filterFn);
  const recommendations = (matches.length > 0 ? matches : MOCK_HOSTELS).slice(0, 4).map((h) => ({
    hostel: normalizeHostel(h),
    matchPercent: 94,
    matchScore: 94,
    reason: `${h.name} is a verified property in ${h.area} offering great amenities and zero brokerage.`,
  }));

  return { reply, recommendations };
};

// Client-side fallback rule engine
const fallbackClientSearch = (prompt) => {
  const q = prompt.toLowerCase();
  const filters = {
    gender: q.includes('boys') || q.includes('male') ? 'boys' : q.includes('girls') || q.includes('female') ? 'girls' : null,
    college: q.includes('parul') ? 'Parul University' : q.includes('msu') || q.includes('ms university') ? 'MS University' : null,
    budgetMax: q.includes('7000') ? 7000 : q.includes('6000') ? 6000 : q.includes('8000') ? 8000 : null,
  };

  const knowledge = getKnowledgeAnswer(prompt);

  return {
    query: prompt,
    filters,
    summary: knowledge.reply,
    recommendations: knowledge.recommendations,
  };
};

export default aiService;
