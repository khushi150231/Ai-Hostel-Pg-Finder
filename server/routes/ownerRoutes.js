import express from 'express';
import {
  getOwnerProfile,
  getMyHostels,
  updateOwnerProfile,
} from '../controllers/ownerController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticateUser);
router.use(authorizeRole('OWNER', 'ADMIN'));

router.get('/profile', getOwnerProfile);
router.put('/profile', updateOwnerProfile);
router.get('/hostels', getMyHostels);

export default router;
