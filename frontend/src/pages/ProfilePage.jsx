import { useMutation } from '@tanstack/react-query';
import { ImagePlus, Shuffle, Upload, UserRound, Crown, Zap, Sparkles, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { http } from '../api/http.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { setCredentials } from '../features/auth/authSlice.js';

const colleges = [
  'Test College',
  'JSS Academy of Technical Education Noida',
  'Indian Institute of Technology Delhi',
  'Delhi Technological University',
  'Netaji Subhas University of Technology',
  'Bennett University',
  'Sharda University',
  'Galgotias University',
  'Amity University Noida',
  'Indraprastha Institute of Information Technology Delhi',
  'Guru Gobind Singh Indraprastha University'
];

const fieldLabels = {
  collegeName: 'College name',
  firstName: 'First name',
  branch: 'Branch',
  year: 'Year',
  gender: 'Gender',
  bio: 'Bio',
  interests: 'Interests',
  vibeTags: 'Vibe tags',
  musicTaste: 'Music taste'
};

const premiumNames = {
  pulse_pro: 'Pulse Pro',
  orbit_z: 'Orbit Z',
  nebula_x: 'Nebula X',
  spark: 'Pulse Pro',
  plus: 'Orbit Z',
  max: 'Nebula X'
};

const premiumCardStyles = {
  pulse_pro: {
    title: 'Pulse Pro active',
    icon: Zap,
    themeClass: 'border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-transparent dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.05)] font-bold',
    iconClass: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
  },
  spark: {
    title: 'Pulse Pro active',
    icon: Zap,
    themeClass: 'border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-transparent dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.05)] font-bold',
    iconClass: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
  },
  orbit_z: {
    title: 'Orbit Z active',
    icon: Crown,
    themeClass: 'border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/5 to-transparent dark:border-violet-500/30 text-violet-600 dark:text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.05)]',
    iconClass: 'text-violet-500 bg-violet-500/10 border-violet-500/20'
  },
  plus: {
    title: 'Orbit Z active',
    icon: Crown,
    themeClass: 'border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/5 to-transparent dark:border-violet-500/30 text-violet-600 dark:text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.05)]',
    iconClass: 'text-violet-500 bg-violet-500/10 border-violet-500/20'
  },
  nebula_x: {
    title: 'Nebula X active',
    icon: Sparkles,
    themeClass: 'border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent dark:border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]',
    iconClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  },
  max: {
    title: 'Nebula X active',
    icon: Sparkles,
    themeClass: 'border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent dark:border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)]',
    iconClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  }
};

const formatDate = (date) => date ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date)) : '';

const avatarPalettes = [
  { name: 'Saiyan Hero' },
  { name: 'Spider Hero' },
  { name: 'Cyber Shinobi' },
  { name: 'Dark Knight' },
  { name: 'V-Fin Mecha' },
  { name: 'Demon Prince' }
];

const createAvatar = (seed = Date.now()) => {
  const type = Math.abs(seed) % 6;
  let svgContent = '';
  
  if (type === 0) {
    // Saiyan Hero (Goku/Anime)
    svgContent = `
      <defs>
        <linearGradient id="bg-saiyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff9d00"/>
          <stop offset="100%" stop-color="#ff4d00"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#bg-saiyan)"/>
      <circle cx="50" cy="50" r="38" fill="#ffeb3b" opacity="0.15" />
      <path d="M 15 50 Q 5 35 10 22 Q 22 28 25 35 Q 22 12 34 14 Q 44 22 46 28 Q 50 2 62 8 Q 64 18 64 24 Q 76 10 82 18 Q 80 30 76 35 Q 92 25 90 40 Q 82 48 78 48 Z" fill="#facc15"/>
      <path d="M 28 76 L 50 90 L 72 76 L 78 100 L 22 100 Z" fill="#1e4ed8"/>
      <path d="M 18 86 L 34 76 L 50 90 L 66 76 L 82 86 L 86 100 L 14 100 Z" fill="#ea580c"/>
      <path d="M 42 66 L 42 78 L 58 78 L 58 66 Z" fill="#fef08a"/>
      <path d="M 32 46 Q 32 70 50 76 Q 68 70 68 46 Z" fill="#fef08a"/>
      <path d="M 31 43 L 47 47 L 46 49 L 31 45 Z" fill="#eab308"/>
      <path d="M 69 43 L 53 47 L 54 49 L 69 45 Z" fill="#eab308"/>
      <path d="M 33 47 L 44 49 L 42 53 L 35 52 Z" fill="#1e293b"/>
      <circle cx="39" cy="51" r="1.5" fill="#22d3ee"/>
      <path d="M 67 47 L 56 49 L 58 53 L 65 52 Z" fill="#1e293b"/>
      <circle cx="61" cy="51" r="1.5" fill="#22d3ee"/>
      <path d="M 50 56 L 48 60 L 50 60 Z" fill="#ca8a04"/>
      <path d="M 43 65 Q 50 62 57 65" stroke="#1e293b" stroke-width="2" stroke-linecap="round" fill="none"/>
    `;
  } else if (type === 1) {
    // Spider Hero
    svgContent = `
      <defs>
        <linearGradient id="bg-spider" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e11d48"/>
          <stop offset="100%" stop-color="#1d4ed8"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#bg-spider)"/>
      <path d="M 0 0 L 100 100 M 100 0 L 0 100 M 50 0 L 50 100 M 0 50 L 100 50" stroke="#ffffff" stroke-width="0.7" opacity="0.15"/>
      <path d="M 22 80 L 50 90 L 78 80 L 85 100 L 15 100 Z" fill="#1d4ed8"/>
      <path d="M 38 80 L 50 90 L 62 80 L 66 100 L 34 100 Z" fill="#e11d48"/>
      <path d="M 50 87 C 48 83, 52 83, 50 87 Z M 50 83 C 48 80, 52 80, 50 83 Z" fill="#111827" stroke="#111827" stroke-width="1"/>
      <path d="M 44 82 Q 50 85 56 82" stroke="#111827" stroke-width="1" fill="none"/>
      <path d="M 40 68 L 40 82 L 60 82 L 60 68 Z" fill="#e11d48"/>
      <path d="M 28 44 C 28 18, 72 18, 72 44 C 72 68, 50 80, 50 80 C 50 80, 28 68, 28 44 Z" fill="#e11d48" stroke="#be123c" stroke-width="1"/>
      <path d="M 50 46 L 50 20 M 50 46 L 50 80 M 50 46 L 28 44 M 50 46 L 72 44 M 50 46 L 34 26 M 50 46 L 66 26 M 50 46 L 36 68 M 50 46 L 64 68" stroke="#111827" stroke-width="1" opacity="0.25"/>
      <path d="M 39 36 Q 50 41 61 36 M 34 45 Q 50 51 66 45 M 39 55 Q 50 61 61 55" stroke="#111827" stroke-width="1" fill="none" opacity="0.25"/>
      <path d="M 32 44 Q 44 47 48 36 Q 44 32 31 35 Q 29 40 32 44 Z" fill="#ffffff" stroke="#111827" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 68 44 Q 56 47 52 36 Q 56 32 69 35 Q 71 40 68 44 Z" fill="#ffffff" stroke="#111827" stroke-width="3" stroke-linejoin="round"/>
    `;
  } else if (type === 2) {
    // Cyber Shinobi (Cyberpunk/Anime Ninja)
    svgContent = `
      <defs>
        <linearGradient id="bg-cyber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c084fc"/>
          <stop offset="100%" stop-color="#06b6d4"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#bg-cyber)"/>
      <path d="M 24 46 Q 10 32 18 22 Q 28 28 32 32 Q 26 12 38 14 Q 46 22 48 26 Q 52 2 62 8 Q 64 18 64 24 Q 76 10 82 18 Q 80 28 76 32 Q 90 22 88 38 Q 80 44 76 44 Z" fill="#f8fafc"/>
      <path d="M 22 80 L 50 88 L 78 80 L 85 100 L 15 100 Z" fill="#0f172a"/>
      <path d="M 32 80 L 50 88 L 68 80 L 68 100 L 32 100 Z" fill="#1e293b"/>
      <path d="M 28 82 L 50 86 L 72 82" stroke="#22d3ee" stroke-width="2" fill="none" opacity="0.8"/>
      <path d="M 42 66 L 42 80 L 58 80 L 58 66 Z" fill="#1e293b"/>
      <path d="M 30 46 Q 30 70 50 76 Q 70 70 70 46 Z" fill="#0f172a"/>
      <path d="M 26 44 L 74 44 L 70 52 L 30 52 Z" fill="#22d3ee" filter="drop-shadow(0 0 3px #22d3ee)"/>
      <path d="M 28 46 L 72 46 L 69 50 L 31 50 Z" fill="#ffffff" opacity="0.6"/>
      <path d="M 29 42 L 71 42 L 71 39 L 29 39 Z" fill="#ef4444"/>
    `;
  } else if (type === 3) {
    // Dark Knight (Gotham Superhero)
    svgContent = `
      <defs>
        <linearGradient id="bg-knight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#475569"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#bg-knight)"/>
      <path d="M 20 80 L 50 88 L 80 80 L 85 100 L 15 100 Z" fill="#1e293b"/>
      <path d="M 34 84 Q 50 90 66 84 L 62 100 L 38 100 Z" fill="#eab308"/>
      <path d="M 44 85 L 56 85" stroke="#111827" stroke-width="1"/>
      <path d="M 40 68 L 40 80 L 60 80 L 60 68 Z" fill="#1e293b"/>
      <path d="M 26 44 L 23 12 L 35 24 L 65 24 L 77 12 L 74 44 Q 74 70 50 76 Q 26 70 26 44 Z" fill="#0f172a"/>
      <path d="M 38 54 Q 38 68 50 72 Q 62 68 62 54 Q 58 50 50 50 Q 42 50 38 54 Z" fill="#ffedd5"/>
      <path d="M 34 38 L 44 41 L 42 44 L 35 43 Z" fill="#ffffff" filter="drop-shadow(0 0 2px #ffffff)"/>
      <path d="M 66 38 L 56 41 L 58 44 L 65 43 Z" fill="#ffffff" filter="drop-shadow(0 0 2px #ffffff)"/>
      <path d="M 45 64 Q 50 66 55 64" stroke="#111827" stroke-width="2" stroke-linecap="round"/>
    `;
  } else if (type === 4) {
    // V-Fin Mecha (Anime Robot)
    svgContent = `
      <defs>
        <linearGradient id="bg-mecha" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#1e1b4b"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#bg-mecha)"/>
      <path d="M 22 80 L 50 90 L 78 80 L 85 100 L 15 100 Z" fill="#1d4ed8"/>
      <rect x="28" y="84" width="10" height="6" fill="#fbbf24"/>
      <rect x="62" y="84" width="10" height="6" fill="#fbbf24"/>
      <path d="M 50 90 L 50 100" stroke="#ef4444" stroke-width="4"/>
      <path d="M 42 66 L 42 80 L 58 80 L 58 66 Z" fill="#475569"/>
      <path d="M 28 40 L 32 68 L 50 80 L 68 68 L 72 40 L 50 28 Z" fill="#f1f5f9"/>
      <path d="M 32 40 L 35 60 L 50 70 L 65 60 L 68 40 Z" fill="#cbd5e1"/>
      <path d="M 30 52 L 34 60 M 70 52 L 66 60" stroke="#475569" stroke-width="2"/>
      <path d="M 50 24 L 30 4 L 38 2 L 50 16 L 62 2 L 70 4 Z" fill="#fbbf24" filter="drop-shadow(0 0 2px #fbbf24)"/>
      <rect x="47" y="16" width="6" height="8" rx="2" fill="#ef4444"/>
      <path d="M 36 44 L 46 46 L 44 49 L 37 47 Z" fill="#10b981" filter="drop-shadow(0 0 3px #10b981)"/>
      <path d="M 64 44 L 54 46 L 56 49 L 63 47 Z" fill="#10b981" filter="drop-shadow(0 0 3px #10b981)"/>
    `;
  } else {
    // Demon Prince (Fantasy Anime Hero)
    svgContent = `
      <defs>
        <linearGradient id="bg-demon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#450a0a"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#bg-demon)"/>
      <path d="M 32 28 Q 14 12 16 0 C 22 6, 28 16, 32 24 Z" fill="#0f172a"/>
      <path d="M 68 28 Q 86 12 84 0 C 78 6, 72 16, 68 24 Z" fill="#0f172a"/>
      <path d="M 22 80 L 50 88 L 78 80 L 85 100 L 15 100 Z" fill="#0f172a"/>
      <path d="M 38 80 L 50 88 L 62 80 L 65 100 L 35 100 Z" fill="#ef4444"/>
      <path d="M 42 66 L 42 80 L 58 80 L 58 66 Z" fill="#f3f4f6"/>
      <path d="M 30 46 Q 30 72 50 78 Q 70 72 70 46 Z" fill="#f3f4f6"/>
      <path d="M 28 35 Q 38 42 42 46 Q 48 32 50 37 Q 52 32 58 46 Q 62 42 72 35 L 68 26 L 32 26 Z" fill="#1e1b4b"/>
      <circle cx="40" cy="52" r="3.5" fill="#ef4444" filter="drop-shadow(0 0 2.5px #ef4444)"/>
      <circle cx="60" cy="52" r="3.5" fill="#ef4444" filter="drop-shadow(0 0 2.5px #ef4444)"/>
      <path d="M 44 64 Q 50 68 56 64" stroke="#0f172a" stroke-width="2" stroke-linecap="round" fill="none"/>
    `;
  }
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${svgContent}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, accessToken } = useSelector((state) => state.auth);
  const online = useSelector((state) => state.realtime.online);
  const [form, setForm] = useState({
    collegeName: user?.collegeName || user?.college?.name || '',
    firstName: user?.firstName || '',
    branch: user?.branch || '',
    year: user?.year || 1,
    gender: user?.gender || 'prefer_not',
    bio: user?.bio || '',
    interests: (user?.interests || []).join(', '),
    vibeTags: (user?.vibeTags || []).join(', '),
    musicTaste: (user?.musicTaste || []).join(', '),
    realPhotoVisibleToMatches: Boolean(user?.realPhotoVisibleToMatches)
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || createAvatar());
  const [photoPreview, setPhotoPreview] = useState(user?.realPhoto || '');
  useEffect(() => {
    setForm({
      collegeName: user?.collegeName || user?.college?.name || '',
      firstName: user?.firstName || '',
      branch: user?.branch || '',
      year: user?.year || 1,
      gender: user?.gender || 'prefer_not',
      bio: user?.bio || '',
      interests: (user?.interests || []).join(', '),
      vibeTags: (user?.vibeTags || []).join(', '),
      musicTaste: (user?.musicTaste || []).join(', '),
      realPhotoVisibleToMatches: Boolean(user?.realPhotoVisibleToMatches)
    });
    setAvatarPreview(user?.avatar || createAvatar());
    setPhotoPreview(user?.realPhoto || '');
  }, [user?.id, user?.avatar, user?.realPhoto, user?.realPhotoVisibleToMatches]);
  const validateProfile = () => {
    const required = ['collegeName', 'firstName', 'branch', 'year', 'gender', 'bio', 'interests', 'vibeTags', 'musicTaste'];
    const missing = required.filter((key) => !String(form[key] || '').trim());
    if (missing.length) {
      throw new Error(`Missing: ${missing.map((key) => fieldLabels[key]).join(', ')}`);
    }
    return true;
  };
  const save = useMutation({
    mutationFn: () => {
      validateProfile();
      return http.patch('/profile', {
        firstName: form.firstName,
        branch: form.branch,
        year: Number(form.year),
        gender: form.gender,
        bio: form.bio,
        collegeName: form.collegeName,
        interests: form.interests.split(',').map((x) => x.trim()).filter(Boolean),
        vibeTags: form.vibeTags.split(',').map((x) => x.trim()).filter(Boolean),
        musicTaste: form.musicTaste.split(',').map((x) => x.trim()).filter(Boolean),
        avatar: avatarPreview,
        realPhotoVisibleToMatches: form.realPhotoVisibleToMatches
      });
    },
    onSuccess: (res) => {
      const isFirstTime = user && !user.profileComplete;
      dispatch(setCredentials({ user: res.data.user, accessToken }));
      toast.success('Profile polished');
      if (isFirstTime) {
        localStorage.setItem(`nexora_onboarding_pending_${res.data.user._id || res.data.user.id}`, 'true');
        navigate('/onboarding');
      } else {
        navigate('/discover');
      }
    },
    onError: (error) => {
      const missing = error.details?.missing?.map((key) => fieldLabels[key] || key).join(', ');
      toast.error(missing ? `Missing: ${missing}` : error.message || 'Could not save profile');
    }
  });
  const uploadPhoto = useMutation({
    mutationFn: (file) => {
      const data = new FormData();
      data.append('photo', file);
      return http.post('/profile/photo', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: (res) => {
      const nextUser = { ...user, realPhoto: res.data.realPhoto };
      dispatch(setCredentials({ user: nextUser, accessToken }));
      setPhotoPreview(res.data.realPhoto);
      toast.success('Private profile photo saved');
    },
    onError: (error) => toast.error(error.message || 'Could not upload photo')
  });
  const randomizeAvatar = () => setAvatarPreview(createAvatar(Date.now() + Math.floor(Math.random() * 1000)));
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-0">
      <Card tilt={false}>
        <div className="flex items-center gap-3">
          <div className="relative grid h-10 w-10 sm:h-12 sm:w-12 place-items-center overflow-hidden rounded-lg bg-aurora font-black text-ink text-sm sm:text-base">
            {avatarPreview ? <img className="h-full w-full object-cover" src={avatarPreview} alt="" /> : user?.nickname?.[0] || 'N'}
            {online[user?.id] && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-ink" />}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-display">{user?.nickname || 'Profile'}</h1>
            <p className="text-xs text-slate-500">{online[user?.id] ? 'Online now' : 'Offline'}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500">Your anonymous identity should feel magnetic before it becomes obvious.</p>
        {user?.premium?.active && (() => {
          const planStyles = premiumCardStyles[user.premium.plan] || {
            title: 'Premium active',
            icon: Crown,
            themeClass: 'border-slate-500/20 bg-slate-500/5 text-slate-700 dark:text-slate-300',
            iconClass: 'text-slate-500 bg-slate-500/10'
          };
          const PlanIcon = planStyles.icon;
          return (
            <div className={`mt-5 flex items-center justify-between gap-4 rounded-2xl border p-4 backdrop-blur-sm transition-all duration-300 ${planStyles.themeClass}`}>
              <div className="flex items-center gap-3.5">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${planStyles.iconClass}`}>
                  <PlanIcon size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight">{planStyles.title}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold flex-wrap">
                    <Calendar size={13} className="shrink-0" />
                    <span>Expires {formatDate(user.premium.expiresAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] sm:text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider shrink-0">
                <span className="relative h-1.5 w-1.5">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
                  <span className="absolute inset-0 rounded-full bg-emerald-400" />
                </span>
                Active
              </div>
            </div>
          );
        })()}
        {user?.profileComplete === false && <p className="mt-4 rounded-lg bg-flare/10 p-3 text-sm font-semibold text-flare">Complete the required profile fields to unlock the rest of Nexora.</p>}
        <div className="mt-6 space-y-3">
          <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
            <div className="grid aspect-square max-h-44 sm:max-h-none place-items-center overflow-hidden rounded-lg border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/5">
              {avatarPreview ? <img className="h-full w-full object-cover" src={avatarPreview} alt="" /> : <UserRound size={42} />}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-bold font-display">Public avatar</p>
                <p className="mt-1 text-xs text-slate-500">Shown in Discover before anyone knows your real photo.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {avatarPalettes.map((item, index) => (
                  <button key={index} type="button" onClick={() => setAvatarPreview(createAvatar(index))} className="h-11 rounded-lg border border-black/10 bg-white/70 text-xs font-bold hover:border-aurora dark:border-white/10 dark:bg-white/5 truncate px-1" title={item.name}>
                    {item.name}
                  </button>
                ))}
              </div>
              <Button type="button" variant="ghost" className="w-full" onClick={randomizeAvatar}><Shuffle size={18} /> Create avatar</Button>
            </div>
          </div>
          <div className="grid gap-3 rounded-lg border border-black/10 p-3 dark:border-white/10 sm:grid-cols-[112px_minmax(0,1fr)]">
            <div className="grid aspect-square max-h-28 sm:max-h-none place-items-center overflow-hidden rounded-lg bg-black/5 dark:bg-white/10">
              {photoPreview ? <img className="h-full w-full object-cover" src={photoPreview} alt="" /> : <ImagePlus size={32} />}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-bold font-display">Private profile photo</p>
                <p className="mt-1 text-xs text-slate-500">Hidden from Discover. It can appear to mutual matches only when you allow it.</p>
              </div>
              <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white shadow-glow dark:bg-white dark:text-ink w-full sm:w-auto active:scale-95 transition-transform">
                <Upload size={18} />
                Upload photo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadPhoto.mutate(e.target.files[0])} />
              </label>
              <label className="flex items-start gap-3 rounded-lg bg-black/5 p-3 text-sm dark:bg-white/10">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-aurora" checked={form.realPhotoVisibleToMatches} onChange={(e) => setForm({ ...form, realPhotoVisibleToMatches: e.target.checked })} />
                <span>
                  <span className="block font-bold">Let mutual likes see my profile photo</span>
                  <span className="text-xs text-slate-500">Only students you matched with can receive it.</span>
                </span>
              </label>
            </div>
          </div>
          <Input placeholder="College Name *" list="profile-college-names" value={form.collegeName} onChange={(e) => setForm({ ...form, collegeName: e.target.value })} className="text-xs" />
          <datalist id="profile-college-names">
            {colleges.map((college) => <option key={college} value={college} />)}
          </datalist>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <Input placeholder="nexorian nick name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="text-xs" />
            <Input placeholder="Branch *" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className="text-xs" />
            <Input placeholder="Year *" type="number" min="1" max="6" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="text-xs" />
            <select className="h-11 w-full rounded-xl border border-black/10 bg-white/70 px-3.5 text-xs font-medium outline-none transition focus:border-aurora focus:ring-1 focus:ring-aurora/20 dark:border-white/10 dark:bg-[#111318]/50 text-slate-800 dark:text-slate-200" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="prefer_not">Prefer not</option>
              <option value="woman">Woman</option>
              <option value="man">Man</option>
              <option value="non_binary">Non-binary</option>
            </select>
          </div>
          <Input placeholder="Bio *" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="text-xs" />
          <Input placeholder="Interests comma separated *" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} className="text-xs" />
          <Input placeholder="Vibe tags *" value={form.vibeTags} onChange={(e) => setForm({ ...form, vibeTags: e.target.value })} className="text-xs" />
          <Input placeholder="Music taste *" value={form.musicTaste} onChange={(e) => setForm({ ...form, musicTaste: e.target.value })} className="text-xs" />
          <Button onClick={() => save.mutate()} className="w-full" disabled={save.isPending}>Save profile</Button>
        </div>
      </Card>
    </div>
  );
};
