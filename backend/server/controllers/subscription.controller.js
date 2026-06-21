import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { razorpay } from '../config/razorpay.js';
import { Subscription } from '../models/Subscription.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const plans = {
  pulse_pro: { amount: 2900, days: 28, name: 'Pulse Pro' },
  orbit_z: { amount: 4900, days: 28, name: 'Orbit Z' },
  nebula_x: { amount: 9900, days: 28, name: 'Nebula X' },
  spark: { amount: 2900, days: 28, name: 'Pulse Pro' },
  plus: { amount: 4900, days: 28, name: 'Orbit Z' },
  max: { amount: 9900, days: 28, name: 'Nebula X' }
};

const normalizePlan = (plan) => ({ spark: 'pulse_pro', plus: 'orbit_z', max: 'nebula_x' }[plan] || plan);

const planRank = {
  pulse_pro: 1,
  spark: 1,
  orbit_z: 2,
  plus: 2,
  nebula_x: 3,
  max: 3
};

export const createOrder = asyncHandler(async (req, res) => {
  const planId = normalizePlan(req.body.plan);
  const plan = plans[planId];
  if (!plan) throw new ApiError(400, 'Invalid plan');
  if (req.user.premium?.active && req.user.premium?.expiresAt > new Date()) {
    const currentPlanId = normalizePlan(req.user.premium.plan);
    const currentRank = planRank[currentPlanId] || 0;
    const targetRank = planRank[planId] || 0;
    
    if (planId === currentPlanId) {
      throw new ApiError(409, 'You already have an active subscription to this plan. You cannot purchase the same plan more than once in 28 days.');
    }
    if (targetRank <= currentRank) {
      throw new ApiError(409, 'You already have an active subscription at this or a higher tier. You can only upgrade to a higher tier plan.');
    }
  }
  let order;
  try {
    order = razorpay
      ? await razorpay.orders.create({ amount: plan.amount, currency: 'INR', receipt: `nx_${Date.now().toString(36)}_${req.user._id.toString().slice(-8)}` })
      : { id: `dev_order_${Date.now()}`, amount: plan.amount, currency: 'INR' };
  } catch (error) {
    throw new ApiError(502, error.error?.description || 'Unable to start Razorpay checkout');
  }
  const subscription = await Subscription.create({ user: req.user._id, plan: planId, amount: plan.amount, razorpayOrderId: order.id });
  ok(res, { order, subscription, keyId: env.razorpayKeyId }, 'Order created');
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (env.razorpayKeySecret) {
    const expected = crypto.createHmac('sha256', env.razorpayKeySecret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    if (expected !== razorpay_signature) throw new ApiError(400, 'Payment signature mismatch');
  }
  const sub = await activateSubscription(razorpay_order_id, razorpay_payment_id);
  ok(res, { subscription: sub }, 'Premium activated');
});

export const webhook = asyncHandler(async (req, res) => {
  if (env.razorpayWebhookSecret) {
    const signature = req.headers['x-razorpay-signature'];
    const expected = crypto.createHmac('sha256', env.razorpayWebhookSecret).update(req.body).digest('hex');
    if (expected !== signature) throw new ApiError(400, 'Invalid webhook signature');
  }
  const event = JSON.parse(req.body.toString());
  if (event.event === 'payment.captured') await activateSubscription(event.payload.payment.entity.order_id, event.payload.payment.entity.id);
  ok(res, null, 'Webhook received');
});

const activateSubscription = async (orderId, paymentId) => {
  const sub = await Subscription.findOne({ razorpayOrderId: orderId });
  if (!sub) throw new ApiError(404, 'Subscription not found');
  if (sub.status === 'active') return sub;
  const meta = plans[sub.plan];
  sub.status = 'active';
  sub.razorpayPaymentId = paymentId;
  sub.startsAt = new Date();
  sub.expiresAt = new Date(Date.now() + meta.days * 24 * 60 * 60 * 1000);
  await sub.save();
  await User.findByIdAndUpdate(sub.user, { premium: { active: true, plan: normalizePlan(sub.plan), expiresAt: sub.expiresAt, badge: true } });
  return sub;
};
