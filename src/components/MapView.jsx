import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Star, ArrowRight, X, ExternalLink, School } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import Rating from './Rating';

// Center coordinates for Vadodara
const VADODARA_BOUNDS = {
  minLat: 22.25,
  maxLat: 22.39,
  minLng: 73.00,
  maxLng: 73.25,
};

const CAMPUSES = [
  { id: 'parul', name: 'Parul University', lat: 22.2965, lng: 73.0169, color: 'bg-amber-500' },
  { id: 'ms', name: 'MS University', lat: 22.3225, lng: 73.1860, color: 'bg-emerald-500' },
  { id: 'itm', name: 'ITM Universe', lat: 22.3561, lng: 73.1928, color: 'bg-violet-500' },
];

export const MapView = ({
  hostels = [],
  selectedHostelId = null,
  onSelectHostel = () => {},
  selectedCollege = 'parul',
  height = 'h-[600px]',
}) => {
  const [activeHostel, setActiveHostel] = useState(
    hostels.find((h) => h.id === selectedHostelId) || null
  );
  const [zoomLevel, setZoomLevel] = useState(1);

  // Convert lat/lng to percentage position on canvas
  const getCoordinatesPosition = (lat, lng) => {
    const latSpan = VADODARA_BOUNDS.maxLat - VADODARA_BOUNDS.minLat;
    const lngSpan = VADODARA_BOUNDS.maxLng - VADODARA_BOUNDS.minLng;

    const y = ((VADODARA_BOUNDS.maxLat - lat) / latSpan) * 100;
    const x = ((lng - VADODARA_BOUNDS.minLng) / lngSpan) * 100;

    // Clamp inside container
    return {
      top: `${Math.max(6, Math.min(94, y))}%`,
      left: `${Math.max(6, Math.min(94, x))}%`,
    };
  };

  const currentSelection = useMemo(() => {
    if (selectedHostelId) {
      return hostels.find((h) => h.id === selectedHostelId) || activeHostel;
    }
    return activeHostel;
  }, [selectedHostelId, hostels, activeHostel]);

  return (
    <div className={`relative w-full ${height} rounded-2xl overflow-hidden border border-white/10 bg-dark-900 shadow-2xl flex flex-col`}>
      {/* Map Header / Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-dark-800/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-lg text-xs text-gray-300">
        <Navigation className="w-4 h-4 text-primary-400 animate-pulse" />
        <span className="font-semibold text-white">Vadodara Metro Map</span>
        <span className="text-gray-500">•</span>
        <span className="text-gray-400">{hostels.length} hostels plotted</span>
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-dark-800/90 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg">
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2))}
          className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-lg text-sm font-bold"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
          className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-lg text-sm font-bold"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="px-2.5 h-8 flex items-center justify-center text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded-lg font-medium"
        >
          Reset
        </button>
      </div>

      {/* Map Canvas Background styled as modern dark cartography */}
      <div
        className="relative flex-1 w-full h-full overflow-hidden transition-transform duration-300 select-none cursor-grab active:cursor-grabbing"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
          background: 'radial-gradient(ellipse at 40% 50%, #151a33 0%, #0d0f1a 100%)',
        }}
      >
        {/* Cartography grid lines & decorative map elements */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#5b6ef5" strokeWidth="0.5" strokeDasharray="3 3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Simulated Vishwamitri River path through Vadodara */}
          <path
            d="M 550,0 Q 520,200 480,350 T 420,600"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="8"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />
          {/* Major arterial roads */}
          <path d="M 0,280 Q 400,320 1000,260" fill="none" stroke="#6366f1" strokeWidth="2" strokeOpacity="0.25" />
          <path d="M 200,600 L 600,0" fill="none" stroke="#6366f1" strokeWidth="2" strokeOpacity="0.25" />
          <path d="M 400,600 L 800,0" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.2" />
        </svg>

        {/* Major areas labels on map */}
        <div className="absolute top-[28%] left-[72%] text-[11px] font-bold tracking-wider uppercase text-white/20 pointer-events-none">
          Alkapuri
        </div>
        <div className="absolute top-[68%] left-[16%] text-[11px] font-bold tracking-wider uppercase text-white/20 pointer-events-none">
          Gotri & Parul Enclave
        </div>
        <div className="absolute top-[20%] left-[82%] text-[11px] font-bold tracking-wider uppercase text-white/20 pointer-events-none">
          Sama & ITM Corridor
        </div>
        <div className="absolute top-[48%] left-[75%] text-[11px] font-bold tracking-wider uppercase text-white/20 pointer-events-none">
          Fatehgunj
        </div>

        {/* University Campus Markers */}
        {CAMPUSES.map((campus) => {
          const pos = getCoordinatesPosition(campus.lat, campus.lng);
          return (
            <div
              key={campus.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
              style={{ top: pos.top, left: pos.left }}
            >
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-dark-900/90 border border-white/20 shadow-xl backdrop-blur-sm cursor-pointer hover:scale-105 transition-all">
                <School className="w-3.5 h-3.5 text-accent-400" />
                <span className="text-[10px] font-bold text-white whitespace-nowrap">{campus.name}</span>
              </div>
            </div>
          );
        })}

        {/* Hostel Markers */}
        {hostels.map((hostel) => {
          const coords = hostel.coordinates || { lat: 22.3, lng: 73.15 };
          const pos = getCoordinatesPosition(coords.lat, coords.lng);
          const isSelected = currentSelection?.id === hostel.id;

          return (
            <div
              key={hostel.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10 ${
                isSelected ? 'z-30 scale-125' : 'hover:scale-115 hover:z-20'
              }`}
              style={{ top: pos.top, left: pos.left }}
              onClick={() => {
                setActiveHostel(hostel);
                onSelectHostel(hostel);
              }}
            >
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full border shadow-xl backdrop-blur-md cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-primary-600 text-white border-primary-300 ring-4 ring-primary-500/30'
                    : 'bg-dark-800/95 text-white border-white/20 hover:border-primary-400 hover:bg-dark-700'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-primary-400'}`} />
                <span className="text-xs font-bold whitespace-nowrap">
                  {formatPrice(hostel.startingPrice)}
                </span>
              </div>

              {/* Ping glow animation for selected */}
              {isSelected && (
                <div className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-30 pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Hostel Popup Card */}
      {currentSelection && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:max-w-md z-30 animate-slide-up">
          <div className="bg-dark-800/95 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <img
                  src={currentSelection.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80'}
                  alt={currentSelection.name}
                  className="w-20 h-20 rounded-xl object-cover border border-white/10"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30">
                      {currentSelection.type || 'Hostel'}
                    </span>
                    <Rating value={currentSelection.rating} size="xs" showCount={false} />
                  </div>
                  <h4 className="font-display font-bold text-white text-base mt-1 line-clamp-1">
                    {currentSelection.name}
                  </h4>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-primary-400" />
                    {currentSelection.area}, {currentSelection.city}
                  </p>
                  <p className="text-xs text-primary-400 font-semibold mt-1">
                    {currentSelection.distanceFromColleges?.[selectedCollege]
                      ? `${currentSelection.distanceFromColleges[selectedCollege]} km from ${selectedCollege.toUpperCase()} campus`
                      : 'Vadodara'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveHostel(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-white/8 pt-3">
              <div>
                <span className="text-xs text-gray-500">Starting from</span>
                <div className="font-display font-bold text-white text-lg leading-tight">
                  {formatPrice(currentSelection.startingPrice)}
                  <span className="text-xs text-gray-400 font-normal"> / month</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/hostel/${currentSelection.id || currentSelection._id || currentSelection.slug}`}
                  className="btn-primary text-xs py-2 px-3.5"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campus Legends Footer */}
      <div className="p-2.5 bg-dark-950/90 border-t border-white/8 flex items-center justify-between text-[11px] text-gray-400 px-4 overflow-x-auto gap-4">
        <div className="flex items-center gap-3 whitespace-nowrap">
          <span className="text-gray-500 font-semibold uppercase text-[10px]">Colleges:</span>
          {CAMPUSES.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${c.color}`} />
              <span>{c.name}</span>
            </div>
          ))}
        </div>
        <div className="text-gray-500 text-[10px] whitespace-nowrap">
          Coordinates calibrated for Vadodara Municipal Region
        </div>
      </div>
    </div>
  );
};

export default MapView;
