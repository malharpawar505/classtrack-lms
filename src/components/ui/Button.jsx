import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { buttonPress } from '../../lib/animations';

const variants = {
  primary: "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-md shadow-sky-500/20",
  accent: "bg-[var(--secondary)] text-white hover:bg-blue-600 shadow-md shadow-blue-500/20",
  ghost: "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200",
  subtle: "bg-transparent text-slate-600 hover:bg-slate-100",
  danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
  success: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200",
};

const sizes = {
  xs: "px-2.5 py-1.5 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base font-medium",
};

export const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  fullWidth = false, 
  children, 
  disabled, 
  ...props 
}, ref) => {
  return (
    <motion.button
      ref={ref}
      variants={buttonPress}
      initial="rest"
      whileHover={disabled || loading ? "rest" : "hover"}
      whileTap={disabled || loading ? "rest" : "pressed"}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {(variant === 'primary' || variant === 'accent') && !disabled && !loading && (
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
      )}
      
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
});

Button.displayName = 'Button';
