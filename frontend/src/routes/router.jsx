import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

const LoginPage = lazy(() => import('../pages/LoginPage.jsx').then(module => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('../pages/SignupPage.jsx').then(module => ({ default: module.SignupPage })));
const VerifyOtpPage = lazy(() => import('../pages/VerifyOtpPage.jsx').then(module => ({ default: module.VerifyOtpPage })));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage.jsx').then(module => ({ default: module.ForgotPasswordPage })));
const DiscoverPage = lazy(() => import('../pages/DiscoverPage.jsx').then(module => ({ default: module.DiscoverPage })));
const RadarPage = lazy(() => import('../pages/RadarPage.jsx').then(module => ({ default: module.RadarPage })));
const ChatsPage = lazy(() => import('../pages/ChatsPage.jsx').then(module => ({ default: module.ChatsPage })));
const RoomsPage = lazy(() => import('../pages/RoomsPage.jsx').then(module => ({ default: module.RoomsPage })));
const CrushPage = lazy(() => import('../pages/CrushPage.jsx').then(module => ({ default: module.CrushPage })));
const PremiumPage = lazy(() => import('../pages/PremiumPage.jsx').then(module => ({ default: module.PremiumPage })));
const AdminPage = lazy(() => import('../pages/AdminPage.jsx').then(module => ({ default: module.AdminPage })));
const ProfilePage = lazy(() => import('../pages/ProfilePage.jsx').then(module => ({ default: module.ProfilePage })));
const LikesRequestsPage = lazy(() => import('../pages/LikesRequestsPage.jsx').then(module => ({ default: module.LikesRequestsPage })));
const OnboardingPage = lazy(() => import('../pages/OnboardingPage.jsx').then(module => ({ default: module.OnboardingPage })));

const lazyLoad = (Component) => (
  <Suspense fallback={<LoadingSpinner fullScreen={true} />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  { path: '/auth/login', element: lazyLoad(LoginPage) },
  { path: '/auth/signup', element: lazyLoad(SignupPage) },
  { path: '/auth/verify-otp', element: lazyLoad(VerifyOtpPage) },
  { path: '/auth/forgot-password', element: lazyLoad(ForgotPasswordPage) },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/onboarding', element: lazyLoad(OnboardingPage) },
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DiscoverPage /> },
          { path: '/discover', element: <DiscoverPage /> },
          { path: '/radar', element: <RadarPage /> },
          { path: '/likes-requests', element: <LikesRequestsPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/chats', element: <ChatsPage /> },
          { path: '/rooms', element: <RoomsPage /> },
          { path: '/crush', element: <CrushPage /> },
          { path: '/premium', element: <PremiumPage /> },
          { path: '/admin', element: <AdminPage /> }
        ]
      }
    ]
  }
]);

