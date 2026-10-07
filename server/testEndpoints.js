import http from 'http';
import { startServer } from './server.js';
import { seedDatabase } from './seed.js';
import { closeDatabases } from './config/dbManager.js';

let BASE_URL = 'http://127.0.0.1:5000/api';

const makeRequest = async (path, options = {}) => {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

const runAllTests = async () => {
  console.log('==================================================');
  console.log(' Starting Stage 3 Automated API Verification Tests');
  console.log(' AI PG & Hostel Finder – Vadodara (StayNear)');
  console.log('==================================================\n');

  // 1. Seed database first
  await seedDatabase();

  // 2. Start server on dynamic port
  const { server } = await startServer(0);
  const actualPort = server.address().port;
  BASE_URL = `http://127.0.0.1:${actualPort}/api`;

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  };

  try {
    // Test 1: Health check
    const health = await makeRequest('/health');
    assert(
      health.status === 200 &&
      health.data.status === 'healthy' &&
      health.data.stage.includes('Stage 3'),
      '1. Server Health Check & Stage 3 Features'
    );

    // Test 2: Student Login
    const login = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'student@test.com', password: 'password' }),
    });
    assert(login.status === 200 && !!login.data.token, '2. Student Authentication Login');
    const studentToken = login.data.token;

    // Test 3: Admin Login
    const adminLogin = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@test.com', password: 'admin123' }),
    });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'ADMIN', '3. Admin Login');
    const adminToken = adminLogin.data.token;

    // Test 4: Current User Profile (GET /api/auth/me)
    const me = await makeRequest('/auth/me', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(me.status === 200 && me.data.user.email === 'student@test.com', '4. Get Current User (/api/auth/me)');

    // Test 5: Get Hostels list
    const hostels = await makeRequest('/hostels');
    assert(hostels.status === 200 && hostels.data.data.length > 0, '5. Get Hostels List (/api/hostels)');
    const sampleHostel = hostels.data.data[0];
    const secondHostel = hostels.data.data[1] || sampleHostel;

    // Test 6: Search Hostels with filter (budget, gender, college)
    const search = await makeRequest('/hostels/search?budgetMax=7000&gender=boys&college=parul&radius=5', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(search.status === 200 && Array.isArray(search.data.data), '6. Complex Hostel Search with Proximity');

    // Test 7: Geolocation Nearby Search (within 2 km)
    const nearby = await makeRequest('/hostels/nearby?latitude=22.2965&longitude=73.0169&radius=2');
    assert(nearby.status === 200 && nearby.data.data.length > 0, '7. Geolocation Nearby Search 2dsphere');

    // Test 8: Get Hostel by ID
    const singleHostel = await makeRequest(`/hostels/${sampleHostel._id}`);
    assert(singleHostel.status === 200 && singleHostel.data.data.name === sampleHostel.name, '8. Get Hostel by ID');

    // Test 9: Add to Favourites
    const addFav = await makeRequest(`/favourites/${sampleHostel._id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(addFav.status === 200 || addFav.status === 201, '9. Add Hostel to Favourites');

    // Test 10: Get Favourites list
    const getFavs = await makeRequest('/favourites', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(getFavs.status === 200 && getFavs.data.data.length > 0, '10. Get Favourites List');

    // Test 11: Remove from Favourites
    const removeFav = await makeRequest(`/favourites/${sampleHostel._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(removeFav.status === 200, '11. Remove Hostel from Favourites');

    // Test 12: Post Review (using unique test student)
    const newStudent = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Test Reviewer',
        email: `reviewer_${Date.now()}@test.com`,
        phone: '9876543211',
        password: 'password123',
      }),
    });
    const reviewToken = newStudent.data.token;

    const postReview = await makeRequest('/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${reviewToken}` },
      body: JSON.stringify({
        hostelId: sampleHostel._id,
        rating: 5,
        comment: 'Superb ambiance and healthy mess food!',
      }),
    });
    assert(postReview.status === 201, '12. Post Resident Review (/api/reviews)');

    // Test 13: Submit Enquiry to Owner
    const enquiry = await makeRequest('/enquiries', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        hostelId: sampleHostel._id,
        roomType: 'Double Sharing',
        message: 'Looking to move in next Monday. Is vacancy guaranteed?',
      }),
    });
    assert(enquiry.status === 201, '13. Student Enquiry Submission (/api/enquiries)');

    // Test 14: Admin Verification
    const verify = await makeRequest(`/admin/hostels/${sampleHostel._id}/verify`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ verificationStatus: 'VERIFIED' }),
    });
    assert(verify.status === 200, '14. Admin Hostel Verification (/api/admin/hostels/:id/verify)');

    // =========================================================================
    // STAGE 3: AI LAYER AUTOMATED ENDPOINT TESTS
    // =========================================================================

    // Test 15: AI Natural Language Search (POST /api/ai/search)
    const aiSearch = await makeRequest('/ai/search', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        message: 'I need a boys PG near Parul University under 7000 with food and WiFi within 3 km.',
      }),
    });
    assert(
      aiSearch.status === 200 &&
      aiSearch.data.success === true &&
      aiSearch.data.recommendations?.length > 0 &&
      typeof aiSearch.data.recommendations[0].matchScore === 'number' &&
      !!aiSearch.data.recommendations[0].reason,
      '15. AI Natural Language Search & Deterministic Ranking (/api/ai/search)'
    );

    // Test 16: Instant Requirement Extraction (POST /api/ai/extract)
    const aiExtract = await makeRequest('/ai/extract', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Looking for a single room girls hostel near MS University under ₹8,000 with AC',
      }),
    });
    assert(
      aiExtract.status === 200 &&
      aiExtract.data.success === true &&
      aiExtract.data.extracted.gender === 'girls' &&
      aiExtract.data.extracted.budgetMax === 8000,
      '16. AI Requirement Extraction & Sanitation (/api/ai/extract)'
    );

    // Test 17: AI Multi-Hostel Comparison Synthesis (POST /api/ai/compare)
    const aiCompare = await makeRequest('/ai/compare', {
      method: 'POST',
      body: JSON.stringify({
        hostelIds: [sampleHostel._id, secondHostel._id],
        userPreferences: { targetCollege: 'Parul University' },
      }),
    });
    assert(
      aiCompare.status === 200 &&
      aiCompare.data.success === true &&
      !!aiCompare.data.comparison &&
      !!aiCompare.data.comparison.finalRecommendation,
      '17. AI Multi-Hostel Grounded Comparison (/api/ai/compare)'
    );

    // Test 18: AI Conversational Chat Turn (POST /api/ai/chat)
    const aiChat = await makeRequest('/ai/chat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({
        message: 'Can you show me options with food and attached washroom?',
        conversationHistory: [
          { role: 'user', content: 'Looking for boys hostel near Parul' },
        ],
        currentFilters: { college: 'Parul University', gender: 'boys' },
      }),
    });
    assert(
      aiChat.status === 200 &&
      aiChat.data.success === true &&
      !!aiChat.data.reply &&
      Array.isArray(aiChat.data.recommendations),
      '18. AI Conversational Assistant Turn (/api/ai/chat)'
    );

    // Test 19: Personalized Student Recommendations (GET /api/ai/recommendations/personalized)
    const aiPersonalized = await makeRequest('/ai/recommendations/personalized', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(
      aiPersonalized.status === 200 &&
      aiPersonalized.data.success === true &&
      Array.isArray(aiPersonalized.data.recommendations),
      '19. Personalized Student Recommendations (/api/ai/recommendations/personalized)'
    );

    // Test 20: Admin Granular Checklist Verification (PUT /api/admin/hostels/:id/checklist-verify)
    const checklistVerify = await makeRequest(`/admin/hostels/${sampleHostel._id}/checklist-verify`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        addressVerified: true,
        ownerVerified: true,
        phoneVerified: true,
        priceVerified: true,
        amenitiesVerified: true,
        availabilityVerified: true,
        photosVerified: true,
        availabilityStatus: 'AVAILABLE',
      }),
    });
    assert(
      checklistVerify.status === 200 &&
      checklistVerify.data.data.verificationStatus === 'ADMIN_VERIFIED' &&
      checklistVerify.data.data.adminChecks.addressVerified === true,
      '20. Admin Granular Checklist Verification (/api/admin/hostels/:id/checklist-verify)'
    );

    // Test 21: Admin Mark Outdated (PUT /api/admin/hostels/:id/mark-outdated)
    const markOutdated = await makeRequest(`/admin/hostels/${sampleHostel._id}/mark-outdated`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      markOutdated.status === 200 &&
      markOutdated.data.data.availabilityStatus === 'UNKNOWN',
      '21. Admin Mark Property Outdated (/api/admin/hostels/:id/mark-outdated)'
    );

    // Test 22: Effective Monthly Cost in AI Search
    assert(
      typeof aiSearch.data.recommendations[0].effectiveMonthlyCost === 'number' &&
      aiSearch.data.recommendations[0].effectiveMonthlyCost > 0,
      '22. Effective Monthly Cost Validation on AI Search Results'
    );

    // Test 23: Data Confidence Output
    assert(
      ['High', 'Medium', 'Low'].includes(aiSearch.data.recommendations[0].dataConfidence),
      '23. AI Data Confidence Assignment (High / Medium / Low)'
    );

    console.log(`\n==================================================`);
    console.log(` Master Data & AI Engine Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`==================================================\n`);
  } catch (err) {
    console.error('Test execution exception:', err);
  } finally {
    server.close();
    await closeDatabases();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runAllTests();
