import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LayoutGrid, List, Map as MapIcon, SlidersHorizontal,
  ArrowUpDown, School, X, Search, Sparkles, RotateCcw
} from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import HostelCard from '../components/HostelCard';
import MapView from '../components/MapView';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { hostelService } from '../services/hostelService';
import { useSearch } from '../context/SearchContext';

export const FindHostel = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, updateFilters, resetFilters } = useSearch();

  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'map'
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [hoveredHostelId, setHoveredHostelId] = useState(null);
  const [searchQueryInput, setSearchQueryInput] = useState('');

  // Sync initial URL search params with filters
  useEffect(() => {
    const paramsObj = {};
    const area = searchParams.get('area');
    const maxBudget = searchParams.get('maxBudget');
    const minBudget = searchParams.get('minBudget');
    const gender = searchParams.get('gender');
    const roomType = searchParams.get('roomType');
    const food = searchParams.get('food');
    const college = searchParams.get('college');
    const search = searchParams.get('search');

    if (area) paramsObj.area = area;
    if (maxBudget) paramsObj.maxBudget = maxBudget;
    if (minBudget) paramsObj.minBudget = minBudget;
    if (gender) paramsObj.gender = gender;
    if (roomType) paramsObj.roomType = roomType;
    if (food) paramsObj.food = food === 'true';
    if (search) {
      paramsObj.search = search;
      setSearchQueryInput(search);
    }
    if (college) {
      paramsObj.college = college;
      setSelectedCollege(college);
    }

    if (Object.keys(paramsObj).length > 0) {
      updateFilters(paramsObj);
    }
  }, [searchParams]);

  // Fetch hostels whenever filters, sort or selected college changes
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const queryFilters = {
          ...filters,
        };
        if (selectedCollege && !queryFilters.college) {
          queryFilters.college = selectedCollege;
        }

        const res = await hostelService.getHostels(queryFilters, sortBy);
        setHostels(res.data || []);
      } catch (err) {
        console.error('Failed to load hostels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [filters, sortBy, selectedCollege]);

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
    if (newFilters.college !== undefined) {
      setSelectedCollege(newFilters.college);
    }
  };

  const handleInlineSearch = (e) => {
    e.preventDefault();
    handleFilterChange({ search: searchQueryInput, area: searchQueryInput });
  };

  const handleClearAll = () => {
    setSearchQueryInput('');
    setSelectedCollege('');
    resetFilters();
    setSearchParams({});
  };

  return (
    <div className="relative min-h-screen bg-dark-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Dim Atmospheric Student Hostel Background Wallpaper */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1920&q=80"
          alt="Vadodara Student Hostel Background"
          className="w-full h-full object-cover object-center filter brightness-[0.20] contrast-105 scale-105"
        />
        {/* Layered dark gradients for clear text and card contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/90 to-dark-900/80" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-dark-900/60 to-dark-900" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Top Search & Control Bar */}
        <div className="bg-dark-800/85 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/8 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                Student Stays in Vadodara
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Showing <span className="text-white font-semibold">{hostels.length}</span> verified PGs & hostels
              </p>
            </div>

            {/* Quick Search Form */}
            <form onSubmit={handleInlineSearch} className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, area (e.g. Fatehgunj, Waghodia)..."
                  value={searchQueryInput}
                  onChange={(e) => setSearchQueryInput(e.target.value)}
                  className="input-field text-sm pl-10 pr-4 py-2.5 w-full bg-dark-900 border-white/10"
                />
              </div>
              <button type="submit" className="btn-primary text-xs py-2.5 px-4 whitespace-nowrap">
                Search
              </button>
            </form>
          </div>

          {/* Controls: College target, Sort, View Modes, Mobile Filter Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* College selector */}
              <div className="flex items-center gap-1.5 bg-dark-900 px-3 py-2 rounded-xl border border-white/10 text-xs">
                <School className="w-3.5 h-3.5 text-primary-400" />
                <select
                  value={selectedCollege || filters.college || ''}
                  onChange={(e) => {
                    setSelectedCollege(e.target.value);
                    handleFilterChange({ college: e.target.value });
                  }}
                  className="bg-transparent text-white focus:outline-none cursor-pointer [&>option]:bg-dark-900"
                >
                  <option value="">All Vadodara Campuses</option>
                  <option value="parul">Parul University</option>
                  <option value="ms">MS University (MSU)</option>
                  <option value="itm">ITM SLS Baroda Univ</option>
                  <option value="navrachana">Navrachana Univ</option>
                  <option value="sigma">Sigma University</option>
                  <option value="gsfc">GSFC University</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5 bg-dark-900 px-3 py-2 rounded-xl border border-white/10 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer [&>option]:bg-dark-900"
                >
                  <option value="recommended">Recommended</option>
                  <option value="priceLow">Price: Low → High</option>
                  <option value="priceHigh">Price: High → Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="nearest">Nearest to Campus</option>
                </select>
              </div>
            </div>

            {/* View Mode Buttons & Mobile Filter */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-dark-900 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'map' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Map & List Split View"
                >
                  <MapIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </button>
            </div>
          </div>
        </div>

        {/* Layout Body: Sidebar + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar (Left) */}
          <div className="hidden lg:block lg:col-span-1">
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleClearAll}
            />
          </div>

          {/* Results Area (Right) */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <LoadingSkeleton count={4} type={viewMode === 'list' ? 'list' : 'card'} />
            ) : hostels.length === 0 ? (
              /* Empty State */
              <div className="card p-12 text-center max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-gray-500">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-xl text-white">No Hostels Found</h3>
                <p className="text-gray-400 text-sm mt-2 mb-6">
                  No accommodations matched your current filter criteria in Vadodara. Try broadening your budget or clearing area filters.
                </p>
                <button onClick={handleClearAll} className="btn-primary text-sm py-2.5 px-6">
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'map' ? (
              /* Map / List Split Layout */
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Left: Scrollable Hostel List */}
                <div className="xl:col-span-5 space-y-4 max-h-[700px] overflow-y-auto pr-2 no-scrollbar">
                  {hostels.map((hostel) => (
                    <div
                      key={hostel.id}
                      onMouseEnter={() => setHoveredHostelId(hostel.id)}
                      onMouseLeave={() => setHoveredHostelId(null)}
                      className={`transition-all rounded-2xl ${
                        hoveredHostelId === hostel.id ? 'ring-2 ring-primary-500' : ''
                      }`}
                    >
                      <HostelCard
                        hostel={hostel}
                        selectedCollege={selectedCollege}
                        view="list"
                      />
                    </div>
                  ))}
                </div>

                {/* Right: Map with markers */}
                <div className="xl:col-span-7 sticky top-24">
                  <MapView
                    hostels={hostels}
                    selectedHostelId={hoveredHostelId}
                    selectedCollege={selectedCollege}
                    height="h-[700px]"
                  />
                </div>
              </div>
            ) : viewMode === 'list' ? (
              /* List View */
              <div className="space-y-4">
                {hostels.map((hostel) => (
                  <HostelCard
                    key={hostel.id}
                    hostel={hostel}
                    selectedCollege={selectedCollege}
                    view="list"
                  />
                ))}
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {hostels.map((hostel) => (
                  <HostelCard
                    key={hostel.id}
                    hostel={hostel}
                    selectedCollege={selectedCollege}
                    view="grid"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Slide-Over Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fade-in">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs h-full bg-dark-900 border-l border-white/10 p-6 overflow-y-auto z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-white text-lg">Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onReset={() => {
                handleClearAll();
                setMobileFilterOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FindHostel;
