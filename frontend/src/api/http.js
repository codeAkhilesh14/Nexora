import axios from 'axios';
import { store } from '../app/store.js';
import { setCredentials, logoutLocal } from '../features/auth/authSlice.js';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  withCredentials: true,
  timeout: 45000 // 45 seconds timeout to prevent indefinite hangs
});

http.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshTokenPromise = null;

http.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original?._retry && !original.url?.includes('/auth/login') && !original.url?.includes('/auth/refresh')) {
      original._retry = true;
      try {
        if (!refreshTokenPromise) {
          refreshTokenPromise = http.post('/auth/refresh').then((res) => {
            refreshTokenPromise = null;
            return res;
          }).catch((err) => {
            refreshTokenPromise = null;
            throw err;
          });
        }
        const data = await refreshTokenPromise;
        store.dispatch(setCredentials(data.data));
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return http(original);
      } catch (refreshError) {
        store.dispatch(logoutLocal());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

