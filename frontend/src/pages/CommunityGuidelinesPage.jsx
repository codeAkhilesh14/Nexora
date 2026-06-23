import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '../components/common/Logo.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Heart, Users, HelpCircle, Check, AlertOctagon, Info, ArrowLeft } from 'lucide-react';

export const CommunityGuidelinesPage = () => {
  const guidelines = [
    {
      title: 'Respect Other Users',
      desc: 'Treat your fellow college students with kind intent. Disagreements are natural, but conversations must remain civil and constructive.',
      icon: Heart,
      iconClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
    },
    {
      title: 'No Hate Speech or Discriminatory Behavior',
      desc: 'We do not tolerate speech that attacks, demeans, or incites hatred against groups or individuals based on race, religion, gender, sexual orientation, disability, or campus branch.',
      icon: AlertOctagon,
      iconClass: 'text-red-500 bg-red-500/10 border-red-500/20'
    },
    {
      title: 'No Sexual Harassment',
      desc: 'Unsolicited explicit texts, bios, images, room chats, or persistent advances after another student has indicated disinterest is strictly prohibited.',
      icon: AlertOctagon,
      iconClass: 'text-red-500 bg-red-500/10 border-red-500/20'
    },
    {
      title: 'No Threats or Abusive Conduct',
      desc: 'Nexora is a safe space. Threats of violence, physical harm, self-harm encouragement, or toxic behavior will result in an immediate permanent ban.',
      icon: AlertOctagon,
      iconClass: 'text-red-500 bg-red-500/10 border-red-500/20'
    },
    {
      title: 'No Fake Accounts or Impersonation',
      desc: 'You must represent yourself truthfully. Impersonating another student, organization, celebrity, or authority is a direct violation of our campus trust model.',
      icon: Users,
      iconClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'No Sharing Private Personal Information (Doxxing)',
      desc: 'Respect other students\' anonymity. You are forbidden from sharing other users\' real names, social media handles, photos, phone numbers, or private chat histories without their clear, written consent.',
      icon: Info,
      iconClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'No Illegal Activities',
      desc: 'Do not use Nexora to buy, sell, or promote illegal items, drugs, academic dishonesty (plagiarism/cheating), or run scams within the student community.',
      icon: AlertOctagon,
      iconClass: 'text-red-500 bg-red-500/10 border-red-500/20'
    }
  ];

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
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-455">
                <Users size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                  Community Guidelines
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">Last updated: June 23, 2026</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-8 font-medium">
              Nexora is designed to help college students connect authentically and safely under an anonymous-first model. 
              Our Guidelines ensure the network remains high-trust, safe, and positive.
            </p>

            <div className="grid gap-6">
              {guidelines.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-black/5 bg-slate-50/50 dark:bg-white/[0.02] dark:border-white/[0.04] hover:bg-slate-100/50 dark:hover:bg-white/[0.04] transition-all duration-300">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${item.iconClass}`}>
                      <Icon size={18} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 font-display">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default CommunityGuidelinesPage;
