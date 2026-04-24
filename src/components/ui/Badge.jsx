import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const variants = {
  default: "bg-slate-100 text-slate-700 border-slate-200",
  accent: "bg-sky-100 text-sky-700 border-sky-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  green: "bg-emerald-100 text-emerald-700 border-emerald-200",
  yellow: "bg-amber-100 text-amber-700 border-amber-200",
  red: "bg-red-100 text-red-700 border-red-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  dark: "bg-slate-800 text-white border-slate-700",
};

export const Badge = ({ className, variant = 'default', size = 'md', icon, children, pulse = false }) => {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-semibold border rounded-md whitespace-nowrap",
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
            variant === 'blue' ? "bg-blue-400" : "bg-sky-400"
          )}></span>
          <span className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            variant === 'green' ? "bg-emerald-500" :
            variant === 'yellow' ? "bg-amber-500" :
            variant === 'blue' ? "bg-blue-500" : "bg-sky-500"
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
      key={status}
    >
      <Badge variant={m.variant} pulse={m.pulse}>
        {m.label}
      </Badge>
    </motion.div>
  );
};
