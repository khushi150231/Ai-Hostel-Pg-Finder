import mongoose from 'mongoose';
import { createModelProxy } from './modelProxy.js';

export const StudentFeedbackSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
      index: true,
    },
    selectedHostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
      index: true,
    },
    searchQuery: {
      type: String,
      default: '',
    },
    matchScore: {
      type: Number,
      default: null,
    },
    whetherStudentContacted: {
      type: Boolean,
      default: false,
    },
    whetherStudentVisited: {
      type: Boolean,
      default: false,
    },
    whetherStudentBooked: {
      type: Boolean,
      default: false,
    },
    studentRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    studentFeedback: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'student_feedback',
  }
);

let StudentFeedbackModel = null;

export const initStudentFeedbackModel = (connection) => {
  if (!connection.models.StudentFeedback) {
    StudentFeedbackModel = connection.model('StudentFeedback', StudentFeedbackSchema, 'student_feedback');
  } else {
    StudentFeedbackModel = connection.models.StudentFeedback;
  }
  return StudentFeedbackModel;
};

export const StudentFeedback = createModelProxy(() => StudentFeedbackModel);

export default StudentFeedback;
