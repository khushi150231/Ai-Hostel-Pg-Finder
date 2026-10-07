import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Users, Wifi, UtensilsCrossed,
  Wind, WashingMachine, Heart, Star, BadgeCheck, ArrowRight, Scale, Sparkles, ShieldCheck
} from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import Rating from './Rating';

const AMENITY_ICONS = {
  wifi: { icon: Wifi, label: 'Wi-Fi' },
  food: { icon: UtensilsCrossed, label: 'Food / Mess' },
  ac: { icon: Wind, label: 'AC' },
  laundry: { icon: WashingMachine, label: 'Laundry' },
};

const GENDER_COLORS = {
  boys: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  girls: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  'co-living': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'co-ed': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
};

const HostelCard = ({
  hostel,
  selectedCollege = '',
  view = 'grid',
  matchPercent,
  matchScore,
  matchBreakdown,
  matchReason,
}) => {
  const { toggleFavourite, isFavourite, addToCompare, removeFromCompare, isInCompare } = useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  if (!hostel) return null;

  const hostelId = hostel.id || hostel._id;
  const fav = isFavourite(hostelId);
  const inCompare = isInCompare(hostelId);

  const handleCardClick = (e) => {
    e?.stopPropagation?.();
    const targetSlug = hostel.slug || hostelId;
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: `/hostel/${targetSlug}` },
          message: '⚠️ Please sign in or register first to view hostel details.',
        },
      });
      return;
    }
    navigate(`/hostel/${targetSlug}`);
  };

  const handleToggleFav = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: '/favourites' },
          message: '⚠️ Please sign in or register first to save hostels to your favourites.',
        },
      });
      return;
    }
    toggleFavourite(hostelId);
  };

  const handleCompare = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: '/compare' },
          message: '⚠️ Please sign in or register first to compare hostels.',
        },
      });
      return;
    }
    inCompare ? removeFromCompare(hostelId) : addToCompare(hostel);
  };

  // Compute display distance
  const distance =
    hostel.distanceKm !== undefined && hostel.distanceKm !== null
      ? hostel.distanceKm
      : selectedCollege ? hostel.distanceFromColleges?.[selectedCollege] : null;

  const collegeNames = {
    parul: 'Parul University',
    ms: 'MS University',
    msu: 'MS University',
    itm: 'ITM Universe',
    navrachana: 'Navrachana Univ',
    sigma: 'Sigma Univ',
    gsfc: 'GSFC Univ',
  };
  const displayCollege = hostel.targetCollege || (selectedCollege ? collegeNames[selectedCollege] || 'Campus' : 'Campus');

  const fallbackImg = `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80`;
  const effectiveMatch = matchPercent || matchScore;

  // Safe gender parsing
  const rawGender = String(hostel.gender || 'boys').toLowerCase();
  const genderKey = rawGender.includes('girl') ? 'girls' : rawGender.includes('co') ? 'co-living' : 'boys';
  const genderLabel = genderKey === 'boys' ? 'Boys PG / Hostel' : genderKey === 'girls' ? 'Girls PG / Hostel' : 'Co-ed / Co-living';

  // Safe amenities list
  const amenitiesList = Array.isArray(hostel.amenities)
    ? hostel.amenities
    : typeof hostel.amenities === 'object' && hostel.amenities !== null
    ? Object.keys(hostel.amenities).filter((k) => hostel.amenities[k] === true)
    : [];

  const priceVal = hostel.startingPrice || hostel.monthlyRent || hostel.effectiveMonthlyCost || 4500;
  const areaVal = hostel.area || hostel.location?.area || 'Vadodara';
  const cityVal = hostel.city || hostel.location?.city || 'Vadodara';
  const ratingVal = Number(hostel.rating || hostel.reviews?.rating || 4.0);
  const reviewCountVal = Number(hostel.reviewCount || hostel.reviewsCount || hostel.reviews?.reviewCount || 0);

  if (view === 'list') {
    return (
      <div
        className="card flex flex-col sm:flex-row gap-0 group cursor-pointer border border-white/10 hover:border-primary-500/40 transition-all duration-300 shadow-lg hover:shadow-2xl"
        onClick={handleCardClick}
      >
        {/* Image */}
        <div className="relative sm:w-60 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
          <img
            src={imgError ? fallbackImg : (hostel.images?.[0] || fallbackImg)}
            alt={hostel.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {hostel.verified && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-emerald-500/90 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md">
              <BadgeCheck className="w-3.5 h-3.5" /> Verified
            </div>
          )}

          {effectiveMatch && (
            <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow-lg border border-white/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-accent-300" />
              {effectiveMatch}% Match
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <span className={`badge border text-xs mb-1.5 ${GENDER_COLORS[genderKey] || GENDER_COLORS['co-living']}`}>
                  {genderLabel}
                </span>
                <h3 className="font-display font-bold text-lg text-white group-hover:text-primary-400 transition-colors">
                  {hostel.name}
                </h3>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-primary-400" />
                  {areaVal}, {cityVal}
                  {distance !== undefined && distance !== null && (
                    <span className="text-primary-300 font-medium ml-1">
                      · {typeof distance === 'number' ? distance.toFixed(1) : distance} km from {displayCollege}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-primary-400 font-display font-bold text-xl">
                  {formatPrice(priceVal)}
                  <span className="text-gray-500 text-sm font-normal">/mo</span>
                </div>
                <Rating value={ratingVal} count={reviewCountVal} size="xs" />
              </div>
            </div>

            {/* AI Explanation Pill */}
            {matchReason && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-primary-950/40 border border-primary-500/20 text-xs text-gray-300 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary-400 flex-shrink-0 mt-0.5" />
                <p className="line-clamp-2"><span className="text-primary-300 font-semibold">Why AI Recommends: </span>{matchReason}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mt-3">
              {amenitiesList.slice(0, 5).map((a) => {
                const key = String(a).toLowerCase();
                const cfg = AMENITY_ICONS[key];
                const Icon = cfg ? cfg.icon : ShieldCheck;
                const label = cfg ? cfg.label : a;
                return (
                  <span key={a} className="amenity-tag text-xs">
                    <Icon className="w-3 h-3" /> {label}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 flex-wrap justify-between border-t border-white/5 pt-3">
            <button
              onClick={handleCardClick}
              className="btn-primary text-sm py-2 px-4"
            >
              View Details <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFav}
                className={`p-2 rounded-xl border transition-all ${
                  fav
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'border-white/15 text-gray-400 hover:text-rose-400 hover:border-rose-500/30'
                }`}
                title={fav ? 'Saved' : 'Save to favourites'}
              >
                <Heart className={`w-4 h-4 ${fav ? 'fill-rose-400' : ''}`} />
              </button>
              <button
                onClick={handleCompare}
                className={`p-2 rounded-xl border transition-all ${
                  inCompare
                    ? 'bg-primary-500/20 border-primary-500/40 text-primary-400'
                    : 'border-white/15 text-gray-400 hover:text-primary-400 hover:border-primary-500/30'
                }`}
                title="Add to compare"
              >
                <Scale className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className="card group cursor-pointer border border-white/10 hover:border-primary-500/40 transition-all duration-300 flex flex-col justify-between"
      onClick={handleCardClick}
    >
      {/* Top Media */}
      <div>
        <div className="relative h-52 overflow-hidden rounded-t-2xl">
          <img
            src={imgError ? fallbackImg : (hostel.images?.[0] || fallbackImg)}
            alt={hostel.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {hostel.verified && (
              <span className="flex items-center gap-1 bg-emerald-500/90 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md">
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            )}
            {hostel.isFeatured && (
              <span className="flex items-center gap-1 bg-accent-500/90 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-md">
                <Star className="w-3 h-3" /> Featured
              </span>
            )}
          </div>

          {/* Match badge */}
          {effectiveMatch && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow-lg border border-white/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-accent-300" />
              {effectiveMatch}% Match
            </div>
          )}

          {/* Bottom price */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-black/70 backdrop-blur-md text-white font-display font-bold text-base px-3 py-1 rounded-xl border border-white/10">
              {formatPrice(priceVal)}
              <span className="text-white/70 text-xs">/mo</span>
            </span>
          </div>

          {/* Quick Action buttons */}
          <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleToggleFav}
              className={`p-1.5 rounded-xl backdrop-blur-md transition-all ${
                fav ? 'bg-rose-500/90 text-white' : 'bg-black/60 text-white/80 hover:bg-rose-500/90'
              }`}
            >
              <Heart className={`w-4 h-4 ${fav ? 'fill-white' : ''}`} />
            </button>
            <button
              onClick={handleCompare}
              className={`p-1.5 rounded-xl backdrop-blur-md transition-all ${
                inCompare ? 'bg-primary-500/90 text-white' : 'bg-black/60 text-white/80 hover:bg-primary-500/90'
              }`}
              title="Compare"
            >
              <Scale className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div>
            <span className={`badge border text-xs ${GENDER_COLORS[genderKey] || GENDER_COLORS['co-living']}`}>
              {genderLabel}
            </span>
            <h3 className="font-display font-bold text-base text-white mt-1 truncate group-hover:text-primary-400 transition-colors">
              {hostel.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary-400" />
            <span className="truncate">{areaVal}, {cityVal}</span>
            {distance !== undefined && distance !== null && (
              <span className="text-primary-300 font-medium ml-1">
                · {typeof distance === 'number' ? distance.toFixed(1) : distance} km
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Rating value={ratingVal} count={reviewCountVal} size="xs" />
          </div>

          {/* Amenities tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {amenitiesList.slice(0, 3).map((a) => {
              const key = String(a).toLowerCase();
              const cfg = AMENITY_ICONS[key];
              const Icon = cfg ? cfg.icon : ShieldCheck;
              const label = cfg ? cfg.label : a;
              return (
                <span key={a} className="amenity-tag text-xs">
                  <Icon className="w-3 h-3" /> {label}
                </span>
              );
            })}
          </div>

          {/* AI Match Reason */}
          {matchReason && (
            <div className="p-2.5 rounded-xl bg-primary-950/30 border border-primary-500/20 text-xs text-gray-300">
              <div className="flex items-center gap-1 text-primary-300 font-semibold mb-0.5">
                <Sparkles className="w-3 h-3" /> Why AI Recommends:
              </div>
              <p className="line-clamp-2 text-gray-300 text-[11px] leading-relaxed">{matchReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-5 pt-0">
        <button
          onClick={handleCardClick}
          className="btn-primary w-full justify-center text-sm py-2.5 rounded-xl shadow-lg"
        >
          View Details <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default HostelCard;
