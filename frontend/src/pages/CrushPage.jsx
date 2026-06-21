import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HeartHandshake, Instagram, Lock, Plus, X, Heart, ShieldAlert, Sparkles, Send, Mail } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { http } from '../api/http.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';

export const CrushPage = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({ targetEmail: '', instagram: '', nickname: '' });

  const { data, isLoading } = useQuery({ 
    queryKey: ['crushes'], 
    queryFn: () => http.get('/crushes') 
  });

  const add = useMutation({
    mutationFn: () => http.post('/crushes', form),
    onSuccess: (res) => {
      toast.success(res.data.revealed ? '❤️ Secret Crush Matched! You can now start chatting.' : 'Secret crush saved securely');
      setForm({ targetEmail: '', instagram: '', nickname: '' });
      setIsAddModalOpen(false);
      qc.invalidateQueries({ queryKey: ['crushes'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save crush');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.targetEmail) {
      toast.error('College email is required to register a secret crush.');
      return;
    }
    add.mutate();
  };

  const crushes = data?.data?.crushes || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Premium Banner Header */}
      <Card className="relative overflow-hidden p-6 md:p-8 bg-gradient-to-br from-rose-500/10 via-slate-900/5 to-slate-900/5 dark:from-rose-500/5 dark:via-slate-950/20 dark:to-slate-950/20 border-rose-500/10 dark:border-rose-500/5">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <Heart size={12} className="fill-current animate-pulse text-rose-500" />
              100% Confidential & Encrypted
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 dark:from-white dark:via-rose-100 dark:to-slate-300 bg-clip-text text-transparent font-display">
              Secret Crush
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
              Express your feelings safely. Add your secret crushes by their college email. You can also specify their Instagram handle and profile nickname. If they secretly add you back by your email, you match instantly and can start chatting!
            </p>
          </div>
          <div className="shrink-0">
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/20 rounded-xl"
            >
              <Plus size={18} />
              Add Secret Crush
            </Button>
          </div>
        </div>
      </Card>

      {/* Crushes List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
            Your Crushes ({crushes.length})
          </h2>
        </div>

        {isLoading ? (
          <LoadingSpinner fullScreen={false} />
        ) : crushes.length === 0 ? (
          /* Premium Empty State */
          <Card className="flex flex-col items-center justify-center text-center p-12 border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-4 border border-slate-200 dark:border-slate-800">
              <HeartHandshake size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No secret crushes added</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm">
              Your secret list is empty. Add individuals you're interested in secretly using their college email, and they'll never know unless the feeling is mutual.
            </p>
            <Button 
              variant="ghost" 
              onClick={() => setIsAddModalOpen(true)}
              className="mt-6 text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1.5"
            >
              <Plus size={16} />
              Add your first crush
            </Button>
          </Card>
        ) : (
          /* Cards Grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {crushes.map((c) => {
              const hasMutualMatch = c.revealed;
              const displayName = c.targetUser?.nickname || c.nickname || 'Anonymous Crush';
              const avatarUrl = c.targetUser?.avatar || c.targetUser?.realPhoto;

              return (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full"
                >
                  <Card 
                    className={`h-full flex flex-col justify-between p-6 relative overflow-hidden transition-all duration-300 ${
                      hasMutualMatch 
                        ? 'border-rose-500/40 dark:border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-slate-900/60 dark:from-rose-950/20 dark:via-pink-950/10 dark:to-slate-950/60 shadow-[0_0_25px_rgba(244,63,94,0.15)]' 
                        : 'border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-slate-900/5 to-slate-900/5 dark:from-slate-950/40 dark:to-slate-950/40 hover:border-rose-500/30 dark:hover:border-rose-500/20 hover:shadow-[0_0_20px_rgba(244,63,94,0.06)]'
                    }`}
                  >
                    {/* Glowing decorative gradient circles */}
                    {hasMutualMatch ? (
                      <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-full blur-2xl pointer-events-none" />
                    ) : (
                      <div className="absolute -top-12 -right-12 w-28 h-28 bg-slate-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/10 transition-all duration-500" />
                    )}

                    <div className="space-y-5">
                      {/* Top Row: Icon/Avatar & Status Badge */}
                      <div className="flex items-start justify-between gap-4">
                        {hasMutualMatch && avatarUrl ? (
                          <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-rose-500 to-pink-600 rounded-2xl blur-sm opacity-70 animate-pulse-slow" />
                            <img 
                              src={avatarUrl} 
                              alt={displayName} 
                              className="relative w-16 h-16 rounded-2xl object-cover border-2 border-rose-500/40 shadow-lg"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-rose-500 to-pink-600 text-white rounded-full p-1 border-2 border-white dark:border-slate-950 shadow-md">
                              <Heart size={10} className="fill-current text-white" />
                            </div>
                          </div>
                        ) : (
                          /* Locked / Pending State Avatar Icon */
                          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500/10 to-pink-500/5 dark:from-rose-500/5 dark:to-pink-500/5 border border-rose-500/20 dark:border-rose-500/10 flex items-center justify-center text-rose-500 dark:text-rose-400/80 shadow-inner">
                            <div className="absolute -inset-0.5 bg-rose-500/5 rounded-2xl animate-pulse-slow pointer-events-none" />
                            <Heart size={28} className="fill-rose-500/10 text-rose-500/70" />
                            <Lock size={12} className="absolute bottom-1 right-1 text-slate-500 dark:text-slate-400" />
                          </div>
                        )}

                        {hasMutualMatch ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-sm animate-pulse-slow">
                            <Sparkles size={11} className="fill-current text-rose-500" />
                            Mutual Match!
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/80">
                            <Lock size={10} className="opacity-80" />
                            Confidential
                          </span>
                        )}
                      </div>

                      {/* Middle Row: Name/Handle & Details */}
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-xl text-slate-900 dark:text-slate-100 truncate capitalize tracking-tight font-display">
                          {displayName}
                        </h3>
                        
                        <div className="space-y-1.5">
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <Mail size={12} className="opacity-60 text-slate-400" />
                            <span className="truncate">{c.targetEmail}</span>
                          </p>
                          {c.instagram && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <Instagram size={12} className="opacity-60 text-slate-400" />
                              <span className="font-medium text-rose-500/90 dark:text-rose-400/80">@{c.instagram}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Footer Action */}
                    <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-3">
                      {hasMutualMatch ? (
                        <>
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            Connected {new Date(c.revealedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                          <Button 
                            onClick={() => navigate('/chats')}
                            className="h-8 px-4 text-xs bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-lg shadow-md shadow-rose-500/10"
                          >
                            <Send size={12} />
                            Chat Now
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                            Secret Saved
                          </p>
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-rose-500 dark:text-rose-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400 animate-pulse" />
                            Awaiting Match
                          </span>
                        </>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Secret Crush Modal Dialog */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-md z-10"
            >
              <Card className="p-6 relative overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl">
                {/* Close Button */}
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  <X size={18} />
                </button>

                {/* Form Header */}
                <div className="space-y-2 pr-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-500/10 text-rose-500">
                    <HeartHandshake size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
                    Add Secret Crush
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Add someone secretly using their college email. Your crush list remains strictly private. If they also add you back, you both get matched and can start chatting!
                  </p>
                </div>

                {/* Form Inputs */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Mail size={12} />
                      College Email Address <span className="text-rose-500">*</span>
                    </label>
                    <Input 
                      placeholder="e.g. name@college.edu" 
                      value={form.targetEmail} 
                      onChange={(e) => setForm({ ...form, targetEmail: e.target.value })}
                      className="placeholder:text-slate-400/50"
                      required
                    />
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Required. The email they use to log in to Nexora. Used as the unique matching key.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Instagram size={12} />
                      Instagram Handle
                    </label>
                    <Input 
                      placeholder="e.g. username" 
                      value={form.instagram} 
                      onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                      className="placeholder:text-slate-400/50"
                    />
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Optional. Used as display details. Enter the handle without the "@" symbol.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      College Profile Nickname
                    </label>
                    <Input 
                      placeholder="e.g. JohnDoe" 
                      value={form.nickname} 
                      onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                      className="placeholder:text-slate-400/50"
                    />
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Optional. Stored as display details.
                    </p>
                  </div>

                  {/* Warning Notice */}
                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-600 dark:text-amber-400 leading-normal">
                    <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                    <span>
                      College email is required and acts as the unique matching key. Instagram and Nickname are stored as supplementary display details.
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex gap-3">
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => setIsAddModalOpen(false)}
                      className="w-1/2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={add.isPending}
                      className="w-1/2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/20"
                    >
                      {add.isPending ? 'Saving...' : 'Save Secretly'}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
