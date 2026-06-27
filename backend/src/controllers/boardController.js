import Board from '../models/Board.js';
import Work from '../models/Work.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/boards
export const createBoard = asyncHandler(async (req, res) => {
  const { name, description, isPublic, isCollaborative } = req.body;
  if (!name) throw ApiError.badRequest('name is required');
  const board = await Board.create({
    name,
    description,
    isPublic: isPublic !== undefined ? isPublic : true,
    isCollaborative: Boolean(isCollaborative),
    owner: req.user._id,
  });
  res.status(201).json({ success: true, board });
});

// GET /api/boards  (?owner=, ?mine=true)
export const getBoards = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.mine === 'true' && req.user) {
    filter.$or = [{ owner: req.user._id }, { collaborators: req.user._id }];
  } else {
    filter.isPublic = true;
    if (req.query.owner) filter.owner = req.query.owner;
  }
  const boards = await Board.find(filter)
    .sort({ updatedAt: -1 })
    .populate('owner', 'name username avatar');
  res.json({ success: true, items: boards });
});

// GET /api/boards/:id
export const getBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id)
    .populate('owner', 'name username avatar')
    .populate('collaborators', 'name username avatar')
    .populate({ path: 'works', populate: { path: 'owner', select: 'name username avatar' } });
  if (!board) throw ApiError.notFound('Board not found');
  if (!board.isPublic && (!req.user || !board.canEdit(req.user._id))) {
    throw ApiError.forbidden('This board is private');
  }
  res.json({ success: true, board });
});

// PUT /api/boards/:id  (req.resource set by ownership middleware)
export const updateBoard = asyncHandler(async (req, res) => {
  const board = req.resource;
  const { name, description, isPublic, isCollaborative } = req.body;
  if (name !== undefined) board.name = name;
  if (description !== undefined) board.description = description;
  if (isPublic !== undefined) board.isPublic = isPublic;
  if (isCollaborative !== undefined) board.isCollaborative = isCollaborative;
  await board.save();
  res.json({ success: true, board });
});

// DELETE /api/boards/:id
export const deleteBoard = asyncHandler(async (req, res) => {
  await req.resource.deleteOne();
  res.json({ success: true, message: 'Board deleted' });
});

// POST /api/boards/:id/works   { workId }   (owner or collaborator)
export const addWork = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) throw ApiError.notFound('Board not found');
  if (!board.canEdit(req.user._id)) throw ApiError.forbidden('Not allowed to edit this board');

  const { workId } = req.body;
  const work = await Work.findById(workId);
  if (!work) throw ApiError.notFound('Work not found');

  if (!board.works.some((w) => w.toString() === workId)) {
    board.works.push(workId);
    if (!board.coverImage && work.thumbnailUrl) board.coverImage = work.thumbnailUrl;
    await board.save();
  }
  res.json({ success: true, board });
});

// DELETE /api/boards/:id/works/:workId
export const removeWork = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) throw ApiError.notFound('Board not found');
  if (!board.canEdit(req.user._id)) throw ApiError.forbidden('Not allowed to edit this board');

  board.works = board.works.filter((w) => w.toString() !== req.params.workId);
  await board.save();
  res.json({ success: true, board });
});

// POST /api/boards/:id/collaborators   { username }   (owner only -> uses ownership middleware)
export const addCollaborator = asyncHandler(async (req, res) => {
  const board = req.resource;
  const user = await User.findOne({ username: (req.body.username || '').toLowerCase() });
  if (!user) throw ApiError.notFound('User not found');

  board.isCollaborative = true;
  if (!board.collaborators.some((c) => c.toString() === user._id.toString())) {
    board.collaborators.push(user._id);
    await board.save();
  }
  res.json({ success: true, board });
});

// DELETE /api/boards/:id/collaborators/:userId  (owner only)
export const removeCollaborator = asyncHandler(async (req, res) => {
  const board = req.resource;
  board.collaborators = board.collaborators.filter((c) => c.toString() !== req.params.userId);
  await board.save();
  res.json({ success: true, board });
});
