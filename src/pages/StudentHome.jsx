import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PageHeader } from '../components/layout/PageHeader';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { StatCard } from '../components/ui/StatCard';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../lib/animations';
import { Clock, CalendarCheck } from 'lucide-react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export const StudentHome = ({ profile, showToast }) => {
  const [todayRecord, setTodayRecord] = useState(null);
  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState({ month: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);

  const particlesInit = async (engine) => { await loadSlim(engine); };

  const load = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(); monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const [{ data: tod }, { data: rec }, { data: month }, { data: hw }] = await Promise.all([
      supabase.from('attendance').select('*').eq('student_id', profile.id).eq('date', today).maybeSingle(),
      supabase.from('attendance').select('*').eq('student_id', profile.id).order('date', { ascending: false }).limit(6),
      supabase.from('attendance').select('id').eq('student_id', profile.id).gte('date', monthStartStr),
      supabase.from('assignments').select('id').eq('student_id', profile.id).in('status', ['pending', 'in_progress'])
    ]);
    setTodayRecord(tod); setRecent(rec || []);
    setStats({ month: month?.length || 0, pending: hw?.length || 0 });
    setLoading(false);
  }, [profile.id]);

  useEffect(() => { load(); }, [load]);

  const handlePunch = async () => {
    setPunching(true);
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];
    const day = new Date().getDay();
    const subject = day === 5 ? 'Mathematics' : day === 6 ? 'Excel (Theory)' : day === 0 ? 'Excel (Practice)' : 'Class';
    const { error } = await supabase.from('attendance').insert({ student_id: profile.id, date: today, punch_time: now, subject, status: 'present' });
    if (error) showToast(error.message.includes('duplicate') ? 'Already punched in today' : error.message, 'error');
    else { showToast('Punched in successfully ✓', 'success'); load(); }
    setPunching(false);
  };

  if (loading) return <PageWrapper><PageHeader title={`Hello, ${profile.full_name?.split(' ')[0]}`} /><Spinner /></PageWrapper>;

  // Typewriter effect logic is easy with framer motion
  const greeting = `Hello, ${profile.full_name?.split(' ')[0] || 'there'}`;
  
  return (
    <PageWrapper>
      <PageHeader 
        title={
          <motion.div initial="hidden" animate="visible" variants={{
            hidden: { opacity: 1 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
          }}>
            {greeting.split("").map((char, index) => (
              <motion.span key={index} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
                {char}
              </motion.span>
            ))}
          </motion.div>
        } 
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} 
      />
      <div className="p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="relative overflow-hidden rounded-2xl glass-panel-strong border border-white/10 shadow-2xl mb-8 group">
            {/* Background Particles for Hero Section */}
            <Particles
              id="tsparticles-hero"
              init={particlesInit}
              options={{
                background: { color: { value: "transparent" } },
                fpsLimit: 60,
                particles: {
                  color: { value: ["#7C3AED", "#06B6D4"] },
                  links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.1, width: 1 },
                  move: { enable: true, speed: 0.6, direction: "none", random: true, straight: false, outModes: { default: "bounce" } },
                  number: { density: { enable: true, area: 800 }, value: 30 },
                  opacity: { value: 0.5 },
                  shape: { type: "circle" },
                  size: { value: { min: 1, max: 3 } },
                },
                detectRetina: true,
              }}
              className="absolute inset-0 z-0 opacity-50"
            />
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--cyan)]/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-[var(--cyan)]/30 transition-colors duration-1000" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--primary)]/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-[var(--primary)]/30 transition-colors duration-1000" />
            
            <div className="relative z-10 p-8 md:p-10">
              <div className="text-[11px] font-semibold text-white/50 uppercase tracking-[0.15em] mb-4">Today's Attendance</div>
              {todayRecord ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight flex items-center gap-3">
                    <CheckCircleIcon className="w-8 h-8 text-emerald-400" /> You're checked in
                  </h2>
                  <div className="flex flex-wrap gap-8 text-sm bg-black/20 w-fit px-6 py-4 rounded-xl border border-white/5">
                    <div>
                      <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold block mb-1">Time</span>
                      <span className="text-white font-mono font-bold text-lg">{todayRecord.punch_time?.substring(0, 5)}</span>
                    </div>
                    <div className="w-[1px] bg-white/10"></div>
                    <div>
                      <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold block mb-1">Subject</span>
                      <span className="text-white font-semibold text-lg">{todayRecord.subject}</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">Ready for class?</h2>
                  <p className="text-[var(--text-muted)] mb-8 text-sm md:text-base max-w-md">Punch in to mark your attendance for today. Your teacher will be notified automatically.</p>
                  <Button onClick={handlePunch} variant="accent" size="lg" loading={punching} className="shadow-[var(--cyan)]/30 shadow-xl px-8">
                    <CalendarCheck className="w-5 h-5 mr-2" /> Punch In Now
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <StatCard label="Classes This Month" value={stats.month} delay={1} />
          <StatCard label="Pending Assignments" value={stats.pending} delay={2} variant="accent" />
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-4">
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--cyan)]" /> Recent classes
          </h3>
        </motion.div>
        
        {recent.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card><EmptyState title="No classes yet" description="Punch in for your first class to see history." /></Card>
          </motion.div>
        ) : (
          <Card padding="p-0" className="overflow-hidden">
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="divide-y divide-white/5">
              {recent.map((r) => (
                <motion.div key={r.id} variants={staggerItem} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold text-white shadow-inner">
                      {new Date(r.date).getDate()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{r.subject}</div>
                      <div className="text-xs text-[var(--text-muted)]">{new Date(r.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                    </div>
                  </div>
                  <Badge variant="green" icon={<span className="mr-1 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}>
                    {r.punch_time?.substring(0, 5)}
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

const CheckCircleIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
