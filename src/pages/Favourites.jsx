import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Building2, Sparkles, Trash2 } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { hostelService } from '../services/hostelService';
import HostelCard from '../components/HostelCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

export const Favourites = () => {
  const { favourites, toggleFavourite } = useSearch();
  const [savedHostels, setSavedHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchSavedHostels = async () => {
      if (!favourites || favourites.length === 0) {
        setSavedHostels([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch all hostels from backend and filter by favourites
        const res = await hostelService.getHostels({});
        const all = res.data || [];
        
        const favSet = new Set(favourites.map((id) => String(id)));
        const matched = all.filter((h) => favSet.has(String(h.id || h._id || h.slug)));

        // If some favourites weren't in the standard page, try fetching individual IDs
        const matchedIds = new Set(matched.map((h) => String(h.id || h._id)));
        const missingIds = favourites.filter((id) => !matchedIds.has(String(id)));

        if (missingIds.length > 0) {
          const individualFetches = await Promise.allSettled(
            missingIds.map((id) => hostelService.getHostelById(id))
          );
          individualFetches.forEach((result) => {
            if (result.status === 'fulfilled' && result.value?.data) {
              matched.push(result.value.data);
            }
          });
        }

        if (isMounted) {
          setSavedHostels(matched);
        }
      } catch (err) {
        console.error('Failed to load favourite hostels:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSavedHostels();
    return () => {
      isMounted = false;
    };
  }, [favourites]);

  return (
    <div className="relative min-h-screen bg-dark-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Dim Atmospheric Student Hostel Background Wallpaper */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1920&q=80"
          alt="Vadodara Student Living Background"
          className="w-full h-full object-cover object-center filter brightness-[0.20] contrast-105 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/90 to-dark-900/80" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-dark-900/60 to-dark-900" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Heart className="w-4 h-4 fill-rose-400" /> Bookmarked Places
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              Saved Hostels & PGs
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              You have shortlisted {savedHostels.length} accommodation{savedHostels.length === 1 ? '' : 's'} in Vadodara
            </p>
          </div>

          {savedHostels.length > 0 && (
            <div className="flex items-center gap-3">
              <Link to="/find" className="btn-secondary text-xs py-2 px-4">
                Explore More Hostels
              </Link>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <LoadingSkeleton type="card" count={3} />
          </div>
        ) : savedHostels.length === 0 ? (
          <div className="card p-12 text-center max-w-lg mx-auto space-y-4 border border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl text-white">No Saved Hostels Yet</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Tap the heart icon on any hostel card to shortlist and easily compare your top choices later.
            </p>
            <div className="pt-2">
              <Link to="/find" className="btn-primary text-sm py-2.5 px-6 inline-flex items-center gap-2">
                Explore Hostels <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {savedHostels.map((hostel) => (
              <HostelCard key={hostel.id || hostel._id} hostel={hostel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favourites;
