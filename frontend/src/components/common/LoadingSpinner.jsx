import { motion } from 'framer-motion';

export const LoadingSpinner = ({ fullScreen = true }) => {
  return (
    <div className={`${fullScreen ? 'fixed inset-0 z-50 bg-white/40 dark:bg-ink/40 backdrop-blur-md' : 'relative w-full py-12'} flex flex-col items-center justify-center`}>
      <div className="relative flex items-center justify-center h-20 w-20">
        {/* Outer Ring */}
        <motion.div
          className="absolute h-16 w-16 rounded-full border-4 border-t-aurora border-r-transparent border-b-flare border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner Ring (opposite direction) */}
        <motion.div
          className="absolute h-10 w-10 rounded-full border-4 border-t-flare border-r-transparent border-b-aurora border-l-transparent"
          animate={{ rotate: -360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
        {/* Pulsing Glow Center */}
        <motion.div
          className="h-4 w-4 rounded-full bg-aurora shadow-[0_0_15px_#54f4c8]"
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <motion.p
        className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        Loading Nexora...
      </motion.p>
    </div>
  );
};
