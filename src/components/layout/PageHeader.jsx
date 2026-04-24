import React from 'react';
import { motion } from 'framer-motion';

export const PageHeader = ({ title, subtitle, action }) => (
  <motion.div 
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="px-8 py-6 pb-5 border-b border-slate-200 flex justify-between items-end gap-5 flex-wrap bg-white/80 sticky top-0 z-30 backdrop-blur-md"
  >
    <div>
      {subtitle && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-[11px] font-bold text-sky-600 uppercase tracking-[0.15em] mb-1.5"
        >
          {subtitle}
        </motion.div>
      )}
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
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
