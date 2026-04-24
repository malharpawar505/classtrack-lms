import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { AttendanceGrid } from '../components/shared/AttendanceGrid';
import { AssignmentsReadOnly } from '../components/shared/AssignmentsReadOnly';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';

export const StudentDetail = ({ student, setPage, showToast }) => {
  const [tab, setTab] = useState('overview');
  const [attendance, setAttendance] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: att } = await supabase.from('attendance').select('*').eq('student_id', student.id).order('date', { ascending: false });
      const { data: hw } = await supabase.from('assignments').select('*').eq('student_id', student.id).order('due_date', { ascending: false });
      setAttendance(att || []); setAssignments(hw || []); setLoading(false);
    })();
  }, [student.id]);

  const submitted = assignments.filter(a => a.score != null);
  const avgScore = submitted.length ? Math.round(submitted.reduce((s, a) => s + (Number(a.score) / Number(a.total_marks) * 100), 0) / submitted.length) : 0;

  const emailParent = () => {
    if (!student.parent_email) { showToast('No parent email on file', 'error'); return; }
    const monthAtt = attendance.filter(a => a.date.startsWith(new Date().toISOString().substring(0, 7)));
    const subject = `${student.full_name} — Monthly Progress Report`;
    const body = `Dear Parent,%0D%0A%0D%0AHere is ${student.full_name}'s progress:%0D%0A%0D%0A- Classes: ${monthAtt.length}%0D%0A- Homework done: ${submitted.length}/${assignments.length}%0D%0A- Avg score: ${avgScore}%25%0D%0A%0D%0ABest,%0D%0ATeacher`;
    window.open(`mailto:${student.parent_email}?subject=${encodeURIComponent(subject)}&body=${body}`, '_blank');
  };

  return (
    <PageWrapper>
      <div className="px-8 pt-6">
        <button 
          onClick={() => setPage('students')} 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4 focus:outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to students
        </button>
      </div>
      
      <div className="px-8 pb-6 border-b border-slate-200 flex justify-between items-end gap-5 flex-wrap">
        <div className="flex items-center gap-5">
          <Avatar name={student.full_name} size={64} variant="accent" />
          <div>
            <div className="text-[11px] font-bold text-sky-600 uppercase tracking-[0.15em] mb-1">{student.grade || 'Student'}</div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">{student.full_name}</h1>
            <div className="text-sm font-medium text-slate-500">{student.email}</div>
          </div>
        </div>
        <Button onClick={emailParent} variant="primary"><Mail className="w-4 h-4 mr-2" /> Email parent</Button>
      </div>

      <div className="px-8 border-b border-slate-200 flex gap-1 bg-slate-50">
        {['overview', 'attendance', 'assignments'].map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`px-5 py-4 text-sm font-bold capitalize transition-colors relative focus:outline-none ${tab === t ? 'text-sky-700' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {t}
            {tab === t && (
              <motion.div 
                layoutId="studentDetailTab" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500"
                initial={false}
              />
            )}
          </button>
        ))}
      </div>

      <div className="p-8">
        {loading ? <Spinner /> : (
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {tab === 'overview' && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard label="Classes Attended" value={attendance.length} delay={1} />
                  <StatCard label="Average Score" value={avgScore} suffix="%" delay={2} />
                  <StatCard label="HW Done" value={submitted.length} suffix={`/ ${assignments.length}`} delay={3} />
                  <StatCard label="Last Active" value={attendance[0]?.date ? new Date(attendance[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'} delay={4} />
                </div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <Card>
                    <h3 className="text-base font-bold text-slate-900 mb-5">Contact details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold mb-1">Student Email</div>
                        <div className="text-sm font-bold text-slate-900">{student.email}</div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold mb-1">Parent Email</div>
                        <div className="text-sm font-bold text-slate-900">{student.parent_email || <span className="text-slate-400 font-medium">Not provided</span>}</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            )}
            {tab === 'attendance' && <AttendanceGrid attendance={attendance} />}
            {tab === 'assignments' && <AssignmentsReadOnly assignments={assignments} />}
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
};
