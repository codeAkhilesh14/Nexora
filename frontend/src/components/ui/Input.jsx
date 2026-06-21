import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export const Input = forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-11 w-full rounded-xl border border-black/10 bg-white/70 px-3.5 text-sm font-medium outline-none transition placeholder:text-slate-400/80 placeholder:font-normal focus:border-aurora focus:ring-1 focus:ring-aurora/20 dark:border-white/10 dark:bg-[#111318]/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),0_0_15px_rgba(84,244,200,0.25)] dark:focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.15),0_0_15px_rgba(84,244,200,0.2)]',
      className
    )}
    {...props}
  />
));

Input.displayName = 'Input';
