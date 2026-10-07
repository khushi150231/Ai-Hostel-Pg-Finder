import mongoose from 'mongoose';
import { createModelProxy } from './modelProxy.js';

export const ReviewSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      default: 'Anonymous Student',
    },
    studentCollege: {
      type: String,
      default: '',
    },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
    collection: 'reviews',
  }
);

// Prevent same student writing duplicate reviews for the same hostel within 30 days
ReviewSchema.index({ studentId: 1, hostelId: 1 }, { unique: true });

let ReviewModel = null;

export const initReviewModel = (connection) => {
  if (!connection.models.Review) {
    ReviewModel = connection.model('Review', ReviewSchema, 'reviews');
  } else {
    ReviewModel = connection.models.Review;
  }
  return ReviewModel;
};

export const Review = createModelProxy(() => ReviewModel);

export default Review;
