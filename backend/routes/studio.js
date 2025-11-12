import express from 'express';
import { getStudios, getStudioById, createStudio } from '../controllers/studioController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getStudios);
router.get('/:id', getStudioById);
router.post('/', protect, authorize('admin'), createStudio);

export default router;