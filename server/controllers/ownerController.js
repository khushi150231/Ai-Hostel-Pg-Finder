import { Owner } from '../models/Owner.js';
import { Hostel } from '../models/Hostel.js';
import { Enquiry } from '../models/Enquiry.js';

// @desc    Get current owner's profile and verification status
// @route   GET /api/owners/profile
// @access  Private (OWNER)
export const getOwnerProfile = async (req, res, next) => {
  try {
    const owner = await Owner.findById(req.user.id).select('-passwordHash');
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Owner account not found' });
    }
    res.json({ success: true, data: owner });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all properties owned by current owner
// @route   GET /api/owners/hostels
// @access  Private (OWNER)
export const getMyHostels = async (req, res, next) => {
  try {
    const hostels = await Hostel.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: hostels.length, data: hostels });
  } catch (err) {
    next(err);
  }
};

// @desc    Update owner details
// @route   PUT /api/owners/profile
// @access  Private (OWNER)
export const updateOwnerProfile = async (req, res, next) => {
  try {
    const { name, phone, businessName } = req.body;
    const owner = await Owner.findByIdAndUpdate(
      req.user.id,
      { name, phone, businessName },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json({ success: true, message: 'Owner profile updated', data: owner });
  } catch (err) {
    next(err);
  }
};
