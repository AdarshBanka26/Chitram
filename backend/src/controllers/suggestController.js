import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { aiEnabled, generateSuggestions, suggestTags, polishDescription } from '../services/aiService.js';

// POST /api/ai/suggest
// Body: { type: 'image'|'writing', title?, description?, category?, textContent? }
export const suggest = asyncHandler(async (req, res) => {
  if (!aiEnabled()) throw ApiError.badRequest('AI features are not configured on this server.');

  const { type, title, description, category, textContent } = req.body;
  if (!type || !['image', 'writing'].includes(type)) {
    throw ApiError.badRequest('type must be "image" or "writing"');
  }
  if (type === 'image' && !title?.trim()) {
    throw ApiError.badRequest('title is required for image suggestions — type a title first');
  }
  if (type === 'writing' && !textContent) {
    throw ApiError.badRequest('textContent is required for writing type');
  }

  const result = await generateSuggestions({ type, title, description, category, textContent });
  res.json({ success: true, ...result });
});

// POST /api/ai/tags
// Always returns tags — AI when available, category-based fallback otherwise.
export const tags = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  if (!title?.trim()) throw ApiError.badRequest('title is required');

  const suggested = await suggestTags(title, description || '', category || '');
  res.json({ success: true, tags: suggested });
});

// POST /api/ai/polish
// Body: { description, title?, category? }
// Returns a polished version of the description. Falls back to original if AI unavailable.
export const polish = asyncHandler(async (req, res) => {
  const { description, title = '', category = '' } = req.body;
  if (!description?.trim()) throw ApiError.badRequest('description is required');

  const result = await polishDescription(description, title, category);
  res.json({ success: true, description: result });
});
