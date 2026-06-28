import mongoose from 'mongoose';

export const CATEGORIES = ['art', 'photography', 'writing', 'design', 'music', 'other'];

const workSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, default: '', maxlength: 2000 },

    // 'image' works carry mediaUrl; 'writing' works carry textContent.
    type: { type: String, enum: ['image', 'writing'], required: true },
    category: { type: String, enum: CATEGORIES, default: 'other', index: true },

    // Cloudinary
    mediaUrl: { type: String, default: '' },
    mediaPublicId: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    width: Number,
    height: Number,

    // For writing-type works
    textContent: { type: String, default: '' },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // User-provided tags and AI-generated tags (kept separate for transparency).
    tags: [{ type: String, trim: true, lowercase: true }],
    aiTags: [{ type: String, trim: true, lowercase: true }],
    aiCategory: { type: String, default: '' }, // AI's suggested category

    // Embedding vector for similarity search / recommendations (OpenAI: 1536 dims).
    embedding: { type: [Number], default: undefined, select: false },

    // Denormalized engagement counters for fast reads.
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likeCount: { type: Number, default: 0, index: true },
    saveCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0, index: true },

    isPublic: { type: Boolean, default: true },

    // Usage rights shown on the work detail page.
    license: { type: String, enum: ['free', 'commercial', 'all-rights-reserved'], default: 'free' },
  },
  { timestamps: true }
);

// Full-text search across title, description and tags.
workSchema.index({ title: 'text', description: 'text', tags: 'text', aiTags: 'text' });
workSchema.index({ createdAt: -1 });

// Keep counters in sync whenever likes/saves arrays change.
workSchema.pre('save', function syncCounts(next) {
  if (this.isModified('likes')) this.likeCount = this.likes.length;
  if (this.isModified('savedBy')) this.saveCount = this.savedBy.length;
  next();
});

const Work = mongoose.model('Work', workSchema);
export default Work;
