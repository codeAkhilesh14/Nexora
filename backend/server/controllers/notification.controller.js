import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { Swipe } from '../models/Swipe.js';
import { ok } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { handleSwipe } from '../services/match.service.js';
import { createNotification } from '../services/notification.service.js';

const likeRequestProjection = 'nickname avatar branch year gender premium';

const mapLikeRequest = (notification, sender) => ({
  _id: notification._id,
  type: notification.type,
  title: notification.title,
  body: notification.body,
  createdAt: notification.createdAt,
  readAt: notification.readAt,
  from: sender
    ? { _id: sender._id, nickname: sender.nickname, avatar: sender.avatar, branch: sender.branch, year: sender.year, gender: sender.gender, premium: sender.premium }
    : { _id: notification.data?.user },
  swipeId: notification.data?.swipe,
  action: notification.data?.action
});

const loadLikeRequestNotification = async (req) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id, type: 'like' });
  if (!notification) throw new ApiError(404, 'Like request not found');
  const senderId = notification.data?.user;
  if (!senderId) throw new ApiError(400, 'Invalid like request');
  return { notification, senderId };
};

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  ok(res, { notifications });
});

export const listLikeRequests = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id, type: 'like' }).sort({ createdAt: -1 }).limit(50);
  const senderIds = notifications.map((notification) => notification.data?.user).filter(Boolean);
  const respondedIds = (await Swipe.distinct('to', { from: req.user._id, to: { $in: senderIds } })).map((id) => id.toString());
  const pendingNotifications = notifications.filter((notification) => {
    const senderId = notification.data?.user?.toString?.();
    return senderId && !respondedIds.includes(senderId);
  });
  const pendingSenderIds = pendingNotifications.map((notification) => notification.data?.user).filter(Boolean);
  const senders = await User.find({ _id: { $in: pendingSenderIds } }).select(likeRequestProjection);
  const senderMap = Object.fromEntries(senders.map((sender) => [sender._id.toString(), sender]));
  const requests = pendingNotifications.map((notification) => mapLikeRequest(notification, senderMap[notification.data?.user?.toString?.()]));
  ok(res, { requests });
});

export const acceptLikeRequest = asyncHandler(async (req, res) => {
  const { notification, senderId } = await loadLikeRequestNotification(req);
  const target = await User.findById(senderId);
  if (!target) throw new ApiError(404, 'Requesting user not found');
  const pendingSwipe = await Swipe.findOne({ from: senderId, to: req.user._id, action: { $in: ['right', 'super_like'] } });
  if (!pendingSwipe) throw new ApiError(404, 'No pending like request available');

  const result = await handleSwipe({ from: req.user, to: target, action: 'right', io: req.app.get('io') });

  await createNotification({
    io: req.app.get('io'),
    user: senderId,
    type: 'like',
    title: 'Like accepted',
    body: `${req.user.nickname} accepted your like request`,
    data: { user: req.user._id, action: 'accepted' }
  });

  notification.readAt = new Date();
  await notification.save();
  ok(res, result, 'Like request accepted');
});

export const rejectLikeRequest = asyncHandler(async (req, res) => {
  const { notification, senderId } = await loadLikeRequestNotification(req);
  const target = await User.findById(senderId);
  if (!target) throw new ApiError(404, 'Requesting user not found');
  const pendingSwipe = await Swipe.findOne({ from: senderId, to: req.user._id, action: { $in: ['right', 'super_like'] } });
  if (!pendingSwipe) throw new ApiError(404, 'No pending like request available');

  await handleSwipe({ from: req.user, to: target, action: 'left', io: req.app.get('io') });

  await createNotification({
    io: req.app.get('io'),
    user: senderId,
    type: 'like',
    title: 'Like rejected',
    body: `${req.user.nickname} rejected your like request`,
    data: { user: req.user._id, action: 'rejected' }
  });

  notification.readAt = new Date();
  await notification.save();
  ok(res, null, 'Like request rejected');
});

export const markRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, readAt: null }, { readAt: new Date() });
  ok(res, null, 'Notifications read');
});
