import express from 'express';
import {
  createEnquiry,
  getStudentEnquiries,
  getOwnerEnquiries,
  updateEnquiryStatus,
} from '../controllers/enquiryController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', createEnquiry);
router.get('/student', getStudentEnquiries);
router.get('/owner', getOwnerEnquiries);
router.put('/:id/status', updateEnquiryStatus);

export default router;
