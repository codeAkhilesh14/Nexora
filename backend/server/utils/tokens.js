import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signAccessToken = (user) => jwt.sign(
  { sub: user._id.toString(), role: user.role, college: user.college?.toString() },
  env.jwtAccessSecret,
  { expiresIn: env.accessTokenTtl }
);

export const signRefreshToken = (user, tokenVersion) => jwt.sign(
  { sub: user._id.toString(), tokenVersion: tokenVersion ?? 0 },
  env.jwtRefreshSecret,
  { expiresIn: env.refreshTokenTtl }
);

export const createOtp = () => String(crypto.randomInt(100000, 999999));
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const cookieOptions = {
  httpOnly: true,
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  secure: env.nodeEnv === 'production',
  domain: env.cookieDomain || undefined,
  path: '/'
};

export const parseDurationToMs = (durationStr, fallbackMs) => {
  if (!durationStr) return fallbackMs;
  const match = durationStr.match(/^(\d+)([smhd])$/);
  if (!match) return fallbackMs;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return fallbackMs;
  }
};

