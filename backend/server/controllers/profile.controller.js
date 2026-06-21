import { User } from '../models/User.js';
import { uploadBuffer } from '../services/media.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const allowed = ['firstName', 'bio', 'branch', 'year', 'gender', 'relationshipGoals', 'studyInterests', 'interests', 'vibeTags', 'musicTaste', 'prompts', 'anonymousMode', 'avatar', 'realPhotoVisibleToMatches'];
const requiredForOnboarding = ['firstName', 'bio', 'branch', 'year', 'gender', 'interests', 'vibeTags', 'musicTaste'];

const hasValue = (value) => Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).trim() !== '';

export const updateProfile = asyncHandler(async (req, res) => {
  if (req.body.collegeName && ![req.user.college.name.toLowerCase(), req.user.college.code.toLowerCase()].includes(req.body.collegeName.trim().toLowerCase())) {
    throw new ApiError(400, 'College name must match your verified college');
  }
  for (const key of allowed) {
    if (key in req.body) req.user[key] = req.body[key];
  }
  const nextProfile = { ...req.user.toObject(), ...req.body };
  const missing = requiredForOnboarding.filter((key) => !hasValue(nextProfile[key]));
  if (!req.user.profileComplete && missing.length) {
    throw new ApiError(400, 'Please complete all mandatory profile details', { missing });
  }
  req.user.profileComplete = true;
  req.user.xp += 10;
  await req.user.save();
  await req.user.populate('college');
  ok(res, { user: { ...req.user.toObject(), id: req.user._id, collegeName: req.user.college?.name } }, 'Profile updated');
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Image is required');
  req.user.avatar = await uploadBuffer(req.file, 'nexora/avatars');
  await req.user.save();
  ok(res, { avatar: req.user.avatar }, 'Avatar updated');
});

export const uploadRealPhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Image is required');
  req.user.realPhoto = await uploadBuffer(req.file, 'nexora/profile-photos');
  await req.user.save();
  ok(res, { realPhoto: req.user.realPhoto }, 'Profile photo updated');
});

export const revealIdentity = asyncHandler(async (req, res) => {
  const nextLevel = Math.min(Number(req.body.level || req.user.revealLevel + 1), 5);
  req.user.revealLevel = Math.max(req.user.revealLevel, nextLevel);
  await req.user.save();
  ok(res, { revealLevel: req.user.revealLevel }, 'Reveal level updated');
});

export const blockUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.userId);
  if (!target) throw new ApiError(404, 'User not found');
  if (!req.user.safety.blockedUsers.some((id) => id.equals(target._id))) req.user.safety.blockedUsers.push(target._id);
  await req.user.save();
  ok(res, null, 'User blocked');
});

export const unblockUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.userId);
  if (!target) throw new ApiError(404, 'User not found');
  req.user.safety.blockedUsers = req.user.safety.blockedUsers.filter((id) => !id.equals(target._id));
  await req.user.save();
  ok(res, null, 'User unblocked');
});
