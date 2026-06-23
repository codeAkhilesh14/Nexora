import mongoose from 'mongoose';

const supportRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' }
}, { timestamps: true });

supportRequestSchema.index({ status: 1, createdAt: -1 });

export const SupportRequest = mongoose.model('SupportRequest', supportRequestSchema);
