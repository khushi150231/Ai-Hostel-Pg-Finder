import express from 'express';
import {
  getAllStudents,
  getAllOwners,
  getAllHostels,
  verifyHostel,
  checklistVerifyHostel,
  markHostelOutdated,
  deleteHostelByAdmin,
  getAllEnquiries,
} from '../controllers/adminController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticateUser);
router.use(authorizeRole('ADMIN'));

router.get('/students', getAllStudents);
router.get('/owners', getAllOwners);
router.get('/hostels', getAllHostels);
router.put('/hostels/:id/verify', verifyHostel);
router.put('/hostels/:id/checklist-verify', checklistVerifyHostel);
router.put('/hostels/:id/mark-outdated', markHostelOutdated);
router.delete('/hostels/:id', deleteHostelByAdmin);
router.get('/enquiries', getAllEnquiries);

export default router;
