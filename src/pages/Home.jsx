import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, ShieldCheck, HeartHandshake,
  Compass, MapPin, Star, Building, CheckCircle2, ChevronRight, School
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import HostelCard from '../components/HostelCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { QUICK_FILTERS } from '../data/mockData';
import { hostelService } from '../services/hostelService';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const [featuredHostels, setFeaturedHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState('parul');
  const { applyQuickFilter } = useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await hostelService.getFeaturedHostels();
        setFeaturedHostels(res.data);
      } catch (err) {
        console.error('Failed to load featured hostels:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleQuickFilterClick = (filterObj) => {
    applyQuickFilter(filterObj.filter);
    const params = new URLSearchParams();
    if (filterObj.filter.college) params.set('college', filterObj.filter.college);
    if (filterObj.filter.maxBudget) params.set('maxBudget', filterObj.filter.maxBudget);
    if (filterObj.filter.gender) params.set('gender', filterObj.filter.gender);
    if (filterObj.filter.roomType) params.set('roomType', filterObj.filter.roomType);
    if (filterObj.filter.food) params.set('food', 'true');

    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: `/find?${params.toString()}` },
          message: `⚠️ Please sign in or register first to access ${filterObj.label} hostels.`,
        },
      });
      return;
    }

    navigate(`/find?${params.toString()}`);
  };

  const handleProtectedNavigate = (targetPath, featureLabel) => {
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: targetPath },
          message: `⚠️ Please sign in or register first to access ${featureLabel}.`,
        },
      });
      return;
    }
    navigate(targetPath);
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Cinematic Modern Hero Background with Cozy Room Aesthetic */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/hero-room.png"
            alt="Modern Student Accommodation Vadodara"
            className="w-full h-full object-cover object-center scale-100 filter brightness-[0.88] contrast-[1.03] transition-all duration-700"
          />
          {/* Multi-layered refined gradients for text readability and warm ambiance */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-dark-900/35" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-dark-900/20 to-dark-900/70" />
          <div className="absolute inset-0 bg-black/15 backdrop-blur-[0.5px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 backdrop-blur-md border border-white/15 text-primary-300 text-xs sm:text-sm font-semibold shadow-xl">
            <Sparkles className="w-4 h-4 text-accent-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Vadodara's First Dedicated Student Housing AI</span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.1]">
              Find a place that <br className="hidden sm:inline" />
              <span className="text-gradient">fits your life.</span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
              AI-powered PG and hostel discovery for students in Vadodara.
              Match by college, budget, food taste & amenities in seconds.
            </p>
          </div>

          {/* Main Search Interface & AI search tab */}
          <div className="pt-2">
            <SearchBar />
          </div>

          {/* Social Proof Metric Pill */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 pt-6 text-gray-400 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-white text-base">500+</span>
              <span>Verified Beds</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-white text-base">₹0</span>
              <span>Brokerage Fees</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-white text-base">3 Colleges</span>
              <span>Parul, MSU, ITM</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK FILTERS SECTION */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-y border-white/8 bg-dark-950/60 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3 sm:hidden text-xs text-gray-400 uppercase tracking-wider font-semibold">
            <span>Quick Filters:</span>
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {QUICK_FILTERS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleQuickFilterClick(item)}
                className="whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-white/5 hover:bg-white/12 text-gray-300 hover:text-white border border-white/10 hover:border-primary-500/50 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED HOSTELS SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 text-primary-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Star className="w-4 h-4 fill-primary-400" /> Handpicked Stays
            </div>
            <h2 className="section-title">Featured Student Accommodations</h2>
            <p className="section-subtitle">
              Verified facilities near top Vadodara educational hubs.
            </p>
          </div>

          {/* College Distance Selector */}
          <div className="flex items-center gap-2 bg-dark-800 p-1.5 rounded-2xl border border-white/10">
            <span className="text-xs text-gray-400 px-2 font-medium flex items-center gap-1">
              <School className="w-3.5 h-3.5" /> Near:
            </span>
            {[
              { id: 'parul', label: 'Parul' },
              { id: 'ms', label: 'MS Univ' },
              { id: 'itm', label: 'ITM' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCollege(c.id)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                  selectedCollege === c.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hostel Grid */}
        {loading ? (
          <LoadingSkeleton count={3} type="card" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredHostels.map((hostel) => (
              <HostelCard
                key={hostel.id}
                hostel={hostel}
                selectedCollege={selectedCollege}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <button
            onClick={() => handleProtectedNavigate('/find', 'all Vadodara hostel listings')}
            className="btn-secondary text-sm px-8 py-3.5"
          >
            Explore All 82+ Listings in Vadodara <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4. IMAGE-BASED POPULAR CATEGORIES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold text-accent-400 tracking-wider">
            Explore By Lifestyle
          </span>
          <h2 className="section-title mt-2">Tailored For Every Student Need</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Boys PGs',
              count: '45+ Verified Properties',
              image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80',
              link: '/find?gender=boys',
            },
            {
              title: 'Girls Hostels',
              count: '38+ Verified Properties with 24/7 Security',
              image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
              link: '/find?gender=girls',
            },
            {
              title: 'Co-Living & Studio',
              count: '24+ Modern Community Spaces',
              image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=600&q=80',
              link: '/find?gender=co-living',
            },
            {
              title: 'Budget Stays (<₹7k)',
              count: 'Meals & Wi-Fi included',
              image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
              link: '/find?maxBudget=7000',
            },
          ].map((cat, i) => (
            <div
              key={i}
              onClick={() => handleProtectedNavigate(cat.link, cat.title)}
              className="group relative h-72 rounded-3xl overflow-hidden border border-white/10 shadow-xl cursor-pointer"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <h3 className="font-display font-bold text-white text-xl group-hover:text-primary-400 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-gray-300 text-xs mt-1">{cat.count}</p>
                <div className="flex items-center gap-1 text-primary-400 text-xs font-semibold mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Browse Category</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHY STAYNEAR VALUE PROPOSITION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-white/10 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase font-bold text-primary-400 tracking-wider">
                The Student Advantage
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white leading-tight">
                Why thousands of students trust StayNear in Vadodara
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Finding a PG in a new city shouldn't involve wandering streets in the heat or paying exorbitant brokerage. StayNear digitizes the entire experience.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  {
                    title: '100% Zero Brokerage',
                    desc: 'Direct connection with owners and wardens without any middlemen.',
                  },
                  {
                    title: 'College Proximity Match',
                    desc: 'Calculate exact transit times and distances from Parul, MSU, and ITM campuses.',
                  },
                  {
                    title: 'AI Smart Compatibility Score',
                    desc: 'Tell our AI what you care about and receive calibrated percentile match scores.',
                  },
                  {
                    title: 'Verified Food & Hygiene Audits',
                    desc: 'Know meal schedules, pure-veg options, and resident food feedback up-front.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold text-sm">{item.title}</h4>
                      <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => handleProtectedNavigate('/ai-finder', 'StayNear AI Matcher')}
                  className="btn-primary text-sm py-3 px-6"
                >
                  <Sparkles className="w-4 h-4" /> Try StayNear AI Matcher
                </button>
              </div>
            </div>

            {/* AI Assistant Interactive Card Preview */}
            <div className="bg-dark-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-base">StayNear AI Engine</h4>
                  <p className="text-xs text-gray-400">Natural language hostel advisor</p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="bg-primary-600/20 border border-primary-500/30 p-3.5 rounded-2xl text-primary-200">
                  "I'm joining Parul University for B.Tech. Need a boys PG under ₹7,000 with 3 meals a day, AC, and high-speed Wi-Fi within walking distance."
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-gray-300 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                    <span>94% Match Found</span>
                    <span>Parul Heights Hostel</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Located just 0.8 km from Parul campus. All meals included, power backup, study desks, and within your ₹7,000 budget bracket.
                  </p>
                  <button
                    onClick={() => handleProtectedNavigate('/hostel/parul-heights-hostel', 'Parul Heights Hostel details')}
                    className="inline-flex items-center gap-1 text-xs text-primary-400 font-semibold hover:underline pt-1"
                  >
                    View Recommendation Details <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOR OWNERS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-primary-900/50 via-primary-800/30 to-accent-900/40 border border-primary-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Are you a Hostel or PG Owner in Vadodara?
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
            List your rooms to thousands of verified students looking for housing around Parul University, MS University, and ITM Universe.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/register" className="btn-primary text-sm py-3 px-8">
              List Your Property For Free
            </Link>
            <Link to="/about" className="btn-secondary text-sm py-3 px-8">
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
