import { motion } from 'framer-motion';
import { Logo } from '../components/common/Logo.jsx';

const badgeContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.4
    }
  }
};

const badgeItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 0.7, y: 0, transition: { type: 'spring', stiffness: 200, damping: 15 } }
};

export const AuthShell = ({ children, title, subtitle }) => (
  <div className="grid min-h-screen place-items-center px-4 py-10 text-slate-950 dark:text-white">
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-6xl overflow-hidden rounded-[28px] border border-black/10 bg-white/70 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-ink/70"
    >
      <div className="grid min-h-[500px] lg:min-h-[680px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-ink p-8 text-white dark:bg-[#0a0b10] dark:text-white border-r border-transparent dark:border-white/5">
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(84,244,200,.34),transparent_22rem),radial-gradient(circle_at_80%_80%,rgba(255,77,141,.3),transparent_24rem)]"
            animate={{
              opacity: [0.85, 1, 0.85],
              scale: [0.98, 1.02, 0.98],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <div className="relative"><Logo /></div>
          <motion.div
            className="relative max-w-xl"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.26em] text-aurora font-display">Verified campus only</p>
            <h1 className="text-5xl font-black leading-[1.08] sm:text-7xl font-display">Anonymous first. Real connection later.</h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/70 dark:text-white/50">Swipe, match, study, vent, flirt, and reveal identity gradually inside your own college ecosystem.</p>
          </motion.div>
          <motion.div
            variants={badgeContainer}
            initial="hidden"
            animate="show"
            className="relative grid grid-cols-3 gap-3 text-xs font-semibold font-display"
          >
            <motion.span variants={badgeItem} className="hover:text-aurora transition-colors">OTP verified</motion.span>
            <motion.span variants={badgeItem} className="hover:text-aurora transition-colors">AI safety</motion.span>
            <motion.span variants={badgeItem} className="hover:text-aurora transition-colors">Campus radar</motion.span>
          </motion.div>
        </section>
        <section className="flex items-center justify-center p-6 sm:p-10">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <div className="mb-8 flex justify-center lg:hidden">
              <Logo />
            </div>
            <h2 className="text-3xl font-black font-display tracking-tight">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{subtitle}</p>
            {children}
          </motion.div>
        </section>
      </div>
    </motion.div>
  </div>
);
