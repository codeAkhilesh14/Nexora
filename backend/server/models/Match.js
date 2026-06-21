import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
  revealLevel: { type: Number, min: 1, max: 5, default: 2 },
  compatibility: {
    score: { type: Number, min: 0, max: 100, default: 50 },
    explanation: String
  },
  active: { type: Boolean, default: true }
}, { timestamps: true });

matchSchema.index({ 'users.0': 1, 'users.1': 1 }, { unique: true });

export const Match = mongoose.model('Match', matchSchema);
