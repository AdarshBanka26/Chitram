import Work from '../models/Work.js';
import env from '../config/env.js';
import { cosineSimilarity } from './aiService.js';

// Find works most similar to a query embedding.
// Uses MongoDB Atlas Vector Search when configured; otherwise falls back to an
// in-memory cosine scan over works that have embeddings.
//
// opts: { limit, excludeIds: [ObjectId|string], onlyPublic: bool }
export const findSimilarByVector = async (queryVector, opts = {}) => {
  const { limit = 12, excludeIds = [], onlyPublic = true } = opts;
  if (!queryVector || !queryVector.length) return [];

  const excludeSet = new Set(excludeIds.map((id) => id.toString()));

  if (env.useAtlasVectorSearch) {
    // Requires an Atlas Vector Search index named "work_vector_index" on `embedding`.
    const pipeline = [
      {
        $vectorSearch: {
          index: 'work_vector_index',
          path: 'embedding',
          queryVector,
          numCandidates: Math.max(100, limit * 10),
          limit: limit + excludeSet.size + 1,
        },
      },
      ...(onlyPublic ? [{ $match: { isPublic: true } }] : []),
      {
        $project: {
          embedding: 0,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ];
    const results = await Work.aggregate(pipeline);
    return results
      .filter((w) => !excludeSet.has(w._id.toString()))
      .slice(0, limit);
  }

  // Fallback: load candidates with embeddings and score in memory.
  const filter = { embedding: { $exists: true, $ne: null } };
  if (onlyPublic) filter.isPublic = true;

  const candidates = await Work.find(filter)
    .select('+embedding')
    .limit(2000) // cap for performance in fallback mode
    .lean();

  const scored = candidates
    .filter((w) => !excludeSet.has(w._id.toString()))
    .map((w) => {
      const score = cosineSimilarity(queryVector, w.embedding);
      const { embedding, ...rest } = w;
      return { ...rest, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
};
