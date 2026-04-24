import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { buttonPress } from '../../lib/animations';

const variants = {
  primary: "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-lg shadow-[var(--primary)]/20",
  accent: "bg-[var(--cyan)] text-white hover:bg-[var(--cyan-hover)] shadow-lg shadow-[var(--cyan)]/20 text-glow",
  ghost: "bg-white/5 text-white hover:bg-white/10 border border-white/10",
  subtle: "bg-transparent text-white hover:bg-white/5",
  danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20",
  success: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20",
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
      {/* Shimmer sweep effect for primary and accent */}
      {(variant === 'primary' || variant === 'accent') && !disabled && !loading && (
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
      )}
      
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
});

Button.displayName = 'Button';
