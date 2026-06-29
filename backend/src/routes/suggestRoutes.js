import { Router } from 'express';
import { suggest, tags, polish } from '../controllers/suggestController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/suggest', protect, suggest);
router.post('/tags', protect, tags);
router.post('/polish', protect, polish);

export default router;