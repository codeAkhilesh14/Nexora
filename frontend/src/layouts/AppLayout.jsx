import { Bell, Compass, Crown, HeartHandshake, MessageCircle, Moon, Shield, Sun, UserCircle, Users } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Logo } from '../components/common/Logo.jsx';
import { Button } from '../components/ui/Button.jsx';
import { toggleTheme } from '../redux/themeSlice.js';
import { logoutLocal } from '../features/auth/authSlice.js';
import { http } from '../api/http.js';
import { useThemeClass } from '../hooks/useThemeClass.js';
import { connectSocket, disconnectSocket } from '../sockets/socket.js';
import { useEffect, Suspense } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

const nav = [
  ['/', Compass, 'Discover'],
  ['/chats', MessageCircle, 'Chats'],
  ['/rooms', Users, 'Rooms'],
  ['/crush', HeartHandshake, 'Crush'],
  ['/profile', UserCircle, 'Profile'],
  ['/premium', Crown, 'Premium']
];

const premiumNames = {
  pulse_pro: 'Pulse Pro',
  orbit_z: 'Orbit Z',
  nebula_x: 'Nebula X',
  spark: 'Pulse Pro',
  plus: 'Orbit Z',
  max: 'Nebula X'
};

const tabConfig = {
  '/': {
    activeBg: 'bg-emerald-50 border border-emerald-200/60 dark:border-transparent dark:bg-white',
    activeColor: 'text-emerald-600 dark:text-ink',
    hoverColor: 'hover:text-emerald-600 dark:hover:text-emerald-400'
  },
  '/chats': {
    activeBg: 'bg-blue-50 border border-blue-200/60 dark:border-transparent dark:bg-white',
    activeColor: 'text-blue-600 dark:text-ink',
    hoverColor: 'hover:text-blue-600 dark:hover:text-blue-400'
  },
  '/rooms': {
    activeBg: 'bg-indigo-50 border border-indigo-200/60 dark:border-transparent dark:bg-white',
    activeColor: 'text-indigo-600 dark:text-ink',
    hoverColor: 'hover:text-indigo-600 dark:hover:text-indigo-400'
  },
  '/crush': {
    activeBg: 'bg-rose-50 border border-rose-200/60 dark:border-transparent dark:bg-white',
    activeColor: 'text-rose-600 dark:text-ink',
    hoverColor: 'hover:text-rose-600 dark:hover:text-rose-400'
  },
  '/profile': {
    activeBg: 'bg-orange-50 border border-orange-200/60 dark:border-transparent dark:bg-white',
    activeColor: 'text-orange-600 dark:text-ink',
    hoverColor: 'hover:text-orange-600 dark:hover:text-orange-400'
  },
  '/premium': {
    activeBg: 'bg-amber-50 border border-amber-200/60 dark:border-transparent dark:bg-white',
    activeColor: 'text-amber-600 dark:text-ink',
    hoverColor: 'hover:text-amber-600 dark:hover:text-amber-400'
  }
};

const getIconColor = (to, isActivePath) => {
  if (to === '/') {
    return isActivePath
      ? 'text-emerald-500 dark:text-emerald-500'
      : 'text-emerald-500/60 hover:text-emerald-500 dark:text-emerald-400/50 dark:hover:text-emerald-400';
  }
  if (to === '/chats') {
    return isActivePath
      ? 'opacity-100'
      : 'opacity-60 hover:opacity-100 transition-opacity duration-200';
  }
  if (to === '/rooms') {
    return isActivePath
      ? 'text-indigo-500 dark:text-indigo-500'
      : 'text-indigo-500/60 hover:text-indigo-500 dark:text-indigo-400/50 dark:hover:text-indigo-400';
  }
  if (to === '/crush') {
    return isActivePath
      ? 'opacity-100'
      : 'opacity-60 hover:opacity-100 transition-opacity duration-200';
  }
  if (to === '/profile') {
    return isActivePath
      ? 'opacity-100'
      : 'opacity-60 hover:opacity-100 transition-opacity duration-200';
  }
  if (to === '/premium') {
    return isActivePath
      ? 'text-amber-500 dark:text-amber-500'
      : 'text-amber-500/60 hover:text-amber-500 dark:text-amber-400/50 dark:hover:text-amber-400';
  }
  return 'text-slate-500 dark:text-slate-400';
};

const getIconStyle = (to) => {
  if (to === '/chats') {
    return { stroke: 'url(#chats-gradient)' };
  }
  if (to === '/crush') {
    return { stroke: 'url(#crush-gradient)' };
  }
  if (to === '/profile') {
    return { stroke: 'url(#profile-gradient)' };
  }
  return undefined;
};

const getTabClass = (to, isActivePath) => {
  const base = 'relative grid place-items-center rounded-xl text-[10px] sm:text-xs p-1 sm:p-1.5 transition duration-200 z-10';
  const cfg = tabConfig[to] || tabConfig['/'];
  if (isActivePath) {
    return `${base} ${cfg.activeColor} font-bold`;
  }

  return `${base} text-slate-500 dark:text-slate-400 ${cfg.hoverColor}`;
};

export const AppLayout = () => {
  useThemeClass();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isDiscoverPage = location.pathname === '/' || location.pathname === '/discover';
  const qc = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.accessToken);
  const mode = useSelector((state) => state.theme.mode);
  const notifications = useSelector((state) => state.realtime.notifications);
  const { data: notificationData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => http.get('/notifications'),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: Boolean(token)
  });
  const unreadCount = (notificationData?.data?.notifications?.filter((n) => !n.readAt)?.length ?? 0) + notifications.length;
  const hasNotifications = unreadCount > 0;

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return undefined;
    const refreshChats = () => {
      qc.invalidateQueries({ queryKey: ['chats'] });
    };
    const refreshRooms = () => {
      qc.invalidateQueries({ queryKey: ['rooms'] });
    };
    const refreshMatches = () => {
      qc.invalidateQueries({ queryKey: ['chats'] });
      qc.invalidateQueries({ queryKey: ['deck'] });
    };
    const showMatchNotification = (notification) => {
      if (notification?.type !== 'match') return;
      const chatId = notification.data?.chat;
      toast.success(
        <button
          type="button"
          className="text-left"
          onClick={() => {
            toast.dismiss(notification._id);
            navigate(chatId ? `/chats?chat=${chatId}` : '/chats');
          }}
        >
          <span className="block font-black">{notification.title || 'You matched'}</span>
          <span className="block text-sm">{notification.body || 'Now you can go to chat.'}</span>
        </button>,
        { id: notification._id, duration: 7000 }
      );
    };
    socket.on('message:new', refreshChats);
    socket.on('room:joined', refreshRooms);
    socket.on('match:new', refreshMatches);
    socket.on('notification:new', showMatchNotification);
    return () => {
      socket.off('message:new', refreshChats);
      socket.off('room:joined', refreshRooms);
      socket.off('match:new', refreshMatches);
      socket.off('notification:new', showMatchNotification);
    };
  }, [token, qc, navigate]);

  useEffect(() => {
    const allowedWithoutProfile = ['/profile'];
    if (user && !user.profileComplete && !allowedWithoutProfile.includes(location.pathname)) {
      navigate('/profile', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const logout = async () => {
    await http.post('/auth/logout').catch(() => { });
    disconnectSocket();
    dispatch(logoutLocal());
    navigate('/auth/login');
  };

  return (
    <div className={`min-h-screen min-h-[100dvh] pb-20 sm:pb-24 text-slate-950 dark:text-white relative transition-colors duration-300 ${
      isDiscoverPage ? 'bg-[#cbd5e1] lg:bg-transparent dark:bg-transparent' : ''
    }`}>
      {/* Floating 3D Ambient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.15, 0.9, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-aurora/10 blur-[120px] dark:bg-aurora/5"
        />
        <motion.div
          animate={{
            x: [0, -60, 80, 0],
            y: [0, 120, -70, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-flare/10 blur-[130px] dark:bg-flare/5"
        />
        <motion.div
          animate={{
            x: [0, 40, -50, 0],
            y: [0, 80, -90, 0],
            scale: [1, 1.1, 0.95, 1]
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute top-[60%] left-[50%] w-[300px] h-[300px] rounded-full bg-solar/10 blur-[110px] dark:bg-solar/5"
        />
      </div>

      {/* SVG Gradient definitions */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <linearGradient id="chats-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="crush-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffb3b3" />
            <stop offset="50%" stopColor="#ff003c" />
            <stop offset="100%" stopColor="#4a000a" />
          </linearGradient>
          <linearGradient id="profile-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
      </svg>
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl dark:bg-ink/65 transition-all duration-300">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-4">
          <Logo />
          <div className="flex items-center gap-2">
            {user?.premium?.active && (
              <NavLink
                to="/premium"
                className={user.premium.plan === 'pulse_pro' || user.premium.plan === 'spark'
                  ? "rounded-lg bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 px-2.5 py-1.5 text-[10px] sm:px-3.5 sm:py-2 sm:text-xs font-black text-slate-950 shadow-md shadow-cyan-400/20 hover:opacity-95 transition-opacity shrink-0 border border-cyan-200/50"
                  : "rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 px-2.5 py-1.5 text-[10px] sm:px-3.5 sm:py-2 sm:text-xs font-black text-white shadow-md shadow-amber-500/10 hover:opacity-95 transition-opacity shrink-0"
                }
              >
                {premiumNames[user.premium.plan] || 'Premium'}
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 transition-all duration-200"
              >
                <Shield size={20} />
              </NavLink>
            )}
            <button
              type="button"
              className={`relative rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 transition-all duration-200 ${user && !user.profileComplete ? 'opacity-40 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (user && !user.profileComplete) {
                  toast.error('Complete your profile to view likes and requests');
                } else {
                  navigate('/likes-requests');
                }
              }}
              aria-label="Open likes requests"
            >
              <Bell size={20} />
              {hasNotifications && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-flare animate-pulse" />}
            </button>
            <Button
              variant="ghost"
              className="text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 rounded-lg p-2 transition-all duration-200"
              onClick={() => dispatch(toggleTheme())}
              aria-label="Toggle theme"
            >
              {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button
              variant="ghost"
              className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 font-bold px-3 py-1.5 rounded-lg transition-all duration-200"
              onClick={logout}
            >
              Exit
            </Button>
          </div>
        </div>
        {/* Bottom border gradient line */}
        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-emerald-400 via-blue-500 via-rose-500 via-orange-500 to-amber-500 opacity-90 animate-gradient-shift" />
      </header>
      <main style={{ perspective: '1200px' }} className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 relative z-10">
        <Suspense fallback={<LoadingSpinner fullScreen={false} />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, rotateX: 6, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, rotateX: -6, y: -15, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
              style={{ transformOrigin: 'top center' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
      <nav className="fixed inset-x-0 bottom-2 sm:bottom-4 z-50 mx-auto grid h-14 sm:h-16 max-w-[96%] sm:max-w-[94%] grid-cols-6 gap-0.5 sm:gap-1 rounded-2xl border border-black/10 bg-white/80 p-1.5 sm:p-2 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-ink/80 md:max-w-2xl safe-bottom">
        {nav.map(([to, Icon, label]) => {
          const isAllowed = user?.profileComplete || to === '/profile';
          const isActivePath = location.pathname === to || (to === '/' && location.pathname === '/discover');
          const cfg = tabConfig[to] || tabConfig['/'];

          if (!isAllowed) {
            return (
              <button
                key={to}
                type="button"
                onClick={() => toast.error('Complete your profile to unlock this tab')}
                className="relative grid place-items-center rounded-xl text-[10px] sm:text-xs p-1 sm:p-1.5 opacity-40 cursor-not-allowed text-slate-500 dark:text-slate-400"
              >
                <Icon size={18} style={getIconStyle(to)} className="shrink-0 transition-colors duration-200 text-slate-500/60 dark:text-slate-400/50" />
                <span className="mt-0.5 hidden sm:block font-display">{label}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              className={getTabClass(to, isActivePath)}
            >
              <Icon size={18} style={getIconStyle(to)} className={`shrink-0 transition-colors duration-200 ${getIconColor(to, isActivePath)}`} />
              <span className="mt-0.5 hidden sm:block font-display">{label}</span>
              {isActivePath && (
                <motion.div
                  layoutId="activeNavTab"
                  className={`absolute inset-0 -z-10 rounded-xl transition-all duration-300 shadow-sm dark:shadow-md ${cfg.activeBg}`}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
