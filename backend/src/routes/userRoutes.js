import { Router } from 'express';
import { getProfile, updateMe, getDashboard, toggleFollow } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/me/dashboard', protect, getDashboard);
router.put('/me', protect, updateMe);
router.post('/:id/follow', protect, toggleFollow);
router.get('/:username', getProfile);

export default router;