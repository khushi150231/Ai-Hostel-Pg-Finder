import { Review } from '../models/Review.js';
import { Hostel } from '../models/Hostel.js';

// Helper to recalculate average rating and count on Hostel
const updateHostelRatingStats = async (hostelId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { hostelId } },
      {
        $group: {
          _id: '$hostelId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Hostel.findByIdAndUpdate(hostelId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].count,
      });
    } else {
      await Hostel.findByIdAndUpdate(hostelId, {
        rating: 4.0,
        reviewCount: 0,
      });
    }
  } catch (err) {
    console.warn('Could not recalculate hostel rating:', err.message);
  }
};

// @desc    Get all reviews for a hostel
// @route   GET /api/reviews/:hostelId
// @access  Public
export const getHostelReviews = async (req, res, next) => {
  try {
    const { hostelId } = req.params;
    const reviews = await Review.find({ hostelId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new student review for a hostel
// @route   POST /api/reviews
// @access  Private (STUDENT)
export const createReview = async (req, res, next) => {
  try {
    const { hostelId, rating, comment } = req.body;
    const studentId = req.user.id;

    if (!hostelId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Hostel ID, rating (1-5), and comment are required',
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5',
      });
    }

    // Check duplicate: prevent multiple reviews from same student
    const existing = await Review.findOne({ studentId, hostelId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this hostel. You can update your existing review instead.',
      });
    }

    const review = await Review.create({
      studentId,
      studentName: req.user.name || 'Student Resident',
      studentCollege: req.user.userDoc?.college || 'Vadodara Student',
      hostelId,
      rating: numRating,
      comment: comment.trim(),
    });

    // Update hostel's cumulative rating & reviewCount
    await updateHostelRatingStats(review.hostelId);

    res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (STUDENT, ADMIN)
export const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (req.user.role !== 'ADMIN' && review.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this review' });
    }

    if (rating !== undefined) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment.trim();

    await review.save();
    await updateHostelRatingStats(review.hostelId);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (STUDENT, ADMIN)
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (req.user.role !== 'ADMIN' && review.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const hostelId = review.hostelId;
    await Review.findByIdAndDelete(req.params.id);
    await updateHostelRatingStats(hostelId);

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
