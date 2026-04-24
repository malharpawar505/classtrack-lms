import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PageHeader } from '../components/layout/PageHeader';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../lib/animations';
import { Mail } from 'lucide-react';

export const TeacherReports = ({ showToast }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const monthStart = new Date(); monthStart.setDate(1);
      const monthStartStr = monthStart.toISOString().split('T')[0];
      const { data: sts } = await supabase.from('profiles').select('*').eq('role', 'student');
      const { data: att } = await supabase.from('attendance').select('student_id').gte('date', monthStartStr);
      const { data: asn } = await supabase.from('assignments').select('*');
      
      const attMap = {}; 
      att?.forEach(a => attMap[a.student_id] = (attMap[a.student_id] || 0) + 1);
      
      const enriched = (sts || []).map(s => {
        const hw = asn?.filter(a => a.student_id === s.id) || [];
        const submitted = hw.filter(a => a.score != null);
        const avg = submitted.length ? Math.round(submitted.reduce((sum, a) => sum + (a.score / a.total_marks * 100), 0) / submitted.length) : 0;
        return { ...s, att: attMap[s.id] || 0, hwTotal: hw.length, hwDone: submitted.length, avg };
      });
      setStudents(enriched); setLoading(false);
    })();
  }, []);

  const sendReport = (s) => {
    if (!s.parent_email) { showToast('No parent email for this student', 'error'); return; }
    const subject = `${s.full_name} — Monthly Progress Report`;
    const body = `Dear Parent,%0D%0A%0D%0AHere is ${s.full_name}'s progress this month:%0D%0A%0D%0A- Classes attended: ${s.att}%0D%0A- Assignments submitted: ${s.hwDone}/${s.hwTotal}%0D%0A- Average score: ${s.avg}%25%0D%0A%0D%0APlease reach out with any questions.%0D%0A%0D%0ABest regards,%0D%0ATeacher`;
    window.open(`mailto:${s.parent_email}?subject=${encodeURIComponent(subject)}&body=${body}`, '_blank');
  };

  return (
    <PageWrapper>
      <PageHeader title="Reports" subtitle="Monthly parent communication" />
      <div className="p-8">
        {loading ? <Spinner /> : students.length === 0 ? (
          <Card><EmptyState title="No students" description="Add students to generate reports." /></Card>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {students.map((s) => (
              <motion.div key={s.id} variants={staggerItem}>
                <Card hoverable className="flex flex-col h-full border-slate-200">
                  <div className="flex items-center gap-3 mb-5">
                    <Avatar name={s.full_name} size={42} variant="blue" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">{s.full_name}</div>
                      <div className="text-xs font-medium text-slate-500 truncate">{s.parent_email || 'No parent email'}</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-100">
                    {[
                      ['Attendance', `${s.att} classes`], 
                      ['Homework', `${s.hwDone}/${s.hwTotal}`], 
                      ['Avg. Score', `${s.avg}%`]
                    ].map(([k, v], idx) => (
                      <div key={k} className={`flex justify-between items-center ${idx === 2 ? '' : 'mb-2 pb-2 border-b border-slate-200'}`}>
                        <span className="text-xs font-bold text-slate-500">{k}</span>
                        <span className="text-sm font-bold text-slate-900 tracking-tight">{v}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-auto">
                    <Button 
                      onClick={() => sendReport(s)} 
                      variant={s.parent_email ? "primary" : "subtle"} 
                      fullWidth 
                      size="sm" 
                      disabled={!s.parent_email}
                    >
                      <Mail className="w-4 h-4 mr-2" /> Send report
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
};
