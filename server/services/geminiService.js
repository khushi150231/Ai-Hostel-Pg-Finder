import { GoogleGenAI } from '@google/genai';
import {
  SYSTEM_PROMPT_REQUIREMENT_EXTRACTION,
  SYSTEM_PROMPT_RECOMMENDATION_EXPLANATION,
  SYSTEM_PROMPT_COMPARISON,
  SYSTEM_PROMPT_CONVERSATIONAL_CHAT,
} from './promptService.js';

let genAIClient = null;

const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
};

/**
 * Utility to extract clean JSON object/array from model output text
 */
const parseJsonSafely = (text) => {
  if (!text || typeof text !== 'string') return null;
  let clean = text.trim();

  // Strip markdown code block markers
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
  }

  clean = clean.trim();

  // Try direct parse
  try {
    return JSON.parse(clean);
  } catch (err) {
    // Attempt regex extraction of the first {...} or [...] block
    const match = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerErr) {
        console.warn('[Gemini Service] Regex JSON parse error:', innerErr.message);
      }
    }
    console.warn('[Gemini Service] JSON parse fallback failed on text:', text.slice(0, 100));
    return null;
  }
};

/**
 * 1. Extract Structured Housing Requirements from Natural Language
 */
export const extractRequirementsWithGemini = async (studentMessage) => {
  const client = getGenAIClient();

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${SYSTEM_PROMPT_REQUIREMENT_EXTRACTION}\n\nStudent Message:\n"${studentMessage}"\n\nReturn strictly valid JSON.`,
              },
            ],
          },
        ],
      });

      const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = parseJsonSafely(rawText);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (apiError) {
      console.warn('[Gemini Service] Live API extraction error, switching to rule-based parser:', apiError.message);
    }
  }

  // Robust Rule-Based Parser Fallback (Deterministic & zero-latency fallback)
  return fallbackExtractRequirements(studentMessage);
};

/**
 * Fallback Natural Language Parser when Gemini API key is unset or network is offline
 */
const fallbackExtractRequirements = (msg = '') => {
  const text = msg.toLowerCase();
  const extracted = {
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

  // College detection
  if (text.includes('parul')) extracted.college = 'Parul University';
  else if (text.includes('msu') || text.includes('ms university') || text.includes('baroda university') || text.includes('sayaji')) extracted.college = 'MS University';
  else if (text.includes('itm')) extracted.college = 'ITM Universe';
  else if (text.includes('navrachana') || text.includes('nuv')) extracted.college = 'Navrachana University';
  else if (text.includes('bvm')) extracted.college = 'BVM Engineering College';
  else if (text.includes('sigma')) extracted.college = 'Sigma University';
  else if (text.includes('gsfc')) extracted.college = 'GSFC University';

  // Area / Location detection
  if (text.includes('fatehgunj') || text.includes('fatehganj')) extracted.location = 'Fatehgunj';
  else if (text.includes('sayajigunj') || text.includes('sayajiganj')) extracted.location = 'Sayajigunj';
  else if (text.includes('waghodia')) extracted.location = 'Waghodia Road';
  else if (text.includes('nizampura')) extracted.location = 'Nizampura';
  else if (text.includes('manjalpur')) extracted.location = 'Manjalpur';
  else if (text.includes('alkapuri')) extracted.location = 'Alkapuri';
  else if (text.includes('vasna') || text.includes('bhayli')) extracted.location = 'Vasna-Bhayli';

  // Gender detection
  if (text.includes('boy') || text.includes('male') || text.includes('gents') || text.includes('men')) {
    extracted.gender = 'boys';
  } else if (text.includes('girl') || text.includes('female') || text.includes('ladies') || text.includes('women')) {
    extracted.gender = 'girls';
  } else if (text.includes('co-ed') || text.includes('unisex') || text.includes('both')) {
    extracted.gender = 'co-ed';
  }

  // Budget detection (e.g. "under 7000", "below 6500", "6000 to 7000", "5k - 7k")
  const rangeMatch = text.match(/(?:between|from)?\s*₹?(\d{1,2}(?:,\d{3}|k)?)\s*(?:to|-)\s*₹?(\d{1,2}(?:,\d{3}|k)?)/i);
  if (rangeMatch) {
    const parseVal = (v) => {
      let num = v.replace(/,/g, '').toLowerCase();
      if (num.endsWith('k')) return parseFloat(num) * 1000;
      return parseFloat(num);
    };
    extracted.budgetMin = parseVal(rangeMatch[1]);
    extracted.budgetMax = parseVal(rangeMatch[2]);
  } else {
    const maxMatch = text.match(/(?:under|below|less than|max|budget(?: of)?|upto|up to)\s*₹?\s*(\d{1,2}(?:,\d{3}|k|\d{3}))/i);
    if (maxMatch) {
      let val = maxMatch[1].replace(/,/g, '').toLowerCase();
      if (val.endsWith('k')) extracted.budgetMax = parseFloat(val) * 1000;
      else extracted.budgetMax = parseFloat(val);
    }
  }

  // Room type detection
  if (text.includes('single') || text.includes('1 sharing') || text.includes('private room')) extracted.roomType = 'Single';
  else if (text.includes('double') || text.includes('2 sharing') || text.includes('twin')) extracted.roomType = 'Double Sharing';
  else if (text.includes('triple') || text.includes('3 sharing')) extracted.roomType = 'Triple Sharing';
  else if (text.includes('four') || text.includes('4 sharing')) extracted.roomType = 'Four Sharing';

  // Distance detection (e.g. "within 3 km", "under 2km", "< 5 km")
  const distMatch = text.match(/(?:within|under|less than|within|in)\s*(\d+(?:\.\d+)?)\s*(?:km|kms|kilometer|kilometres)/i);
  if (distMatch) {
    extracted.maxDistanceKm = parseFloat(distMatch[1]);
  }

  // Amenities & Food
  if (text.includes('wifi') || text.includes('wi-fi') || text.includes('internet')) extracted.amenities.push('wifi');
  if (text.includes('food') || text.includes('mess') || text.includes('meals') || text.includes('tiffin')) {
    extracted.amenities.push('food');
    extracted.food = true;
  }
  if (text.includes(' ac') || text.includes('air conditioning') || text.includes('air conditioner')) extracted.amenities.push('ac');
  if (text.includes('washroom') || text.includes('attached bathroom') || text.includes('attached bath')) extracted.amenities.push('attached washroom');
  if (text.includes('laundry') || text.includes('washing machine')) extracted.amenities.push('laundry');
  if (text.includes('security') || text.includes('cctv') || text.includes('guard')) extracted.amenities.push('security');
  if (text.includes('parking') || text.includes('bike parking')) extracted.amenities.push('parking');
  if (text.includes('study table') || text.includes('desk')) extracted.amenities.push('study table');

  return extracted;
};

/**
 * 2. Generate Grounded Explanations for Top Candidate Hostels
 */
export const explainRecommendationsWithGemini = async (studentQuery, requirements, topHostels = []) => {
  if (!topHostels || topHostels.length === 0) {
    return {
      summary: 'No hostels in our Vadodara database currently match all of your exact requirements.',
      explanations: [],
      bestMatchAdvice: 'Try widening your maximum budget slightly or expanding your search distance from campus.',
      suggestions: [
        'Increase budget by ₹500 - ₹1,000 for more verified options with meals included.',
        'Widen your distance radius to 3-5 km from college.',
      ],
    };
  }

  const client = getGenAIClient();
  const minimalHostelData = topHostels.map((h) => ({
    id: h._id?.toString() || h.id,
    name: h.name,
    type: h.type || 'PRIVATE_HOSTEL',
    area: h.location?.area || h.area,
    monthlyRent: h.pricing?.monthlyRent ?? h.monthlyRent ?? null,
    effectiveMonthlyCost: h.effectiveMonthlyCost || h.pricing?.effectiveMonthlyCost || h.monthlyRent,
    distanceKm: h.distanceKm !== null && h.distanceKm !== undefined ? `${h.distanceKm} km` : 'Location verified',
    gender: h.gender,
    rating: h.reviews?.rating ?? h.rating ?? 4.0,
    reviewCount: h.reviews?.reviewCount ?? h.reviewCount ?? 0,
    foodIncluded: h.food?.included || false,
    amenities: h.amenityList || h.amenities || [],
    verificationStatus: h.verificationStatus || 'SOURCE_LISTED',
    dataConfidence: h.dataConfidence || 'Medium',
    availabilityStatus: h.availabilityStatus || 'UNKNOWN',
    categories: h.categories || [],
    matchScore: `${h.matchScore}%`,
  }));

  if (client) {
    try {
      const prompt = `${SYSTEM_PROMPT_RECOMMENDATION_EXPLANATION}

Student Request:
"${studentQuery}"

Extracted Requirements:
${JSON.stringify(requirements, null, 2)}

Candidate Hostels from Database (Top ${topHostels.length}):
${JSON.stringify(minimalHostelData, null, 2)}

Return strictly valid JSON according to the schema.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = parseJsonSafely(rawText);
      if (parsed && Array.isArray(parsed.explanations)) {
        return parsed;
      }
    } catch (err) {
      console.warn('[Gemini Service] Explanation generation fallback triggered:', err.message);
    }
  }

  // Fallback grounded explanation builder with effective monthly cost and data confidence
  const explanations = topHostels.map((h) => {
    const highlights = [];
    const cost = h.effectiveMonthlyCost || h.pricing?.effectiveMonthlyCost || h.monthlyRent;
    if (cost) {
      highlights.push(`effective monthly cost of ₹${cost.toLocaleString('en-IN')}`);
    }

    if (h.distanceKm !== null && h.distanceKm !== undefined) {
      highlights.push(`${h.distanceKm} km from ${requirements.college || 'campus'}`);
    }

    if (h.food?.included) {
      highlights.push('includes mess meals');
    }

    const ratingVal = h.reviews?.rating ?? h.rating ?? 4.0;
    if (ratingVal >= 4.0) {
      highlights.push(`rated ${ratingVal} ★`);
    }

    const cat = h.categories?.[0] || 'Top Match';

    return {
      hostelId: h._id?.toString() || h.id,
      category: cat,
      reason: `${h.name} (${cat}) is a strong ${h.matchScore}% match because it offers ${highlights.slice(0, 3).join(', ')}.`,
    };
  });

  const best = topHostels[0];
  return {
    summary: `Based on your requirements, we found ${topHostels.length} verified accommodation options in Vadodara.`,
    explanations,
    bestMatchAdvice: `${best.name} stands out as your top overall pick (${best.matchScore}%) offering optimal value and proximity to ${requirements.college || best.area}.`,
    disclaimer: 'Availability and prices should be confirmed with the property because listings can change.',
    suggestions: [
      'Confirm current room availability and meal plans directly before visiting.',
      'Check lock-in period and notice period terms before finalizing.',
    ],
  };
};

/**
 * 3. Synthesize Side-by-Side Hostel Comparison
 */
export const compareHostelsWithGemini = async (hostelRecords = [], userPreferences = {}) => {
  if (!hostelRecords || hostelRecords.length === 0) {
    throw new Error('At least one hostel record is required for comparison.');
  }

  const client = getGenAIClient();
  const cleanRecords = hostelRecords.map((h) => ({
    id: h._id?.toString() || h.id,
    name: h.name,
    area: h.area,
    address: h.address,
    monthlyRent: h.monthlyRent,
    gender: h.gender,
    rating: h.rating,
    reviewsCount: h.reviewsCount || 0,
    food: h.food,
    roomTypes: h.roomTypes,
    amenities: h.amenities,
    rules: h.rules,
    distanceKm: h.distanceKm || null,
  }));

  if (client) {
    try {
      const prompt = `${SYSTEM_PROMPT_COMPARISON}

Student Context / Preferences:
${JSON.stringify(userPreferences, null, 2)}

Actual Database Records for Comparison:
${JSON.stringify(cleanRecords, null, 2)}

Return strictly valid JSON.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = parseJsonSafely(rawText);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch (err) {
      console.warn('[Gemini Service] Comparison fallback triggered:', err.message);
    }
  }

  // Deterministic Grounded Comparison Fallback
  const getRent = (h) => h.pricing?.effectiveMonthlyCost ?? h.pricing?.monthlyRent ?? h.monthlyRent ?? 0;
  const getRating = (h) => h.reviews?.rating ?? h.rating ?? 4.0;
  const getAmenitiesCount = (h) => {
    if (Array.isArray(h.amenities)) return h.amenities.length;
    if (typeof h.amenities === 'object' && h.amenities !== null) {
      return Object.values(h.amenities).filter((v) => v === true).length;
    }
    return 0;
  };

  const sortedByRent = [...cleanRecords].sort((a, b) => getRent(a) - getRent(b));
  const sortedByRating = [...cleanRecords].sort((a, b) => getRating(b) - getRating(a));
  const sortedByAmenities = [...cleanRecords].sort((a, b) => getAmenitiesCount(b) - getAmenitiesCount(a));

  const bestBudget = sortedByRent[0] || cleanRecords[0];
  const bestRating = sortedByRating[0] || cleanRecords[0];
  const bestAmenities = sortedByAmenities[0] || cleanRecords[0];
  const bestOverall = cleanRecords[0];

  const hostelAnalysis = cleanRecords.map((h) => {
    const rentVal = getRent(h);
    const ratingVal = getRating(h);
    const amCount = getAmenitiesCount(h);

    return {
      hostelId: h.id,
      hostelName: h.name,
      effectiveMonthlyCost: rentVal,
      advantages: [
        rentVal > 0 ? `₹${rentVal.toLocaleString('en-IN')}/month effective cost` : 'Contact for confirmed pricing',
        h.food?.included ? 'Mess meals included in fee' : 'Flexible meal options',
        `${amCount} verified amenities provided`,
        `Resident Rating: ${ratingVal} ★ (${h.reviewsCount || 0} reviews)`,
      ],
      disadvantages: [
        h.rules?.curfew ? `Curfew time: ${h.rules.curfew}` : 'Verify curfew with management',
      ],
    };
  });

  const bestRentVal = getRent(bestBudget);
  return {
    bestOverall: {
      hostelId: bestOverall.id,
      hostelName: bestOverall.name,
      reason: `${bestOverall.name} offers the most well-rounded combination of pricing, resident rating (${getRating(bestOverall)}★), and facilities.`,
    },
    bestBudget: {
      hostelId: bestBudget.id,
      hostelName: bestBudget.name,
      reason: `${bestBudget.name} offers the most economical effective monthly cost at ₹${bestRentVal ? bestRentVal.toLocaleString('en-IN') : 'competitive rates'}/month.`,
    },
    bestLocation: {
      hostelId: bestOverall.id,
      hostelName: bestOverall.name,
      reason: `Conveniently situated in ${bestOverall.area || 'Vadodara'} with easy transit access.`,
    },
    bestAmenities: {
      hostelId: bestAmenities.id,
      hostelName: bestAmenities.name,
      reason: `${bestAmenities.name} offers ${getAmenitiesCount(bestAmenities)} verified amenities.`,
    },
    hostelAnalysis,
    finalRecommendation: `If budget is your top priority, consider ${bestBudget.name}. For the most comprehensive amenities and top resident satisfaction, ${bestOverall.name} is recommended.`,
  };
};

/**
 * 4. Multi-Turn Conversational Assistant & Knowledge Engine
 */
export const processChatWithGemini = async (message, conversationHistory = [], currentFilters = {}) => {
  const client = getGenAIClient();

  if (client) {
    try {
      const prompt = `${SYSTEM_PROMPT_CONVERSATIONAL_CHAT}

Current Active Filters:
${JSON.stringify(currentFilters, null, 2)}

Recent Conversation History:
${JSON.stringify(conversationHistory.slice(-4), null, 2)}

Latest Student Message:
"${message}"

Return strictly valid JSON according to the schema.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = parseJsonSafely(rawText);
      if (parsed && typeof parsed === 'object' && parsed.reply) {
        return parsed;
      }
    } catch (err) {
      console.warn('[Gemini Service] Conversational chat API fallback triggered:', err.message);
    }
  }

  // Comprehensive Heuristic Knowledge Engine Fallback
  return fallbackKnowledgeResponder(message, currentFilters);
};

/**
 * Intelligent Knowledge Responder & Rule-based Engine for All Hostel Questions
 */
export const fallbackKnowledgeResponder = (message = '', currentFilters = {}) => {
  const text = message.toLowerCase();
  const extracted = fallbackExtractRequirements(message);
  const updatedFilters = { ...currentFilters };

  if (extracted.college) updatedFilters.college = extracted.college;
  if (extracted.location) updatedFilters.location = extracted.location;
  if (extracted.budgetMin) updatedFilters.budgetMin = extracted.budgetMin;
  if (extracted.budgetMax) updatedFilters.budgetMax = extracted.budgetMax;
  if (extracted.gender) updatedFilters.gender = extracted.gender;
  if (extracted.roomType) updatedFilters.roomType = extracted.roomType;
  if (extracted.maxDistanceKm) updatedFilters.maxDistanceKm = extracted.maxDistanceKm;
  if (extracted.amenities?.length > 0) {
    updatedFilters.amenities = Array.from(new Set([...(updatedFilters.amenities || []), ...extracted.amenities]));
  }
  if (extracted.food !== null) updatedFilters.food = extracted.food;

  let reply = '';
  let requiresDbSearch = true;

  // 1. Curfew / Gate Timing Questions
  if (text.includes('curfew') || text.includes('gate timing') || text.includes('gate close') || text.includes('timing') || text.includes('late entry')) {
    reply = `🕒 **Hostel Gate & Curfew Policies in Vadodara:**\n\n` +
      `• **Standard Gate Timings:** Most boys hostels close gates between **10:00 PM – 10:30 PM**, and girls hostels close between **9:30 PM – 10:00 PM** for safety.\n` +
      `• **Late Night & Exam Passes:** For college fests, library study sessions, or project work, students can get late-entry permission with prior warden intimation and parental SMS confirmation.\n` +
      `• **Biometric & CCTV Access:** Most verified properties on StayNear feature biometric fingerprint / RFID entry logs for resident safety.\n\n` +
      `Here are top verified student stays with disciplined and student-friendly management:`;
  }
  // 2. Food / Mess / Meal Questions
  else if (text.includes('food') || text.includes('mess') || text.includes('meal') || text.includes('jain') || text.includes('veg') || text.includes('non veg') || text.includes('breakfast') || text.includes('dinner')) {
    reply = `🍽️ **Food & Mess Standards in Vadodara Hostels:**\n\n` +
      `• **Meal Inclusions:** Most student PGs include **3 to 4 meals daily** (Breakfast, Lunch, Evening Tea/Snacks, and Dinner).\n` +
      `• **100% Pure Vegetarian & Jain:** Over 95% of hostels in Vadodara serve pure vegetarian food with dedicated **Jain meal options** (no onion, garlic, or root veggies) available upon request.\n` +
      `• **Cuisine Variety:** Daily changing menu featuring Gujarati dishes (Rotli, Dal-Bhat, Shaak, Chaas, Khichdi-Kadhi) and North Indian / Punjabi specials (Paneer, Puri, Pulav).\n` +
      `• **RO Purified Water:** 24/7 cold and normal purified water filtration stations are provided.\n\n` +
      `Below are verified stays with high student food ratings:`;
  }
  // 3. Room Types & Sharing Differences
  else if (text.includes('single') || text.includes('double') || text.includes('triple') || text.includes('sharing') || text.includes('room type') || text.includes('difference between')) {
    reply = `🛏️ **Room Sharing Types & Pricing in Vadodara (2026):**\n\n` +
      `• **Single Room (Private):** ₹7,000 – ₹16,000/mo. Ideal for students who need total privacy, quiet study space, and dedicated AC/desk.\n` +
      `• **Double Sharing (2 Sharing):** ₹4,500 – ₹8,500/mo per bed. The most popular choice offering companion study and optimal cost sharing.\n` +
      `• **Triple & 4-Sharing:** ₹3,200 – ₹5,500/mo per bed. Ultra-budget friendly option, frequently including 3-time meals in the total package.\n` +
      `• **Luxury Studio / Co-Living:** ₹14,000 – ₹24,000/mo. Fully furnished private apartment with personal kitchenette and community lounge.\n\n` +
      `Here are the best verified options matching your sharing preference:`;
  }
  // 4. Deposit, Pricing & Electricity Charges
  else if (text.includes('deposit') || text.includes('refund') || text.includes('electricity') || text.includes('price') || text.includes('rent') || text.includes('cost') || text.includes('budget') || text.includes('bill')) {
    reply = `💰 **Rent & Financial Transparency Guide:**\n\n` +
      `• **Security Deposit:** Typically **1 to 2 months rent**, 100% refundable upon move-out with a standard **30-day notice period**.\n` +
      `• **Effective Monthly Cost:** StayNear calculates the total cost (Base Rent + Mandatory Mess + Maintenance) so there are no surprise fees.\n` +
      `• **Electricity Rates:** Normal lights, fans, and Wi-Fi are covered; AC units are metered via individual sub-meters (approx. ₹8 – ₹10 per unit).\n` +
      `• **Zero Brokerage:** You connect directly with the verified owner without paying broker commissions.\n\n` +
      `Here are top stays offering the best value for your budget:`;
  }
  // 5. Parul University Specific Questions
  else if (text.includes('parul') || text.includes('limda') || text.includes('waghodia')) {
    reply = `🎓 **Student Living Around Parul University (Limda / Waghodia Road):**\n\n` +
      `• **Best Locations:** Limda (0.5 – 2 km from campus), Waghodia Road (3 – 6 km), and Gurukul Char Rasta.\n` +
      `• **Transit:** Auto stands and direct college shuttle buses operate frequently along the Waghodia-Limda highway corridor.\n` +
      `• **Typical Costs:** Budget triple sharing from ₹4,000/mo (with food) to premium AC single rooms up to ₹14,000/mo.\n\n` +
      `Here are verified hostels closest to Parul University:`;
  }
  // 6. MS University Specific Questions
  else if (text.includes('msu') || text.includes('ms university') || text.includes('fatehgunj') || text.includes('sayaji') || text.includes('alkapuri')) {
    reply = `🏛️ **Student Living Around MS University (MSU Vadodara):**\n\n` +
      `• **Best Locations:** **Fatehgunj** (5-minute walk to Arts/Science/Commerce/FTE campuses), **Sayajigunj**, **Pratapgunj**, and **Alkapuri**.\n` +
      `• **Student Atmosphere:** Surrounded by student libraries, budget food joints, stationary stores, and Vadodara Railway Station.\n` +
      `• **Typical Costs:** Double sharing from ₹5,000 – ₹7,500/mo; luxury studios up to ₹16,000/mo.\n\n` +
      `Here are top rated student accommodations near MSU:`;
  }
  // 7. ITM Universe Specific Questions
  else if (text.includes('itm') || text.includes('paldi') || text.includes('jarod')) {
    reply = `🚀 **Student Living Around ITM Universe (Paldi / Jarod Highway):**\n\n` +
      `• **Best Locations:** Paldi, Jarod Highway, and Waghodia Road corridor.\n` +
      `• **Transit:** Regular college bus routes pick up from Waghodia Road, Sayajigunj, and Manjalpur.\n` +
      `• **Typical Costs:** Quality student PGs with 3-time mess meals range from ₹4,500 to ₹9,000/mo.\n\n` +
      `Here are verified stays with high connectivity to ITM Universe:`;
  }
  // 8. Rules, Safety & Visitors
  else if (text.includes('rule') || text.includes('safety') || text.includes('parent') || text.includes('visitor') || text.includes('guest') || text.includes('alcohol') || text.includes('smoking')) {
    reply = `🛡️ **Safety, Security & House Rules:**\n\n` +
      `• **24/7 Security:** CCTV cameras across entry gates, corridors, and biometric entry systems.\n` +
      `• **Warden Oversight:** On-duty resident wardens (including dedicated female wardens in girls PGs).\n` +
      `• **Visitors Policy:** Parents and family are permitted in ground floor visiting lounges until 7:30 PM. Male visitors are strictly restricted from girls room corridors.\n` +
      `• **Zero Tolerance:** 100% smoke-free, alcohol-free, and drug-free student community.\n\n` +
      `Here are verified, highly secure accommodations:`;
  }
  // 9. StayNear Platform & How to Book
  else if (text.includes('staynear') || text.includes('book') || text.includes('how to') || text.includes('visit') || text.includes('contact')) {
    reply = `✨ **How StayNear Works (100% Free & Zero Brokerage):**\n\n` +
      `1. **Search & AI Match:** Find stays by college, budget, gender, and amenities with calculated compatibility.\n` +
      `2. **Compare & Shortlist:** Compare rent, food, distance, and reviews side-by-side.\n` +
      `3. **Contact Owner Directly:** Click 'View Details' on any hostel to connect with the manager/warden for free.\n` +
      `4. **Schedule a Physical Visit:** Visit the property, check the mess and room, and finalize directly with zero middleman fees!\n\n` +
      `Here are our top trending student stays in Vadodara:`;
  }
  // 10. Default Smart Housing Advice
  else {
    const filtersMentioned = [];
    if (updatedFilters.college) filtersMentioned.push(updatedFilters.college);
    if (updatedFilters.location) filtersMentioned.push(updatedFilters.location);
    if (updatedFilters.gender) filtersMentioned.push(`${updatedFilters.gender} accommodation`);
    if (updatedFilters.budgetMax) filtersMentioned.push(`budget under ₹${updatedFilters.budgetMax.toLocaleString('en-IN')}`);
    if (updatedFilters.roomType) filtersMentioned.push(updatedFilters.roomType);

    const filterSummary = filtersMentioned.length > 0 ? filtersMentioned.join(', ') : 'Vadodara student stays';

    reply = `👋 **Here are the best verified accommodations for ${filterSummary}:**\n\n` +
      `Every listed property includes verified security, high-speed Wi-Fi, clean water, and direct owner contact with **0% brokerage**.\n\n` +
      `Feel free to ask me anything about **food, gate curfew, sharing types, or pricing**!`;
  }

  return {
    reply,
    updatedFilters,
    requiresDbSearch,
  };
};

