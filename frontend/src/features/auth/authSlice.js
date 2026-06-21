import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, accessToken: null },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    logoutLocal: (state) => {
      state.user = null;
      state.accessToken = null;
    }
  }
});

export const { setCredentials, logoutLocal } = authSlice.actions;
export default authSlice.reducer;
