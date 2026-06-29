import { Router } from 'express';
import { search, getCategories } from '../controllers/searchController.js';

const router = Router();

router.get('/', search);
router.get('/categories', getCategories);

export default router;