import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, maxlength: 2000, default: '' },
  media: [{ url: String, type: { type: String, enum: ['image', 'voice'] } }],
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  reactions: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, emoji: String }],
  readBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, at: Date }],
  moderation: {
    flagged: { type: Boolean, default: false },
    labels: [String],
    score: { type: Number, default: 0 }
  },
  deletedAt: Date,
  expiresAt: Date
}, { timestamps: true });

messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

export const Message = mongoose.model('Message', messageSchema);
