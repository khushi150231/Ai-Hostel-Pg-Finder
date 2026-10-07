import mongoose from 'mongoose';
import { createModelProxy } from './modelProxy.js';

export const StudentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Do not return by default in queries
    },
    college: {
      type: String,
      default: 'Parul University',
      trim: true,
    },
    course: {
      type: String,
      trim: true,
      default: 'B.Tech',
    },
    year: {
      type: String,
      default: '1st Year',
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Other'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male',
    },
    budgetMin: {
      type: Number,
      default: 2000,
    },
    budgetMax: {
      type: Number,
      default: 8000,
    },
    preferredLocations: {
      type: [String],
      default: ['Gotri', 'Limda'],
    },
    preferredRoomType: {
      type: String,
      enum: ['Single', 'Double Sharing', 'Triple Sharing', 'Four Sharing', 'Any'],
      default: 'Any',
    },
    preferredAmenities: {
      type: [String],
      default: ['wifi', 'food'],
    },
    profileImage: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      default: 'STUDENT',
      immutable: true,
    },
  },
  {
    timestamps: true,
    collection: 'students',
  }
);

let StudentModel = null;

export const initStudentModel = (connection) => {
  if (!connection.models.Student) {
    StudentModel = connection.model('Student', StudentSchema, 'students');
  } else {
    StudentModel = connection.models.Student;
  }
  return StudentModel;
};

export const Student = createModelProxy(() => StudentModel);

export default Student;
