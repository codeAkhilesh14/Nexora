import { College } from '../models/College.js';
import { Report } from '../models/Report.js';
import { Subscription } from '../models/Subscription.js';
import { User } from '../models/User.js';
import { ok } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const dashboard = asyncHandler(async (_req, res) => {
  const [users, colleges, reports, revenue] = await Promise.all([
    User.countDocuments(),
    College.countDocuments({ active: true }),
    Report.countDocuments({ status: 'open' }),
    Subscription.aggregate([{ $match: { status: 'active' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
  ]);
  ok(res, { users, colleges, reports, revenuePaise: revenue[0]?.total || 0 });
});

export const upsertCollege = asyncHandler(async (req, res) => {
  const college = await College.findOneAndUpdate(
    { code: req.body.code.toUpperCase() },
    { ...req.body, domains: req.body.domains.map((d) => d.toLowerCase()) },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  ok(res, { college }, 'College saved');
});

export const moderateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.userId, { status: req.body.status }, { new: true });
  ok(res, { user }, 'User status updated');
});

export const reports = asyncHandler(async (_req, res) => {
  const data = await Report.find().populate('reporter targetUser', 'nickname email').sort({ createdAt: -1 }).limit(100);
  ok(res, { reports: data });
});

export const resolveReportStatus = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { status, actionTaken } = req.body;

  if (!['resolved', 'dismissed'].includes(status)) {
    throw new ApiError(400, 'Invalid status. Status must be resolved or dismissed.');
  }

  const report = await Report.findById(reportId);
  if (!report) {
    throw new ApiError(404, 'Report not found.');
  }

  report.status = status;
  if (actionTaken !== undefined) {
    report.actionTaken = actionTaken;
  }
  await report.save();

  ok(res, { report }, `Report updated to ${status}`);
});

