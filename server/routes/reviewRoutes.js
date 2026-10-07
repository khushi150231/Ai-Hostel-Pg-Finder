import express from 'express';
import {
  getHostelReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:hostelId', getHostelReviews);
router.post('/', authenticateUser, createReview);
router.put('/:id', authenticateUser, updateReview);
router.delete('/:id', authenticateUser, deleteReview);

export default router;
