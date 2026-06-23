import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, accessToken: null },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    },
    logoutLocal: (state) => {
      state.user = null;
      state.accessToken = null;
    }
  }
});

export const { setCredentials, updateUser, logoutLocal } = authSlice.actions;
export default authSlice.reducer;
