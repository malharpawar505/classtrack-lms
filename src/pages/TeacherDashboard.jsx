import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PageHeader } from '../components/layout/PageHeader';
import { PageWrapper } from '../components/layout/PageWrapper';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../lib/animations';
import { ChevronRight, Clock } from 'lucide-react';

export const TeacherDashboard = ({ profile, setPage }) => {
  const [stats, setStats] = useState({ students: 0, todayAtt: 0, avgAtt: 0, pendingHw: 0 });
  const [todayCheckins, setTodayCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(); monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    const { data: studentsData } = await supabase.from('profiles').select('*').eq('role', 'student');
    const students = studentsData || [];
    const { data: todayAtt } = await supabase.from('attendance').select('*, student:profiles!student_id(*)').eq('date', today);
    const { data: monthAtt } = await supabase.from('attendance').select('*').gte('date', monthStartStr);
    const { data: pendingHw } = await supabase.from('assignments').select('id').in('status', ['pending', 'in_progress']);

    const totalPossible = students.length * 12;
    const avgAtt = totalPossible > 0 ? Math.round((monthAtt?.length || 0) / totalPossible * 100) : 0;
    setStats({ students: students.length, todayAtt: todayAtt?.length || 0, avgAtt, pendingHw: pendingHw?.length || 0 });
    setTodayCheckins(todayAtt || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = profile.full_name?.split(' ')[0] || 'Teacher';

  if (loading) return (
    <PageWrapper>
      <PageHeader 
        title={`${greeting}, ${firstName}`} 
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} 
      />
      <Spinner />
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <PageHeader 
        title={`${greeting}, ${firstName}`} 
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} 
      />
      
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Students" value={stats.students} delay={1} />
          <StatCard label="Today's Check-ins" value={stats.todayAtt} suffix={`/ ${stats.students}`} variant="accent" delay={2} />
          <StatCard label="Avg. Attendance" value={stats.avgAtt} suffix="%" delay={3} />
          <StatCard label="Pending Homework" value={stats.pendingHw} delay={4} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between items-center mb-4"
        >
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--cyan)]" /> Today's check-ins
          </h3>
          <button 
            onClick={() => setPage('students')} 
            className="text-xs text-[var(--text-muted)] hover:text-white flex items-center gap-1 transition-colors font-medium focus:outline-none"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </motion.div>

        {todayCheckins.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card>
              <EmptyState title="No check-ins yet today" description="Students will appear here once they punch in for class." />
            </Card>
          </motion.div>
        ) : (
          <Card padding="p-0" className="overflow-hidden">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="divide-y divide-white/5"
            >
              {todayCheckins.map((c) => (
                <motion.div 
                  key={c.id} 
                  variants={staggerItem}
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={c.student?.full_name} size={38} />
                    <div>
                      <div className="text-sm font-semibold text-white">{c.student?.full_name || 'Unknown'}</div>
                      <div className="text-xs text-[var(--text-muted)]">{c.subject || 'Class'}</div>
                    </div>
                  </div>
                  <Badge variant="green" icon={<span className="mr-1 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}>
                    {c.punch_time?.substring(0, 5)}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};
