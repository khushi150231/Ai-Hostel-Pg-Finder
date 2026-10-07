import mongoose from 'mongoose';
import { createModelProxy } from './modelProxy.js';

export const AreaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Area name is required'],
      unique: true,
      trim: true,
    },
    city: {
      type: String,
      default: 'Vadodara',
      trim: true,
    },
    pincode: {
      type: String,
      default: null,
      trim: true,
    },
    popularFor: {
      type: [String],
      default: [],
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'areas',
  }
);

let AreaModel = null;

export const initAreaModel = (connection) => {
  if (!connection.models.Area) {
    AreaModel = connection.model('Area', AreaSchema, 'areas');
  } else {
    AreaModel = connection.models.Area;
  }
  return AreaModel;
};

export const Area = createModelProxy(() => AreaModel);

export default Area;
