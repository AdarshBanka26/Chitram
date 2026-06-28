import { Router } from 'express';
import {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  addWork,
  removeWork,
  addCollaborator,
  removeCollaborator,
} from '../controllers/boardController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { authorizeOwnership } from '../middleware/authorize.js';
import Board from '../models/Board.js';

const router = Router();

const loadBoard = authorizeOwnership({
  loader: (req) => Board.findById(req.params.id),
  attachAs: 'resource',
  notFoundMsg: 'Board not found',
});

router.route('/').get(optionalAuth, getBoards).post(protect, createBoard);

// Works can be added/removed by owner OR collaborators (checked inside controller).
router.post('/:id/works', protect, addWork);
router.delete('/:id/works/:workId', protect, removeWork);

// Collaborator management is owner-only.
router.post('/:id/collaborators', protect, loadBoard, addCollaborator);
router.delete('/:id/collaborators/:userId', protect, loadBoard, removeCollaborator);

router
  .route('/:id')
  .get(optionalAuth, getBoard)
  .put(protect, loadBoard, updateBoard)
  .delete(protect, loadBoard, deleteBoard);

export default router;
