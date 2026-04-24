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
      className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 mx-auto mb-6 flex items-center justify-center text-3xl text-sky-300 shadow-sm"
    >
      ○
    </motion.div>
    <h3 className="text-lg font-bold text-slate-800 mb-2 tracking-tight">{title}</h3>
    <p className="text-sm text-slate-500 max-w-[360px] mx-auto leading-relaxed mb-6 font-medium">
      {description}
    </p>
    {action}
  </motion.div>
);
