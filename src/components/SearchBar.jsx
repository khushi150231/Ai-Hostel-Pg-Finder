import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Wallet, Users, Home, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SearchBar = ({ onSearch, compact = false }) => {
  const [filters, setFilters] = useState({
    location: '',
    maxBudget: '',
    gender: '',
    roomType: '',
  });
  const [aiQuery, setAiQuery] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filters.location) params.set('area', filters.location);
    if (filters.maxBudget) params.set('maxBudget', filters.maxBudget);
    if (filters.gender) params.set('gender', filters.gender);
    if (filters.roomType) params.set('roomType', filters.roomType);

    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: `/find?${params.toString()}` },
          message: '⚠️ Please sign in or register first to search and view hostels.',
        },
      });
      return;
    }

    navigate(`/find?${params.toString()}`);
    onSearch?.(filters);
  };

  const handleAiSearch = (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: `/ai-finder?q=${encodeURIComponent(aiQuery)}` },
          message: '⚠️ Please sign in or register first to use the AI Hostel Finder.',
        },
      });
      return;
    }

    navigate(`/ai-finder?q=${encodeURIComponent(aiQuery)}`);
  };

  return (
    <div className={`w-full ${compact ? '' : 'max-w-4xl mx-auto'}`}>
      {/* Tabs */}
      {!compact && (
        <div className="flex gap-1 mb-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-1 w-fit mx-auto">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'basic' ? 'bg-white/10 text-white border border-white/15' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" /> Quick Search
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'ai' ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Ask AI
          </button>
        </div>
      )}

      {/* Basic Search */}
      {(activeTab === 'basic' || compact) && (
        <form onSubmit={handleSearch}>
          <div className={`flex ${compact ? 'flex-row gap-2' : 'flex-col sm:flex-row gap-3'} bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl p-3 shadow-2xl shadow-black/30`}>
            {/* Location */}
            <div className={`flex items-center gap-2.5 flex-1 px-3 py-2 ${!compact ? 'border-b sm:border-b-0 sm:border-r border-white/10' : ''}`}>
              <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Location or College..."
                value={filters.location}
                onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}
                className="bg-transparent text-white placeholder-gray-500 text-sm w-full focus:outline-none"
              />
            </div>

            {!compact && (
              <>
                {/* Budget */}
                <div className="flex items-center gap-2.5 flex-1 px-3 py-2 border-b sm:border-b-0 sm:border-r border-white/10">
                  <Wallet className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <select
                    value={filters.maxBudget}
                    onChange={(e) => setFilters((p) => ({ ...p, maxBudget: e.target.value }))}
                    className="bg-transparent text-sm w-full focus:outline-none appearance-none cursor-pointer text-white [&>option]:bg-gray-900 [&>option]:text-white"
                  >
                    <option value="" className="text-gray-500">Max Budget</option>
                    <option value="3000">Under ₹3,000</option>
                    <option value="5000">Under ₹5,000</option>
                    <option value="7000">Under ₹7,000</option>
                    <option value="10000">Under ₹10,000</option>
                    <option value="15000">Under ₹15,000</option>
                  </select>
                </div>

                {/* Gender */}
                <div className="flex items-center gap-2.5 flex-1 px-3 py-2 border-b sm:border-b-0 sm:border-r border-white/10">
                  <Users className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <select
                    value={filters.gender}
                    onChange={(e) => setFilters((p) => ({ ...p, gender: e.target.value }))}
                    className="bg-transparent text-sm w-full focus:outline-none appearance-none cursor-pointer text-white [&>option]:bg-gray-900"
                  >
                    <option value="">Any Gender</option>
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                    <option value="co-living">Co-living</option>
                  </select>
                </div>

                {/* Room Type */}
                <div className="flex items-center gap-2.5 flex-1 px-3 py-2">
                  <Home className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <select
                    value={filters.roomType}
                    onChange={(e) => setFilters((p) => ({ ...p, roomType: e.target.value }))}
                    className="bg-transparent text-sm w-full focus:outline-none appearance-none cursor-pointer text-white [&>option]:bg-gray-900"
                  >
                    <option value="">Any Room Type</option>
                    <option value="single">Single</option>
                    <option value="double">Double Sharing</option>
                    <option value="triple">Triple Sharing</option>
                    <option value="fourSharing">4 Sharing</option>
                  </select>
                </div>
              </>
            )}

            <button type="submit" className="btn-primary whitespace-nowrap flex-shrink-0">
              <Search className="w-4 h-4" />
              {compact ? '' : 'Find My Hostel'}
            </button>
          </div>
        </form>
      )}

      {/* AI Search */}
      {activeTab === 'ai' && !compact && (
        <form onSubmit={handleAiSearch}>
          <div className="bg-white/8 backdrop-blur-md border border-primary-500/30 rounded-2xl p-3 shadow-2xl shadow-primary-900/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary-400 flex-shrink-0 mt-2.5" />
              <textarea
                rows={3}
                placeholder="I need a boys PG near Parul University under ₹7,000 with food and Wi-Fi..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none resize-none"
              />
              <button type="submit" className="btn-primary self-end flex-shrink-0">
                <Sparkles className="w-4 h-4" /> Ask AI
              </button>
            </div>
          </div>
          <p className="text-center text-gray-600 text-xs mt-2">
            Describe what you're looking for in plain English. Our AI will find the best matches.
          </p>
        </form>
      )}
    </div>
  );
};

export default SearchBar;
