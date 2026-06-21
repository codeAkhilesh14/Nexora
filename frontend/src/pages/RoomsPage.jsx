import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mic2, Radio, Users, Check, ArrowLeft, Send, MessageSquare, Zap, Crown, Sparkles, AlertCircle, SmilePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { http } from '../api/http.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getSocket } from '../sockets/socket.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 140, damping: 15 } }
};

const roomSpecificThemes = {
  // --- BREAKUP RECOVERY ---
  'breakup-recovery': {
    bg: 'from-rose-500/20 via-pink-500/10 to-purple-500/5 dark:from-rose-950/30 dark:via-pink-950/15 dark:to-purple-950/10',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/30',
    iconColor: 'text-rose-500 dark:text-rose-400',
    bubbleSelf: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white dark:from-rose-600 dark:to-pink-700 shadow-md shadow-rose-500/10 rounded-tr-none',
    bubbleOther: 'bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-rose-100 border border-black/5 dark:border-white/5 rounded-tl-none',
    button: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md shadow-rose-500/10 border-none',
    inputFocus: 'focus:border-rose-400 focus:ring-rose-400/20',
    headerBg: 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100/50 dark:border-rose-900/20',
    particles: ['💔', '🩹', '❤️', '🌸', '🧸', '✨'],
    cardClass: 'border-rose-200/50 dark:border-rose-900/30 shadow-rose-500/5',
  },
  // --- ANIME FANS ---
  'anime-fans': {
    bg: 'from-fuchsia-500/20 via-purple-500/10 to-cyan-500/10 dark:from-fuchsia-950/30 dark:via-purple-950/15 dark:to-cyan-950/15',
    badge: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-800/30',
    iconColor: 'text-fuchsia-500 dark:text-fuchsia-400',
    bubbleSelf: 'bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-600 text-white shadow-[3px_3px_0px_rgba(0,0,0,0.15)] dark:shadow-[3px_3px_0px_rgba(255,255,255,0.05)] rounded-tr-none border border-fuchsia-400/30',
    bubbleOther: 'bg-cyan-500/10 text-slate-800 dark:text-cyan-100 border border-cyan-500/20 rounded-tl-none',
    button: 'bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white shadow-[2px_2px_0px_rgba(0,0,0,0.15)] border-none',
    inputFocus: 'focus:border-fuchsia-400 focus:ring-fuchsia-400/20',
    headerBg: 'bg-fuchsia-50/50 dark:bg-fuchsia-950/20 border-fuchsia-100/50 dark:border-fuchsia-900/20',
    particles: ['✨', '⭐', '🍥', '🔥', '⚡', '💥', '🐱'],
    cardClass: 'border-fuchsia-200/50 dark:border-fuchsia-900/30 shadow-fuchsia-500/5',
  },
  // --- CODING NIGHT ---
  'coding-night': {
    bg: 'from-emerald-500/10 via-zinc-950 to-emerald-950/20 dark:from-emerald-950/20 dark:via-[#090a0f] dark:to-emerald-950/10',
    badge: 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-mono text-[10px]',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    bubbleSelf: 'bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 font-mono shadow-[0_0_10px_rgba(16,185,129,0.15)] rounded-tr-none',
    bubbleOther: 'bg-zinc-900/90 text-zinc-300 border border-zinc-800 font-mono rounded-tl-none',
    button: 'bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold border-none shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    inputFocus: 'focus:border-emerald-500 focus:ring-emerald-500/20 font-mono text-emerald-400',
    headerBg: 'bg-zinc-950/80 border-emerald-950/50',
    particles: ['</>', '{ }', '[]', ';', '&&', '01', '||', '💻'],
    cardClass: 'border-emerald-500/20 dark:border-emerald-500/20 shadow-emerald-500/5 bg-zinc-950 dark:bg-[#07080c]',
  },
  // --- EXAM STRESS ---
  'exam-stress': {
    bg: 'from-amber-500/15 via-rose-500/5 to-amber-500/5 dark:from-amber-950/25 dark:via-rose-950/10 dark:to-transparent',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/30',
    iconColor: 'text-amber-500 dark:text-amber-400',
    bubbleSelf: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm rounded-tr-none',
    bubbleOther: 'bg-amber-50/50 text-slate-800 dark:bg-white/5 dark:text-amber-100 border border-amber-200/20 rounded-tl-none',
    button: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm border-none',
    inputFocus: 'focus:border-amber-400 focus:ring-amber-400/20',
    headerBg: 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100/50 dark:border-amber-900/10',
    particles: ['📝', '☕', '📚', '⏰', '🤯', '💯', '✏️'],
    cardClass: 'border-amber-200/50 dark:border-amber-900/20 shadow-amber-500/5',
  },
  // --- LONELY TONIGHT ---
  'lonely-tonight': {
    bg: 'from-indigo-950 via-slate-900 to-indigo-900/50 dark:from-[#0a0c16] dark:via-[#11131c] dark:to-indigo-950/30',
    badge: 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/20',
    iconColor: 'text-indigo-400',
    bubbleSelf: 'bg-indigo-650 text-white dark:bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.25)] rounded-tr-none border border-indigo-500/30',
    bubbleOther: 'bg-indigo-950/40 text-indigo-100 dark:bg-white/5 dark:text-indigo-200 border border-white/5 rounded-tl-none',
    button: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)] border-none',
    inputFocus: 'focus:border-indigo-500 focus:ring-indigo-500/20',
    headerBg: 'bg-indigo-950/40 border-indigo-900/20',
    particles: ['⭐', '✨', '🌙', '☁️', '💤', '🪐'],
    cardClass: 'border-indigo-900/30 shadow-indigo-950/50',
  },
  // --- STUDY PARTNER ---
  'study-partner': {
    bg: 'from-sky-500/10 via-blue-500/5 to-teal-500/5 dark:from-sky-950/20 dark:via-blue-950/10 dark:to-transparent',
    badge: 'bg-sky-100 text-sky-850 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800/30',
    iconColor: 'text-sky-650 dark:text-sky-400',
    bubbleSelf: 'bg-blue-600 text-white dark:bg-blue-500 shadow-sm rounded-tr-none',
    bubbleOther: 'bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-200 border border-black/5 dark:border-white/5 rounded-tl-none',
    button: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm border-none',
    inputFocus: 'focus:border-blue-400 focus:ring-blue-400/20',
    headerBg: 'bg-sky-50/50 dark:bg-sky-950/10 border-sky-100/50 dark:border-sky-900/10',
    particles: ['📖', '✏️', '💡', '✅', '🔍', '🎓'],
    cardClass: 'border-sky-200/50 dark:border-sky-900/20 shadow-sky-500/5',
  },
  // --- GYM BROS ---
  'gym-bros': {
    bg: 'from-orange-500/15 via-red-500/5 to-slate-800/15 dark:from-orange-950/30 dark:via-red-950/15 dark:to-slate-950/30',
    badge: 'bg-orange-100 text-orange-850 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800/30',
    iconColor: 'text-orange-650 dark:text-orange-400',
    bubbleSelf: 'bg-gradient-to-r from-orange-500 to-red-650 text-white font-bold shadow-md rounded-tr-none',
    bubbleOther: 'bg-slate-800 text-slate-100 dark:bg-[#1a1c23] dark:text-slate-200 border border-black/10 dark:border-white/5 rounded-tl-none',
    button: 'bg-gradient-to-r from-orange-500 to-red-650 hover:from-orange-600 hover:to-red-700 text-white shadow-md border-none',
    inputFocus: 'focus:border-orange-500 focus:ring-orange-500/20',
    headerBg: 'bg-orange-50/50 dark:bg-orange-950/15 border-orange-100/50 dark:border-orange-900/15',
    particles: ['💪', '🔥', '🏋️', '⚡', '🥤', '🥇'],
    cardClass: 'border-orange-200/50 dark:border-orange-900/20 shadow-orange-500/5',
  },
  // --- HACKATHON TEAM ---
  'hackathon-team': {
    bg: 'from-violet-500/15 via-amber-500/5 to-purple-500/10 dark:from-violet-950/25 dark:via-amber-950/15 dark:to-purple-950/20',
    badge: 'bg-violet-100 text-violet-850 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-200 dark:border-violet-800/30',
    iconColor: 'text-violet-650 dark:text-violet-400',
    bubbleSelf: 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 text-white shadow-md rounded-tr-none',
    bubbleOther: 'bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-200 border border-black/5 dark:border-white/5 rounded-tl-none',
    button: 'bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-700 hover:to-indigo-750 text-white shadow-md border-none',
    inputFocus: 'focus:border-violet-400 focus:ring-violet-400/20',
    headerBg: 'bg-violet-50/50 dark:bg-violet-950/15 border-violet-100/50 dark:border-violet-900/15',
    particles: ['🚀', '💻', '📈', '🏆', '💡', '🔥'],
    cardClass: 'border-violet-200/50 dark:border-violet-900/20 shadow-violet-500/5',
  },
  
  // --- FALLBACKS BY MOOD NAME ---
  chaotic: {
    bg: 'from-fuchsia-500/10 via-pink-500/5 to-transparent dark:from-fuchsia-500/20 dark:via-pink-500/5 dark:to-transparent',
    badge: 'bg-fuchsia-100 text-fuchsia-850 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-800/30',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
    bubbleSelf: 'bg-fuchsia-600 text-white dark:bg-fuchsia-500 dark:text-white rounded-tr-none',
    bubbleOther: 'bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-200 rounded-tl-none',
    button: 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white dark:bg-fuchsia-500 dark:hover:bg-fuchsia-600 dark:text-white border-none',
    inputFocus: 'focus:border-fuchsia-500 focus:ring-fuchsia-500/20',
    headerBg: 'bg-slate-50/50 dark:bg-white/[0.02]',
    particles: ['✨', '🔥'],
    cardClass: 'border-black/5 dark:border-white/5',
  },
  healing: {
    bg: 'from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-500/20 dark:via-teal-500/5 dark:to-transparent',
    badge: 'bg-emerald-100 text-emerald-850 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bubbleSelf: 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white rounded-tr-none',
    bubbleOther: 'bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-200 rounded-tl-none',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-white border-none',
    inputFocus: 'focus:border-emerald-500 focus:ring-emerald-500/20',
    headerBg: 'bg-slate-50/50 dark:bg-white/[0.02]',
    particles: ['🌸', '❤️'],
    cardClass: 'border-black/5 dark:border-white/5',
  },
  'locked-in': {
    bg: 'from-violet-500/10 via-indigo-500/5 to-transparent dark:from-violet-500/20 dark:via-indigo-500/5 dark:to-transparent',
    badge: 'bg-violet-100 text-violet-850 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-200 dark:border-violet-800/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
    bubbleSelf: 'bg-violet-600 text-white dark:bg-violet-500 dark:text-white rounded-tr-none',
    bubbleOther: 'bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-200 rounded-tl-none',
    button: 'bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-500 dark:hover:bg-violet-600 dark:text-white border-none',
    inputFocus: 'focus:border-violet-500 focus:ring-violet-500/20',
    headerBg: 'bg-slate-50/50 dark:bg-white/[0.02]',
    particles: ['💻', '⚡'],
    cardClass: 'border-black/5 dark:border-white/5',
  },
  overwhelmed: {
    bg: 'from-rose-500/10 via-red-500/5 to-transparent dark:from-rose-500/20 dark:via-red-500/5 dark:to-transparent',
    badge: 'bg-rose-100 text-rose-850 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    bubbleSelf: 'bg-rose-600 text-white dark:bg-rose-500 dark:text-white rounded-tr-none',
    bubbleOther: 'bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-200 rounded-tl-none',
    button: 'bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-500 dark:hover:bg-rose-600 dark:text-white border-none',
    inputFocus: 'focus:border-rose-500 focus:ring-rose-500/20',
    headerBg: 'bg-slate-50/50 dark:bg-white/[0.02]',
    particles: ['☕', '⏰'],
    cardClass: 'border-black/5 dark:border-white/5',
  },
  'high-energy': {
    bg: 'from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-500/20 dark:via-amber-500/5 dark:to-transparent',
    badge: 'bg-orange-100 text-orange-850 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800/30',
    iconColor: 'text-orange-650 dark:text-orange-400',
    bubbleSelf: 'bg-orange-650 text-white dark:bg-orange-600 dark:text-white rounded-tr-none',
    bubbleOther: 'bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-200 rounded-tl-none',
    button: 'bg-orange-650 hover:bg-orange-700 text-white dark:bg-orange-650 dark:hover:bg-orange-600 dark:text-white border-none',
    inputFocus: 'focus:border-orange-500 focus:ring-orange-500/20',
    headerBg: 'bg-slate-50/50 dark:bg-white/[0.02]',
    particles: ['🔥', '⚡'],
    cardClass: 'border-black/5 dark:border-white/5',
  },
  ambitious: {
    bg: 'from-amber-500/10 via-yellow-500/5 to-transparent dark:from-amber-500/20 dark:via-yellow-500/5 dark:to-transparent',
    badge: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    bubbleSelf: 'bg-amber-600 text-white dark:bg-amber-500 dark:text-white rounded-tr-none',
    bubbleOther: 'bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-200 rounded-tl-none',
    button: 'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-white border-none',
    inputFocus: 'focus:border-amber-500 focus:ring-amber-500/20',
    headerBg: 'bg-slate-50/50 dark:bg-white/[0.02]',
    particles: ['🚀', '🏆'],
    cardClass: 'border-black/5 dark:border-white/5',
  },
  soft: {
    bg: 'from-teal-500/10 via-cyan-500/5 to-transparent dark:from-teal-500/20 dark:via-cyan-500/5 dark:to-transparent',
    badge: 'bg-teal-100 text-teal-850 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800/30',
    iconColor: 'text-teal-650 dark:text-teal-400',
    bubbleSelf: 'bg-teal-650 text-white dark:bg-teal-600 dark:text-white rounded-tr-none',
    bubbleOther: 'bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-200 rounded-tl-none',
    button: 'bg-teal-650 hover:bg-teal-700 text-white dark:bg-teal-650 dark:hover:bg-teal-600 dark:text-white border-none',
    inputFocus: 'focus:border-teal-500 focus:ring-teal-500/20',
    headerBg: 'bg-slate-50/50 dark:bg-white/[0.02]',
    particles: ['☁️', '💤'],
    cardClass: 'border-black/5 dark:border-white/5',
  },
  focused: {
    bg: 'from-blue-500/10 via-sky-500/5 to-transparent dark:from-blue-500/20 dark:via-sky-500/5 dark:to-transparent',
    badge: 'bg-blue-100 text-blue-850 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30',
    iconColor: 'text-blue-650 dark:text-sky-400',
    bubbleSelf: 'bg-blue-650 text-white dark:bg-blue-600 dark:text-white rounded-tr-none',
    bubbleOther: 'bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-200 rounded-tl-none',
    button: 'bg-blue-650 hover:bg-blue-700 text-white dark:bg-blue-650 dark:hover:bg-blue-600 dark:text-white border-none',
    inputFocus: 'focus:border-blue-500 focus:ring-blue-500/20',
    headerBg: 'bg-slate-50/50 dark:bg-white/[0.02]',
    particles: ['💡', '🔍'],
    cardClass: 'border-black/5 dark:border-white/5',
  }
};

const getTheme = (slug, mood) => {
  const normalizedSlug = slug?.toLowerCase() || '';
  const normalizedMood = mood?.toLowerCase() || '';
  return roomSpecificThemes[normalizedSlug] || roomSpecificThemes[normalizedMood] || roomSpecificThemes['focused'];
};

const FloatingDecorations = ({ particles }) => {
  if (!particles || particles.length === 0) return null;
  const [elements, setElements] = useState([]);
  
  useEffect(() => {
    // Generate 12 elements with randomized properties
    const newElements = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      emoji: particles[i % particles.length],
      left: `${5 + Math.random() * 90}%`,
      delay: Math.random() * 6,
      duration: 6 + Math.random() * 8,
      size: 14 + Math.random() * 12,
    }));
    setElements(newElements);
  }, [particles]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          initial={{ y: '105%', x: 0, opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{
            y: '-10%',
            opacity: [0, 0.4, 0.4, 0],
            scale: [0.6, 1.1, 1.1, 0.7],
            rotate: [0, Math.random() * 90 - 45],
            x: [0, Math.random() * 50 - 25, Math.random() * 100 - 50],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: el.left,
            fontSize: `${el.size}px`,
          }}
        >
          {el.emoji}
        </motion.div>
      ))}
    </div>
  );
};

const popularEmojis = [
  '😀', '😂', '🤣', '😊', '😍', '😘', '😜', '😎',
  '👍', '👎', '❤️', '🔥', '🎉', '✨', '🙌', '👏',
  '🤔', '😭', '😡', '😱', '👀', '💡', '🚀', '💯',
  '🎓', '🏫', '📚', '☕', '🍕', '🍻', '👋', '🙏'
];

export const RoomsPage = () => {
  const qc = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messagesUsed, setMessagesUsed] = useState(0);
  const [messageLimit, setMessageLimit] = useState(20);
  const [activeMembersCount, setActiveMembersCount] = useState(0);
  const [newMessageText, setNewMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef(null);

  const { data, isLoading } = useQuery({ 
    queryKey: ['rooms'], 
    queryFn: () => http.get('/rooms') 
  });
  
  const join = useMutation({
    mutationFn: (id) => http.post(`/rooms/${id}/join`),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['rooms'] });
      toast.success(res.message === 'Already joined' ? 'Already Joined' : 'Joined anonymously');
    },
    onError: (error) => toast.error(error.message || 'Could not enter room')
  });

  const rooms = data?.data?.rooms || [];

  // Fetch messages when a room is selected
  useEffect(() => {
    if (!activeRoom) {
      setMessages([]);
      return;
    }
    
    let isMounted = true;
    setLoadingMessages(true);
    
    http.get(`/rooms/${activeRoom._id}/messages`)
      .then((res) => {
        if (isMounted && res.data) {
          setMessages(res.data.messages || []);
          setMessagesUsed(res.data.messagesUsed || 0);
          setMessageLimit(res.data.messageLimit || 20);
        }
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to load messages');
      })
      .finally(() => {
        if (isMounted) {
          setLoadingMessages(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeRoom?._id]);

  // Set active members count when entering a room
  useEffect(() => {
    if (activeRoom) {
      setActiveMembersCount(activeRoom.membersOnline || 0);
    }
  }, [activeRoom]);

  // Handle socket subscription for live messaging
  useEffect(() => {
    if (!activeRoom) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('room:join', activeRoom._id);

      const handleNewMessage = (msg) => {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      };

      const handleRoomJoined = (payload) => {
        if (payload.roomId === activeRoom._id) {
          setActiveMembersCount(payload.membersOnline);
        }
      };

      socket.on('room:message:new', handleNewMessage);
      socket.on('room:joined', handleRoomJoined);

      return () => {
        socket.off('room:message:new', handleNewMessage);
        socket.off('room:joined', handleRoomJoined);
        socket.emit('room:leave', activeRoom._id);
      };
    }
  }, [activeRoom?._id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeRoom) {
      document.body.classList.add('chatting-active');
      document.documentElement.classList.add('chatting-active');
    } else {
      document.body.classList.remove('chatting-active');
      document.documentElement.classList.remove('chatting-active');
    }
    return () => {
      document.body.classList.remove('chatting-active');
      document.documentElement.classList.remove('chatting-active');
    };
  }, [activeRoom]);

  const handleEnterRoom = (room) => {
    if (room.joined) {
      setActiveRoom(room);
    } else {
      join.mutate(room._id, {
        onSuccess: (res) => {
          qc.invalidateQueries({ queryKey: ['rooms'] });
          setActiveRoom(room);
        }
      });
    }
  };

  const handleBackToRooms = () => {
    setActiveRoom(null);
    qc.invalidateQueries({ queryKey: ['rooms'] });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || sendingMessage || !activeRoom) return;

    setSendingMessage(true);
    try {
      const res = await http.post(`/rooms/${activeRoom._id}/messages`, {
        body: newMessageText.trim()
      });
      
      if (res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data.message._id)) return prev;
          return [...prev, res.data.message];
        });
        setMessagesUsed(res.data.messagesUsed);
        setMessageLimit(res.data.messageLimit);
      }
      setNewMessageText('');
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-172px)] h-[calc(100dvh-172px)]">
        <LoadingSpinner fullScreen={false} />
      </div>
    );
  }

  if (activeRoom) {
    const theme = getTheme(activeRoom.slug, activeRoom.mood);
    const progress = messageLimit ? Math.min((messagesUsed / messageLimit) * 100, 100) : 0;
    const isAtLimit = messageLimit !== null && messagesUsed >= messageLimit;

    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col h-[calc(100vh-172px)] h-[calc(100dvh-172px)] sm:h-[calc(100vh-200px)] pt-3 sm:pt-6">
        <div className={`flex flex-col flex-1 bg-white dark:bg-[#111318] rounded-2xl shadow-xl overflow-hidden border ${theme.cardClass} relative`}>
          {/* Custom glowing background gradient based on mood */}
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-40 pointer-events-none`} />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-200/10 dark:from-white/[0.02] to-transparent rounded-bl-full pointer-events-none" />
          
          {/* Animated floating particles in background */}
          <FloatingDecorations particles={theme.particles} />

        {/* Chat Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${theme.headerBg} relative z-10`}>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleBackToRooms}
              className="p-2 h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center border-none shadow-none text-slate-600 dark:text-slate-400"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                {activeRoom.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${theme.badge}`}>
                  {activeRoom.mood}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  {activeMembersCount} active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Pane */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10">
          {loadingMessages ? (
            <LoadingSpinner fullScreen={false} />
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <MessageSquare size={24} />
              </div>
              <p className="font-extrabold text-sm text-slate-700 dark:text-slate-300">Quiet room...</p>
              <p className="text-xs text-slate-500 max-w-[200px]">Be the first to speak. Say something anonymous.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
              const isMe = senderId === user?.id || senderId === user?._id;
              return (
                <div key={msg._id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${isMe ? 'flex-row-reverse' : ''}`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-xl overflow-hidden border border-black/5 dark:border-white/5 shrink-0 bg-slate-100 dark:bg-white/5">
                        {msg.sender?.avatar ? (
                          <img src={msg.sender.avatar} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-aurora text-ink">
                            {msg.sender?.nickname?.[0] || 'A'}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col">
                      {!isMe && (
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 ml-1 mb-1">
                          {msg.sender?.nickname || 'Anonymous'}
                        </span>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed break-words shadow-sm ${
                          isMe
                            ? `${theme.bubbleSelf}`
                            : `${theme.bubbleOther}`
                        }`}
                      >
                        {msg.body}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input & Limits Panel */}
        <div className="p-4 border-t border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] space-y-3 relative z-10">
          {/* Limits Progress Bar / Info */}
          {messageLimit !== null ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  {user?.premium?.active ? (
                    <>
                      <Zap size={12} className="text-emerald-500 fill-emerald-500/20" />
                      Pulse Pro Message Limit
                    </>
                  ) : (
                    <>
                      <AlertCircle size={12} className="text-slate-400" />
                      Free Daily Message Limit
                    </>
                  )}
                </span>
                <span className={isAtLimit ? 'text-rose-500 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}>
                  {messagesUsed} / {messageLimit} messages
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isAtLimit
                      ? 'bg-rose-500'
                      : progress > 80
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {isAtLimit && (
                <p className="text-[10px] text-rose-500 dark:text-rose-400 font-bold leading-tight animate-pulse">
                  Limit reached! Upgrade plan to send more room messages today.
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 dark:text-violet-400">
              <Sparkles size={12} className="animate-pulse" />
              <span>Premium Active — Unlimited room messages today</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSendMessage} className="relative flex gap-2 w-full">
            {showEmojiPicker && (
              <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
            )}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full right-0 mb-2 p-2 bg-white/95 dark:bg-[#15171e]/95 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl backdrop-blur-md grid grid-cols-8 gap-1.5 z-50 w-72"
                >
                  {popularEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setNewMessageText((prev) => prev + emoji);
                      }}
                      className="text-xl p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors active:scale-90"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              disabled={isAtLimit || sendingMessage}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="h-11 w-11 flex items-center justify-center rounded-xl text-slate-500 hover:bg-black/5 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white transition shrink-0 border border-black/10 dark:border-white/10 bg-white dark:bg-[#181a20] self-center focus:outline-none"
              aria-label="Select emoji"
            >
              <SmilePlus size={20} />
            </motion.button>
            <Input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              disabled={isAtLimit || sendingMessage}
              placeholder={
                isAtLimit
                  ? 'Message limit reached for today'
                  : 'Type a message...'
              }
              className={`flex-1 min-w-0 placeholder:text-xs sm:placeholder:text-sm ${theme.inputFocus || ''}`}
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isAtLimit || sendingMessage || !newMessageText.trim()}
              className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border-none outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${theme.button}`}
            >
              <Send size={16} />
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
          Mood Rooms
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Anonymous college rooms for the moment you are actually in.
        </p>
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {rooms.map((room) => {
          const theme = getTheme(room.slug, room.mood);
          const hasMembers = room.membersOnline > 0;
          return (
            <motion.div
              key={room._id}
              variants={cardItemVariants}
              className="group"
            >
              <Card 
                tilt={false}
                className="h-full flex flex-col justify-between overflow-hidden bg-white dark:bg-[#111318] transition-all duration-300 border-none shadow-md hover:shadow-lg"
              >
                {/* Custom glowing background gradient based on mood */}
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-200/10 dark:from-white/[0.02] to-transparent rounded-bl-full pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  {/* Card Header: Icon + Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/5">
                      <motion.div
                        animate={{ scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Radio className={theme.iconColor} size={18} />
                      </motion.div>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${theme.badge}`}>
                      {room.mood}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white leading-snug line-clamp-2 group-hover:text-slate-950 dark:group-hover:text-white transition-colors duration-200">
                      {room.name}
                    </h2>
                  </div>
                </div>
                
                <div className="relative z-10 mt-6 space-y-4">
                  {/* Status Badges */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <span className="relative flex h-2 w-2">
                        {hasMembers && (
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        )}
                        <span className={`relative inline-flex h-2 w-2 rounded-full ${hasMembers ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      </span>
                      {room.membersOnline} active
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Mic2 size={13} className="text-slate-400 dark:text-slate-500" />
                      voice-ready
                    </span>
                  </div>

                  {/* Dynamic Action Button */}
                  <Button
                    onClick={() => handleEnterRoom(room)}
                    disabled={join.isPending}
                    variant="ghost"
                    className="w-full h-11 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-95 bg-slate-900 text-white dark:bg-slate-800 dark:text-white border-none shadow-none hover:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    Enter Room
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
