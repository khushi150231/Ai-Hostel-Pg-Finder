import express from 'express';
import {
  getHostels,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
  searchHostelsHandler,
  getNearbyHostels,
  getFeaturedHostels,
} from '../controllers/hostelController.js';
import { authenticateUser, optionalAuth } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/roleMiddleware.js';
import { upload } from '../services/cloudinaryService.js';

const router = express.Router();

// Public routes (with optional auth to record student search history)
router.get('/', optionalAuth, getHostels);
router.get('/search', optionalAuth, searchHostelsHandler);
router.get('/nearby', optionalAuth, getNearbyHostels);
router.get('/featured', getFeaturedHostels);
router.get('/:id', getHostelById);

// Protected routes (OWNER, ADMIN)
router.post(
  '/',
  authenticateUser,
  authorizeRole('OWNER', 'ADMIN'),
  upload.array('images', 10),
  createHostel
);

router.put(
  '/:id',
  authenticateUser,
  authorizeRole('OWNER', 'ADMIN'),
  upload.array('images', 10),
  updateHostel
);

router.delete(
  '/:id',
  authenticateUser,
  authorizeRole('OWNER', 'ADMIN'),
  deleteHostel
);

export default router;
