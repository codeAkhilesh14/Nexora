import mongoose from 'mongoose';

const swipeSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
  action: { type: String, enum: ['left', 'right', 'super_like'], required: true },
  rewound: { type: Boolean, default: false }
}, { timestamps: true });

swipeSchema.index({ from: 1, to: 1 }, { unique: true });
swipeSchema.index({ to: 1, action: 1 });

export const Swipe = mongoose.model('Swipe', swipeSchema);
