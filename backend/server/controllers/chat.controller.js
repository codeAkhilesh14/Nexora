import { Chat } from '../models/Chat.js';
import { Match } from '../models/Match.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { moderateText } from '../services/ai.service.js';
import { createNotification } from '../services/notification.service.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const MESSAGE_LIMITS = { pulse_pro: 120, orbit_z: Infinity, nebula_x: Infinity, spark: 120, plus: Infinity, max: Infinity };
const FREE_MESSAGE_LIMIT = 20;

const getUserMessageLimit = (user) => {
  if (!user.premium?.active) return FREE_MESSAGE_LIMIT;
  return MESSAGE_LIMITS[user.premium.plan] ?? 120;
};

const resetIfNewDay = async (user) => {
  const now = new Date();
  const lastReset = user.limits.resetAt ? new Date(user.limits.resetAt) : new Date(0);
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (lastReset < todayStart) {
    user.limits.chatsToday = 0;
    user.limits.swipesToday = 0;
    user.limits.resetAt = now;
    await user.save();
  }
};

const matchedProfileProjection = 'nickname avatar realPhoto realPhotoVisibleToMatches premium revealLevel gender';
const hidePrivatePhotoUnlessAllowed = (user) => {
  const profile = user.toObject ? user.toObject() : { ...user };
  if (!profile.realPhotoVisibleToMatches) delete profile.realPhoto;
  delete profile.realPhotoVisibleToMatches;
  return profile;
};

export const listChats = asyncHandler(async (req, res) => {
  const activeMatchIds = await Match.distinct('_id', { users: req.user._id, active: true });
  const chats = await Chat.find({ type: 'match', match: { $in: activeMatchIds }, participants: req.user._id })
    .populate('participants', matchedProfileProjection)
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

  const peerIds = chats.flatMap((chat) => chat.participants.map((p) => p._id).filter((id) => !id.equals(req.user._id)));
  const peers = await User.find({ _id: { $in: peerIds } }).select('safety.blockedUsers');
  const peerBlockMap = new Map(peers.map((p) => [p._id.toString(), p.safety?.blockedUsers || []]));
  const myBlocked = new Set((req.user.safety?.blockedUsers || []).map((id) => id.toString()));

  const safeChats = chats.map((chat) => {
    const peer = chat.participants.find((p) => !p._id.equals(req.user._id));
    const peerIdStr = peer?._id?.toString();
    const blockedByMe = peerIdStr ? myBlocked.has(peerIdStr) : false;
    const peerBlockedList = peerIdStr ? (peerBlockMap.get(peerIdStr) || []) : [];
    const blockedByPeer = peerBlockedList.some((id) => id.toString() === req.user._id.toString());

    return {
      ...chat.toObject(),
      blockedByMe,
      blockedByPeer,
      participants: chat.participants.map(hidePrivatePhotoUnlessAllowed)
    };
  });
  ok(res, { chats: safeChats });
});

const findAllowedDirectChat = async (chatId, userId) => {
  const chat = await Chat.findOne({ _id: chatId, type: 'match', participants: userId });
  if (!chat || chat.participants.length < 2) throw new ApiError(404, 'Chat not found');
  const uniqueParticipants = new Set(chat.participants.map((participant) => participant.toString()));
  if (uniqueParticipants.size < 2) throw new ApiError(403, 'Direct chat requires another matched student');
  const match = await Match.findOne({ _id: chat.match, users: userId, active: true });
  if (!match) throw new ApiError(403, 'Chat is available only after a mutual right swipe');
  return chat;
};

export const getMessages = asyncHandler(async (req, res) => {
  const chat = await findAllowedDirectChat(req.params.chatId, req.user._id);
  const messages = await Message.find({ chat: chat._id }).sort({ createdAt: -1 }).limit(Number(req.query.limit || 50)).populate('sender', 'nickname avatar realPhoto realPhotoVisibleToMatches');
  const safeMessages = messages.map((message) => ({
    ...message.toObject(),
    sender: message.sender ? hidePrivatePhotoUnlessAllowed(message.sender) : message.sender
  }));
  ok(res, { messages: safeMessages.reverse() });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const chat = await findAllowedDirectChat(req.params.chatId, req.user._id);
  const peerId = chat.participants.find((p) => !p.equals(req.user._id));
  const peer = await User.findById(peerId);
  if (!peer) throw new ApiError(404, 'Peer student not found');
  if (req.user.safety?.blockedUsers?.some((id) => id.equals(peerId))) {
    throw new ApiError(400, 'You have blocked this match. Unblock them to send messages.');
  }
  if (peer.safety?.blockedUsers?.some((id) => id.equals(req.user._id))) {
    throw new ApiError(403, 'You cannot send messages to this match.');
  }
  await resetIfNewDay(req.user);
  const chatLimit = getUserMessageLimit(req.user);
  if (chatLimit !== Infinity && req.user.limits.chatsToday >= chatLimit) {
    throw new ApiError(429, `Daily message limit reached (${chatLimit}). Upgrade to Premium for more.`);
  }
  const moderation = await moderateText(req.body.body);
  const message = await Message.create({
    chat: chat._id,
    sender: req.user._id,
    body: req.body.body,
    replyTo: req.body.replyTo,
    moderation,
    expiresAt: req.body.disappearing ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined
  });
  chat.lastMessage = message._id;
  await chat.save();
  req.user.limits.chatsToday += 1;
  req.user.xp += moderation.flagged ? 0 : 2;
  await req.user.save();
  const io = req.app.get('io');
  const populatedMessage = await message.populate('sender', 'nickname avatar realPhoto realPhotoVisibleToMatches');
  const safePopulatedMessage = {
    ...populatedMessage.toObject(),
    sender: populatedMessage.sender ? hidePrivatePhotoUnlessAllowed(populatedMessage.sender) : populatedMessage.sender
  };
  io.to(`chat:${chat._id}`).emit('message:new', safePopulatedMessage);
  for (const participant of chat.participants) {
    io.to(`user:${participant}`).emit('message:new', safePopulatedMessage);
    if (!participant.equals(req.user._id)) await createNotification({ io, user: participant, type: 'message', title: 'New message', body: req.user.nickname, data: { chat: chat._id } });
  }
  ok(res, { message: safePopulatedMessage }, 'Message sent', 201);
});

export const reactToMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.messageId);
  if (!message) throw new ApiError(404, 'Message not found');
  message.reactions = message.reactions.filter((r) => !r.user.equals(req.user._id));
  message.reactions.push({ user: req.user._id, emoji: req.body.emoji });
  await message.save();
  req.app.get('io').to(`chat:${message.chat}`).emit('message:reaction', message);
  ok(res, { message }, 'Reaction added');
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findOne({ _id: req.params.messageId, sender: req.user._id });
  if (!message) throw new ApiError(404, 'Message not found');
  message.deletedAt = new Date();
  message.body = '';
  await message.save();
  req.app.get('io').to(`chat:${message.chat}`).emit('message:deleted', { messageId: message._id });
  ok(res, null, 'Message deleted');
});

export const getChatLimits = asyncHandler(async (req, res) => {
  await resetIfNewDay(req.user);
  const limit = getUserMessageLimit(req.user);
  const nextReset = new Date();
  nextReset.setUTCHours(24, 0, 0, 0);
  ok(res, {
    messagesUsed: req.user.limits.chatsToday,
    messageLimit: limit === Infinity ? null : limit,
    unlimited: limit === Infinity,
    resetsAt: nextReset.toISOString()
  });
});
