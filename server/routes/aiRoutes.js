import express from 'express';
import {
  aiSearchHandler,
  aiCompareHandler,
  aiChatHandler,
  aiPersonalizedHandler,
  aiExtractRequirementsHandler,
} from '../controllers/aiController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Optionally authenticated AI endpoints
router.post('/search', optionalAuth, aiSearchHandler);
router.post('/compare', aiCompareHandler);
router.post('/chat', optionalAuth, aiChatHandler);
router.post('/extract', aiExtractRequirementsHandler);

// Protected student-specific AI recommendations
router.get('/recommendations/personalized', protect, aiPersonalizedHandler);

export default router;
