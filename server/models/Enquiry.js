import mongoose from 'mongoose';
import { createModelProxy } from './modelProxy.js';

export const EnquirySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      default: '',
    },
    studentPhone: {
      type: String,
      default: '',
    },
    studentEmail: {
      type: String,
      default: '',
    },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true,
      index: true,
    },
    hostelName: {
      type: String,
      default: '',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      required: true,
      index: true,
    },
    roomType: {
      type: String,
      default: 'Single',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'REPLIED', 'ARCHIVED'],
      default: 'PENDING',
    },
    ownerReply: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'enquiries',
  }
);

let EnquiryModel = null;

export const initEnquiryModel = (connection) => {
  if (!connection.models.Enquiry) {
    EnquiryModel = connection.model('Enquiry', EnquirySchema, 'enquiries');
  } else {
    EnquiryModel = connection.models.Enquiry;
  }
  return EnquiryModel;
};

export const Enquiry = createModelProxy(() => EnquiryModel);

export default Enquiry;
