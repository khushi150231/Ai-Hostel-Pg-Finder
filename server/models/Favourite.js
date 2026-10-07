import mongoose from 'mongoose';
import { createModelProxy } from './modelProxy.js';

export const FavouriteSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    hostelId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'favourites',
  }
);

// Prevent duplicate favourite entry for the same student and hostel
FavouriteSchema.index({ studentId: 1, hostelId: 1 }, { unique: true });

let FavouriteModel = null;

export const initFavouriteModel = (connection) => {
  if (!connection.models.Favourite) {
    FavouriteModel = connection.model('Favourite', FavouriteSchema, 'favourites');
  } else {
    FavouriteModel = connection.models.Favourite;
  }
  return FavouriteModel;
};

export const Favourite = createModelProxy(() => FavouriteModel);

export default Favourite;
