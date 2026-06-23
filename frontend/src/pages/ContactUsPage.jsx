import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Logo } from '../components/common/Logo.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Mail, Phone, Clock, MessageSquare, Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { http } from '../api/http.js';

export const ContactUsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [name, setName] = useState(user?.firstName || user?.nickname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    if (user?.firstName || user?.nickname) {
      setName(user.firstName || user.nickname);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill in all fields');
      return;
    }
    setSending(true);
    try {
      await http.post('/auth/contact', { name, email, message });
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (err) {
      toast.error(err.message || 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] pb-16 text-slate-950 dark:text-white relative overflow-hidden bg-slate-50 dark:bg-ink/5 pt-6">
      {/* Ambient backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
        <div className="absolute top-[10%] left-[15%] w-[300px] h-[300px] rounded-full bg-aurora/10 blur-[100px] dark:bg-aurora/5" />
        <div className="absolute bottom-[20%] right-[15%] w-[350px] h-[350px] rounded-full bg-flare/10 blur-[120px] dark:bg-flare/5" />
      </div>

      <header className="mx-auto max-w-4xl px-4 mb-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Logo />
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-xs font-bold hover:bg-slate-50 dark:border-white/10 dark:bg-[#111318]/50 dark:hover:bg-white/5 transition duration-200"
          >
            <ArrowLeft size={14} /> Back to Profile
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-6 md:grid-cols-[1fr_1.3fr]"
        >
          {/* Brand Info Grid */}
          <Card tilt={false} className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-aurora via-[#5f6caf] to-flare text-sm font-black text-white">
                  Nx
                </div>
                <div>
                  <h1 className="text-xl font-black font-display text-slate-800 dark:text-white leading-tight">Nexora Support</h1>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Campus network</p>
                </div>
              </div>
              
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 mb-8 font-medium">
                Have questions about verification, account recovery, feature requests, or billing? Reach out and we will help you get back to campus discovery.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Email Us</p>
                  <a href="mailto:av384783@gmail.com" className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline">
                    av384783@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Call Us</p>
                  <a href="tel:9336220495" className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:underline">
                    9336220495
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Response Time</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Within 24 to 48 hours
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Form Card */}
          <Card tilt={false} className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="contact-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <h2 className="text-lg font-black font-display text-slate-800 dark:text-white flex items-center gap-2">
                    <MessageSquare size={18} className="text-purple-500" /> Send a Message
                  </h2>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Full Name</label>
                    <Input
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">College Email</label>
                    <Input
                      type="email"
                      placeholder="Enter your college email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={Boolean(user?.email)}
                      className={user?.email ? "bg-slate-100/85 dark:bg-[#111318]/65 opacity-80 cursor-not-allowed border-black/5 dark:border-white/5" : ""}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Message</label>
                    <textarea
                      placeholder="Write your message details..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full min-h-[120px] rounded-xl border border-black/10 bg-white/70 px-3.5 py-3 text-sm outline-none transition focus:border-aurora focus:ring-1 focus:ring-aurora/20 dark:border-white/10 dark:bg-white/5 text-slate-800 dark:text-slate-200 font-semibold"
                    />
                  </div>

                  <Button type="submit" disabled={sending} className="w-full flex items-center justify-center gap-2 py-3 mt-4">
                    {sending ? 'Sending message...' : (
                      <>
                        <Send size={15} />
                        <span>Send Message</span>
                      </>
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="success-container"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-12"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-4 animate-bounce">
                    <CheckCircle2 size={36} />
                  </div>
                  <h2 className="text-xl font-black font-display text-slate-800 dark:text-white">Thank You!</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                    Your request has been received. We will check it and respond to your college email within 24-48 hours.
                  </p>
                  <Button variant="ghost" className="mt-6 border" onClick={() => setSubmitted(false)}>
                    Send another message
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default ContactUsPage;
