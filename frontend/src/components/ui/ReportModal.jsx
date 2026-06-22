import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { http } from '../../api/http.js';
import { Button } from './Button.jsx';
import { Card } from './Card.jsx';

export const ReportModal = ({ isOpen, onClose, targetUserId, targetUserNickname }) => {
  const [reason, setReason] = useState('harassment');
  const [notes, setNotes] = useState('');

  const reportMutation = useMutation({
    mutationFn: () => http.post('/reports', { targetUserId, reason, notes }),
    onSuccess: (res) => {
      toast.success(res.message || 'Report submitted successfully. Thank you!');
      setNotes('');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Could not submit report');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetUserId) {
      toast.error('No user specified to report.');
      return;
    }
    reportMutation.mutate();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <X size={18} />
              </button>

              {/* Form Header */}
              <div className="space-y-2 pr-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-500/10 text-rose-500">
                  <ShieldAlert size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
                  Report Student
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Report <span className="font-bold text-rose-500">{targetUserNickname || 'this student'}</span> for behavior that violates campus guidelines. Reports are confidential and reviewed by administrators.
                </p>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Reason <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)}
                    className="h-11 w-full rounded-xl border border-black/10 bg-white/70 px-3.5 text-sm font-medium outline-none transition focus:border-rose-450 focus:ring-1 focus:ring-rose-400/20 dark:border-white/10 dark:bg-[#111318]/50 text-slate-800 dark:text-slate-200"
                    required
                  >
                    <option value="harassment">Harassment / Bullying</option>
                    <option value="spam">Spam / Advertising</option>
                    <option value="inappropriate_behavior">Inappropriate Profile/Language</option>
                    <option value="other">Other Violation</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Additional Details / Notes
                  </label>
                  <textarea
                    placeholder="Provide context or details about the violation..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-black/10 bg-white/70 p-3 text-sm font-medium outline-none transition focus:border-rose-450 focus:ring-1 focus:ring-rose-400/20 dark:border-white/10 dark:bg-[#111318]/50 text-slate-800 dark:text-slate-200 placeholder:text-slate-400/50"
                  />
                </div>

                {/* Warning Alert */}
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-600 dark:text-amber-400 leading-normal">
                  <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                  <span>
                    Submitting false or spam reports can result in deductions to your student trust score.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex gap-3">
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="w-1/2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={reportMutation.isPending}
                    className="w-1/2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/20"
                  >
                    {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
