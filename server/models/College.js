import mongoose from 'mongoose';
import { createModelProxy } from './modelProxy.js';

export const CollegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'College name is required'],
      unique: true,
      trim: true,
    },
    city: {
      type: String,
      default: 'Vadodara',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    website: {
      type: String,
      default: null,
      trim: true,
    },
    type: {
      type: String,
      enum: ['State University', 'Private University', 'Deemed University', 'Institute', 'Other'],
      default: 'Private University',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
  },
  {
    timestamps: true,
    collection: 'colleges',
  }
);

CollegeSchema.pre('save', function (next) {
  if (this.longitude !== undefined && this.latitude !== undefined) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude],
    };
  }
  next();
});

CollegeSchema.index({ location: '2dsphere' });

let CollegeModel = null;

export const initCollegeModel = (connection) => {
  if (!connection.models.College) {
    CollegeModel = connection.model('College', CollegeSchema, 'colleges');
  } else {
    CollegeModel = connection.models.College;
  }
  return CollegeModel;
};

export const College = createModelProxy(() => CollegeModel);

export default College;
