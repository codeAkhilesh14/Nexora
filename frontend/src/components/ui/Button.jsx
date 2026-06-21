import { motion } from 'framer-motion';
import { cn } from '../../utils/cn.js';

export const Button = ({ className, variant = 'primary', ...props }) => {
  const styles = {
    primary: 'bg-ink text-white dark:bg-white dark:text-ink shadow-[0_4px_0_0_#1e293b] dark:shadow-[0_4px_0_0_#cbd5e1] border border-slate-700 dark:border-slate-200',
    ghost: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/10 border border-transparent',
    neon: 'bg-aurora text-ink shadow-[0_4px_0_0_#059669,0_8px_16px_rgba(84,244,200,0.22)] border border-emerald-400 dark:border-emerald-300 font-bold',
    danger: 'bg-flare text-white shadow-[0_4px_0_0_#be123c,0_8px_16px_rgba(255,77,141,0.15)] border border-rose-500'
  };

  const hoverY = variant === 'ghost' ? -1 : -2;
  const tapY = variant === 'ghost' ? 0 : 2;
  const tapScale = variant === 'ghost' ? 0.96 : 0.98;

  return (
    <motion.button
      whileHover={{ y: hoverY }}
      whileTap={{ y: tapY, scale: tapScale }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold tracking-wide transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 select-none',
        styles[variant],
        className
      )}
      {...props}
    />
  );
};
