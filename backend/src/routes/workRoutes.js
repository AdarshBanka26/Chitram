import { Router } from 'express';
import {
  createWork,
  getWorks,
  getWork,
  updateWork,
  deleteWork,
  toggleLike,
  toggleSave,
  getSimilarWorks,
  getFollowingWorks,
} from '../controllers/workController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { authorizeOwnership } from '../middleware/authorize.js';
import { uploadImage } from '../config/cloudinary.js';
import Work from '../models/Work.js';

const router = Router();

const loadWork = authorizeOwnership({
  loader: (req) => Work.findById(req.params.id),
  attachAs: 'resource',
  notFoundMsg: 'Work not found',
});

router.route('/').get(getWorks).post(protect, uploadImage.single('image'), createWork);

// Must be before /:id to avoid "following" being treated as an id.
router.get('/following', protect, getFollowingWorks);

router.get('/:id/similar', getSimilarWorks);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/save', protect, toggleSave);

router
  .route('/:id')
  .get(optionalAuth, getWork)
  .put(protect, loadWork, updateWork)
  .delete(protect, loadWork, deleteWork);

export default router;