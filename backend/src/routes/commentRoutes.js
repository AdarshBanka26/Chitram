import { Router } from 'express';
import { getComments, addComment, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/work/:workId', getComments);
router.post('/work/:workId', protect, addComment);
router.delete('/:id', protect, deleteComment);

export default router;
