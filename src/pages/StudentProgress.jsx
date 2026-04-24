import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PageHeader } from '../components/layout/PageHeader';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Spinner } from '../components/ui/Spinner';
import { AssignmentsReadOnly } from '../components/shared/AssignmentsReadOnly';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../lib/animations';

export const StudentProgress = ({ profile }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('assignments').select('*').eq('student_id', profile.id).order('due_date', { ascending: false });
      setAssignments(data || []); setLoading(false);
    })();
  }, [profile.id]);
  
  const graded = assignments.filter(a => a.score != null);
  const avg = graded.length ? Math.round(graded.reduce((s, a) => s + (a.score / a.total_marks * 100), 0) / graded.length) : 0;

  // Subject breakdown
  const bySubject = {};
  graded.forEach(a => {
    if (!bySubject[a.subject]) bySubject[a.subject] = { total: 0, max: 0, count: 0 };
    bySubject[a.subject].total += Number(a.score);
    bySubject[a.subject].max += Number(a.total_marks);
    bySubject[a.subject].count += 1;
  });

  return (
    <PageWrapper>
      <PageHeader title="My Progress" subtitle="Scores & performance" />
      <div className="p-8">
        {loading ? <Spinner /> : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard label="Average Score" value={avg} suffix="%" variant="accent" delay={1} />
              <StatCard label="Graded" value={graded.length} delay={2} />
              <StatCard label="Total Assignments" value={assignments.length} delay={3} />
            </div>

            {Object.keys(bySubject).length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
                <h3 className="text-base font-semibold text-white tracking-tight mb-4">Performance by subject</h3>
                <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(bySubject).map(([subj, data], i) => {
                    const pct = Math.round(data.total / data.max * 100);
                    return (
                      <motion.div key={subj} variants={staggerItem}>
                        <Card padding="p-5" hoverable className="border-white/5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="text-sm font-semibold text-white mb-1">{subj}</div>
                              <div className="text-xs text-[var(--text-muted)] font-medium">{data.count} assignment{data.count !== 1 ? 's' : ''}</div>
                            </div>
                            <div className="text-2xl font-bold text-white font-mono tracking-tight">{pct}%</div>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 + 0.5 }}
                              className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-[var(--cyan)]' : 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]'}`} 
                            />
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <h3 className="text-base font-semibold text-white tracking-tight mb-4">All assignments</h3>
              <AssignmentsReadOnly assignments={assignments} />
            </motion.div>
          </>
        )}
      </div>
    </PageWrapper>
  );
};
