import express from 'express';
import {
  getFavourites,
  addFavourite,
  removeFavourite,
} from '../controllers/favouriteController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', getFavourites);
router.post('/:hostelId', addFavourite);
router.delete('/:hostelId', removeFavourite);

export default router;
