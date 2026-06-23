import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '../components/common/Logo.jsx';
import { Card } from '../components/ui/Card.jsx';
import { FileText, Award, AlertTriangle, PlayCircle, Edit3, ArrowLeft } from 'lucide-react';

export const TermsConditionsPage = () => {
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
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-455">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                  Terms & Conditions
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">Last updated: June 23, 2026</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-8 font-medium">
              Welcome to Nexora. By creating an account or using our platform, you agree to comply with and be bound by these Terms & Conditions. 
              Please read them carefully.
            </p>

            <div className="space-y-8">
              {/* Section 1 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base font-display">
                  <Award size={18} className="text-amber-500" />
                  <h2>1. Eligibility & Verification</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  Nexora is a campus-exclusive network:
                </p>
                <ul className="list-disc pl-12 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li><strong>Verified Students Only:</strong> You must be an active, verified college student from an approved campus to register and use our services.</li>
                  <li><strong>Verification Requirement:</strong> You must complete OTP verification using your matching verified campus email address to unlock the discovery, chats, and rooms features.</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base font-display">
                  <AlertTriangle size={18} className="text-amber-500" />
                  <h2>2. Prohibited Content and Conduct</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  We maintain a respectful and safe campus environment. You agree not to post, share, or engage in:
                </p>
                <ul className="list-disc pl-12 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li><strong>Harassment & Bullying:</strong> Abusive comments, threats, intimidation, stalking, or any form of harassment against other students.</li>
                  <li><strong>Impersonation & Fake Profiles:</strong> Signing up with details that do not belong to you, impersonating college faculty, staff, or other students.</li>
                  <li><strong>Spam & Solicitation:</strong> Sending unsolicited advertisements, sales, phishing, mass-messaging, or duplicate content.</li>
                  <li><strong>Illegal Content:</strong> Publishing illegal substances, activities, intellectual property infringement, or explicit, non-consensual sexual content.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base font-display">
                  <AlertTriangle size={18} className="text-red-500" />
                  <h2>3. Account Suspension & Termination</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  Nexora reserves the right to review community reports and block list actions. We may:
                </p>
                <ul className="list-disc pl-12 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li>Warn users, temporarily suspend profiles, or permanently ban accounts violating these terms or community guidelines.</li>
                  <li>Revoke access instantly, disconnect all socket sessions, and block the associated college email address from future signup attempts.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base font-display">
                  <PlayCircle size={18} className="text-amber-500" />
                  <h2>4. Premium Subscriptions</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  We offer premium tiers (like Pulse Pro, Orbit Z, and Nebula X) that unlock extra functionalities:
                </p>
                <ul className="list-disc pl-12 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li>Subscriptions are purchased for specified billing terms (weekly, monthly, etc.).</li>
                  <li>Features like unlimited swipes, premium badges, and advanced search filters are active only during the paid subscription period.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base font-display">
                  <Edit3 size={18} className="text-amber-500" />
                  <h2>5. Content Ownership & Responsibility</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  You are solely responsible for the content, text, bios, messages, and interests you share on Nexora. 
                  Nexora does not claim ownership of user-posted content but retains a non-exclusive license to transmit and host it as needed to run the platform.
                </p>
              </section>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default TermsConditionsPage;
