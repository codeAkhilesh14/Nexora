import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Crown, Send, SmilePlus, Timer, Zap } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { http } from '../api/http.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { getSocket } from '../sockets/socket.js';
import { getPremiumStyles } from './DiscoverPage.jsx';

const profileImage = (profile) => profile?.realPhoto || profile?.avatar;

export const ChatsPage = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.user?.id);
  const online = useSelector((state) => state.realtime.online);
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState(null);
  const [body, setBody] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const containerRef = useRef(null);
  const popularEmojis = [
    '😀', '😂', '🤣', '😊', '😍', '😘', '😜', '😎',
    '👍', '👎', '❤️', '🔥', '🎉', '✨', '🙌', '👏',
    '🤔', '😭', '😡', '😱', '👀', '💡', '🚀', '💯',
    '🎓', '🏫', '📚', '☕', '🍕', '🍻', '👋', '🙏'
  ];
  const { data, isLoading: chatsLoading } = useQuery({ queryKey: ['chats'], queryFn: () => http.get('/chats') });
  const chats = data?.data?.chats || [];
  const chatId = active?._id || chats[0]?._id;
  const { data: messageData, isLoading: messagesLoading } = useQuery({ queryKey: ['messages', chatId], enabled: Boolean(chatId), queryFn: () => http.get(`/chats/${chatId}/messages`) });
  const messages = messageData?.data?.messages || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, chatId]);
  const currentChat = active || chats[0];
  const currentPeer = currentChat?.participants?.find((participant) => participant?._id !== userId);
  const currentPeerPremium = getPremiumStyles(currentPeer?.premium);
  const isBlockedByMe = currentChat?.blockedByMe;
  const isBlockedByPeer = currentChat?.blockedByPeer;

  /* ── Daily message limits ── */
  const { data: limitsData } = useQuery({
    queryKey: ['chatLimits'],
    queryFn: () => http.get('/chats/limits'),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60
  });
  const limits = limitsData?.data || {};
  const messagesUsed = limits.messagesUsed ?? 0;
  const messageLimit = limits.messageLimit;
  const isUnlimited = limits.unlimited === true;
  const limitReached = !isUnlimited && messageLimit != null && messagesUsed >= messageLimit;
  const remaining = isUnlimited ? null : (messageLimit != null ? Math.max(0, messageLimit - messagesUsed) : null);

  const send = useMutation({
    mutationFn: () => http.post(`/chats/${chatId}/messages`, { body }),
    onSuccess: () => {
      setBody('');
      qc.invalidateQueries({ queryKey: ['messages', chatId] });
      qc.invalidateQueries({ queryKey: ['chatLimits'] });
    },
    onError: (error) => {
      const status = error?.statusCode || error?.status;
      if (status === 429) {
        toast.error(error?.message || 'Daily message limit reached. Upgrade to Premium for more!');
        qc.invalidateQueries({ queryKey: ['chatLimits'] });
      } else {
        toast.error(error?.message || 'Failed to send message');
      }
    }
  });

  const blockToggle = useMutation({
    mutationFn: () => {
      const url = isBlockedByMe
        ? `/profile/unblock/${currentPeer?._id}`
        : `/profile/block/${currentPeer?._id}`;
      return http.post(url);
    },
    onSuccess: () => {
      toast.success(isBlockedByMe ? 'Match unblocked' : 'Match blocked');
      qc.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Action failed');
    }
  });

  useEffect(() => {
    const requestedChatId = searchParams.get('chat');
    if (!requestedChatId || !chats.length) return;
    const requestedChat = chats.find((chat) => chat._id === requestedChatId);
    if (requestedChat && requestedChat._id !== active?._id) setActive(requestedChat);
  }, [active?._id, chats, searchParams]);

  useEffect(() => {
    if (active && chats.length) {
      const freshActive = chats.find((c) => c._id === active._id);
      if (freshActive) {
        if (freshActive !== active) {
          setActive(freshActive);
        }
      } else {
        setActive(null);
      }
    }
  }, [chats, active]);

  useEffect(() => {
    if (!chatId) return;
    const socket = getSocket();
    socket?.emit('chat:join', chatId);
    socket?.on('message:new', () => qc.invalidateQueries({ queryKey: ['messages', chatId] }));
    return () => socket?.off('message:new');
  }, [chatId, qc]);

  const inputDisabled = !chatId || limitReached || isBlockedByMe || isBlockedByPeer;
  const getPlaceholderText = () => {
    if (limitReached) return 'Daily limit reached — upgrade for more';
    if (isBlockedByMe) return 'You have blocked this match. Unblock to message.';
    if (isBlockedByPeer) return 'This match is unavailable.';
    if (!chatId) return 'Match with someone to start chatting';
    return 'Write softly, safely...';
  };

  if (chatsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-172px)] h-[calc(100dvh-172px)]">
        <LoadingSpinner fullScreen={false} />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:grid h-[calc(100vh-172px)] h-[calc(100dvh-172px)] lg:h-[calc(100vh-200px)] gap-3 sm:gap-4 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[330px_minmax(0,1fr)]">
      <Card className={`max-h-[100%] overflow-hidden p-0 flex-col ${active ? 'hidden lg:flex' : 'flex'}`}>
        <div className="border-b border-black/10 p-3 sm:p-4 dark:border-white/10"><h1 className="text-xl sm:text-2xl font-black font-display">Chats</h1></div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.map((chat) => {
            const peer = chat.participants?.find((participant) => participant?._id !== userId);
            const isOnline = Boolean(peer?._id && online[peer._id]);
            const image = profileImage(peer);
            const isActive = chat._id === chatId;
            const peerPremium = getPremiumStyles(peer?.premium);
            return (
              <motion.button
                key={chat._id}
                onClick={() => setActive(chat)}
                whileHover={{ x: 3, backgroundColor: 'rgba(0,0,0,0.03)' }}
                whileTap={{ scale: 0.98 }}
                className={`flex w-full items-center gap-2.5 sm:gap-3 rounded-lg p-2.5 sm:p-3 text-left transition-colors duration-150 ${isActive ? 'bg-black/5 dark:bg-white/10' : ''
                  }`}
              >
                <div className="relative grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-aurora font-black text-ink text-sm sm:text-base">
                  {image ? <img className="h-full w-full object-cover" src={image} alt="" /> : peer?.nickname?.[0] || 'N'}
                  {isOnline && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-ink" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="truncate font-bold text-sm text-slate-900 dark:text-white">{peer?.nickname || 'Room'}</p>
                    {peerPremium && (
                      <span className={`shrink-0 inline-flex items-center justify-center rounded-md px-1 py-0.5 text-[8px] font-black uppercase tracking-wider ${peerPremium.badgeClass}`}>
                        <peerPremium.icon size={7} />
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{chat.lastMessage?.body || 'Start the spark'}</p>
                </div>
              </motion.button>
            );
          })}
          {!chats.length && <p className="p-4 text-sm text-slate-500">Chats unlock after a mutual right swipe.</p>}
        </div>
      </Card>

      <Card className={`flex-1 lg:flex-initial min-h-0 flex-col p-0 ${active ? 'flex' : 'hidden lg:flex'}`}>
        <div className="flex items-center justify-between border-b border-black/10 p-2 sm:p-4 dark:border-white/10">
          <div className="min-w-0 flex items-center gap-1.5 sm:gap-3 flex-1">
            {active && (
              <button
                type="button"
                onClick={() => setActive(null)}
                className="mr-0.5 rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/10 lg:hidden shrink-0 text-slate-700 dark:text-slate-305"
                aria-label="Back to chats list"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            
            {/* Avatar block with online indicator dot in the bottom right corner */}
            {profileImage(currentPeer) ? (
              <div 
                onClick={() => setPreviewPhoto(profileImage(currentPeer))}
                className="relative shrink-0 cursor-pointer group/avatar"
                title="Click to view photo"
              >
                <img className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover border border-black/5 dark:border-white/10 group-hover/avatar:scale-105 transition-transform duration-200" src={profileImage(currentPeer)} alt="" />
                {currentPeer?._id && online[currentPeer._id] && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white dark:border-[#111318] bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                )}
              </div>
            ) : (
              // Default initials avatar
              <div className="relative shrink-0 grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-lg bg-aurora font-black text-ink text-xs sm:text-base border border-black/5 dark:border-white/10">
                {currentPeer?.nickname?.[0] || 'N'}
                {currentPeer?._id && online[currentPeer._id] && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white dark:border-[#111318] bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                )}
              </div>
            )}
            
            {/* Text details container */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                <h2 className="truncate font-black text-xs sm:text-base text-slate-900 dark:text-white leading-tight">{currentPeer?.nickname || 'Realtime DM'}</h2>
                {currentPeerPremium && (
                  <span className={`shrink-0 inline-flex items-center gap-0.5 rounded-md px-1 py-0.5 text-[7px] sm:text-[8px] font-black uppercase tracking-wider ${currentPeerPremium.badgeClass}`}>
                    <currentPeerPremium.icon size={7} className="shrink-0" />
                    {currentPeerPremium.label}
                  </span>
                )}
              </div>
              <p className="text-[9px] sm:text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5 font-semibold">
                {currentPeer?._id && online[currentPeer._id] ? 'Online now' : 'Offline'}
              </p>
            </div>
          </div>
          
          {/* Header Action Elements */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-1.5">
            {/* Daily message counter badge */}
            {!isUnlimited && messageLimit != null && (
              <div className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-[8px] sm:text-xs font-bold transition-colors ${limitReached
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                  : remaining != null && remaining <= 5
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                }`}>
                <Zap size={8} className="shrink-0 sm:size-[10px]" />
                <span>{messagesUsed}/{messageLimit}</span>
              </div>
            )}
            {isUnlimited && (
              <div className="flex items-center gap-0.5 rounded-full bg-aurora/10 border border-aurora/20 px-1.5 py-0.5 sm:px-2 sm:py-1 text-[8px] sm:text-xs font-bold text-emerald-600 dark:text-aurora">
                <Crown size={8} className="shrink-0 sm:size-[10px]" />
                <span className="hidden xs:inline">Unlimited</span>
              </div>
            )}
            {currentPeer && (
              <button
                type="button"
                onClick={() => blockToggle.mutate()}
                disabled={blockToggle.isPending}
                className={`text-[8px] sm:text-xs font-black uppercase tracking-wider px-1.5 py-0.5 sm:px-2.5 sm:py-1.5 rounded-lg border transition-all duration-200 shrink-0 ${isBlockedByMe
                    ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 border-black/5 text-slate-600 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-slate-400 dark:hover:text-white'
                  }`}
              >
                {isBlockedByMe ? 'Unblock' : 'Block'}
              </button>
            )}
            <Timer className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer shrink-0" size={16} />
          </div>
        </div>

        <div ref={containerRef} className="flex-1 space-y-3 overflow-y-auto p-4 bg-slate-50/50 dark:bg-ink/20 scroll-smooth">
          {messagesLoading ? (
            <LoadingSpinner fullScreen={false} />
          ) : messages.map((m) => {
            const senderId = m.sender?._id || m.sender;
            const mine = senderId === userId;
            return (
              <motion.div
                key={m._id}
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[86%] rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-sm sm:max-w-[72%] shadow-sm ${mine ? 'rounded-br-md bg-aurora text-ink font-medium' : 'rounded-bl-md bg-white dark:bg-white/5 border border-black/5 dark:border-white/5'
                    }`}
                >
                  {!mine && <p className="mb-1 text-xs font-bold text-flare">{m.sender?.nickname}</p>}
                  {m.deletedAt ? <em className="text-slate-400 dark:text-slate-500">deleted</em> : m.body}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Limit reached banner */}
        {limitReached && (
          <div className="flex items-center justify-between gap-3 border-t border-red-500/10 bg-red-500/5 px-4 py-2.5">
            <p className="text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400">
              Daily limit reached ({messageLimit} messages). Resets at midnight UTC.
            </p>
            <Button
              type="button"
              onClick={() => navigate('/premium')}
              className="shrink-0 bg-gradient-to-r from-aurora to-emerald-500 text-ink text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90"
            >
              <Crown size={13} className="mr-1" />
              Upgrade
            </Button>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); if (chatId && body.trim() && !inputDisabled) send.mutate(); }} className="relative flex gap-1.5 sm:gap-2 border-t border-black/10 p-2 sm:p-3 dark:border-white/10 bg-white/50 dark:bg-ink/50 backdrop-blur-md">
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
                className="absolute bottom-full left-2 mb-2 p-2 bg-white/95 dark:bg-[#15171e]/95 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl backdrop-blur-md grid grid-cols-8 gap-1.5 z-50 w-72"
              >
                {popularEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setBody((prev) => prev + emoji);
                    }}
                    className="text-xl p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors active:scale-90"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="button"
            disabled={inputDisabled}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="h-10 w-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-black/5 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white transition shrink-0 self-center"
            aria-label="Select emoji"
          >
            <SmilePlus size={20} />
          </button>
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={getPlaceholderText()}
            disabled={inputDisabled}
            className="placeholder:text-xs flex-1"
          />
          <Button 
            disabled={inputDisabled || send.isPending}
            className="w-11 h-11 rounded-full p-0 flex items-center justify-center shrink-0"
          >
            <Send size={16} className="translate-x-[1px]" />
          </Button>
        </form>
      </Card>
      
      {/* Photo Preview Modal */}
      <AnimatePresence>
        {previewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewPhoto(null)}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center cursor-zoom-out p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl bg-slate-950 flex items-center justify-center cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={previewPhoto} alt="User profile preview" className="w-full h-full object-cover" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
