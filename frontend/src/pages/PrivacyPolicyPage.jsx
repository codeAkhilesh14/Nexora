import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '../components/common/Logo.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Shield, Eye, Lock, Trash2, Mail, ArrowLeft } from 'lucide-react';

export const PrivacyPolicyPage = () => {
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
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
                <Shield size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Privacy Policy
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">Last updated: June 23, 2026</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-8 font-medium">
              At Nexora, we believe that your privacy is foundational to creating authentic campus connections. 
              This Privacy Policy explains how we collect, use, and protect your information when you use our services.
            </p>

            <div className="space-y-8">
              {/* Section 1 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base font-display">
                  <Eye size={18} className="text-purple-500" />
                  <h2>1. What User Data We Collect</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  To provide a secure and authentic college matchmaking and social ecosystem, we collect:
                </p>
                <ul className="list-disc pl-12 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li><strong>Account Credentials:</strong> Your college email address (used solely for verification) and password.</li>
                  <li><strong>Verification Info:</strong> Verification status and details related to your campus email domain verification.</li>
                  <li><strong>Profile Details:</strong> Your nickname, branch of study, year, gender, bio, interests, vibe tags, and music taste.</li>
                  <li><strong>Avatars & Photos:</strong> Public anonymous avatars and private profile photos (which are hidden from Discovery by default).</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base font-display">
                  <Shield size={18} className="text-purple-500" />
                  <h2>2. Why We Collect Your Data</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  We process your data to deliver, secure, and improve Nexora:
                </p>
                <ul className="list-disc pl-12 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li><strong>College Verification:</strong> Ensuring that only active, verified students from your specific campus can enter your ecosystem.</li>
                  <li><strong>gradual Reveal & Matchmaking:</strong> Powering the reveal ladder and calculating matching percentages based on shared interests, branch, and vibe tags.</li>
                  <li><strong>Realtime Communication:</strong> Allowing secure room chats and direct messaging.</li>
                  <li><strong>Platform Integrity:</strong> Keeping the campus community safe from spammers, fake accounts, and bad actors.</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base font-display">
                  <Lock size={18} className="text-purple-500" />
                  <h2>3. How We Store and Protect Your Data</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  Your safety and security are top priorities:
                </p>
                <ul className="list-disc pl-12 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li><strong>Encryption & Hashing:</strong> Passwords and email OTPs are securely hashed on our servers using standard, industrial-grade algorithms (like bcrypt and sha256).</li>
                  <li><strong>Database Security:</strong> All records are stored in secure cloud-based databases with strict network firewalls and access controls.</li>
                  <li><strong>gradual Image Reveal:</strong> Private photos are completely hidden from discovery and only shown to mutual matches when you explicitly check the option to reveal.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base font-display">
                  <Trash2 size={18} className="text-purple-500" />
                  <h2>4. User Rights and Data Deletion</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  You retain full ownership of your data:
                </p>
                <ul className="list-disc pl-12 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li><strong>Access & Modify:</strong> You can edit your campus profile information, interests, vibe tags, and photos at any time in the Profile page.</li>
                  <li><strong>Account Deletion:</strong> You have the right to request deletion of your account. Upon account deletion, all personal data, matches, rooms history, and profile records are permanently removed from our databases.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-sm sm:text-base font-display">
                  <Mail size={18} className="text-purple-500" />
                  <h2>5. Contact for Privacy Requests</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 pl-7">
                  For data deletion requests, questions about your privacy, or other data protection queries, please contact our support team at:
                </p>
                <div className="ml-7 mt-2 p-4 rounded-xl border border-black/5 bg-slate-50 dark:bg-white/5 inline-flex items-center gap-2 text-sm font-bold text-slate-850 dark:text-slate-200">
                  <Mail size={16} className="text-purple-500" />
                  <a href="mailto:av384783@gmail.com" className="hover:underline text-purple-600 dark:text-purple-400">
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

export default PrivacyPolicyPage;
