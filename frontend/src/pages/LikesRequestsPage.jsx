import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { http } from '../api/http.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { clearNotifications } from '../redux/realtimeSlice.js';
import { getPremiumStyles } from './DiscoverPage.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

export const LikesRequestsPage = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    http.post('/notifications/read')
      .then(() => {
        qc.invalidateQueries({ queryKey: ['notifications'] });
      })
      .catch((err) => console.error('Error marking notifications as read:', err));

    dispatch(clearNotifications());
  }, [dispatch, qc]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['likeRequests'],
    queryFn: () => http.get('/notifications/likes')
  });

  const acceptMutation = useMutation({
    mutationFn: (id) => http.post(`/notifications/likes/${id}/accept`),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['likeRequests'] });
      qc.invalidateQueries({ queryKey: ['chats'] });
      qc.invalidateQueries({ queryKey: ['deck'] });
      const chatId = res.data?.chat?._id || res.data?.chat;
      toast.success(
        <button
          type="button"
          className="text-left"
          onClick={() => {
            toast.dismiss('match-unlocked');
            navigate(chatId ? `/chats?chat=${chatId}` : '/chats');
          }}
        >
          <span className="block font-black">Matched</span>
          <span className="block text-sm">Now you can go to chat.</span>
        </button>,
        { id: 'match-unlocked', duration: 7000 }
      );
    },
    onError: (error) => {
      toast.error(error.message || 'Could not accept like request');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => http.post(`/notifications/likes/${id}/reject`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['likeRequests'] });
      qc.invalidateQueries({ queryKey: ['deck'] });
      toast.success('Like request rejected');
    },
    onError: (error) => {
      toast.error(error.message || 'Could not reject like request');
    }
  });

  const requests = data?.data?.requests || [];
  const isBusy = acceptMutation.isPending || rejectMutation.isPending;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-h-[68vh]">
        <div className="mb-6">
          <h1 className="text-3xl font-black font-display sm:text-4xl">Likes Requests</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Respond to students who liked your profile.</p>
        </div>

        <div className="space-y-4">
          {isLoading || isFetching ? (
            <LoadingSpinner fullScreen={false} />
          ) : requests.length === 0 ? (
            <Card>
              <div className="space-y-3 py-12 text-center">
                <p className="text-xl font-black">No likes yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Keep swiping and your next request will appear here.</p>
              </div>
            </Card>
          ) : (
            <AnimatePresence mode="popLayout">
              {requests.map((request) => {
                const isSuperLike = request.action === 'super_like';
                const premiumStyles = getPremiumStyles(request.from?.premium);
                
                const cardBorderClass = isSuperLike
                  ? 'border border-amber-400/50 dark:border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)] bg-gradient-to-r from-amber-500/5 via-transparent to-transparent'
                  : premiumStyles 
                    ? premiumStyles.cardClass 
                    : 'border-black/5 dark:border-white/5 hover:shadow-glow';
                return (
                  <motion.div
                    key={request._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: -30, transition: { duration: 0.2 } }}
                    transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                  >
                    <Card tilt={false} className={`transition-all duration-300 ${cardBorderClass}`}>
                      <div className="flex items-center gap-4">
                        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-aurora text-2xl font-black text-ink">
                          {request.from?.avatar ? (
                            <img className="h-full w-full object-cover" src={request.from.avatar} alt={request.from.nickname || 'Profile'} />
                          ) : (
                            request.from?.nickname?.[0]?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="truncate text-xl font-black">{request.from?.nickname || 'Student'}</h2>
                            {isSuperLike && (
                              <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 px-2 py-0.5 text-[9px] font-black text-black uppercase tracking-wider shadow-md shadow-amber-500/10">
                                <Sparkles size={8} fill="currentColor" />
                                Super Liked!
                              </span>
                            )}
                            {premiumStyles && (
                              <span className={`shrink-0 inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${premiumStyles.badgeClass}`}>
                                <premiumStyles.icon size={8} className="shrink-0" />
                                {premiumStyles.label}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {request.from?.branch?.toUpperCase()} · Year {request.from?.year}{request.from?.gender && (request.from.gender === 'man' ? ' · M' : request.from.gender === 'woman' ? ' · F' : '')}
                          </p>
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{request.body}</p>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <Button variant="ghost" className="flex-1 sm:flex-initial" disabled={isBusy} onClick={() => rejectMutation.mutate(request._id)}>
                          Reject
                        </Button>
                        <Button variant="neon" className="flex-1 sm:flex-initial" disabled={isBusy} onClick={() => acceptMutation.mutate(request._id)}>
                          Accept
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </section>

      <aside className="space-y-4">
        <Card>
          <h2 className="font-black">How it works</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            When someone likes your profile, their request appears here. Accept to unlock a match and chat instantly. Reject to remove the request and let them resurface after seven days.
          </p>
        </Card>
      </aside>
    </div>
  );
};
