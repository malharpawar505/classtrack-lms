import React from 'react';
import { Card } from './Card';
import { motion } from 'framer-motion';

export const StatCard = ({ label, value, suffix, variant = 'default', delay = 0, trend }) => {
  const isAccent = variant === 'accent';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, type: "spring", stiffness: 300, damping: 24 }}
    >
      <Card 
        padding="p-5" 
        className={isAccent ? "bg-[var(--panel)] border-[var(--primary)]/30 box-glow" : ""}
      >
        {isAccent && (
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-[var(--primary)]/20 blur-xl pointer-events-none" />
        )}
        <div className="relative">
          <div className={`text-[11px] uppercase tracking-[0.08em] font-medium mb-2 ${isAccent ? 'text-[var(--cyan)]' : 'text-[var(--text-muted)]'}`}>
            {label}
          </div>
          <div className="flex items-baseline gap-2">
            <div className={`text-3xl font-bold tracking-tight font-display ${isAccent ? 'text-white' : 'text-white'}`}>
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay * 0.1 + 0.2, type: "spring" }}
              >
                {value}
              </motion.span>
              {suffix && <span className="text-sm text-[var(--text-muted)] ml-1 font-medium">{suffix}</span>}
            </div>
            {trend && (
              <span className={`text-[11px] font-semibold ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
