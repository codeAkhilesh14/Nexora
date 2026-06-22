import { Report } from '../models/Report.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const submitReport = asyncHandler(async (req, res) => {
  const { targetUserId, reason, notes } = req.body;

  if (!targetUserId) {
    throw new ApiError(400, 'Target user ID is required.');
  }
  if (!reason) {
    throw new ApiError(400, 'Reason is required.');
  }

  if (targetUserId === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot report yourself.');
  }

  const targetUser = await User.findOne({ _id: targetUserId, status: 'active' });
  if (!targetUser) {
    throw new ApiError(404, 'Reported user profile not found.');
  }

  const report = await Report.create({
    reporter: req.user._id,
    targetUser: targetUserId,
    reason,
    notes: notes || '',
    status: 'open'
  });

  const io = req.app.get('io');
  if (io) {
    io.to('admins').emit('report:new', { reportId: report._id });
  }

  ok(res, { report }, 'Report submitted successfully. Thank you for keeping campus safe!', 201);
});
