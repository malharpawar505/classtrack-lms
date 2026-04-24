import React from 'react';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { StatusBadge } from '../ui/Badge';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../lib/animations';

export const AssignmentsReadOnly = ({ assignments }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    {assignments.length === 0 ? (
      <Card><EmptyState title="No assignments" description="Assignments will appear here." /></Card>
    ) : (
      <Card padding="p-0" className="overflow-hidden">
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="divide-y divide-white/5">
          {assignments.map((a) => (
            <motion.div key={a.id} variants={staggerItem} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
              <div>
                <div className="text-sm font-semibold text-white mb-1">{a.title}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {a.subject} · Due {new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={a.status} />
                {a.score != null && (
                  <div className="text-xl font-bold text-white font-mono tracking-tight">
                    {a.score}<span className="text-sm text-[var(--text-muted)] font-medium">/{a.total_marks}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Card>
    )}
  </motion.div>
);
