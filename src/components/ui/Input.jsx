import React from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Input = React.forwardRef(({ 
  className, 
  type = 'text', 
  label, 
  error, 
  icon, 
  ...props 
}, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:border-transparent transition-all shadow-sm",
            icon ? "pl-10" : "",
            error ? "border-red-300 focus-visible:ring-red-500/50" : "border-slate-300",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5 font-medium"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';
