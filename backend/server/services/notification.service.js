import { Notification } from '../models/Notification.js';

export const createNotification = async ({ io, user, type, title, body, data }) => {
  const notification = await Notification.create({ user, type, title, body, data });
  io?.to(`user:${user}`).emit('notification:new', notification);
  return notification;
};
