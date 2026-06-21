import { Chat } from '../models/Chat.js';
import { Room } from '../models/Room.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ok } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const defaultRooms = [
  ['Exam Stress', 'exam-stress', 'overwhelmed'],
  ['Coding Night', 'coding-night', 'locked-in'],
  ['Lonely Tonight', 'lonely-tonight', 'soft'],
  ['Anime Fans', 'anime-fans', 'chaotic'],
  ['Study Partner', 'study-partner', 'focused'],
  ['Gym Bros', 'gym-bros', 'high-energy'],
  ['Breakup Recovery', 'breakup-recovery', 'healing'],
  ['Hackathon Team', 'hackathon-team', 'ambitious']
];

const getActiveMembersCount = (io, roomId) => {
  if (!io) return 0;
  const sockets = io.sockets.adapter.rooms.get(`room:${roomId}`);
  if (!sockets) return 0;
  const uniqueUsers = new Set();
  for (const socketId of sockets) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket?.user?._id) {
      uniqueUsers.add(socket.user._id.toString());
    }
  }
  return uniqueUsers.size;
};

export const listRooms = asyncHandler(async (req, res) => {
  for (const [name, slug, mood] of defaultRooms) {
    await Room.findOneAndUpdate({ college: req.user.college._id, slug }, { name, slug, mood, college: req.user.college._id }, { upsert: true });
  }
  const io = req.app.get('io');
  const rooms = await Room.find({ college: req.user.college._id, active: true }).sort({ membersOnline: -1, name: 1 }).lean();
  const chats = await Chat.find({ room: { $in: rooms.map((room) => room._id) } }).select('room participants').lean();
  const chatByRoom = new Map(chats.map((chat) => [chat.room.toString(), chat]));
  const decoratedRooms = rooms.map((room) => {
    const chat = chatByRoom.get(room._id.toString());
    const membersOnline = getActiveMembersCount(io, room._id.toString());
    return {
      ...room,
      membersOnline,
      joined: Boolean(chat?.participants?.some((participant) => participant.toString() === req.user._id.toString()))
    };
  });
  ok(res, { rooms: decoratedRooms });
});

export const joinRoom = asyncHandler(async (req, res) => {
  const room = await Room.findOne({ _id: req.params.roomId, college: req.user.college._id });
  if (!room) throw new ApiError(404, 'Room not found');
  let chat = await Chat.findOne({ room: room._id });
  if (!chat) {
    chat = await Chat.create({ type: 'room', room: room._id, college: req.user.college._id, participants: [req.user._id] });
  }
  const alreadyJoined = chat.participants.some((participant) => participant.equals(req.user._id));
  if (!alreadyJoined) {
    chat.participants.push(req.user._id);
    await chat.save();
  }
  const io = req.app.get('io');
  const count = getActiveMembersCount(io, room._id.toString());
  room.membersOnline = count;
  await room.save();
  const payload = { room: { ...room.toObject(), joined: true }, chat, alreadyJoined };
  if (!alreadyJoined) io.to(`room:${room._id}`).emit('room:joined', { roomId: room._id, nickname: req.user.nickname, membersOnline: count });
  ok(res, payload, alreadyJoined ? 'Already joined' : 'Room joined');
});

export const getRoomMessages = asyncHandler(async (req, res) => {
  const room = await Room.findOne({ _id: req.params.roomId, college: req.user.college._id });
  if (!room) throw new ApiError(404, 'Room not found');

  const chat = await Chat.findOne({ room: room._id });
  if (!chat) throw new ApiError(404, 'Room chat not found');

  const isJoined = chat.participants.some((p) => p.equals(req.user._id));
  if (!isJoined) throw new ApiError(403, 'Join the room to view messages');

  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  const messages = await Message.find({ 
    chat: chat._id,
    createdAt: { $gte: tenDaysAgo }
  })
    .sort({ createdAt: -1 })
    .populate('sender', 'nickname avatar');

  // Get limit and usage
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const roomChats = await Chat.find({ type: 'room' }).select('_id');
  const roomChatIds = roomChats.map((c) => c._id);
  const messagesCount = await Message.countDocuments({
    sender: req.user._id,
    chat: { $in: roomChatIds },
    createdAt: { $gte: todayStart }
  });

  let limit = 20;
  const premium = req.user.premium;
  if (premium?.active) {
    if (premium.plan === 'pulse_pro' || premium.plan === 'spark') {
      limit = 120;
    } else if (['orbit_z', 'plus', 'nebula_x', 'max'].includes(premium.plan)) {
      limit = Infinity;
    }
  }

  ok(res, { 
    messages: messages.reverse(), 
    messagesUsed: messagesCount, 
    messageLimit: limit === Infinity ? null : limit 
  }, 'Room messages retrieved');
});

export const sendRoomMessage = asyncHandler(async (req, res) => {
  const room = await Room.findOne({ _id: req.params.roomId, college: req.user.college._id });
  if (!room) throw new ApiError(404, 'Room not found');

  const chat = await Chat.findOne({ room: room._id });
  if (!chat) throw new ApiError(404, 'Room chat not found');

  const isJoined = chat.participants.some((p) => p.equals(req.user._id));
  if (!isJoined) throw new ApiError(403, 'Join the room to send messages');

  // Enforce limits
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  // Find all room chats
  const roomChats = await Chat.find({ type: 'room' }).select('_id');
  const roomChatIds = roomChats.map((c) => c._id);

  // Count messages sent by this user in all room chats today
  const messagesCount = await Message.countDocuments({
    sender: req.user._id,
    chat: { $in: roomChatIds },
    createdAt: { $gte: todayStart }
  });

  // Determine limit based on premium status
  let limit = 20;
  const premium = req.user.premium;
  if (premium?.active) {
    if (premium.plan === 'pulse_pro' || premium.plan === 'spark') {
      limit = 120;
    } else if (['orbit_z', 'plus', 'nebula_x', 'max'].includes(premium.plan)) {
      limit = Infinity;
    }
  }

  if (messagesCount >= limit) {
    throw new ApiError(429, `Daily room message limit reached (${limit} messages). Upgrade for more.`);
  }

  // Create message
  const message = await Message.create({
    chat: chat._id,
    sender: req.user._id,
    body: req.body.body,
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
  });

  chat.lastMessage = message._id;
  await chat.save();

  // Populate sender info for frontend rendering
  const populatedMessage = await message.populate('sender', 'nickname avatar');

  // Broadcast to socket room
  const io = req.app.get('io');
  io.to(`room:${room._id}`).emit('room:message:new', populatedMessage);

  ok(res, { 
    message: populatedMessage, 
    messagesUsed: messagesCount + 1, 
    messageLimit: limit === Infinity ? null : limit 
  }, 'Message sent', 201);
});
