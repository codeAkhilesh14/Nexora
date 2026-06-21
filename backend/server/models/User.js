import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

const promptSchema = new mongoose.Schema({
  question: String,
  answer: { type: String, maxlength: 240 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  phone: { type: String, trim: true, sparse: true, unique: true },
  password: { type: String, required: true, select: false },
  nickname: { type: String, required: true, trim: true, unique: true, minlength: 3, maxlength: 24 },
  firstName: { type: String, trim: true, maxlength: 60 },
  avatar: { type: String, default: '' },
  realPhoto: { type: String, default: '' },
  realPhotoVisibleToMatches: { type: Boolean, default: false },
  bio: { type: String, maxlength: 280, default: '' },
  branch: { type: String, trim: true },
  year: { type: Number, min: 1, max: 6 },
  gender: { type: String, enum: ['woman', 'man', 'non_binary', 'prefer_not'], default: 'prefer_not' },
  relationshipGoals: [{ type: String, enum: ['crush', 'friends', 'relationship', 'study_partner', 'teammate', 'networking'] }],
  studyInterests: [String],
  interests: [String],
  vibeTags: [String],
  musicTaste: [String],
  prompts: [promptSchema],
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
  collegeDomain: { type: String, required: true, lowercase: true },
  studentVerified: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  profileComplete: { type: Boolean, default: false },
  ageVerified: { type: Boolean, default: true },
  anonymousMode: { type: Boolean, default: true },
  revealLevel: { type: Number, min: 1, max: 5, default: 1 },
  xp: { type: Number, default: 0 },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  premium: {
    active: { type: Boolean, default: false },
    plan: { type: String, enum: ['pulse_pro', 'orbit_z', 'nebula_x', 'spark', 'plus', 'max', null], default: null },
    expiresAt: Date,
    badge: { type: Boolean, default: false }
  },
  limits: {
    swipesToday: { type: Number, default: 0 },
    chatsToday: { type: Number, default: 0 },
    resetAt: { type: Date, default: () => new Date() }
  },
  locationSignal: {
    zone: { type: String, enum: ['library', 'cafeteria', 'amenities', 'college_gate', 'mandir_area', 'boys_hostel', 'girls_hostel', 'field', 'basketball_court', 'badminton_court', 'volleyball_court', 'first_year_block', 'amphitheatre', 'courtyard', 'parking', 'placement_cell_office', 'registrar_office', null], default: null },
    updatedAt: Date
  },
  safety: {
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reportsCount: { type: Number, default: 0 },
    trustScore: { type: Number, default: 100 }
  },
  refreshTokenVersion: { type: Number, default: 0 },
  otp: {
    hash: String,
    expiresAt: Date
  },
  resetPassword: {
    hash: String,
    expiresAt: Date
  },
  status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active', index: true },
  lastSeenAt: Date
}, { timestamps: true });

userSchema.pre('save', async function hashPassword(next) {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
  if (this.isModified('email') && this.email === env.adminEmail) this.role = 'admin';
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.index({ college: 1, status: 1, updatedAt: -1 });
userSchema.index({ college: 1, interests: 1 });
userSchema.index({ 'premium.expiresAt': 1 });

export const User = mongoose.model('User', userSchema);
