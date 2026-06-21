import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/auth/authSlice.js';
import themeReducer from '../redux/themeSlice.js';
import realtimeReducer from '../redux/realtimeSlice.js';

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  realtime: realtimeReducer
});

export const store = configureStore({
  reducer: persistReducer({ key: 'nexora', storage, whitelist: ['auth', 'theme'] }, rootReducer),
  middleware: (getDefault) => getDefault({ serializableCheck: false })
});

export const persistor = persistStore(store);
