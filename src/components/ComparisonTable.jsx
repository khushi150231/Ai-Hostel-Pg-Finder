import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, X, Sparkles, Trash2, ArrowRight, Star,
  ShieldCheck, Loader2, Bot, MapPin, Award, DollarSign, Compass
} from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';
import { aiService } from '../services/aiService';
import Rating from './Rating';

export const ComparisonTable = ({
  hostels = [],
  onRemove = () => {},
  selectedCollege = 'parul',
}) => {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const collegeNames = { parul: 'Parul Univ', ms: 'MS Univ', itm: 'ITM Universe' };

  const handleAskAI = async () => {
    if (hostels.length < 2) return;
    setAnalyzing(true);
    try {
      const res = await aiService.compareHostels(
        hostels.map((h) => h.id || h._id),
        { targetCollege: collegeNames[selectedCollege] }
      );
      setAiAnalysis(res);
    } catch {
      setAiAnalysis({ comparison: 'Failed to generate comparison. Please try again.' });
    } finally {
      setAnalyzing(false);
    }
  };

  if (!hostels || hostels.length === 0) {
    return (
      <div className="card p-12 text-center max-w-xl mx-auto my-12 border border-white/10">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-gray-400">
          <Bot className="w-8 h-8" />
        </div>
        <h3 className="font-display font-bold text-xl text-white">No Hostels in Compare List</h3>
        <p className="text-gray-400 text-sm mt-2 mb-6">
          Add up to 3 hostels from the search or home page to evaluate price, facilities, and AI recommendations side-by-side.
        </p>
        <Link to="/find" className="btn-primary text-sm">
          Browse Hostels <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const detailed = aiAnalysis?.detailedComparison;

  return (
    <div className="space-y-8">
      {/* AI Comparison Analysis Box */}
      {hostels.length >= 2 && (
        <div className="bg-gradient-to-r from-primary-950/60 via-dark-800 to-purple-950/50 border border-primary-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-lg">
                  AI Multi-Hostel Grounded Synthesis
                </h3>
                <p className="text-xs text-gray-400">
                  Compare trade-offs, value-for-money, and campus proximity
                </p>
              </div>
            </div>

            <button
              onClick={handleAskAI}
              disabled={analyzing}
              className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Synthesizing with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {aiAnalysis ? 'Re-run AI Synthesis' : 'Ask AI to Compare'}
                </>
              )}
            </button>
          </div>

          {aiAnalysis && (
            <div className="mt-5 space-y-4 animate-slide-up">
              {/* Top synthesis badges */}
              {detailed && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {detailed.bestOverall && (
                    <div className="p-3.5 rounded-2xl bg-primary-900/30 border border-primary-500/30">
                      <div className="flex items-center gap-2 text-primary-300 font-semibold text-xs">
                        <Award className="w-4 h-4 text-accent-400" /> Best Overall Choice
                      </div>
                      <p className="text-white font-bold text-sm mt-1">{detailed.bestOverall.hostelName}</p>
                      <p className="text-gray-300 text-xs mt-0.5">{detailed.bestOverall.reason}</p>
                    </div>
                  )}

                  {detailed.bestBudget && (
                    <div className="p-3.5 rounded-2xl bg-emerald-900/20 border border-emerald-500/30">
                      <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
                        <DollarSign className="w-4 h-4 text-emerald-400" /> Best Budget Value
                      </div>
                      <p className="text-white font-bold text-sm mt-1">{detailed.bestBudget.hostelName}</p>
                      <p className="text-gray-300 text-xs mt-0.5">{detailed.bestBudget.reason}</p>
                    </div>
                  )}

                  {detailed.bestLocation && (
                    <div className="p-3.5 rounded-2xl bg-purple-900/20 border border-purple-500/30">
                      <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
                        <Compass className="w-4 h-4 text-purple-400" /> Best Campus Proximity
                      </div>
                      <p className="text-white font-bold text-sm mt-1">{detailed.bestLocation.hostelName}</p>
                      <p className="text-gray-300 text-xs mt-0.5">{detailed.bestLocation.reason}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Main Summary Recommendation */}
              <div className="p-4 rounded-2xl bg-dark-900/90 border border-white/10 text-sm leading-relaxed text-gray-200 flex gap-3">
                <Bot className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-200">{aiAnalysis.comparison}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comparison Table */}
      <div className="card overflow-x-auto shadow-2xl border border-white/10">
        <table className="w-full text-left border-collapse min-w-[700px]">
          {/* Header row with Images & Actions */}
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-4 sm:p-5 w-1/4 text-gray-400 font-medium text-xs uppercase tracking-wider bg-dark-900/50">
                Hostel Overview
              </th>
              {hostels.map((hostel) => (
                <th key={hostel.id || hostel._id} className="p-4 sm:p-5 w-1/4 align-top">
                  <div className="relative group">
                    <button
                      onClick={() => onRemove(hostel.id || hostel._id)}
                      className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white shadow-lg transition-all z-10"
                      title="Remove from compare"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <img
                      src={hostel.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&q=80'}
                      alt={hostel.name}
                      className="w-full h-36 object-cover rounded-xl border border-white/10 mb-3"
                    />
                    <h4 className="font-display font-bold text-white text-base leading-tight">
                      {hostel.name}
                    </h4>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-primary-400" />
                      {hostel.area}
                    </p>
                    <div className="mt-3">
                      <Link
                        to={`/hostel/${hostel.id || hostel._id || hostel.slug}`}
                        className="btn-outline w-full justify-center text-xs py-1.5 px-2.5 rounded-lg"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </th>
              ))}
              {Array.from({ length: Math.max(0, 3 - hostels.length) }).map((_, idx) => (
                <th key={`empty-${idx}`} className="p-5 w-1/4 align-top text-center">
                  <div className="h-48 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-4 text-gray-500">
                    <span className="text-xs mb-2">Slot {hostels.length + idx + 1} of 3</span>
                    <Link
                      to="/find"
                      className="text-xs text-primary-400 hover:text-primary-300 font-semibold"
                    >
                      + Add Hostel
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5 text-sm">
            {/* Price */}
            <tr>
              <td className="p-4 font-semibold text-gray-300 bg-dark-900/40">Starting Rent</td>
              {hostels.map((h) => (
                <td key={h.id || h._id} className="p-4 font-display font-bold text-primary-400 text-base">
                  {formatPrice(h.startingPrice || h.monthlyRent)}
                  <span className="text-xs text-gray-400 font-normal"> /mo</span>
                </td>
              ))}
              {Array.from({ length: Math.max(0, 3 - hostels.length) }).map((_, i) => (
                <td key={i} className="p-4 text-gray-600">—</td>
              ))}
            </tr>

            {/* Distance from college */}
            <tr>
              <td className="p-4 font-semibold text-gray-300 bg-dark-900/40">
                Campus Distance ({collegeNames[selectedCollege] || 'Campus'})
              </td>
              {hostels.map((h) => {
                const dist = h.distanceKm !== undefined && h.distanceKm !== null ? h.distanceKm : h.distanceFromColleges?.[selectedCollege];
                return (
                  <td key={h.id || h._id} className="p-4 text-gray-200">
                    {dist !== undefined && dist !== null ? `${typeof dist === 'number' ? dist.toFixed(1) : dist} km` : 'Near transit'}
                  </td>
                );
              })}
              {Array.from({ length: Math.max(0, 3 - hostels.length) }).map((_, i) => (
                <td key={i} className="p-4 text-gray-600">—</td>
              ))}
            </tr>

            {/* Rating */}
            <tr>
              <td className="p-4 font-semibold text-gray-300 bg-dark-900/40">Rating & Reviews</td>
              {hostels.map((h) => (
                <td key={h.id || h._id} className="p-4">
                  <Rating value={h.rating} count={h.reviewCount || h.reviewsCount} size="xs" />
                </td>
              ))}
              {Array.from({ length: Math.max(0, 3 - hostels.length) }).map((_, i) => (
                <td key={i} className="p-4 text-gray-600">—</td>
              ))}
            </tr>

            {/* Gender */}
            <tr>
              <td className="p-4 font-semibold text-gray-300 bg-dark-900/40">Gender Category</td>
              {hostels.map((h) => (
                <td key={h.id || h._id} className="p-4 capitalize text-gray-200">
                  {h.gender}
                </td>
              ))}
              {Array.from({ length: Math.max(0, 3 - hostels.length) }).map((_, i) => (
                <td key={i} className="p-4 text-gray-600">—</td>
              ))}
            </tr>

            {/* Room Types */}
            <tr>
              <td className="p-4 font-semibold text-gray-300 bg-dark-900/40">Available Rooms</td>
              {hostels.map((h) => {
                const rooms = Array.isArray(h.roomTypes)
                  ? h.roomTypes.map((r) => (typeof r === 'object' ? r.roomType : r)).join(', ')
                  : 'Single, Double, Triple';
                return (
                  <td key={h.id || h._id} className="p-4 text-gray-300 text-xs capitalize">
                    {rooms}
                  </td>
                );
              })}
              {Array.from({ length: Math.max(0, 3 - hostels.length) }).map((_, i) => (
                <td key={i} className="p-4 text-gray-600">—</td>
              ))}
            </tr>

            {/* Food Included */}
            <tr>
              <td className="p-4 font-semibold text-gray-300 bg-dark-900/40">Food Facility</td>
              {hostels.map((h) => (
                <td key={h.id || h._id} className="p-4">
                  {h.food?.included ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-xs">
                      <Check className="w-4 h-4" />
                      {h.food.type || 'Veg'} {h.food.meals ? `(${h.food.meals.join(', ')})` : '(Mess Included)'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-rose-400 font-medium text-xs">
                      <X className="w-4 h-4" /> Not Included
                    </span>
                  )}
                </td>
              ))}
              {Array.from({ length: Math.max(0, 3 - hostels.length) }).map((_, i) => (
                <td key={i} className="p-4 text-gray-600">—</td>
              ))}
            </tr>

            {/* Wi-Fi */}
            <tr>
              <td className="p-4 font-semibold text-gray-300 bg-dark-900/40">High-Speed Wi-Fi</td>
              {hostels.map((h) => (
                <td key={h.id || h._id} className="p-4">
                  {h.amenities?.some((a) => a.toLowerCase().includes('wifi')) ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-gray-600" />
                  )}
                </td>
              ))}
              {Array.from({ length: Math.max(0, 3 - hostels.length) }).map((_, i) => (
                <td key={i} className="p-4 text-gray-600">—</td>
              ))}
            </tr>

            {/* AC */}
            <tr>
              <td className="p-4 font-semibold text-gray-300 bg-dark-900/40">Air Conditioning</td>
              {hostels.map((h) => (
                <td key={h.id || h._id} className="p-4">
                  {h.amenities?.some((a) => a.toLowerCase().includes('ac')) ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-gray-600" />
                  )}
                </td>
              ))}
              {Array.from({ length: Math.max(0, 3 - hostels.length) }).map((_, i) => (
                <td key={i} className="p-4 text-gray-600">—</td>
              ))}
            </tr>

            {/* Laundry */}
            <tr>
              <td className="p-4 font-semibold text-gray-300 bg-dark-900/40">Laundry Service</td>
              {hostels.map((h) => (
                <td key={h.id || h._id} className="p-4">
                  {h.amenities?.some((a) => a.toLowerCase().includes('laundry')) ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-gray-600" />
                  )}
                </td>
              ))}
              {Array.from({ length: Math.max(0, 3 - hostels.length) }).map((_, i) => (
                <td key={i} className="p-4 text-gray-600">—</td>
              ))}
            </tr>

            {/* Security */}
            <tr>
              <td className="p-4 font-semibold text-gray-300 bg-dark-900/40">Security & CCTV</td>
              {hostels.map((h) => (
                <td key={h.id || h._id} className="p-4">
                  {h.amenities?.some((a) => a.toLowerCase().includes('cctv') || a.toLowerCase().includes('security')) ? (
                    <span className="flex items-center gap-1 text-emerald-400 text-xs">
                      <ShieldCheck className="w-4 h-4" /> 24/7 Monitored
                    </span>
                  ) : (
                    <X className="w-4 h-4 text-gray-600" />
                  )}
                </td>
              ))}
              {Array.from({ length: Math.max(0, 3 - hostels.length) }).map((_, i) => (
                <td key={i} className="p-4 text-gray-600">—</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
