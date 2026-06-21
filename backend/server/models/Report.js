import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  reason: { type: String, required: true },
  notes: String,
  status: { type: String, enum: ['open', 'reviewing', 'resolved', 'dismissed'], default: 'open' },
  actionTaken: String
}, { timestamps: true });

reportSchema.index({ status: 1, createdAt: -1 });

export const Report = mongoose.model('Report', reportSchema);
