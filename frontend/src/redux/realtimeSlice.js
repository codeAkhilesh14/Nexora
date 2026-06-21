import { createSlice } from '@reduxjs/toolkit';

const realtimeSlice = createSlice({
  name: 'realtime',
  initialState: { online: {}, notifications: [] },
  reducers: {
    setPresence: (state, action) => { state.online[action.payload.userId] = action.payload.online; },
    setPresenceSnapshot: (state, action) => {
      state.online = {};
      action.payload.forEach((userId) => { state.online[userId] = true; });
    },
    pushNotification: (state, action) => { state.notifications.unshift(action.payload); },
    clearNotifications: (state) => {
      state.notifications = [];
    }
  }
});

export const { setPresence, setPresenceSnapshot, pushNotification, clearNotifications } = realtimeSlice.actions;
export default realtimeSlice.reducer;
