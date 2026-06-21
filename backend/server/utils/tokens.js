import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signAccessToken = (user) => jwt.sign(
  { sub: user._id.toString(), role: user.role, college: user.college?.toString() },
  env.jwtAccessSecret,
  { expiresIn: env.accessTokenTtl }
);

export const signRefreshToken = (user, tokenVersion) => jwt.sign(
  { sub: user._id.toString(), tokenVersion },
  env.jwtRefreshSecret,
  { expiresIn: env.refreshTokenTtl }
);

export const createOtp = () => String(crypto.randomInt(100000, 999999));
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.nodeEnv === 'production',
  domain: env.cookieDomain,
  path: '/'
};
