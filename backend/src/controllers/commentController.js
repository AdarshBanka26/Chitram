import Comment from '../models/Comment.js';
import Work from '../models/Work.js';
import Activity from '../models/Activity.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/comments/work/:workId
export const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ work: req.params.workId })
    .sort({ createdAt: 1 })
    .populate('author', 'name username avatar');
  res.json({ success: true, items: comments });
});

// POST /api/comments/work/:workId   { text, parent? }
export const addComment = asyncHandler(async (req, res) => {
  const { text, parent } = req.body;
  if (!text) throw ApiError.badRequest('text is required');

  const work = await Work.findById(req.params.workId);
  if (!work) throw ApiError.notFound('Work not found');

  const comment = await Comment.create({
    work: work._id,
    author: req.user._id,
    text,
    parent: parent || null,
  });
  work.commentCount += 1;
  await work.save();
  Activity.create({ type: 'comment', work: work._id, user: req.user._id }).catch(() => {});

  await comment.populate('author', 'name username avatar');
  res.status(201).json({ success: true, comment });
});

// DELETE /api/comments/:id  (comment author, work owner, or admin)
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound('Comment not found');

  const work = await Work.findById(comment.work);
  const isAuthor = comment.author.toString() === req.user._id.toString();
  const isWorkOwner = work && work.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isAuthor && !isWorkOwner && !isAdmin) throw ApiError.forbidden('Not allowed to delete this comment');

  await comment.deleteOne();
  if (work) {
    work.commentCount = Math.max(0, work.commentCount - 1);
    await work.save();
  }
  res.json({ success: true, message: 'Comment deleted' });
});
