import mongoose from 'mongoose';
import Work from '../models/Work.js';
import Activity from '../models/Activity.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Build a date->counts map for a set of works over the last N days, grouped by day & type.
const buildTrends = async (workIds, days) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await Activity.aggregate([
    { $match: { work: { $in: workIds }, createdAt: { $gte: since }, type: { $in: ['view', 'like', 'save', 'comment'] } } },
    {
      $group: {
        _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, type: '$type' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.day': 1 } },
  ]);

  // Reshape into [{ date, views, likes, saves, comments }] with zero-filled days.
  const map = {};
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    map[d] = { date: d, views: 0, likes: 0, saves: 0, comments: 0 };
  }
  rows.forEach((r) => {
    const day = r._id.day;
    const key = `${r._id.type}s`; // view->views, like->likes, etc.
    if (map[day] && key in map[day]) map[day][key] = r.count;
  });
  return Object.values(map);
};

// GET /api/insights/overview  (totals across the authenticated user's works)
export const getOverview = asyncHandler(async (req, res) => {
  const uid = req.user._id;
  const [agg, topWorks] = await Promise.all([
    Work.aggregate([
      { $match: { owner: uid } },
      {
        $group: {
          _id: null,
          works: { $sum: 1 },
          views: { $sum: '$viewCount' },
          likes: { $sum: '$likeCount' },
          saves: { $sum: '$saveCount' },
          comments: { $sum: '$commentCount' },
        },
      },
    ]),
    Work.find({ owner: uid })
      .sort({ likeCount: -1, viewCount: -1 })
      .limit(5)
      .select('title category likeCount saveCount viewCount commentCount thumbnailUrl'),
  ]);

  res.json({
    success: true,
    totals: agg[0] || { works: 0, views: 0, likes: 0, saves: 0, comments: 0 },
    topWorks,
  });
});

// GET /api/insights/trends?days=30  (time series for graphs)
export const getTrends = asyncHandler(async (req, res) => {
  const days = Math.min(90, Math.max(7, parseInt(req.query.days, 10) || 30));
  const works = await Work.find({ owner: req.user._id }).select('_id').lean();
  const workIds = works.map((w) => w._id);
  const series = workIds.length ? await buildTrends(workIds, days) : [];
  res.json({ success: true, days, series });
});

// GET /api/insights/works/:id?days=30  (per-work trend, owner only)
export const getWorkInsights = asyncHandler(async (req, res) => {
  const work = await Work.findById(req.params.id);
  if (!work) throw ApiError.notFound('Work not found');
  if (work.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not your work');
  }
  const days = Math.min(90, Math.max(7, parseInt(req.query.days, 10) || 30));
  const series = await buildTrends([new mongoose.Types.ObjectId(work._id)], days);
  res.json({
    success: true,
    work: { id: work._id, title: work.title, views: work.viewCount, likes: work.likeCount, saves: work.saveCount },
    days,
    series,
  });
});
