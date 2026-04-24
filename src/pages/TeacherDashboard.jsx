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
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../lib/animations';
import { ChevronRight, Clock, UserPlus, BookOpen, BarChart3, Sparkles, TrendingUp, Calendar } from 'lucide-react';

export const TeacherDashboard = ({ profile, setPage }) => {
  const [stats, setStats] = useState({ students: 0, todayAtt: 0, avgAtt: 0, pendingHw: 0 });
  const [todayCheckins, setTodayCheckins] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(); monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    const [
      { data: studentsData },
      { data: todayAtt },
      { data: monthAtt },
      { data: pendingHw },
      { data: recentAsn }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'student'),
      supabase.from('attendance').select('*, student:profiles!student_id(*)').eq('date', today),
      supabase.from('attendance').select('*').gte('date', monthStartStr),
      supabase.from('assignments').select('id').in('status', ['pending', 'in_progress']),
      supabase.from('assignments').select('*, student:profiles!student_id(full_name)').order('created_at', { ascending: false }).limit(5)
    ]);
    const students = studentsData || [];

    const totalPossible = students.length * 12;
    const avgAtt = totalPossible > 0 ? Math.round((monthAtt?.length || 0) / totalPossible * 100) : 0;
    setStats({ students: students.length, todayAtt: todayAtt?.length || 0, avgAtt, pendingHw: pendingHw?.length || 0 });
    setTodayCheckins(todayAtt || []);
    setRecentActivity(recentAsn || []);
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Students" value={stats.students} delay={1} />
          <StatCard label="Today's Check-ins" value={stats.todayAtt} suffix={`/ ${stats.students}`} variant="accent" delay={2} />
          <StatCard label="Avg. Attendance" value={stats.avgAtt} suffix="%" delay={3} />
          <StatCard label="Pending Homework" value={stats.pendingHw} delay={4} />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-sky-500" /> Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Add Student', icon: UserPlus, desc: 'Register a new student', page: 'students', color: 'sky' },
              { label: 'New Assignment', icon: BookOpen, desc: 'Create homework', page: 'assignments', color: 'blue' },
              { label: 'View Reports', icon: BarChart3, desc: 'Parent communication', page: 'reports', color: 'emerald' },
            ].map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(14,165,233,0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPage(action.page)}
                className={`group flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl text-left transition-colors hover:border-${action.color}-200 cursor-pointer`}
              >
                <div className={`w-10 h-10 rounded-xl bg-${action.color}-50 flex items-center justify-center text-${action.color}-600 group-hover:bg-${action.color}-100 transition-colors shrink-0`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900">{action.label}</div>
                  <div className="text-xs text-slate-500 font-medium">{action.desc}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 ml-auto shrink-0 group-hover:text-slate-500 transition-colors" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Two-column layout: Check-ins + Recent assignments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Check-ins */}
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-between items-center mb-4"
            >
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-500" /> Today's check-ins
              </h3>
              <button 
                onClick={() => setPage('students')} 
                className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors font-bold focus:outline-none"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </motion.div>

            {todayCheckins.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <Card>
                  <EmptyState title="No check-ins yet today" description="Students will appear here once they punch in." />
                </Card>
              </motion.div>
            ) : (
              <Card padding="p-0" className="overflow-hidden">
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="divide-y divide-slate-100"
                >
                  {todayCheckins.map((c) => (
                    <motion.div 
                      key={c.id} 
                      variants={staggerItem}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={c.student?.full_name} size={38} variant="blue" />
                        <div>
                          <div className="text-sm font-bold text-slate-900">{c.student?.full_name || 'Unknown'}</div>
                          <div className="text-xs font-medium text-slate-500">{c.subject || 'Class'}</div>
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

          {/* Recent Assignments Activity */}
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="flex justify-between items-center mb-4"
            >
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-500" /> Recent Assignments
              </h3>
              <button 
                onClick={() => setPage('assignments')} 
                className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors font-bold focus:outline-none"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </motion.div>

            {recentActivity.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
                <Card>
                  <EmptyState title="No assignments yet" description="Create an assignment to start tracking." />
                </Card>
              </motion.div>
            ) : (
              <Card padding="p-0" className="overflow-hidden">
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="divide-y divide-slate-100"
                >
                  {recentActivity.map((a) => (
                    <motion.div 
                      key={a.id} 
                      variants={staggerItem}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-900 truncate">{a.title}</div>
                        <div className="text-xs font-medium text-slate-500 truncate">
                          {a.student?.full_name || '—'} · {a.subject}
                        </div>
                      </div>
                      <Badge 
                        variant={a.status === 'graded' ? 'green' : a.status === 'submitted' ? 'yellow' : a.status === 'in_progress' ? 'blue' : 'default'}
                      >
                        {a.status?.replace('_', ' ')}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
