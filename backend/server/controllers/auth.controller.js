import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { College } from '../models/College.js';
import { User } from '../models/User.js';
import { Crush } from '../models/Crush.js';
import { sendOtpEmail, sendMail, sendResetPasswordOtpEmail } from '../services/email.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cookieOptions, createOtp, hashToken, signAccessToken, signRefreshToken } from '../utils/tokens.js';
import { env } from '../config/env.js';

const requiredProfileFields = ['firstName', 'bio', 'branch', 'year', 'gender', 'interests', 'vibeTags', 'musicTaste'];
const hasProfileValue = (value) => Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).trim() !== '';
const isProfileComplete = (user) => user.profileComplete === true || requiredProfileFields.every((field) => hasProfileValue(user[field]));
const currentPremium = (user) => {
  if (!user.premium?.active) return user.premium;
  if (user.premium.expiresAt && user.premium.expiresAt <= new Date()) return { active: false, plan: null, expiresAt: undefined, badge: false };
  return user.premium;
};

const publicUser = (user) => ({
  id: user._id,
  email: user.email,
  nickname: user.nickname,
  firstName: user.firstName,
  avatar: user.avatar,
  realPhoto: user.realPhoto,
  realPhotoVisibleToMatches: user.realPhotoVisibleToMatches,
  bio: user.bio,
  branch: user.branch,
  year: user.year,
  gender: user.gender,
  interests: user.interests,
  vibeTags: user.vibeTags,
  musicTaste: user.musicTaste,
  role: user.role,
  college: user.college,
  collegeName: user.college?.name || user.collegeName,
  emailVerified: user.emailVerified,
  studentVerified: user.studentVerified,
  profileComplete: isProfileComplete(user),
  premium: currentPremium(user),
  revealLevel: user.revealLevel
});

const setAuthCookies = (res, user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, user.refreshTokenVersion);
  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  return { accessToken };
};

export const signup = asyncHandler(async (req, res) => {
  const { email, password, nickname, branch, year, gender, collegeName } = req.validated.body;
  const domain = email.split('@')[1].toLowerCase();
  const domainParts = domain.split('.');
  const domainCandidates = domainParts.slice(0, -1).map((_, index) => domainParts.slice(index).join('.'));
  const normalizedCollegeName = collegeName.trim();
  const domainCollege = await College.findOne({ domains: { $in: domainCandidates }, active: true });
  const selectedCollege = normalizedCollegeName
    ? await College.findOne({
      active: true,
      $or: [
        { name: normalizedCollegeName },
        { code: normalizedCollegeName.toUpperCase() }
      ]
    }).collation({ locale: 'en', strength: 2 })
    : null;
  const college = domainCollege || selectedCollege;
  if (!college) throw new ApiError(403, 'Select an approved college or use its college email');
  if (domainCollege && selectedCollege && !domainCollege._id.equals(selectedCollege._id)) {
    throw new ApiError(400, 'College name must match your college email domain');
  }
  const studentVerified = Boolean(domainCollege);
  const otp = createOtp();
  const user = await User.create({
    email,
    password,
    nickname,
    branch,
    year,
    gender,
    college: college._id,
    collegeDomain: domain,
    studentVerified,
    otp: { hash: hashToken(otp), expiresAt: new Date(Date.now() + 10 * 60 * 1000) }
  });

  // Link newly signed up user to any existing secret crushes
  await Crush.updateMany({ targetEmail: email?.toLowerCase() }, { targetUser: user._id });
  
  // Send OTP to email - will throw error if SMTP not configured
  let otpSent = false;
  try {
    await sendOtpEmail(email, otp);
    otpSent = true;
  } catch (emailError) {
    console.error('[Auth] OTP Email send failed for:', email, emailError.message);
    throw new ApiError(500, 'Unable to send verification email. Please check email configuration.');
  }
  
  const tokens = setAuthCookies(res, user);
  ok(res, {
    user: publicUser(await user.populate('college')),
    ...tokens,
    otpSent
  }, 'Signup successful. OTP sent to your email', 201);
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.validated.body;
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'Account not found. Please sign up first.');
  if (user.emailVerified) throw new ApiError(400, 'Email is already verified');

  const otp = createOtp();
  user.otp = { hash: hashToken(otp), expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
  await user.save();
  
  // Send OTP to email - will throw error if SMTP not configured
  try {
    await sendOtpEmail(email, otp);
  } catch (emailError) {
    console.error('[Auth] OTP Email resend failed for:', email, emailError.message);
    throw new ApiError(500, 'Unable to send verification email. Please check email configuration.');
  }

  ok(res, {
    otpSent: true
  }, 'OTP sent successfully to your email');
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email }).select('+password').populate('college');
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, 'Invalid credentials');
  if (user.status !== 'active') throw new ApiError(403, 'Account is not active');
  if (user.premium?.active && user.premium?.expiresAt && user.premium.expiresAt <= new Date()) {
    user.premium = { active: false, plan: null, expiresAt: undefined, badge: false };
    await user.save();
  }
  const tokens = setAuthCookies(res, user);
  ok(res, { user: publicUser(user), ...tokens }, 'Welcome back');
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.validated.body;
  const user = await User.findOne({ email }).populate('college');
  if (!user || user.otp?.hash !== hashToken(otp) || user.otp.expiresAt < new Date()) throw new ApiError(400, 'Invalid or expired OTP');
  user.emailVerified = true;
  user.otp = undefined;
  user.xp += 50;
  await user.save();
  ok(res, { user: publicUser(user) }, 'Email verified');
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new ApiError(401, 'Refresh token required');
  let payload;
  try {
    payload = jwt.verify(token, env.jwtRefreshSecret);
  } catch (err) {
    throw new ApiError(401, 'Refresh token invalid or expired');
  }
  const user = await User.findById(payload.sub).populate('college');
  if (!user || payload.tokenVersion !== user.refreshTokenVersion) throw new ApiError(401, 'Refresh token expired');
  const tokens = setAuthCookies(res, user);
  ok(res, { user: publicUser(user), ...tokens }, 'Token refreshed');
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.refreshTokenVersion += 1;
    await req.user.save();
  }
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
  ok(res, null, 'Logged out');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.validated.body;
  const user = await User.findOne({ email });
  if (user) {
    const otp = createOtp();
    user.resetPassword = { hash: hashToken(otp), expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save();
    await sendResetPasswordOtpEmail(email, otp);
  }
  ok(res, null, 'If the account exists, a password reset code has been sent');
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.validated.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || user.resetPassword?.hash !== hashToken(otp) || user.resetPassword.expiresAt < new Date()) throw new ApiError(400, 'Invalid or expired OTP');
  user.password = password;
  user.resetPassword = undefined;
  user.refreshTokenVersion += 1;
  await user.save();
  ok(res, null, 'Password reset successful');
});

export const me = asyncHandler(async (req, res) => ok(res, { user: publicUser(req.user) }));
