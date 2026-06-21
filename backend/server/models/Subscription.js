import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  plan: { type: String, enum: ['pulse_pro', 'orbit_z', 'nebula_x', 'spark', 'plus', 'max'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  status: { type: String, enum: ['created', 'active', 'expired', 'failed'], default: 'created' },
  startsAt: Date,
  expiresAt: Date
}, { timestamps: true });

subscriptionSchema.index({ status: 1, expiresAt: 1 });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
