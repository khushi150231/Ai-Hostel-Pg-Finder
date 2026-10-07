import { Enquiry } from '../models/Enquiry.js';
import { Hostel } from '../models/Hostel.js';

// @desc    Submit an inquiry from student to hostel owner
// @route   POST /api/enquiries
// @access  Private (STUDENT)
export const createEnquiry = async (req, res, next) => {
  try {
    const { hostelId, roomType, message, phone, email } = req.body;
    const studentId = req.user.id;

    if (!hostelId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Hostel ID and message are required fields',
      });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    const enquiry = await Enquiry.create({
      studentId,
      studentName: req.user.name,
      studentPhone: phone || req.user.userDoc?.phone || '',
      studentEmail: email || req.user.email,
      hostelId: hostel._id,
      hostelName: hostel.name,
      ownerId: hostel.ownerId,
      roomType: roomType || 'Single',
      message: message.trim(),
      status: 'PENDING',
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry sent successfully to property management',
      data: enquiry,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all inquiries sent by the current student
// @route   GET /api/enquiries/student
// @access  Private (STUDENT)
export const getStudentEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all inquiries received by the current owner
// @route   GET /api/enquiries/owner
// @access  Private (OWNER)
export const getOwnerEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update status or reply to inquiry (OWNER)
// @route   PUT /api/enquiries/:id/status
// @access  Private (OWNER, ADMIN)
export const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status, ownerReply } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry record not found' });
    }

    if (req.user.role !== 'ADMIN' && enquiry.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: Not your property inquiry' });
    }

    if (status) enquiry.status = status;
    if (ownerReply) enquiry.ownerReply = ownerReply;

    await enquiry.save();

    res.json({
      success: true,
      message: 'Enquiry status updated successfully',
      data: enquiry,
    });
  } catch (err) {
    next(err);
  }
};
