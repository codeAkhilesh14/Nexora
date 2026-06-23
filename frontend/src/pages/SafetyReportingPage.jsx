import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '../components/common/Logo.jsx';
import { Card } from '../components/ui/Card.jsx';
import { ShieldCheck, UserX, AlertCircle, Eye, ShieldAlert, ArrowLeft } from 'lucide-react';

export const SafetyReportingPage = () => {
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
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-455">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Safety & Reporting
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">Last updated: June 23, 2026</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-8 font-medium">
              We offer comprehensive self-service safety tools and active administration to keep Nexora a safe, positive student network. 
              Our community safety features are detailed below.
            </p>

            <div className="space-y-8">
              {/* Section 1 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base font-display">
                  <UserX size={18} className="text-teal-500" />
                  <h2>1. Blocking Users</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  You have absolute control over who can interact with you. At any point, you can block another student.
                </p>
                <ul className="list-disc pl-12 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li><strong>How to block:</strong> Click the "Block" button on their chat screen or profile view.</li>
                  <li><strong>What happens:</strong> The block takes effect immediately. The user will be unable to see your messages, enter room chats with you, swipe on your profile, or send direct messages. All previous connections between you are broken.</li>
                  <li><strong>Unblocking:</strong> You can unblock users at any time from your settings or chat screen.</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base font-display">
                  <AlertCircle size={18} className="text-teal-500" />
                  <h2>2. Reporting Content and Profiles</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  Help keep Nexora safe by reporting guidelines violations:
                </p>
                <ul className="list-disc pl-12 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li><strong>Report Profiles:</strong> You can report a student profile directly if their bio, branch details, interest tags, or avatar violate community standards.</li>
                  <li><strong>Report Messages:</strong> Individual direct messages containing harassment, spam, or abusive behavior can be reported directly from the chat screen.</li>
                  <li><strong>Report Room Content:</strong> You can report room descriptions, user names, or messages inside public rooms.</li>
                  <li><strong>Anonymous Reviews:</strong> Reports are handled anonymously. The reported user will not know who submitted the report.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base font-display">
                  <ShieldAlert size={18} className="text-teal-500" />
                  <h2>3. Administrative Moderation Actions</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  Our administrators review reports around the clock. When a violation is verified, admins can take immediate action:
                </p>
                <ul className="list-disc pl-12 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li><strong>Review Reports:</strong> Admins examine the reported logs, bio details, and context.</li>
                  <li><strong>Warn Users:</strong> For minor or first-time violations, users receive a formal warnings notification detailing the violation.</li>
                  <li><strong>Suspend Accounts:</strong> For moderate or repeating violations, accounts are suspended (typically for 7 to 14 days), locking them out of all socket connections and discovery views.</li>
                  <li><strong>Permanently Ban Accounts:</strong> For severe violations (like physical threats, hate speech, doxxing, or extreme harassment), the account is banned, and the email address is blacklisted permanently.</li>
                </ul>
              </section>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default SafetyReportingPage;
