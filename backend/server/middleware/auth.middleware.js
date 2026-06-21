import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies.accessToken;
  if (!token) throw new ApiError(401, 'Authentication required');
  let payload;
  try {
    payload = jwt.verify(token, env.jwtAccessSecret);
  } catch (err) {
    throw new ApiError(401, 'Authentication token invalid or expired');
  }
  const user = await User.findById(payload.sub).populate('college');
  if (!user || user.status !== 'active') throw new ApiError(401, 'User unavailable');
  if (user.premium?.active && user.premium?.expiresAt && user.premium.expiresAt <= new Date()) {
    user.premium = { active: false, plan: null, expiresAt: undefined, badge: false };
    await user.save();
  }
  req.user = user;
  next();
});

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== 'admin' || req.user.email !== env.adminEmail) throw new ApiError(403, 'Admin only');
  next();
};

export const requirePremium = (req, _res, next) => {
  if (!req.user?.premium?.active) throw new ApiError(402, 'Premium plan required');
  next();
};
