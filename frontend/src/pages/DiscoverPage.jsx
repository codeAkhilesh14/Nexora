import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, RotateCcw, Sparkles, X, Users, Search, Zap, Crown, MapPin, Rocket, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEffect, useState, useRef, forwardRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { http } from '../api/http.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Skeleton } from '../components/common/Skeleton.jsx';
import { getSocket } from '../sockets/socket.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

const radarZones = [
  { value: 'library', label: 'Library' },
  { value: 'cafeteria', label: 'Cafeteria' },
  { value: 'amenities', label: 'Amenities' },
  { value: 'college_gate', label: 'College gate' },
  { value: 'mandir_area', label: 'Mandir area' },
  { value: 'boys_hostel', label: 'Boys hostel' },
  { value: 'girls_hostel', label: 'Girls hostel' },
  { value: 'field', label: 'Field' },
  { value: 'basketball_court', label: 'Basketball court' },
  { value: 'badminton_court', label: 'Badminton court' },
  { value: 'volleyball_court', label: 'Volleyball court' },
  { value: 'first_year_block', label: '1st year block' },
  { value: 'amphitheatre', label: 'Amphitheatre' },
  { value: 'courtyard', label: 'Courtyard' },
  { value: 'parking', label: 'Parking' },
  { value: 'placement_cell_office', label: 'Placement cell office' },
  { value: 'registrar_office', label: 'Registrar office' }
];

/* ── Gradient color sets for cards ── */
const cardGradients = [
  'from-violet-500/10 via-fuchsia-500/5 to-transparent dark:from-violet-600/20 dark:via-fuchsia-500/10 dark:to-transparent',
  'from-cyan-500/10 via-blue-500/5 to-transparent dark:from-cyan-500/20 dark:via-blue-500/10 dark:to-transparent',
  'from-rose-500/10 via-pink-400/5 to-transparent dark:from-rose-500/20 dark:via-pink-400/10 dark:to-transparent',
  'from-amber-500/10 via-orange-400/5 to-transparent dark:from-amber-500/20 dark:via-orange-400/10 dark:to-transparent',
  'from-emerald-500/10 via-teal-400/5 to-transparent dark:from-emerald-500/20 dark:via-teal-400/10 dark:to-transparent',
  'from-indigo-500/10 via-purple-400/5 to-transparent dark:from-indigo-500/20 dark:via-purple-400/10 dark:to-transparent',
];

const glowColors = [
  'hover:shadow-violet-500/10',
  'hover:shadow-cyan-500/10',
  'hover:shadow-rose-500/10',
  'hover:shadow-amber-500/10',
  'hover:shadow-emerald-500/10',
  'hover:shadow-indigo-500/10',
];

export const getPremiumStyles = (premium) => {
  if (!premium?.active) return null;
  const plan = premium.plan;
  const planKey = (plan === 'spark' || plan === 'pulse_pro') ? 'pulse_pro'
    : (plan === 'plus' || plan === 'orbit_z') ? 'orbit_z'
      : (plan === 'max' || plan === 'nebula_x') ? 'nebula_x'
        : null;

  if (planKey === 'pulse_pro') {
    return {
      cardClass: 'border border-cyan-400/40 dark:border-cyan-500/30 shadow-[0_8px_30px_rgba(6,182,212,0.06)] dark:shadow-[0_8px_30px_rgba(34,211,238,0.08)] hover:shadow-cyan-500/20 hover:border-cyan-500/60 dark:hover:border-cyan-400/50 hover:shadow-xl dark:bg-[#111518]',
      badgeClass: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40 font-bold',
      icon: Zap,
      label: 'Pulse Pro',
      gradient: 'from-cyan-500/10 via-sky-400/5 to-transparent dark:from-cyan-600/20 dark:via-sky-500/10 dark:to-transparent'
    };
  }
  if (planKey === 'orbit_z') {
    return {
      cardClass: 'border border-indigo-400/40 dark:border-indigo-500/30 shadow-[0_8px_30px_rgba(99,102,241,0.06)] dark:shadow-[0_8px_30px_rgba(139,92,246,0.08)] hover:shadow-indigo-500/20 hover:border-indigo-500/60 dark:hover:border-indigo-400/50 hover:shadow-xl dark:bg-[#121118]',
      badgeClass: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-black shadow-md shadow-violet-500/10',
      icon: Crown,
      label: 'Orbit Z',
      gradient: 'from-violet-500/15 via-fuchsia-500/5 to-transparent dark:from-violet-600/25 dark:via-fuchsia-500/10 dark:to-transparent'
    };
  }
  if (planKey === 'nebula_x') {
    return {
      cardClass: 'border-2 border-amber-400/50 dark:border-amber-500/40 shadow-[0_8px_30px_rgba(245,158,11,0.08)] dark:shadow-[0_8px_30px_rgba(245,158,11,0.12)] hover:shadow-amber-500/25 hover:border-amber-500 dark:hover:border-amber-400 hover:scale-[1.01] hover:shadow-2xl dark:bg-[#181511]',
      badgeClass: 'bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 text-black font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 animate-pulse',
      icon: Rocket,
      label: 'Nebula X',
      gradient: 'from-amber-500/15 via-orange-400/5 to-transparent dark:from-amber-500/25 dark:via-orange-400/10 dark:to-transparent'
    };
  }
  return null;
};

const ProfileCard = forwardRef(({ profile, online, onAction, actionPending, index }, ref) => {
  const { user } = useSelector((state) => state.auth);
  const profileOnline = Boolean(profile._id && online[profile._id]);
  const userIsPremium = user?.premium?.active;
  const currentUserHasNebulaX = user?.premium?.active && ['nebula_x', 'max'].includes(user.premium.plan);

  const gradient = cardGradients[index % cardGradients.length];
  const glow = glowColors[index % glowColors.length];

  const premiumStyles = getPremiumStyles(profile.premium);
  const isHighMatch = profile.matchPercentage > 75;

  const cardBorderClass = premiumStyles
    ? premiumStyles.cardClass
    : (isHighMatch
        ? `border-2 border-pink-400/50 dark:border-pink-500/40 shadow-[0_12px_40px_-12px_rgba(244,63,94,0.15)] dark:shadow-[0_20px_50px_-20px_rgba(244,63,94,0.3)] hover:scale-[1.01] hover:border-pink-500 dark:hover:border-pink-400 hover:shadow-2xl dark:bg-[#181113]`
        : `border border-slate-200/50 dark:border-white/[0.08] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] ${glow} hover:border-slate-300/60 dark:hover:border-white/[0.12]`);

  const bgGradient = premiumStyles
    ? premiumStyles.gradient
    : (isHighMatch
        ? 'from-pink-500/10 via-rose-500/5 to-transparent dark:from-pink-600/25 dark:via-rose-500/10 dark:to-transparent'
        : gradient);

  const localRef = useRef(null);
  const setRefs = (node) => {
    localRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!localRef.current) return;
    const card = localRef.current;
    const rect = card.getBoundingClientRect();

    const xVal = e.clientX - rect.left;
    const yVal = e.clientY - rect.top;

    setMousePos({
      x: (xVal / rect.width) * 100,
      y: (yVal / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={setRefs}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: isHovered ? -4 : 0,
        scale: isHovered ? 1.01 : 1,
        z: isHovered ? 20 : 0,
      }}
      exit={{ opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
        layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        willChange: 'transform',
      }}
      className={`group relative overflow-hidden rounded-[24px] bg-white/95 dark:bg-[#0f111a]/95 backdrop-blur-xl text-slate-800 dark:text-white transition-all duration-500 hover:shadow-glow-card ${cardBorderClass}`}
    >
      {/* 3D highlight glow following cursor */}
      <div
        className="absolute inset-0 rounded-[24px] pointer-events-none mix-blend-overlay transition-opacity duration-300 z-20"
        style={{
          opacity: isHovered ? 0.95 : 0,
          background: `radial-gradient(circle 160px at ${mousePos.x}% ${mousePos.y}%, rgba(84, 244, 200, 0.2), transparent 80%)`,
        }}
      />
      {/* Animated gradient bg */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-200/10 dark:from-white/[0.03] to-transparent rounded-bl-full" />
      {isHighMatch && (
        <div className="absolute top-3 right-3 z-20">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-wider shadow-md animate-pulse">
            🔥 High Match
          </span>
        </div>
      )}

      <div style={{ transform: 'translateZ(15px)' }} className="relative z-10 p-4 sm:p-6">
        {/* Header: Avatar + Info */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-tr from-purple-500/20 via-pink-500/10 to-transparent dark:from-purple-500/30 dark:via-aurora/20 dark:to-transparent p-[2px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-300 group-hover:from-purple-500 group-hover:via-flare group-hover:to-aurora">
              <div className="h-full w-full rounded-[14px] bg-[#f8fafc] dark:bg-[#1a1d24] grid place-items-center text-lg sm:text-2xl font-black overflow-hidden relative">
                {profile.avatar ? (
                  <img className="h-full w-full rounded-[14px] object-cover" src={profile.avatar} alt="" loading="lazy" />
                ) : (
                  <span className="bg-gradient-to-br from-teal-500 to-cyan-500 dark:from-aurora dark:to-cyan-400 bg-clip-text text-transparent">
                    {profile.nickname?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            {/* Online pulse */}
            {currentUserHasNebulaX && (
              <span className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-[2.5px] border-white dark:border-[#0f111a] transition-colors ${profileOnline
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.5)]'
                  : 'bg-slate-300 dark:bg-slate-600'
                }`}>
                {profileOnline && <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />}
              </span>
            )}
          </div>

          {/* Name & Meta */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight truncate font-display text-purple-600 dark:text-purple-400">{profile.firstName || profile.nickname}</h3>
              {premiumStyles ? (
                <span className={`shrink-0 inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${premiumStyles.badgeClass}`}>
                  <premiumStyles.icon size={8} className="shrink-0" />
                  {premiumStyles.label}
                </span>
              ) : profile.premium?.badge && (
                <span className="shrink-0 inline-flex items-center gap-0.5 rounded-md bg-gradient-to-r from-amber-400 to-orange-500 px-1.5 py-0.5 text-[9px] font-black text-black uppercase tracking-wider">
                  <Crown size={8} />
                  Pro
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-white/45 truncate">
              {profile.branch?.toUpperCase()}{userIsPremium && ` · Year ${profile.year}`}{profile.gender && (profile.gender === 'man' ? ' · M' : profile.gender === 'woman' ? ' · F' : '')}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {currentUserHasNebulaX && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] font-bold ${profileOnline
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-white/40 border border-slate-200/60 dark:border-white/[0.06]'
                  }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${profileOnline ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-white/20'}`} />
                  {profileOnline ? 'Online' : 'Offline'}
                </span>
              )}
              <span className="rounded-full bg-indigo-500/10 dark:bg-indigo-500/10 border border-indigo-500/20 dark:border-indigo-500/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
                L{profile.revealLevel}
              </span>
              {profile.matchPercentage != null && (
                <span className="rounded-full bg-pink-500/10 dark:bg-pink-500/10 border border-pink-500/20 dark:border-pink-500/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-0.5 shadow-sm">
                  <span>💖</span> {profile.matchPercentage}% Match
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-3.5 text-xs sm:text-sm text-slate-600 dark:text-white/70 leading-relaxed font-medium italic border-l-2 border-purple-500/30 pl-3">
            "{profile.bio}"
          </p>
        )}

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="mt-4">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-white/30 mb-1.5">Interests</h4>
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Vibe Tags */}
        {profile.vibeTags && profile.vibeTags.length > 0 && (
          <div className="mt-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-white/30 mb-1.5">Vibe</h4>
            <div className="flex flex-wrap gap-1.5">
              {profile.vibeTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/10 dark:border-violet-500/20 px-2.5 py-1 text-[10px] font-bold text-violet-600 dark:text-violet-300 hover:bg-violet-500/10 dark:hover:bg-violet-500/15 transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Music Taste */}
        {profile.musicTaste && profile.musicTaste.length > 0 && (
          <div className="mt-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-white/30 mb-1.5">Music Taste</h4>
            <div className="flex flex-wrap gap-1.5">
              {profile.musicTaste.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-pink-500/5 dark:bg-pink-500/10 border border-pink-500/10 dark:border-pink-500/20 px-2.5 py-1 text-[10px] font-bold text-pink-600 dark:text-pink-300 hover:bg-pink-500/10 dark:hover:bg-pink-500/15 transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="mt-5 mb-4 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/[0.06] to-transparent" />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAction('left', profile._id)}
            disabled={actionPending}
            className="flex-1 group/btn flex items-center justify-center gap-1.5 rounded-xl bg-slate-100/50 hover:bg-red-500/10 dark:bg-white/[0.02] dark:hover:bg-red-500/10 border border-slate-200 dark:border-white/[0.06] hover:border-red-500/25 px-2.5 sm:px-3 py-2.5 text-[11px] sm:text-xs font-bold text-slate-500 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm"
            aria-label="Dismiss"
          >
            <X size={14} className="group-hover/btn:rotate-90 transition-transform duration-300" />
            <span>Dismiss</span>
          </button>
          <button
            type="button"
            onClick={() => onAction('super_like', profile._id)}
            disabled={actionPending}
            className="group/btn flex items-center justify-center rounded-xl bg-slate-100/50 hover:bg-amber-500/10 dark:bg-white/[0.02] dark:hover:bg-amber-500/10 border border-slate-200 dark:border-white/[0.06] hover:border-amber-500/25 px-3 py-2.5 text-slate-500 dark:text-white/40 hover:text-amber-500 dark:hover:text-amber-400 transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm"
            aria-label="Super Like"
          >
            <Sparkles size={15} className="group-hover/btn:scale-110 transition-transform duration-300" />
          </button>
          <button
            type="button"
            onClick={() => onAction('right', profile._id)}
            disabled={actionPending}
            className="flex-1 group/btn flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500/5 to-pink-500/5 dark:from-flare/5 dark:to-rose-500/5 hover:from-rose-500/10 hover:to-pink-500/10 dark:hover:from-flare/10 dark:hover:to-rose-500/10 border border-rose-500/15 dark:border-flare/10 hover:border-rose-500/35 dark:hover:border-flare/30 px-2.5 sm:px-3 py-2.5 text-[11px] sm:text-xs font-bold text-rose-500 dark:text-flare hover:text-rose-600 dark:hover:text-pink-400 transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-sm"
            aria-label="Like"
          >
            <Heart size={14} className="group-hover/btn:scale-110 transition-transform duration-300" fill="currentColor" />
            <span>Like</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export const DiscoverPage = () => {
  const qc = useQueryClient();
  const online = useSelector((state) => state.realtime.online);
  const { user } = useSelector((state) => state.auth);
  const userIsPremium = user?.premium?.active;
  const [zoneSelectorOpen, setZoneSelectorOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showZoneDeck, setShowZoneDeck] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const zone = params.get('zone');
    if (zone) {
      setSelectedZone(zone);
      setShowZoneDeck(true);
    }
  }, [location.search]);

  const deckQueryKey = showZoneDeck && selectedZone ? ['radar-zone-users', selectedZone] : ['deck'];
  const { data: deckData, isLoading: deckLoading } = useQuery({
    queryKey: deckQueryKey,
    queryFn: () => (showZoneDeck && selectedZone ? http.get(`/discovery/radar/users?zone=${selectedZone}`) : http.get('/discovery/deck')),
    staleTime: 0,
    gcTime: 0
  });
  const allUsers = deckData?.data?.users || [];
  const selectedZoneLabel = radarZones.find((zone) => zone.value === selectedZone)?.label || selectedZone;
  const zoneLabel = deckData?.data?.label || selectedZoneLabel;
  const sameZoneCount = deckData?.data?.users?.length || 0;

  // Filter users by online status (keep for stats badge count)
  const onlineUsers = allUsers.filter((u) => online[u._id]);

  // Filter users by search query
  const users = searchQuery
    ? allUsers.filter((u) =>
      u.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.interests || []).some((i) => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.vibeTags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    : allUsers;

  /* ── Daily swipe limits ── */
  const { data: swipeLimitsData } = useQuery({
    queryKey: ['swipeLimits'],
    queryFn: () => http.get('/discovery/limits'),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60
  });
  const swipeLimits = swipeLimitsData?.data || {};
  const swipesUsed = swipeLimits.swipesUsed ?? 0;
  const swipeLimit = swipeLimits.swipeLimit;
  const isSwipeUnlimited = swipeLimits.unlimited === true;
  const swipeLimitReached = !isSwipeUnlimited && swipeLimit != null && swipesUsed >= swipeLimit;
  const swipesRemaining = isSwipeUnlimited ? null : (swipeLimit != null ? Math.max(0, swipeLimit - swipesUsed) : null);

  const radarMutation = useMutation({
    mutationFn: (payload) => http.post('/discovery/radar', payload),
    onSuccess: (res) => {
      const zone = res?.data?.zone;
      setSelectedZone(zone);
      setShowZoneDeck(true);
      setZoneSelectorOpen(false);
      qc.invalidateQueries({ queryKey: ['radar-zone-users', zone] });
      toast.success(res?.message || `Zone updated to ${zone}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Could not update zone');
    }
  });

  const swipeMutation = useMutation({
    mutationFn: (payload) => http.post('/discovery/swipe', payload),
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: deckQueryKey });
      const previousDeck = qc.getQueryData(deckQueryKey);
      // Optimistically remove user from the list
      qc.setQueryData(deckQueryKey, (old) => ({
        ...old,
        data: {
          ...old?.data,
          users: (old?.data?.users || []).filter((user) => String(user._id) !== String(variables.targetUserId))
        }
      }));
      return { previousDeck };
    },
    onError: (error, variables, context) => {
      if (context?.previousDeck) qc.setQueryData(deckQueryKey, context.previousDeck);
      const status = error?.statusCode || error?.status;
      if (status === 429) {
        toast.error(error?.message || 'Daily swipe limit reached. Upgrade to Premium for more!');
        qc.invalidateQueries({ queryKey: ['swipeLimits'] });
      } else {
        toast.error(error?.message || 'Could not process action');
      }
    },
    onSuccess: (res, variables) => {
      if (res.data?.match) {
        toast.success('New match unlocked! 🎉');
      } else if (variables.action === 'left') {
        toast.success('Dismissed · will reappear after 7 days');
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: deckQueryKey });
      qc.invalidateQueries({ queryKey: ['swipeLimits'] });
    }
  });

  const handleAction = (action, targetUserId) => {
    if (!targetUserId || swipeLimitReached) return;
    if (action === 'super_like') {
      const hasNebulaX = user?.premium?.active && ['nebula_x', 'max'].includes(user.premium.plan);
      if (!hasNebulaX) {
        toast.error('Super Likes are exclusive to Nebula X premium members!');
        return;
      }
    }
    swipeMutation.mutate({ targetUserId, action });
  };

  const updateZone = (zone) => {
    radarMutation.mutate({ zone });
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;
    const refreshDeck = () => qc.invalidateQueries({ queryKey: ['deck'] });
    socket.on('match:new', refreshDeck);
    return () => socket.off('match:new', refreshDeck);
  }, [qc]);

  const renderRevealLadder = () => (
    <Card className="hover:shadow-glow transition-shadow duration-300">
      <h2 className="font-black text-lg text-slate-800 dark:text-white font-display">Reveal ladder</h2>
      <div className="mt-4 space-y-3 pl-3">
        {['Anonymous vibe', 'Add secret crush', 'Blur photo', 'Share thoughts in rooms', 'Contact exchange'].map((item, index) => {
          const isActive = index === activeStep;
          return (
            <div key={item} className="flex items-center gap-3 text-sm relative">
              {isActive && (
                <motion.div
                  layoutId="ladderPointer"
                  className="absolute -left-4 text-yellow-100 dark:text-yellow-50"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <ChevronRight size={14} className="animate-pulse" />
                </motion.div>
              )}
              <span className={`grid h-7 w-7 place-items-center rounded-lg font-black transition-all duration-300 ${isActive
                  ? 'bg-yellow-300 text-slate-950 scale-110 shadow-[0_0_12px_rgba(253,224,71,0.4)]'
                  : 'bg-black/5 dark:bg-white/10 text-slate-700 dark:text-white opacity-40'
                }`}>
                {index + 1}
              </span>
              <span className={`transition-all duration-300 ${isActive
                  ? 'text-yellow-500 dark:text-yellow-300 font-extrabold translate-x-1'
                  : 'text-slate-600 dark:text-slate-400 font-medium opacity-40'
                }`}>
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );

  const renderQuickRadar = () => (
    <Card className="hover:shadow-glow transition-shadow duration-300">
      <h2 className="font-black text-lg text-slate-800 dark:text-white font-display">Quick radar</h2>
      <p className="mt-2 text-sm text-slate-500">Approximate campus zones only. No live location.</p>
      {selectedZone && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
          <p className="font-semibold">Current zone</p>
          <p className="mt-1 text-sm">{zoneLabel}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{sameZoneCount} student{sameZoneCount === 1 ? '' : 's'} found in this zone</p>
          <Button
            type="button"
            className="mt-4 w-full"
            variant="ghost"
            onClick={() => setShowZoneDeck(true)}
          >
            See all in same zone
          </Button>
        </div>
      )}
      {zoneSelectorOpen ? (
        <div className="mt-4 grid gap-2">
          {radarZones.map((zone) => (
            <Button
              key={zone.value}
              type="button"
              variant="ghost"
              className="w-full justify-start"
              onClick={() => updateZone(zone.value)}
            >
              {zone.label}
            </Button>
          ))}
          <Button
            type="button"
            variant="danger"
            className="w-full"
            onClick={() => setZoneSelectorOpen(false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          className="mt-5 w-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-yellow-500 dark:text-yellow-400"
          variant="ghost"
          onClick={() => navigate('/radar')}
        >
          <RotateCcw size={18} className="mr-1" /> Update zone
        </Button>
      )}
      {showZoneDeck && selectedZone && (
        <Button
          className="mt-3 w-full"
          variant="ghost"
          onClick={() => setShowZoneDeck(false)}
        >
          Back to Campus Discover
        </Button>
      )}
    </Card>
  );

  return (
    <div className="grid gap-6 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-h-[68vh]">
        {/* Header */}
        <div className="mb-5 sm:mb-8">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 dark:from-aurora/20 dark:to-cyan-500/20 border border-emerald-500/10 dark:border-aurora/10 shrink-0 mt-0.5">
              <Zap size={18} className="text-emerald-500 dark:text-aurora" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent leading-tight">
                Campus Discover
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Anonymous profiles from your verified college only.
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-3 sm:mt-5 flex flex-wrap items-center gap-1.5 sm:gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 dark:bg-emerald-500/10 dark:border-emerald-500/15 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="relative h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40" />
                <span className="absolute inset-0 rounded-full bg-emerald-500" />
              </span>
              {onlineUsers.length} online
            </span>
            <button
              onClick={() => navigate('/radar')}
              className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-aurora/10 hover:bg-emerald-500/20 dark:hover:bg-aurora/20 border border-emerald-500/20 dark:border-aurora/20 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-emerald-600 dark:text-aurora transition-colors"
            >
              <MapPin size={12} />
              {selectedZone ? `Radar: ${zoneLabel}` : 'Set Radar Zone'}
            </button>
            {/* Daily swipe counter badge */}
            {!isSwipeUnlimited && swipeLimit != null && (
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-bold transition-colors ${swipeLimitReached
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                  : swipesRemaining != null && swipesRemaining <= 2
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
                }`}>
                <Heart size={11} />
                {swipesUsed}/{swipeLimit} swipes
              </span>
            )}
            {isSwipeUnlimited && (
              <span className="flex items-center gap-1 rounded-full bg-aurora/10 border border-aurora/20 px-3 py-1.5 text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-aurora">
                <Crown size={11} />
                ∞ swipes
              </span>
            )}
          </div>

          {/* Swipe Limit Reached Banner */}
          {swipeLimitReached && (
            <div className="mt-4 flex items-center justify-between gap-3 border border-red-500/20 bg-red-500/5 px-4 py-3 rounded-2xl animate-fade-in">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-red-500 shrink-0 animate-pulse" />
                <p className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400">
                  Daily swipe limit reached ({swipeLimit} swipes). Resets at midnight UTC.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => navigate('/premium')}
                className="shrink-0 bg-gradient-to-r from-aurora to-emerald-500 text-ink text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90 flex items-center gap-1 shadow-md"
              >
                <Crown size={13} />
                Upgrade
              </Button>
            </div>
          )}

          {/* Mobile Radar & Ladder (above search) */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:hidden">
            {renderQuickRadar()}
            {!showZoneDeck && renderRevealLadder()}
          </div>

          {/* Search */}
          <div className="relative mt-4 group">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/20 group-focus-within:text-emerald-500 dark:group-focus-within:text-aurora/60 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search by name, branch, or interests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200/40 bg-white/80 py-2.5 sm:py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-400/50 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)] transition-all duration-300 dark:border-white/[0.06] dark:bg-[#111318] dark:text-white dark:placeholder-white/20 dark:focus:border-aurora/25 dark:focus:shadow-[0_0_0_3px_rgba(84,244,200,0.06)]"
            />
          </div>
        </div>

        {/* Scrollable user grid */}
        {deckLoading ? (
          <LoadingSpinner fullScreen={false} />
        ) : users.length > 0 ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {users.map((profile, idx) => (
                <ProfileCard
                  key={profile._id}
                  profile={profile}
                  online={online}
                  onAction={handleAction}
                  actionPending={swipeMutation.isPending || swipeLimitReached}
                  index={idx}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[20px] border border-dashed border-slate-200 dark:border-white/[0.06] bg-white/80 dark:bg-[#111318] p-8 sm:p-14 text-center flex flex-col justify-center items-center"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
              <Users size={24} className="text-slate-300 dark:text-white/15" />
            </div>
            <p className="text-lg font-black text-slate-700 dark:text-white/60">
              {searchQuery ? 'No matches found' : 'No profiles available'}
            </p>
            <p className="mt-2 text-sm text-slate-400 dark:text-white/25">
              {searchQuery ? 'Try a different search term.' : 'Check back later for new campus profiles.'}
            </p>
          </motion.div>
        )}
      </section>

      <aside className="hidden xl:block space-y-4">
        {!showZoneDeck && renderRevealLadder()}
        {renderQuickRadar()}
      </aside>
    </div>
  );
};
