import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '../components/common/Logo.jsx';
import { Card } from '../components/ui/Card.jsx';
import { CreditCard, ShieldCheck, Mail, HelpCircle, ArrowLeft } from 'lucide-react';

export const RefundPolicyPage = () => {
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
        >
          <Card tilt={false} className="p-6 sm:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455">
                <CreditCard size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight bg-gradient-to-r from-rose-500 to-pink-500 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Refund Policy
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">Last updated: June 23, 2026</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-8 font-medium">
              We want you to have the best possible experience exploring your college campus. 
              Please read our policy on premium subscription refunds.
            </p>

            <div className="space-y-8">
              {/* Section 1 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base font-display">
                  <ShieldCheck size={18} className="text-rose-500" />
                  <h2>1. Subscriptions & Digital Services</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  Premium subscriptions (Pulse Pro, Orbit Z, Nebula X, etc.) and other paid digital services on Nexora are **generally non-refundable once activated**. 
                  As a real-time digital matchmaking platform, premium status and benefits (like unlimited swipes and access to campus rooms) are granted immediately upon successful payment.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base font-display">
                  <HelpCircle size={18} className="text-rose-500" />
                  <h2>2. Exceptions & Case-by-Case Reviews</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  While purchases are generally final, we want to ensure fairness. Refund requests may be reviewed and processed on a case-by-case basis under the following circumstances:
                </p>
                <ul className="list-disc pl-12 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li><strong>Duplicate Charges:</strong> If you were billed twice for the same subscription period due to a system error or network hiccup.</li>
                  <li><strong>Accidental Purchases:</strong> Accidental renewals or transaction disputes reviewed by our billing department.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base font-display">
                  <Mail size={18} className="text-rose-500" />
                  <h2>3. How to Request a Refund</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  To request a billing review or submit a refund claim, please email our support team with your registered college email address and payment receipt/details:
                </p>
                <div className="ml-7 mt-2 p-4 rounded-xl border border-black/5 bg-slate-50 dark:bg-white/5 inline-flex items-center gap-2 text-sm font-bold text-slate-850 dark:text-slate-200">
                  <Mail size={16} className="text-rose-500" />
                  <a href="mailto:av384783@gmail.com" className="hover:underline text-rose-600 dark:text-rose-400">
                    av384783@gmail.com
                  </a>
                </div>
              </section>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default RefundPolicyPage;
