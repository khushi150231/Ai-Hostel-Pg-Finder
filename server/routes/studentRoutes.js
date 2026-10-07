import express from 'express';
import {
  getProfile,
  updateProfile,
  getSearchHistory,
} from '../controllers/studentController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticateUser);
router.use(authorizeRole('STUDENT', 'ADMIN'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/searches', getSearchHistory);

export default router;
