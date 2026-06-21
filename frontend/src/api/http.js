import axios from 'axios';
import { store } from '../app/store.js';
import { setCredentials, logoutLocal } from '../features/auth/authSlice.js';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  withCredentials: true
});

http.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original?._retry && !original.url?.includes('/auth/login') && !original.url?.includes('/auth/refresh')) {
      original._retry = true;
      try {
        const data = await http.post('/auth/refresh');
        store.dispatch(setCredentials(data.data));
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return http(original);
      } catch {
        store.dispatch(logoutLocal());
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);
