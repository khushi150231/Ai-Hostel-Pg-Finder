import mongoose from 'mongoose';
import { createModelProxy } from './modelProxy.js';

// Room sub-schema
const RoomSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: 'SINGLE',
      trim: true,
    },
    price: {
      type: Number,
      default: null,
    },
    beds: {
      type: Number,
      default: null,
    },
    availableBeds: {
      type: Number,
      default: null,
    },
    ac: {
      type: Boolean,
      default: null,
    },
    attachedBathroom: {
      type: Boolean,
      default: null,
    },
    balcony: {
      type: Boolean,
      default: null,
    },
    studyTable: {
      type: Boolean,
      default: null,
    },
    wardrobe: {
      type: Boolean,
      default: null,
    },
  },
  { _id: false }
);

// College Distance sub-schema
const CollegeDistanceSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      default: null,
    },
    collegeName: {
      type: String,
      required: true,
    },
    distanceKm: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

export const HostelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hostel name is required'],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'UNIVERSITY_HOSTEL',
        'PRIVATE_HOSTEL',
        'PRIVATE_PG',
        'CO_LIVING',
        'STUDENT_DORMITORY',
        'HOMESTAY',
      ],
      default: 'PRIVATE_HOSTEL',
      index: true,
    },
    gender: {
      type: String,
      enum: ['BOYS', 'GIRLS', 'BOYS_AND_GIRLS', 'VERIFY'],
      default: 'BOYS',
      index: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      default: null,
      index: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      default: null,
      index: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    email: {
      type: String,
      default: null,
      trim: true,
    },
    source: {
      type: String,
      default: 'Public Vadodara Accommodation Directory',
      trim: true,
    },
    sourceUrl: {
      type: String,
      default: null,
      trim: true,
    },
    sourceType: {
      type: String,
      enum: [
        'OFFICIAL_UNIVERSITY',
        'PUBLIC_LISTING',
        'VERIFIED_BUSINESS',
        'OWNER_PROVIDED',
        'STUDENT_SUBMITTED',
      ],
      default: 'PUBLIC_LISTING',
    },
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'SOURCE_LISTED', 'OWNER_VERIFIED', 'ADMIN_VERIFIED'],
      default: 'SOURCE_LISTED',
      index: true,
    },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'LIMITED', 'WAITLIST', 'UNAVAILABLE', 'UNKNOWN'],
      default: 'UNKNOWN',
      index: true,
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now,
    },
    priceLastVerifiedAt: {
      type: Date,
      default: Date.now,
    },

    // Location Subdocument
    location: {
      address: { type: String, default: null },
      area: { type: String, required: true, trim: true, index: true },
      city: { type: String, default: 'Vadodara', trim: true },
      pincode: { type: String, default: null },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      // GeoJSON Point for 2dsphere spatial index: coordinates = [longitude, latitude]
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [73.1812, 22.3072],
      },
    },

    // Pricing Subdocument (with effective monthly cost calculation)
    pricing: {
      monthlyRent: { type: Number, default: null, index: true },
      annualRent: { type: Number, default: null },
      securityDeposit: { type: Number, default: null },
      maintenance: { type: Number, default: null },
      electricity: { type: Number, default: null },
      water: { type: Number, default: null },
      food: { type: Number, default: null },
      laundry: { type: Number, default: null },
      otherMandatoryCharges: { type: Number, default: null },
      effectiveMonthlyCost: { type: Number, default: null, index: true },
    },

    // Rooms list
    rooms: [RoomSchema],

    // Legacy / UI roomTypes alias
    roomTypes: [
      {
        roomType: { type: String, default: 'Single' },
        price: { type: Number, default: null },
        availableBeds: { type: Number, default: null },
        features: { type: [String], default: [] },
      },
    ],

    // Total beds & available rooms
    totalBeds: { type: Number, default: null },
    availableRooms: { type: Number, default: null },

    // Amenities Subdocument (Boolean / null)
    amenities: {
      wifi: { type: Boolean, default: null },
      ac: { type: Boolean, default: null },
      food: { type: Boolean, default: null },
      laundry: { type: Boolean, default: null },
      housekeeping: { type: Boolean, default: null },
      geyser: { type: Boolean, default: null },
      hotWater: { type: Boolean, default: null },
      roWater: { type: Boolean, default: null },
      powerBackup: { type: Boolean, default: null },
      parking: { type: Boolean, default: null },
      cctv: { type: Boolean, default: null },
      securityGuard: { type: Boolean, default: null },
      lift: { type: Boolean, default: null },
      gym: { type: Boolean, default: null },
      studyRoom: { type: Boolean, default: null },
      commonRoom: { type: Boolean, default: null },
      tvRoom: { type: Boolean, default: null },
      garden: { type: Boolean, default: null },
      sports: { type: Boolean, default: null },
      kitchen: { type: Boolean, default: null },
      fridge: { type: Boolean, default: null },
      washingMachine: { type: Boolean, default: null },
      diningTable: { type: Boolean, default: null },
      gatedCommunity: { type: Boolean, default: null },
    },

    // Food Subdocument
    food: {
      available: { type: Boolean, default: null },
      included: { type: Boolean, default: null },
      breakfast: { type: Boolean, default: null },
      lunch: { type: Boolean, default: null },
      dinner: { type: Boolean, default: null },
      vegetarian: { type: Boolean, default: null },
      nonVegetarian: { type: Boolean, default: null },
      jain: { type: Boolean, default: null },
      monthlyCost: { type: Number, default: null },
    },

    // Rules Subdocument
    rules: {
      curfew: { type: String, default: null },
      guestPolicy: { type: String, default: null },
      visitorHours: { type: String, default: null },
      cookingAllowed: { type: Boolean, default: null },
      smokingAllowed: { type: Boolean, default: null },
      alcoholAllowed: { type: Boolean, default: null },
      petsAllowed: { type: Boolean, default: null },
      nonVegAllowed: { type: Boolean, default: null },
      noticePeriod: { type: String, default: null },
      lockIn: { type: String, default: null },
    },

    // Security Subdocument
    security: {
      cctv: { type: Boolean, default: null },
      guard: { type: Boolean, default: null },
      warden: { type: Boolean, default: null },
      femaleWarden: { type: Boolean, default: null },
      gatedEntry: { type: Boolean, default: null },
      emergencyContact: { type: String, default: null },
      fireSafety: { type: Boolean, default: null },
    },

    // Location Score Data
    locationScoreData: {
      distanceToCollege: { type: Number, default: null },
      walkingTime: { type: Number, default: null },
      bikeTime: { type: Number, default: null },
      publicTransportTime: { type: Number, default: null },
    },

    // Reviews & Rating
    reviews: {
      rating: { type: Number, default: 4.0, min: 0, max: 5 },
      reviewCount: { type: Number, default: 0 },
      cleanliness: { type: Number, default: null },
      food: { type: Number, default: null },
      wifi: { type: Number, default: null },
      location: { type: Number, default: null },
      security: { type: Number, default: null },
      staff: { type: Number, default: null },
    },

    // Admin Verification Checklist
    adminChecks: {
      addressVerified: { type: Boolean, default: false },
      ownerVerified: { type: Boolean, default: false },
      phoneVerified: { type: Boolean, default: false },
      priceVerified: { type: Boolean, default: false },
      amenitiesVerified: { type: Boolean, default: false },
      availabilityVerified: { type: Boolean, default: false },
      photosVerified: { type: Boolean, default: false },
    },

    // Images
    images: {
      type: [String],
      default: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'],
    },

    // Distances to specific colleges
    collegeDistances: [CollegeDistanceSchema],
    nearbyPlaces: {
      type: [String],
      default: [],
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'hostels',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook: Compute effectiveMonthlyCost & coordinates
HostelSchema.pre('save', function (next) {
  // Ensure location coordinates
  if (this.location?.longitude !== undefined && this.location?.latitude !== undefined) {
    this.location.coordinates = [this.location.longitude, this.location.latitude];
  }

  // Calculate effectiveMonthlyCost:
  // effectiveMonthlyCost = rent + mandatoryFood + mandatoryElectricity + mandatoryMaintenance + mandatoryOtherCharges
  const rent = this.pricing?.monthlyRent || 0;
  const foodCost = this.pricing?.food || 0;
  const elec = this.pricing?.electricity || 0;
  const maint = this.pricing?.maintenance || 0;
  const other = this.pricing?.otherMandatoryCharges || 0;

  if (rent > 0 || foodCost > 0 || elec > 0 || maint > 0 || other > 0) {
    if (!this.pricing) this.pricing = {};
    this.pricing.effectiveMonthlyCost = rent + foodCost + elec + maint + other;
  }

  next();
});

// Virtual Getters for Backward Compatibility with existing UI / routes
HostelSchema.virtual('monthlyRent').get(function () {
  return this.pricing?.monthlyRent || this.pricing?.effectiveMonthlyCost || null;
});

HostelSchema.virtual('area').get(function () {
  return this.location?.area || null;
});

HostelSchema.virtual('address').get(function () {
  return this.location?.address || `${this.location?.area || ''}, Vadodara`;
});

HostelSchema.virtual('rating').get(function () {
  return this.reviews?.rating || 4.0;
});

HostelSchema.virtual('reviewCount').get(function () {
  return this.reviews?.reviewCount || 0;
});

HostelSchema.virtual('effectiveMonthlyCost').get(function () {
  if (this.pricing?.effectiveMonthlyCost) return this.pricing.effectiveMonthlyCost;
  const rent = this.pricing?.monthlyRent || 0;
  const food = this.pricing?.food || 0;
  const elec = this.pricing?.electricity || 0;
  const maint = this.pricing?.maintenance || 0;
  const other = this.pricing?.otherMandatoryCharges || 0;
  return rent + food + elec + maint + other;
});

// Helper virtual for active amenity string list for search & tags
HostelSchema.virtual('amenityList').get(function () {
  if (!this.amenities) return [];
  const list = [];
  for (const [key, value] of Object.entries(this.amenities)) {
    if (value === true) list.push(key);
  }
  return list;
});

// 2dsphere index for geoNear and geospatial radius search
HostelSchema.index({ 'location.coordinates': '2dsphere' });
HostelSchema.index({ 'location.area': 1, gender: 1, 'pricing.monthlyRent': 1 });
HostelSchema.index({ type: 1, verificationStatus: 1, availabilityStatus: 1 });

let HostelModel = null;

export const initHostelModel = (connection) => {
  if (!connection.models.Hostel) {
    HostelModel = connection.model('Hostel', HostelSchema, 'hostels');
  } else {
    HostelModel = connection.models.Hostel;
  }
  return HostelModel;
};

export const Hostel = createModelProxy(() => HostelModel);

export default Hostel;
