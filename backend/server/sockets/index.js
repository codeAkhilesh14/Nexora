import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Room } from '../models/Room.js';

const onlineUsers = new Map();

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

export const registerSockets = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.cookie?.match(/accessToken=([^;]+)/)?.[1];
      if (!token) return next(new Error('Unauthorized'));
      const payload = jwt.verify(decodeURIComponent(token), env.jwtAccessSecret);
      const user = await User.findById(payload.sub);
      if (!user || user.status !== 'active') return next(new Error('Unauthorized'));
      socket.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, (onlineUsers.get(userId) || 0) + 1);
    socket.join(`user:${userId}`);
    await User.findByIdAndUpdate(userId, { lastSeenAt: new Date() });
    socket.emit('presence:snapshot', [...onlineUsers.keys()]);
    io.emit('presence:update', { userId, online: true });

    socket.on('chat:join', (chatId) => socket.join(`chat:${chatId}`));
    socket.on('chat:typing', ({ chatId, typing }) => socket.to(`chat:${chatId}`).emit('chat:typing', { userId, typing }));
    socket.on('message:read', ({ chatId, messageId }) => socket.to(`chat:${chatId}`).emit('message:read', { userId, messageId, at: new Date() }));
    
    socket.on('room:join', async (roomId) => {
      socket.join(`room:${roomId}`);
      const count = getActiveMembersCount(io, roomId);
      await Room.findByIdAndUpdate(roomId, { membersOnline: count });
      io.to(`room:${roomId}`).emit('room:joined', { roomId, membersOnline: count });
    });

    socket.on('room:leave', async (roomId) => {
      socket.leave(`room:${roomId}`);
      const count = getActiveMembersCount(io, roomId);
      await Room.findByIdAndUpdate(roomId, { membersOnline: count });
      io.to(`room:${roomId}`).emit('room:joined', { roomId, membersOnline: count });
    });

    socket.on('screenshot:warning', ({ chatId }) => socket.to(`chat:${chatId}`).emit('screenshot:warning', { userId }));

    socket.on('disconnecting', () => {
      for (const room of socket.rooms) {
        if (room.startsWith('room:')) {
          const roomId = room.substring(5);
          setTimeout(async () => {
            const count = getActiveMembersCount(io, roomId);
            await Room.findByIdAndUpdate(roomId, { membersOnline: count });
            io.to(`room:${roomId}`).emit('room:joined', { roomId, membersOnline: count });
          }, 50);
        }
      }
    });

    socket.on('disconnect', async () => {
      const remaining = (onlineUsers.get(userId) || 1) - 1;
      if (remaining > 0) onlineUsers.set(userId, remaining);
      else onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { lastSeenAt: new Date() });
      if (remaining <= 0) io.emit('presence:update', { userId, online: false });
    });
  });
};
