import { Router } from 'express';
import { getOverview, getTrends, getWorkInsights } from '../controllers/insightsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/overview', protect, getOverview);
router.get('/trends', protect, getTrends);
router.get('/works/:id', protect, getWorkInsights);

export default router;
