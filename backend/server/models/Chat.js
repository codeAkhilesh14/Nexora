import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  type: { type: String, enum: ['match', 'room'], required: true },
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  expiresMessagesAfterSeconds: Number
}, { timestamps: true });

chatSchema.index({ participants: 1, updatedAt: -1 });
chatSchema.index({ match: 1 }, { sparse: true, unique: true });

export const Chat = mongoose.model('Chat', chatSchema);
