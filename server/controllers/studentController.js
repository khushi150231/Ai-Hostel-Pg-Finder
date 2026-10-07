import { Student } from '../models/Student.js';
import { Search } from '../models/Search.js';

// @desc    Get current student's full profile
// @route   GET /api/students/profile
// @access  Private (STUDENT)
export const getProfile = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user.id).select('-passwordHash');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// @desc    Update current student profile
// @route   PUT /api/students/profile
// @access  Private (STUDENT)
export const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'fullName',
      'phone',
      'college',
      'course',
      'year',
      'gender',
      'budgetMin',
      'budgetMax',
      'preferredLocations',
      'preferredRoomType',
      'preferredAmenities',
      'profileImage',
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const student = await Student.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    res.json({
      success: true,
      message: 'Student profile updated successfully',
      data: student,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get student search history
// @route   GET /api/students/searches
// @access  Private (STUDENT)
export const getSearchHistory = async (req, res, next) => {
  try {
    const searches = await Search.find({ studentId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(15);
    res.json({ success: true, count: searches.length, data: searches });
  } catch (err) {
    next(err);
  }
};
