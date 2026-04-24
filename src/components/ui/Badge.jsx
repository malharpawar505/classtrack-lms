import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const variants = {
  default: "bg-white/10 text-white border-white/20",
  accent: "bg-[var(--cyan)]/20 text-[var(--cyan)] border-[var(--cyan)]/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  green: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  yellow: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  purple: "bg-[var(--primary)]/20 text-purple-400 border-[var(--primary)]/30",
  dark: "bg-black/50 text-white border-white/10",
};

export const Badge = ({ className, variant = 'default', size = 'md', icon, children, pulse = false }) => {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-medium border rounded-md whitespace-nowrap",
      size === 'sm' ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
      variants[variant],
      className
    )}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            variant === 'green' ? "bg-emerald-400" :
            variant === 'yellow' ? "bg-amber-400" :
            variant === 'blue' ? "bg-blue-400" : "bg-[var(--cyan)]"
          )}></span>
          <span className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            variant === 'green' ? "bg-emerald-500" :
            variant === 'yellow' ? "bg-amber-500" :
            variant === 'blue' ? "bg-blue-500" : "bg-[var(--cyan)]"
          )}></span>
        </span>
      )}
      {icon && !pulse && <span>{icon}</span>}
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const map = {
    pending: { variant: 'default', label: 'To Do', pulse: false },
    in_progress: { variant: 'blue', label: 'In Progress', pulse: true },
    submitted: { variant: 'yellow', label: 'Submitted', pulse: false },
    graded: { variant: 'green', label: 'Graded', pulse: false },
  };
  
  const m = map[status] || map.pending;
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      key={status} // This triggers re-animation on status change
    >
      <Badge variant={m.variant} pulse={m.pulse}>
        {m.label}
      </Badge>
    </motion.div>
  );
};
