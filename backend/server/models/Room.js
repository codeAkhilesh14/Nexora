import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  mood: { type: String, required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
  anonymous: { type: Boolean, default: true },
  voiceEnabled: { type: Boolean, default: true },
  livePoll: {
    question: String,
    options: [{ label: String, votes: { type: Number, default: 0 } }],
    closesAt: Date
  },
  membersOnline: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

roomSchema.index({ college: 1, slug: 1 }, { unique: true });

export const Room = mongoose.model('Room', roomSchema);
