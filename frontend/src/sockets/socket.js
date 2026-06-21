import { io } from 'socket.io-client';
import { store } from '../app/store.js';
import { pushNotification, setPresence, setPresenceSnapshot } from '../redux/realtimeSlice.js';

let socket;

export const connectSocket = () => {
  const token = store.getState().auth.accessToken;
  if (!token) return socket;
  if (socket && socket.auth?.token === token) return socket;
  if (socket) socket.disconnect();
  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080', {
    withCredentials: true,
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 4000
  });
  socket.auth = { token };
  socket.on('presence:snapshot', (payload) => store.dispatch(setPresenceSnapshot(payload)));
  socket.on('presence:update', (payload) => store.dispatch(setPresence(payload)));
  socket.on('notification:new', (payload) => store.dispatch(pushNotification(payload)));
  return socket;
};

export const getSocket = () => socket || connectSocket();

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = undefined;
};
