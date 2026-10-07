import { Student } from '../models/Student.js';
import { Owner } from '../models/Owner.js';
import { Hostel } from '../models/Hostel.js';
import { Enquiry } from '../models/Enquiry.js';

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (ADMIN)
export const getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all owners
// @route   GET /api/admin/owners
// @access  Private (ADMIN)
export const getAllOwners = async (req, res, next) => {
  try {
    const owners = await Owner.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: owners.length,
      data: owners,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all hostels (verified & pending)
// @route   GET /api/admin/hostels
// @access  Private (ADMIN)
export const getAllHostels = async (req, res, next) => {
  try {
    const hostels = await Hostel.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: hostels.length,
      data: hostels,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify or update verification status of a hostel
// @route   PUT /api/admin/hostels/:id/verify
// @access  Private (ADMIN)
export const verifyHostel = async (req, res, next) => {
  try {
    const { verificationStatus = 'ADMIN_VERIFIED', availabilityStatus } = req.body;
    const update = {
      verificationStatus,
      lastVerifiedAt: new Date(),
    };

    if (availabilityStatus) {
      update.availabilityStatus = availabilityStatus;
    }

    const hostel = await Hostel.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    res.json({
      success: true,
      message: `Hostel verification status updated to '${verificationStatus}'`,
      data: hostel,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Granular admin checklist verification (Section 20)
// @route   PUT /api/admin/hostels/:id/checklist-verify
// @access  Private (ADMIN)
export const checklistVerifyHostel = async (req, res, next) => {
  try {
    const {
      addressVerified = true,
      ownerVerified = true,
      phoneVerified = true,
      priceVerified = true,
      amenitiesVerified = true,
      availabilityVerified = true,
      photosVerified = true,
      availabilityStatus = 'AVAILABLE',
    } = req.body;

    const allChecked =
      addressVerified &&
      ownerVerified &&
      phoneVerified &&
      priceVerified &&
      amenitiesVerified &&
      availabilityVerified &&
      photosVerified;

    const update = {
      'adminChecks.addressVerified': Boolean(addressVerified),
      'adminChecks.ownerVerified': Boolean(ownerVerified),
      'adminChecks.phoneVerified': Boolean(phoneVerified),
      'adminChecks.priceVerified': Boolean(priceVerified),
      'adminChecks.amenitiesVerified': Boolean(amenitiesVerified),
      'adminChecks.availabilityVerified': Boolean(availabilityVerified),
      'adminChecks.photosVerified': Boolean(photosVerified),
      verificationStatus: allChecked ? 'ADMIN_VERIFIED' : 'SOURCE_LISTED',
      availabilityStatus,
      lastVerifiedAt: new Date(),
      priceLastVerifiedAt: new Date(),
    };

    const hostel = await Hostel.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    res.json({
      success: true,
      message: allChecked
        ? 'Property fully verified as ADMIN_VERIFIED'
        : 'Checklist updated; status set to SOURCE_LISTED pending remaining items.',
      data: hostel,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark property information as outdated / stale (Section 21)
// @route   PUT /api/admin/hostels/:id/mark-outdated
// @access  Private (ADMIN)
export const markHostelOutdated = async (req, res, next) => {
  try {
    const hostel = await Hostel.findByIdAndUpdate(
      req.params.id,
      {
        availabilityStatus: 'UNKNOWN',
        'adminChecks.availabilityVerified': false,
      },
      { new: true }
    );

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    res.json({
      success: true,
      message: 'Property listing marked as outdated. Availability status set to UNKNOWN.',
      data: hostel,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete hostel listing
// @route   DELETE /api/admin/hostels/:id
// @access  Private (ADMIN)
export const deleteHostelByAdmin = async (req, res, next) => {
  try {
    const hostel = await Hostel.findByIdAndDelete(req.params.id);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    res.json({
      success: true,
      message: 'Hostel deleted by administrator',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all inquiries across platform
// @route   GET /api/admin/enquiries
// @access  Private (ADMIN)
export const getAllEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (err) {
    next(err);
  }
};
