import mongoose from 'mongoose';

const crushSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
  targetEmail: { type: String, lowercase: true, trim: true, required: true },
  nickname: { type: String, lowercase: true, trim: true },
  instagram: { type: String, lowercase: true, trim: true },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  revealed: { type: Boolean, default: false },
  revealedAt: Date
}, { timestamps: true });

crushSchema.index({ owner: 1, targetEmail: 1 }, { unique: true });
crushSchema.index({ targetUser: 1, revealed: 1 });

export const Crush = mongoose.model('Crush', crushSchema);
