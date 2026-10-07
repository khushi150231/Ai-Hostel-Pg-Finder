import mongoose from 'mongoose';
import { createModelProxy } from './modelProxy.js';

export const SearchSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
      index: true,
    },
    originalQuery: {
      type: String,
      default: '',
      trim: true,
    },
    budget: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
    },
    location: {
      area: { type: String, default: '' },
      city: { type: String, default: 'Vadodara' },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      radiusKm: { type: Number, default: null },
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'searches',
  }
);

let SearchModel = null;

export const initSearchModel = (connection) => {
  if (!connection.models.Search) {
    SearchModel = connection.model('Search', SearchSchema, 'searches');
  } else {
    SearchModel = connection.models.Search;
  }
  return SearchModel;
};

export const Search = createModelProxy(() => SearchModel);

export default Search;
