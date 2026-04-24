import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AttendanceGrid = ({ attendance }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  
  const monthRecs = attendance.filter(a => a.date.startsWith(monthKey));
  const recMap = {};
  monthRecs.forEach(r => { recMap[parseInt(r.date.split('-')[2], 10)] = r; });
  
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-bold text-white tracking-tight">{monthName}</div>
        <div className="flex gap-2">
          <Button onClick={() => setViewDate(new Date(year, month - 1, 1))} variant="ghost" size="xs">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button onClick={() => setViewDate(new Date())} variant="ghost" size="xs">Today</Button>
          <Button onClick={() => setViewDate(new Date(year, month + 1, 1))} variant="ghost" size="xs">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Card padding="p-6">
        <div className="grid grid-cols-7 gap-2 mb-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider text-center py-1.5">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const record = recMap[day];
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            
            return (
              <motion.div 
                key={i} 
                initial={record ? { scale: 0.8, opacity: 0 } : false}
                animate={record ? { scale: 1, opacity: 1 } : false}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "aspect-square rounded-xl p-2 flex flex-col justify-between transition-all",
                  record 
                    ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20" 
                    : isToday 
                      ? "bg-[var(--cyan)]/20 border border-[var(--cyan)]/30 text-white" 
                      : "bg-white/5 border border-white/5 text-[var(--text-muted)]"
                )}
              >
                <div className="text-sm font-medium">{day}</div>
                {record && (
                  <div className="text-[9px] font-bold text-emerald-300 font-mono tracking-tighter">
                    {record.punch_time?.substring(0, 5)}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        <div className="flex gap-5 mt-6 pt-5 border-t border-white/10 text-xs text-[var(--text-muted)] font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[var(--primary)] rounded-sm" /> Present
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[var(--cyan)]/20 border border-[var(--cyan)]/30 rounded-sm" /> Today
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
