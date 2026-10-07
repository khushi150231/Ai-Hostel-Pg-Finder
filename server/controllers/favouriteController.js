import { Favourite } from '../models/Favourite.js';
import { Hostel } from '../models/Hostel.js';

// @desc    Get all favourite hostels for authenticated student
// @route   GET /api/favourites
// @access  Private (STUDENT)
export const getFavourites = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const favRecords = await Favourite.find({ studentId }).sort({ createdAt: -1 }).lean();

    const hostelIds = favRecords.map((f) => f.hostelId);

    // Look up hostels from hostel_finder_db
    const hostels = await Hostel.find({
      $or: [
        { _id: { $in: hostelIds.filter((id) => id.match(/^[0-9a-fA-F]{24}$/)) } },
      ],
    }).lean();

    const hostelMap = new Map(hostels.map((h) => [h._id.toString(), h]));

    const enriched = favRecords.map((f) => ({
      favouriteId: f._id,
      hostelId: f.hostelId,
      savedAt: f.createdAt,
      hostel: hostelMap.get(f.hostelId) || null,
    }));

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a hostel to favourites
// @route   POST /api/favourites/:hostelId
// @access  Private (STUDENT)
export const addFavourite = async (req, res, next) => {
  try {
    const { hostelId } = req.params;
    const studentId = req.user.id;

    if (!hostelId) {
      return res.status(400).json({ success: false, message: 'Hostel ID is required' });
    }

    // Upsert or check existing
    const existing = await Favourite.findOne({ studentId, hostelId });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Hostel is already in favourites',
        data: existing,
      });
    }

    const favourite = await Favourite.create({ studentId, hostelId });

    res.status(201).json({
      success: true,
      message: 'Hostel bookmarked to favourites',
      data: favourite,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove hostel from favourites
// @route   DELETE /api/favourites/:hostelId
// @access  Private (STUDENT)
export const removeFavourite = async (req, res, next) => {
  try {
    const { hostelId } = req.params;
    const studentId = req.user.id;

    const result = await Favourite.findOneAndDelete({ studentId, hostelId });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Favourite bookmark not found' });
    }

    res.json({
      success: true,
      message: 'Hostel removed from favourites',
    });
  } catch (err) {
    next(err);
  }
};
