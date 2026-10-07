import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Heart, Search, Sparkles, Send, Scale, Edit3,
  CheckCircle, Clock, MapPin, School, Wallet, BookOpen, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import { enquiryService } from '../services/enquiryService';
import { studentService } from '../services/studentService';
import { aiService } from '../services/aiService';
import { hostelService } from '../services/hostelService';
import { MOCK_HOSTELS, AI_RECOMMENDATIONS } from '../data/mockData';
import HostelCard from '../components/HostelCard';
import { formatPrice } from '../utils/formatPrice';

export const Dashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const { favourites, compareList, removeFromCompare } = useSearch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [enquiries, setEnquiries] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [personalizedMatches, setPersonalizedMatches] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Arjun Patel',
    email: user?.email || 'student@test.com',
    phone: '9876543210',
    college: user?.college || 'Parul University',
    course: user?.course || 'B.Tech Computer Science',
    year: user?.year || '2nd Year',
    preferredLocation: 'Gotri Road',
    budget: user?.budget || 7000,
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saveStatus, setSaveStatus] = useState(false);

  // Sync profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.name || user.fullName || prev.name,
        email: user.email || prev.email,
        college: user.college || prev.college,
        course: user.course || prev.course,
        year: user.year || prev.year,
        budget: user.budget || prev.budget,
      }));
    }
  }, [user]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const enqRes = await enquiryService.getMyEnquiries();
        setEnquiries(enqRes.data || []);
        const sRes = await studentService.getRecentSearches();
        setRecentSearches(sRes.data || []);

        setLoadingAI(true);
        const aiRecs = await aiService.getPersonalizedRecommendations();
        if (aiRecs && aiRecs.recommendations) {
          setPersonalizedMatches(aiRecs.recommendations);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoadingAI(false);
      }
    };
    loadDashboardData();
  }, [user]);

  const [savedHostelsList, setSavedHostelsList] = useState([]);

  // Fetch real saved hostels dynamically
  useEffect(() => {
    const fetchSaved = async () => {
      if (!favourites || favourites.length === 0) {
        setSavedHostelsList([]);
        return;
      }
      try {
        const res = await hostelService.getHostels({});
        const all = res.data || [];
        const favSet = new Set(favourites.map((id) => String(id)));
        const matched = all.filter((h) => favSet.has(String(h.id || h._id || h.slug)));

        const matchedIds = new Set(matched.map((h) => String(h.id || h._id)));
        const missing = favourites.filter((id) => !matchedIds.has(String(id)));
        if (missing.length > 0) {
          const fetched = await Promise.allSettled(missing.map((id) => hostelService.getHostelById(id)));
          fetched.forEach((r) => {
            if (r.status === 'fulfilled' && r.value?.data) matched.push(r.value.data);
          });
        }
        setSavedHostelsList(matched);
      } catch (e) {
        console.error('Failed to load saved hostels in dashboard:', e);
      }
    };
    fetchSaved();
  }, [favourites]);

  const savedHostels = savedHostelsList;
  const fallbackRecommendedHostels = AI_RECOMMENDATIONS.map((rec) => ({
    ...rec,
    hostel: MOCK_HOSTELS.find((h) => h.id === rec.hostelId),
  })).filter((item) => item.hostel);

  const displayRecommendations =
    personalizedMatches.length > 0 ? personalizedMatches : fallbackRecommendedHostels;

  const handleProfileSave = async (e) => {
    e.preventDefault();
    await studentService.updateProfile(profileData);
    setIsEditingProfile(false);
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2500);
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-dark-900 pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="card p-8 sm:p-10 max-w-md w-full text-center space-y-6 border border-white/10 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center mx-auto text-white shadow-xl shadow-primary-900/40">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-white">Student Dashboard</h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Please sign in to view your profile, manage enquiries, and view AI-tailored accommodation recommendations.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link to="/login" className="btn-primary w-full justify-center py-3 text-sm font-semibold rounded-xl">
              Sign In to Dashboard
            </Link>
            <Link to="/" className="btn-secondary w-full justify-center py-2.5 text-xs rounded-xl text-gray-400">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-900/60 via-dark-800 to-dark-900 border border-primary-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
              {profileData.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                  Welcome back, {profileData.name?.split(' ')[0]}!
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30">
                  Student
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                {profileData.college} • {profileData.course}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/ai-finder" className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> AI Matcher
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="btn-secondary text-xs py-2.5 px-4 text-rose-400 hover:text-rose-300"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 no-scrollbar">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'saved', label: `Saved (${savedHostels.length})`, icon: Heart },
            { id: 'enquiries', label: `Enquiries (${enquiries.length})`, icon: Send },
            { id: 'ai', label: 'AI Matches', icon: Sparkles },
            { id: 'searches', label: 'Recent Searches', icon: Search },
            { id: 'compare', label: `Compare List (${compareList.length})`, icon: Scale },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 card p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-xl text-white">Student Profile Details</h3>
                  <p className="text-xs text-gray-400">Used by AI to automatically calibrate best hostel recommendations</p>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                )}
              </div>

              {saveStatus && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Profile details saved successfully!
                </div>
              )}

              {isEditingProfile ? (
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData((p) => ({ ...p, name: e.target.value }))}
                        className="input-field text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData((p) => ({ ...p, phone: e.target.value }))}
                        className="input-field text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">College</label>
                      <input
                        type="text"
                        value={profileData.college}
                        onChange={(e) => setProfileData((p) => ({ ...p, college: e.target.value }))}
                        className="input-field text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Course</label>
                      <input
                        type="text"
                        value={profileData.course}
                        onChange={(e) => setProfileData((p) => ({ ...p, course: e.target.value }))}
                        className="input-field text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Academic Year</label>
                      <input
                        type="text"
                        value={profileData.year}
                        onChange={(e) => setProfileData((p) => ({ ...p, year: e.target.value }))}
                        className="input-field text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Preferred Area</label>
                      <input
                        type="text"
                        value={profileData.preferredLocation}
                        onChange={(e) => setProfileData((p) => ({ ...p, preferredLocation: e.target.value }))}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Monthly Budget (₹)</label>
                      <input
                        type="number"
                        value={profileData.budget}
                        onChange={(e) => setProfileData((p) => ({ ...p, budget: Number(e.target.value) }))}
                        className="input-field text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button type="submit" className="btn-primary text-xs py-2 px-5">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="btn-secondary text-xs py-2 px-4"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <span className="text-xs text-gray-400 block">Full Name</span>
                    <span className="font-semibold text-white mt-0.5 block">{profileData.name}</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <span className="text-xs text-gray-400 block">Email Address</span>
                    <span className="font-semibold text-white mt-0.5 block">{profileData.email}</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <span className="text-xs text-gray-400 block">Contact Phone</span>
                    <span className="font-semibold text-white mt-0.5 block">{profileData.phone}</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <span className="text-xs text-gray-400 block">College</span>
                    <span className="font-semibold text-white mt-0.5 block">{profileData.college}</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <span className="text-xs text-gray-400 block">Course & Year</span>
                    <span className="font-semibold text-white mt-0.5 block">{profileData.course} ({profileData.year})</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <span className="text-xs text-gray-400 block">Monthly Target Budget</span>
                    <span className="font-semibold text-primary-400 mt-0.5 block">{formatPrice(profileData.budget)} / month</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats side card */}
            <div className="space-y-4">
              <div className="card p-6 space-y-4">
                <h4 className="font-display font-bold text-white text-base">Housing Tracker</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Shortlisted Hostels</span>
                    <span className="text-white font-bold">{savedHostels.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Dispatched Enquiries</span>
                    <span className="text-white font-bold">{enquiries.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Target College</span>
                    <span className="text-white font-bold">{profileData.college}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Saved Hostels */}
        {activeTab === 'saved' && (
          <div>
            {savedHostels.length === 0 ? (
              <div className="card p-12 text-center max-w-md mx-auto">
                <Heart className="w-8 h-8 text-rose-400 mx-auto mb-3" />
                <h4 className="text-white font-bold text-base">No Saved Hostels</h4>
                <p className="text-xs text-gray-400 mt-1 mb-4">You haven't bookmarked any hostels yet.</p>
                <Link to="/find" className="btn-primary text-xs py-2 px-4">Browse Hostels</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {savedHostels.map((h) => (
                  <HostelCard key={h.id} hostel={h} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Enquiries */}
        {activeTab === 'enquiries' && (
          <div className="card p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-xl text-white">Your Inquiries & Responses</h3>
            <p className="text-xs text-gray-400">Track messages sent to hostel wardens and owners</p>

            <div className="space-y-3 pt-2">
              {enquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{enq.hostelName}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          enq.status === 'replied'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {enq.status === 'replied' ? 'Replied by Owner' : 'Pending Warden Review'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">"{enq.message}"</p>
                    <span className="text-[10px] text-gray-500 block mt-1">{enq.date}</span>
                  </div>

                  <Link
                    to={`/hostel/${enq.hostelId}`}
                    className="btn-outline text-xs py-1.5 px-3 whitespace-nowrap"
                  >
                    View Hostel
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: AI Recommendations */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-xl text-white">AI Tailored Matches</h3>
              <p className="text-xs text-gray-400">Based on your student profile at {profileData.college}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayRecommendations.map(({ hostel, matchPercent, matchScore, reason }) => (
                <HostelCard
                  key={hostel.id || hostel._id}
                  hostel={hostel}
                  matchPercent={matchPercent || matchScore}
                  matchReason={reason}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Recent Searches */}
        {activeTab === 'searches' && (
          <div className="card p-6 sm:p-8 space-y-4">
            <h3 className="font-display font-bold text-xl text-white">Recent Discovery Queries</h3>
            <div className="space-y-2.5 pt-2">
              {recentSearches.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-primary-400" />
                    <div>
                      <p className="text-sm text-white font-medium">{s.query}</p>
                      <span className="text-[10px] text-gray-500">{s.date}</span>
                    </div>
                  </div>
                  <Link
                    to={`/ai-finder?q=${encodeURIComponent(s.query)}`}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Run Search Again
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Compare List */}
        {activeTab === 'compare' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xl text-white">Active Compare Shortlist</h3>
              {compareList.length > 0 && (
                <Link to="/compare" className="btn-primary text-xs py-2 px-4">
                  Open Comparison Matrix
                </Link>
              )}
            </div>

            {compareList.length === 0 ? (
              <div className="card p-8 text-center max-w-sm mx-auto">
                <Scale className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-xs text-gray-400 mb-3">No hostels selected for comparison.</p>
                <Link to="/find" className="btn-secondary text-xs py-2 px-4">Find Hostels</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {compareList.map((h) => (
                  <HostelCard key={h.id} hostel={h} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
