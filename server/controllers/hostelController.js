import { Hostel } from '../models/Hostel.js';
import { Review } from '../models/Review.js';
import { Owner } from '../models/Owner.js';
import { Search } from '../models/Search.js';
import { searchHostels } from '../services/hostelSearchService.js';
import { uploadMultipleImages } from '../services/cloudinaryService.js';

// @desc    Get all hostels with standard pagination & basic filters
// @route   GET /api/hostels
// @access  Public
export const getHostels = async (req, res, next) => {
  try {
    const results = await searchHostels(req.query);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

// @desc    Advanced search hostels (budget, gender, roomType, amenities, college, location radius)
// @route   GET /api/hostels/search
// @access  Public
export const searchHostelsHandler = async (req, res, next) => {
  try {
    const results = await searchHostels(req.query);

    // If student is logged in, asynchronously record search history for Stage 3 AI recommendations
    if (req.user && req.user.role === 'STUDENT') {
      Search.create({
        studentId: req.user.id,
        originalQuery: req.query.search || req.query.area || req.query.college || 'Filter query',
        budget: {
          min: req.query.budgetMin ? Number(req.query.budgetMin) : null,
          max: req.query.budgetMax ? Number(req.query.budgetMax) : null,
        },
        location: {
          area: req.query.area || '',
          latitude: req.query.latitude ? Number(req.query.latitude) : null,
          longitude: req.query.longitude ? Number(req.query.longitude) : null,
          radiusKm: req.query.radius ? Number(req.query.radius) : null,
        },
        filters: req.query,
        resultsCount: results.total || 0,
      }).catch((e) => console.warn('Could not log search history:', e.message));
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
};

// @desc    Get nearby hostels within 1, 2, 3, or 5 km of coordinates
// @route   GET /api/hostels/nearby
// @access  Public
export const getNearbyHostels = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 3 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both latitude and longitude query parameters',
      });
    }

    const results = await searchHostels({
      ...req.query,
      latitude,
      longitude,
      radius,
      sort: 'nearest',
    });

    res.json(results);
  } catch (err) {
    next(err);
  }
};

// @desc    Get featured hostels
// @route   GET /api/hostels/featured
// @access  Public
export const getFeaturedHostels = async (req, res, next) => {
  try {
    const hostels = await Hostel.find({
      $or: [{ isFeatured: true }, { rating: { $gte: 4.4 } }],
      verificationStatus: { $ne: 'REJECTED' },
    })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(6)
      .lean();

    res.json({ success: true, count: hostels.length, data: hostels });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single hostel details by ID or slug
// @route   GET /api/hostels/:id
// @access  Public
export const getHostelById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let hostel = null;
    // 1. Check if ID is standard 24-char Mongo ObjectId
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      hostel = await Hostel.findById(id).lean();
    }

    // 2. Match exact slug if set
    if (!hostel) {
      hostel = await Hostel.findOne({ slug: id }).lean();
    }

    // 3. Match flexible regex across name words
    if (!hostel) {
      const words = id.split(/[^a-zA-Z0-9]+/).filter(Boolean);
      if (words.length > 0) {
        const regexPattern = words.join('.*');
        hostel = await Hostel.findOne({
          name: new RegExp(regexPattern, 'i'),
        }).lean();
      }
    }

    // 4. Normalized character fallback across all records
    if (!hostel) {
      const allHostels = await Hostel.find({}).lean();
      const targetClean = id.toLowerCase().replace(/[^a-z0-9]/g, '');
      hostel =
        allHostels.find((h) => {
          const nameClean = (h.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const slugClean = (h.slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          return (
            nameClean === targetClean ||
            slugClean === targetClean ||
            (targetClean.length > 5 && nameClean.includes(targetClean)) ||
            (nameClean.length > 5 && targetClean.includes(nameClean))
          );
        }) || null;
    }

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel accommodation not found' });
    }

    // Attach owner info (without sensitive password)
    let owner = null;
    if (hostel.ownerId) {
      owner = await Owner.findById(hostel.ownerId).select('name phone email businessName verificationStatus').lean();
    }

    // Attach recent reviews
    const reviews = await Review.find({ hostelId: hostel._id }).sort({ createdAt: -1 }).limit(10).lean();

    res.json({
      success: true,
      data: {
        ...hostel,
        owner: owner || {
          name: 'Verified Warden',
          phone: hostel.phone,
          email: hostel.email,
        },
        reviews,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new hostel listing (OWNER or ADMIN)
// @route   POST /api/hostels
// @access  Private (OWNER, ADMIN)
export const createHostel = async (req, res, next) => {
  try {
    const {
      name,
      description,
      hostelType,
      gender,
      phone,
      email,
      address,
      area,
      city,
      pincode,
      latitude,
      longitude,
      monthlyRent,
      securityDeposit,
      roomTypes,
      availableRooms,
      amenities,
      food,
      rules,
      nearbyPlaces,
      collegeDistances,
    } = req.body;

    if (!name || !monthlyRent || !area) {
      return res.status(400).json({
        success: false,
        message: 'Name, area, and monthly rent are required fields',
      });
    }

    // Handle Cloudinary multiple image uploads if files exist
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadMultipleImages(req.files);
    } else if (req.body.images) {
      imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    } else {
      imageUrls = ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'];
    }

    // Parse coordinates [longitude, latitude]
    const lat = latitude ? parseFloat(latitude) : 22.3072;
    const lng = longitude ? parseFloat(longitude) : 73.1812;

    const hostel = await Hostel.create({
      name,
      description: description || '',
      hostelType: hostelType || 'PG',
      gender: gender || 'boys',
      ownerId: req.user.role === 'ADMIN' && req.body.ownerId ? req.body.ownerId : req.user.id,
      phone: phone || req.user.phone || '9876543210',
      email: email || req.user.email || '',
      address: address || `${area}, Vadodara`,
      area,
      city: city || 'Vadodara',
      pincode: pincode || '390001',
      location: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      monthlyRent: Number(monthlyRent),
      securityDeposit: securityDeposit ? Number(securityDeposit) : Number(monthlyRent),
      roomTypes: roomTypes || [
        { roomType: 'Single', price: Number(monthlyRent), availableBeds: 2 },
        { roomType: 'Double Sharing', price: Math.round(Number(monthlyRent) * 0.75), availableBeds: 4 },
      ],
      availableRooms: availableRooms ? Number(availableRooms) : 5,
      amenities: amenities || ['wifi', 'food'],
      food: food || { available: true, included: true, type: 'Veg' },
      images: imageUrls,
      rules: rules || ['Quiet hours after 11 PM', 'No smoking'],
      nearbyPlaces: nearbyPlaces || [],
      collegeDistances: collegeDistances || [],
      verificationStatus: req.user.role === 'ADMIN' ? 'VERIFIED' : 'PENDING',
    });

    res.status(201).json({
      success: true,
      message: 'Hostel listing created successfully',
      data: hostel,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update hostel listing
// @route   PUT /api/hostels/:id
// @access  Private (OWNER, ADMIN)
export const updateHostel = async (req, res, next) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Ownership check: must be owner of property or ADMIN
    if (req.user.role !== 'ADMIN' && hostel.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this hostel listing',
      });
    }

    // Handle new images if provided
    if (req.files && req.files.length > 0) {
      const newImages = await uploadMultipleImages(req.files);
      req.body.images = [...(hostel.images || []), ...newImages];
    }

    // Handle location coordinate updates
    if (req.body.latitude && req.body.longitude) {
      req.body.location = {
        type: 'Point',
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
      };
    }

    const updated = await Hostel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Hostel listing updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete hostel listing
// @route   DELETE /api/hostels/:id
// @access  Private (OWNER, ADMIN)
export const deleteHostel = async (req, res, next) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    if (req.user.role !== 'ADMIN' && hostel.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this hostel listing',
      });
    }

    await Hostel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Hostel listing deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
