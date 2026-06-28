import mongoose from 'mongoose';

// A Board is a collection of works. It can be collaborative (multiple editors)
// to support the "collaborative boards / group collections" requirement.
const boardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 1000 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    works: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Work' }],

    // Collaboration
    isCollaborative: { type: Boolean, default: false },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    coverImage: { type: String, default: '' },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

boardSchema.index({ name: 'text', description: 'text' });

// Helper: can a given user edit (add/remove works, update) this board?
boardSchema.methods.canEdit = function canEdit(userId) {
  const id = userId.toString();
  if (this.owner.toString() === id) return true;
  return this.isCollaborative && this.collaborators.some((c) => c.toString() === id);
};

const Board = mongoose.model('Board', boardSchema);
export default Board;
