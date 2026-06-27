import OpenAI from 'openai';
import env from '../config/env.js';
import { CATEGORIES } from '../models/Work.js';

let client = null;
if (env.openai.enabled) {
  client = new OpenAI({ apiKey: env.openai.apiKey });
}

export const aiEnabled = () => Boolean(client);

// Build the canonical text we embed for a work (title + description + tags + content snippet).
export const buildEmbeddingText = (work) => {
  const parts = [
    work.title,
    work.description,
    (work.tags || []).join(' '),
    work.category,
    work.type === 'writing' ? (work.textContent || '').slice(0, 2000) : '',
  ];
  return parts.filter(Boolean).join('\n').trim();
};

// Returns a numeric embedding vector, or null if AI disabled / on error.
export const generateEmbedding = async (text) => {
  if (!client || !text) return null;
  try {
    const resp = await client.embeddings.create({
      model: env.openai.embeddingModel,
      input: text.slice(0, 8000),
    });
    return resp.data[0].embedding;
  } catch (err) {
    console.warn('[ai] embedding failed:', err.message);
    return null;
  }
};

// Generate title, description, tags, and category suggestions — text-only, no image needed.
// For images: uses the title + description + category the user already typed.
// For writing: uses the first 2000 chars of textContent.
export const generateSuggestions = async ({ type, title = '', description = '', category = '', textContent = '' }) => {
  if (!client) return null;

  const context =
    type === 'writing'
      ? `Content:\n${(textContent || '').slice(0, 2000)}`
      : [
          `Title: ${title || '(untitled)'}`,
          description ? `Description: ${description}` : null,
          category ? `Category: ${category}` : null,
        ]
          .filter(Boolean)
          .join('\n');

  const prompt = `You are a creative curator for an online art gallery. Based on the provided metadata, suggest compelling upload details.
Respond ONLY with compact JSON (no markdown):
{"title":"evocative title (max 60 chars)","description":"2-3 sentence gallery-style description","tags":["lowercase","keywords"],"category":"one of: ${CATEGORIES.join(', ')}"}
Rules: title should be poetic and short; 4-6 descriptive tags; description should be engaging.

${context}`;

  try {
    const resp = await client.chat.completions.create({
      model: env.openai.chatModel,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 300,
    });

    const parsed = JSON.parse(resp.choices[0].message.content);
    return {
      title: typeof parsed.title === 'string' ? parsed.title.slice(0, 100).trim() : '',
      description: typeof parsed.description === 'string' ? parsed.description.slice(0, 500).trim() : '',
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.map((t) => String(t).toLowerCase().trim()).filter(Boolean).slice(0, 8)
        : [],
      category: CATEGORIES.includes(parsed.category) ? parsed.category : '',
    };
  } catch (err) {
    throw new Error(`AI suggestion error: ${err.message}`);
  }
};

// Aesthetic / mood fallback tags — style descriptors that help with discovery
// regardless of the specific content. Deliberately not medium-descriptive.
const GENERIC_TAGS = {
  art:         ['bold', 'expressive', 'contemporary', 'vibrant', 'textured'],
  photography: ['moody', 'cinematic', 'atmospheric', 'candid', 'raw'],
  writing:     ['poetic', 'lyrical', 'evocative', 'introspective', 'narrative'],
  design:      ['minimal', 'geometric', 'clean', 'modern', 'sharp'],
  music:       ['ambient', 'soulful', 'rhythmic', 'experimental', 'melodic'],
  other:       ['aesthetic', 'minimal', 'bold', 'expressive', 'contemporary'],
};

const getGenericTags = (category) => GENERIC_TAGS[category] || GENERIC_TAGS.other;

// Suggest relevant tags — always returns something via category fallback when AI is unavailable.
export const suggestTags = async (title, description, category) => {
  if (!client || !title) return getGenericTags(category);

  const prompt = `Suggest 5-6 short descriptive tags (lowercase, single words or 2-word phrases) for this gallery work.
Title: ${title}
${description ? `Description: ${description}\n` : ''}${category ? `Category: ${category}` : ''}
Respond ONLY with JSON: {"tags":["tag1","tag2",...]}`;

  try {
    const resp = await client.chat.completions.create({
      model: env.openai.chatModel,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 80,
    });
    const parsed = JSON.parse(resp.choices[0].message.content);
    const aiTags = Array.isArray(parsed.tags)
      ? parsed.tags.map((t) => String(t).toLowerCase().trim()).filter(Boolean).slice(0, 6)
      : [];
    // Fall back to generic tags if AI returned nothing useful.
    return aiTags.length ? aiTags : getGenericTags(category);
  } catch {
    return getGenericTags(category);
  }
};

// Rewrite a rough description into a polished gallery-style blurb.
// Returns the original text on failure so the user never loses their input.
export const polishDescription = async (rough, title = '', category = '') => {
  if (!client || !rough?.trim()) return rough || '';

  const prompt = `You are a gallery curator. Rewrite this description as a concise, evocative 2-3 sentence gallery blurb. Keep the core meaning but make it engaging and professional. Reply with just the rewritten description — no quotes, no explanation.
Title: ${title}
Category: ${category}
Original: ${rough.slice(0, 500)}`;

  try {
    const resp = await client.chat.completions.create({
      model: env.openai.chatModel,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 180,
    });
    return resp.choices[0].message.content.trim();
  } catch {
    return rough;
  }
};

// Cosine similarity between two equal-length vectors.
export const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

// Average a list of vectors into a single "taste profile" vector.
export const averageVectors = (vectors) => {
  const valid = vectors.filter((v) => Array.isArray(v) && v.length);
  if (!valid.length) return null;
  const dim = valid[0].length;
  const out = new Array(dim).fill(0);
  valid.forEach((v) => {
    for (let i = 0; i < dim; i += 1) out[i] += v[i];
  });
  for (let i = 0; i < dim; i += 1) out[i] /= valid.length;
  return out;
};
