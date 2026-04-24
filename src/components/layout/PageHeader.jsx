import React from 'react';
import { motion } from 'framer-motion';

export const PageHeader = ({ title, subtitle, action }) => (
  <motion.div 
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="px-8 py-6 pb-5 border-b border-white/10 flex justify-between items-end gap-5 flex-wrap bg-gradient-to-b from-black/40 to-transparent sticky top-0 z-30 backdrop-blur-sm"
  >
    <div>
      {subtitle && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-[11px] font-semibold text-[var(--cyan)] uppercase tracking-[0.15em] mb-1.5"
        >
          {subtitle}
        </motion.div>
      )}
      <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
    </div>
    {action && (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        {action}
      </motion.div>
    )}
  </motion.div>
);
