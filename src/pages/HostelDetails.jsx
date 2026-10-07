import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Heart, Scale, Share2, Star, CheckCircle,
  ShieldCheck, Wifi, UtensilsCrossed, Wind, WashingMachine, Car,
  Camera, Lock, Clock, AlertCircle, ArrowLeft, Send, Check, MessageSquare,
  BadgeCheck, Info, Sparkles, UserCheck, Calendar
} from 'lucide-react';
import { hostelService } from '../services/hostelService';
import { reviewService } from '../services/reviewService';
import { enquiryService } from '../services/enquiryService';
import { useSearch } from '../context/SearchContext';
import { formatPrice } from '../utils/formatPrice';
import Rating from '../components/Rating';
import MapView from '../components/MapView';
import LoadingSkeleton from '../components/LoadingSkeleton';

const ALL_AMENITY_DETAILS = {
  wifi: { icon: Wifi, label: 'High Speed Wi-Fi', desc: 'Continuous Internet connectivity' },
  food: { icon: UtensilsCrossed, label: 'Food & Mess', desc: 'Hygienic home-style student meals' },
  ac: { icon: Wind, label: 'Air Conditioning', desc: 'Equipped with climate cooling' },
  laundry: { icon: WashingMachine, label: 'Laundry Service', desc: 'Washing machines & drying area' },
  parking: { icon: Car, label: 'Dedicated Parking', desc: 'Two-wheeler & visitor parking' },
  cctv: { icon: Camera, label: 'CCTV Surveillance', desc: '24/7 security cameras' },
  security: { icon: ShieldCheck, label: 'Security Guard', desc: 'On-duty warden and security' },
  securityguard: { icon: ShieldCheck, label: 'Security Guard', desc: 'On-duty warden and security' },
  powerbackup: { icon: Lock, label: 'Power Backup', desc: 'Inverter backup for uninterrupted study' },
  housekeeping: { icon: CheckCircle, label: 'Housekeeping', desc: 'Regular cleaning & maintenance' },
  studytable: { icon: CheckCircle, label: 'Study Table & Desk', desc: 'Ergonomic study space' },
  rowater: { icon: CheckCircle, label: 'RO Drinking Water', desc: 'Purified drinking water' },
  geyser: { icon: CheckCircle, label: 'Hot Water Geyser', desc: 'Water heating facilities' },
  gym: { icon: CheckCircle, label: 'Fitness Gym', desc: 'Workout and gym facilities' },
  lift: { icon: CheckCircle, label: 'Elevator / Lift', desc: 'Building elevator access' },
  fridge: { icon: CheckCircle, label: 'Refrigerator', desc: 'Shared refrigerator' },
};

export const HostelDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isFavourite, toggleFavourite, addToCompare, removeFromCompare, isInCompare } = useSearch();

  const [hostel, setHostel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Modals state
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({ name: '', phone: '', email: '', roomType: 'Single', message: '' });
  const [enquiryStatus, setEnquiryStatus] = useState(null);

  // Review form state
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '', college: 'Parul University' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const fetchHostelData = async () => {
      setLoading(true);
      try {
        const res = await hostelService.getHostelById(slug);
        if (res && res.data) {
          setHostel(res.data);
          try {
            const revRes = await reviewService.getReviews(res.data.id || res.data._id);
            if (revRes && Array.isArray(revRes.data) && revRes.data.length > 0) {
              setReviews(revRes.data);
            } else if (Array.isArray(res.data.reviews)) {
              setReviews(res.data.reviews);
            }
          } catch (revErr) {
            console.warn('Reviews loading fallback:', revErr.message);
            if (Array.isArray(res.data.reviews)) setReviews(res.data.reviews);
          }
        }
      } catch (err) {
        console.error('Failed to load hostel details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHostelData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <LoadingSkeleton type="detail" />
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="min-h-screen bg-dark-900 pt-32 pb-20 px-4 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Hostel Accommodation Not Found</h2>
        <p className="text-gray-400 text-sm">
          The requested property may have been updated or moved. Browse all verified Vadodara listings below.
        </p>
        <Link to="/find" className="btn-primary text-sm py-2.5 px-6 inline-flex">
          Browse All Hostels
        </Link>
      </div>
    );
  }

  const hostelId = hostel.id || hostel._id;
  const fav = isFavourite(hostelId);
  const inCompare = isInCompare(hostelId);

  // Extract amenities list safely
  const amenitiesList = Array.isArray(hostel.amenities)
    ? hostel.amenities
    : typeof hostel.amenities === 'object' && hostel.amenities !== null
    ? Object.keys(hostel.amenities).filter((k) => hostel.amenities[k] === true)
    : [];

  // Extract rules list safely
  const rulesList = Array.isArray(hostel.rules)
    ? hostel.rules
    : typeof hostel.rules === 'object' && hostel.rules !== null
    ? Object.entries(hostel.rules)
        .filter(([k, v]) => v !== null && v !== undefined && v !== false)
        .map(([k, v]) => (typeof v === 'boolean' ? `${k.replace(/([A-Z])/g, ' $1')}: Yes` : `${k.replace(/([A-Z])/g, ' $1')}: ${v}`))
    : ['Standard student accommodation rules apply', 'Visitor hours and gate timings to be followed'];

  // Pricing calculations
  const monthlyCost = hostel.effectiveMonthlyCost || hostel.pricing?.effectiveMonthlyCost || hostel.monthlyRent || hostel.startingPrice || 4500;
  const baseRent = hostel.pricing?.monthlyRent || hostel.monthlyRent || monthlyCost;
  const depositVal = hostel.pricing?.securityDeposit || hostel.securityDeposit || baseRent;

  // Format rooms list
  const roomsList = Array.isArray(hostel.rooms) && hostel.rooms.length > 0
    ? hostel.rooms
    : Array.isArray(hostel.roomTypes) && hostel.roomTypes.length > 0
    ? hostel.roomTypes.map((rt) => ({ type: rt.roomType || 'Standard', price: rt.price || baseRent, availableBeds: rt.availableBeds }))
    : [
        { type: 'Single Room', price: Math.round(baseRent * 1.3), availableBeds: 2 },
        { type: 'Double Sharing', price: baseRent, availableBeds: 3 },
      ];

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setEnquiryStatus('sending');
    try {
      await enquiryService.sendEnquiry(hostelId, enquiryForm);
      setEnquiryStatus('success');
      setTimeout(() => {
        setEnquiryModalOpen(false);
        setEnquiryStatus(null);
      }, 2000);
    } catch {
      setEnquiryStatus('error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    setReviewSubmitting(true);
    try {
      const res = await reviewService.addReview(hostelId, {
        studentName: newReview.name,
        rating: Number(newReview.rating),
        comment: newReview.comment,
        college: newReview.college,
        year: 'Student',
        date: new Date().toISOString().split('T')[0],
        avatar: newReview.name.slice(0, 2).toUpperCase(),
      });
      if (res && res.data) {
        setReviews((prev) => [res.data, ...prev]);
      }
      setNewReview({ name: '', rating: 5, comment: '', college: 'Parul University' });
    } catch (err) {
      console.warn('Review submit note:', err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const imagesList = Array.isArray(hostel.images) && hostel.images.length > 0
    ? hostel.images
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'];

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link to="/find" className="hover:text-white">Find Hostel</Link>
          <span>/</span>
          <span className="text-primary-400 font-medium truncate">{hostel.name}</span>
        </div>

        {/* 1. IMAGE GALLERY */}
        <div className="space-y-4">
          <div className="relative h-[340px] sm:h-[460px] lg:h-[520px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <img
              src={imagesList[activeImageIdx] || imagesList[0]}
              alt={hostel.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent pointer-events-none" />

            {/* Badges on image */}
            <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
              <span className="badge bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-xl">
                {hostel.type ? hostel.type.replace(/_/g, ' ') : 'PG'}
              </span>
              <span className="badge bg-dark-900/80 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-xl border border-white/10 capitalize">
                {String(hostel.gender || 'Boys').toLowerCase()}
              </span>
              {hostel.verified && (
                <span className="badge bg-emerald-500/90 text-white text-xs font-semibold px-3 py-1 rounded-xl flex items-center gap-1 shadow-md">
                  <BadgeCheck className="w-3.5 h-3.5" /> {hostel.verificationStatus === 'ADMIN_VERIFIED' ? 'Admin Verified' : 'Verified'}
                </span>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => toggleFavourite(hostelId)}
                className={`p-3 rounded-2xl backdrop-blur-md border border-white/20 transition-all ${
                  fav ? 'bg-rose-500 text-white' : 'bg-dark-900/80 text-white hover:bg-rose-500/80'
                }`}
                title="Save Hostel"
              >
                <Heart className={`w-5 h-5 ${fav ? 'fill-white' : ''}`} />
              </button>
              <button
                onClick={() => (inCompare ? removeFromCompare(hostelId) : addToCompare(hostel))}
                className={`p-3 rounded-2xl backdrop-blur-md border border-white/20 transition-all ${
                  inCompare ? 'bg-primary-600 text-white' : 'bg-dark-900/80 text-white hover:bg-primary-600/80'
                }`}
                title="Compare"
              >
                <Scale className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-24 h-16 sm:w-32 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIdx === idx ? 'border-primary-500 scale-105' : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. MAIN DETAILS & SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
                  {hostel.name}
                </h1>
              </div>

              <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>{hostel.address || `${hostel.area || 'Vadodara'}, Vadodara`}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                <Rating value={hostel.rating || 4.0} count={reviews.length || hostel.reviewCount || 0} size="sm" />
                <span className="text-gray-500">•</span>
                <span className="text-gray-300">
                  Security Deposit: <span className="text-white font-semibold">{formatPrice(depositVal)}</span>
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-emerald-400 font-medium">
                  {hostel.availabilityStatus ? `Status: ${hostel.availabilityStatus}` : 'Available'}
                </span>
              </div>
            </div>

            {/* Provenance & Verification Badge */}
            <div className="bg-dark-800/80 border border-white/8 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <ShieldCheck className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>
                  <strong>Data Source:</strong> {hostel.source || 'Verified Vadodara Student Accommodation Records'}
                </span>
              </div>
              <div className="text-gray-400">
                Status: <span className="text-white font-medium">{hostel.verificationStatus || 'SOURCE_LISTED'}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-xl text-white">About the Property</h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {hostel.description ||
                  `${hostel.name} is a verified student accommodation in ${hostel.area || 'Vadodara'}, offering comfortable rooms and student-friendly facilities.`}
              </p>
            </div>

            {/* 3. AVAILABLE ROOMS & PRICING */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-xl text-white">Room Types & Monthly Rates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {roomsList.map((room, idx) => (
                  <div
                    key={idx}
                    className="card p-4 text-center border border-white/10 space-y-1"
                  >
                    <span className="text-xs text-gray-400 font-medium">{room.type ? String(room.type).replace(/_/g, ' ') : 'Sharing Room'}</span>
                    <div className="font-display font-bold text-lg text-primary-400">
                      {room.price ? formatPrice(room.price) : formatPrice(monthlyCost)}
                    </div>
                    <span className="text-[11px] text-gray-500 block">per bed / month</span>
                    {room.availableBeds !== null && room.availableBeds !== undefined && (
                      <span className="text-[10px] text-emerald-400 block pt-1">
                        {room.availableBeds} beds available
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 4. AMENITIES */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-xl text-white">Amenities & Facilities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {amenitiesList.length > 0 ? (
                  amenitiesList.map((item) => {
                    const key = String(item).toLowerCase().replace(/[^a-z]/g, '');
                    const info = ALL_AMENITY_DETAILS[key] || { icon: CheckCircle, label: String(item), desc: 'Verified facility' };
                    const Icon = info.icon;
                    return (
                      <div key={item} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/8">
                        <div className="p-2 rounded-xl bg-primary-500/20 text-primary-400">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-sm">{info.label}</h4>
                          <p className="text-gray-400 text-xs mt-0.5">{info.desc}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-sm">Essential student amenities provided. Contact property for full list.</p>
                )}
              </div>
            </div>

            {/* 5. FOOD & MESS DETAILS */}
            <div className="bg-dark-800/80 border border-white/8 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-accent-500/20 text-accent-400">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">Food & Mess Details</h3>
                  <p className="text-xs text-gray-400">Fresh daily catering for students</p>
                </div>
              </div>

              {hostel.food?.included || hostel.food?.available ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-white/5 p-3.5 rounded-2xl">
                    <span className="text-xs text-gray-400">Cuisine Type</span>
                    <div className="text-sm font-semibold text-white mt-1">
                      {hostel.food.vegetarian ? 'Pure Vegetarian' : 'Vegetarian / Mixed'}
                    </div>
                  </div>
                  <div className="bg-white/5 p-3.5 rounded-2xl">
                    <span className="text-xs text-gray-400">Meal Plan</span>
                    <div className="text-sm font-semibold text-white mt-1">
                      {hostel.food.breakfast && hostel.food.lunch && hostel.food.dinner
                        ? 'Breakfast, Lunch & Dinner'
                        : 'Daily Student Mess'}
                    </div>
                  </div>
                  <div className="bg-white/5 p-3.5 rounded-2xl">
                    <span className="text-xs text-gray-400">Hygiene & Cleanliness</span>
                    <div className="text-sm font-semibold text-emerald-400 mt-1">Verified Kitchen</div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  Self-catered or tiffin delivery available at nearby student food spots.
                </p>
              )}
            </div>

            {/* 6. RULES & SECURITY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-dark-800/80 border border-white/8 rounded-3xl p-6 space-y-3">
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-400" /> Accommodation Guidelines
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
                  {rulesList.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary-400">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-dark-800/80 border border-white/8 rounded-3xl p-6 space-y-3">
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security Safeguards
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>24/7 CCTV surveillance on premises</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>Gated community / entry register</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    <span>Warden and emergency contact on call</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 7. REVIEWS & RATINGS */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xl text-white">Student Reviews</h3>
                <Rating value={hostel.rating || 4.0} count={reviews.length} size="sm" />
              </div>

              {/* Review List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((rev, idx) => (
                    <div key={idx} className="bg-dark-800/80 border border-white/8 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                            {rev.avatar || rev.studentName?.slice(0, 2).toUpperCase() || 'ST'}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-sm">{rev.studentName || 'Resident Student'}</h4>
                            <p className="text-[11px] text-gray-400">{rev.college || 'Vadodara Campus'}</p>
                          </div>
                        </div>
                        <Rating value={rev.rating || 5} size="xs" showCount={false} />
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm pt-1 leading-relaxed">
                        "{rev.comment || 'Great student stay with good maintenance.'}"
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic">No resident reviews posted yet. Be the first to share your experience!</p>
                )}
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleReviewSubmit} className="bg-dark-800/60 border border-white/10 rounded-2xl p-5 space-y-4">
                <h4 className="font-display font-semibold text-white text-sm">Write a Resident Review</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={newReview.name}
                    onChange={(e) => setNewReview((p) => ({ ...p, name: e.target.value }))}
                    className="input-field text-xs"
                    required
                  />
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview((p) => ({ ...p, rating: e.target.value }))}
                    className="input-field text-xs cursor-pointer"
                  >
                    <option value="5">★★★★★ 5 - Excellent</option>
                    <option value="4">★★★★☆ 4 - Good</option>
                    <option value="3">★★★☆☆ 3 - Average</option>
                    <option value="2">★★☆☆☆ 2 - Poor</option>
                  </select>
                </div>
                <textarea
                  rows={3}
                  placeholder="Share details about food quality, cleanliness, warden behavior, or Wi-Fi speed..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview((p) => ({ ...p, comment: e.target.value }))}
                  className="input-field text-xs resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="btn-primary text-xs py-2 px-5"
                >
                  {reviewSubmitting ? 'Posting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>

          {/* Right 1 Col: Booking Card & Action Bar */}
          <div className="lg:col-span-1 space-y-6 sticky top-24">
            <div className="bg-dark-800 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
              <div>
                <span className="text-xs text-gray-400">Effective Monthly Cost</span>
                <div className="font-display font-extrabold text-3xl text-white mt-1">
                  {formatPrice(monthlyCost)}
                  <span className="text-xs font-normal text-gray-400"> / month</span>
                </div>
                <p className="text-[11px] text-emerald-400 mt-1">Zero Brokerage Guarantee</p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setEnquiryModalOpen(true)}
                  className="btn-primary w-full justify-center py-3.5 text-sm font-semibold rounded-2xl"
                >
                  <Send className="w-4 h-4" /> Send Free Enquiry
                </button>

                <button
                  onClick={() => setContactModalOpen(true)}
                  className="btn-secondary w-full justify-center py-3 text-sm font-semibold rounded-2xl"
                >
                  <Phone className="w-4 h-4" /> Contact Owner / Warden
                </button>

                <button
                  onClick={() => (inCompare ? removeFromCompare(hostelId) : addToCompare(hostel))}
                  className="btn-outline w-full justify-center py-2.5 text-xs rounded-xl"
                >
                  <Scale className="w-3.5 h-3.5" />
                  {inCompare ? 'Remove from Compare' : 'Add to Compare'}
                </button>
              </div>

              {/* Owner Info Snippet */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                  Property Contact
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                    {hostel.owner?.name?.[0] || 'W'}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">{hostel.owner?.name || 'Verified Property Warden'}</h4>
                    <p className="text-gray-400 text-xs">Phone: {hostel.phone || hostel.owner?.phone || 'Available via enquiry'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ENQUIRY MODAL */}
      {enquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="font-display font-bold text-xl text-white">Send Enquiry</h3>
            <p className="text-xs text-gray-400 mt-1 mb-5">
              Inquire about bed availability at {hostel.name}
            </p>

            {enquiryStatus === 'success' ? (
              <div className="p-6 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                <Check className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-base">Enquiry Dispatched!</h4>
                <p className="text-xs text-gray-300">
                  The property warden will reach you on phone/WhatsApp within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={enquiryForm.name}
                  onChange={(e) => setEnquiryForm((p) => ({ ...p, name: e.target.value }))}
                  className="input-field text-sm"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number (WhatsApp)"
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm((p) => ({ ...p, phone: e.target.value }))}
                  className="input-field text-sm"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={enquiryForm.email}
                  onChange={(e) => setEnquiryForm((p) => ({ ...p, email: e.target.value }))}
                  className="input-field text-sm"
                  required
                />
                <select
                  value={enquiryForm.roomType}
                  onChange={(e) => setEnquiryForm((p) => ({ ...p, roomType: e.target.value }))}
                  className="input-field text-sm cursor-pointer"
                >
                  <option value="Single">Single Room</option>
                  <option value="Double Sharing">Double Sharing</option>
                  <option value="Triple Sharing">Triple Sharing</option>
                  <option value="Four Sharing">4 Sharing</option>
                </select>
                <textarea
                  rows={3}
                  placeholder="Any questions about food, gate timings, or moving date..."
                  value={enquiryForm.message}
                  onChange={(e) => setEnquiryForm((p) => ({ ...p, message: e.target.value }))}
                  className="input-field text-sm resize-none"
                />

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEnquiryModalOpen(false)}
                    className="btn-secondary flex-1 justify-center text-sm py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={enquiryStatus === 'sending'}
                    className="btn-primary flex-1 justify-center text-sm py-2.5"
                  >
                    {enquiryStatus === 'sending' ? 'Submitting...' : 'Send Now'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CONTACT OWNER MODAL */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-primary-600/20 text-primary-400 flex items-center justify-center mx-auto">
              <Phone className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-white">Contact Property Management</h3>
              <p className="text-xs text-gray-400 mt-1">Direct contact for {hostel.name}</p>
            </div>

            <div className="bg-dark-800 p-4 rounded-2xl space-y-3 text-left">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Contact Person / Warden</span>
                <p className="text-sm font-semibold text-white">{hostel.owner?.name || 'Property Warden'}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Phone / WhatsApp</span>
                <p className="text-sm font-semibold text-primary-400">{hostel.phone || hostel.owner?.phone || '+91 9666007700'}</p>
              </div>
              {hostel.email && (
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Email</span>
                  <p className="text-sm text-gray-300">{hostel.email}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setContactModalOpen(false)}
              className="btn-primary w-full justify-center text-sm py-2.5"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelDetails;
