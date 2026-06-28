import mongoose from 'mongoose';

// Event log powering the Content Insights dashboard (views / saves / engagement
// trends over time) and AI recommendations (what a user engages with).
const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // may be null for anon views
    work: { type: mongoose.Schema.Types.ObjectId, ref: 'Work', required: true, index: true },
    type: {
      type: String,
      enum: ['view', 'like', 'unlike', 'save', 'unsave', 'comment'],
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

activitySchema.index({ work: 1, type: 1, createdAt: -1 });
activitySchema.index({ user: 1, type: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
