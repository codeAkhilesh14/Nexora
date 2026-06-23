import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { http } from '../api/http.js';
import { logoutLocal, updateUser } from '../features/auth/authSlice.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

export const ProtectedRoute = () => {
  const token = useSelector((state) => state.auth.accessToken);
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    http.get('/auth/me')
      .then((res) => {
        if (!cancelled) {
          dispatch(updateUser(res.data.user));
        }
      })
      .catch(() => {
        // Interceptor already tried /auth/refresh and retried /auth/me.
        // If we're still here, the refresh also failed → session truly expired.
        if (!cancelled) dispatch(logoutLocal());
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []); // Run only once on mount to verify initial session state

  useEffect(() => {
    if (!token) {
      setChecking(false);
    }
  }, [token]);

  if (checking) return <LoadingSpinner fullScreen />;
  return token ? <Outlet /> : <Navigate to="/auth/login" replace />;
};
