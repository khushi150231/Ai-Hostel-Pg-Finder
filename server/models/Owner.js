import mongoose from 'mongoose';
import { createModelProxy } from './modelProxy.js';

export const OwnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    businessName: {
      type: String,
      default: '',
      trim: true,
    },
    role: {
      type: String,
      default: 'OWNER',
      enum: ['OWNER', 'ADMIN'],
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
    collection: 'owners',
  }
);

let OwnerModel = null;

export const initOwnerModel = (connection) => {
  if (!connection.models.Owner) {
    OwnerModel = connection.model('Owner', OwnerSchema, 'owners');
  } else {
    OwnerModel = connection.models.Owner;
  }
  return OwnerModel;
};

export const Owner = createModelProxy(() => OwnerModel);

export default Owner;
