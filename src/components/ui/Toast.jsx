import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (toast) {
      const t = setTimeout(onDismiss, 3500);
      return () => clearTimeout(t);
    }
  }, [toast, onDismiss]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed top-6 right-6 z-50 min-w-[300px] max-w-md glass-panel-strong rounded-xl p-4 flex items-start gap-3 shadow-2xl border-l-4"
          style={{
            borderLeftColor: 
              toast.type === 'success' ? '#10B981' : 
              toast.type === 'error' ? '#EF4444' : 
              'var(--cyan)'
          }}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[var(--cyan)]" />}
          </div>
          <div className="flex-1 text-sm font-medium text-white leading-relaxed">
            {toast.message}
          </div>
          <button 
            onClick={onDismiss}
            className="shrink-0 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
