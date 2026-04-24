import React from 'react';
import { motion } from 'framer-motion';

export const EmptyState = ({ title, description, action }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-14 px-5"
  >
    <motion.div 
      animate={{ y: [-4, 4] }}
      transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mx-auto mb-5 flex items-center justify-center text-2xl text-[var(--text-muted)]"
    >
      ○
    </motion.div>
    <h3 className="text-base font-semibold text-white mb-1.5 tracking-tight">{title}</h3>
    <p className="text-sm text-[var(--text-muted)] max-w-[360px] mx-auto leading-relaxed mb-5">
      {description}
    </p>
    {action}
  </motion.div>
);
