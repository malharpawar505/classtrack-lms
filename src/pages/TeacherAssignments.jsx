import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PageHeader } from '../components/layout/PageHeader';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../lib/animations';
import { Plus, CheckCircle2, Trash2, Mail, AlertTriangle } from 'lucide-react';

export const TeacherAssignments = ({ profile, showToast }) => {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', subject: 'Mathematics', student_id: '', due_date: '', total_marks: 20 });

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: asn }, { data: sts }] = await Promise.all([
      supabase.from('assignments').select('*, student:profiles!student_id(full_name, email, parent_email)').order('due_date', { ascending: false }),
      supabase.from('profiles').select('id, full_name').eq('role', 'student').order('full_name')
    ]);
    setAssignments(asn || []); setStudents(sts || []); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.title || !form.student_id || !form.due_date) { showToast('All required fields needed', 'error'); return; }
    const { error } = await supabase.from('assignments').insert({ ...form, teacher_id: profile.id, status: 'pending' });
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Assignment created ✓', 'success');
    setForm({ title: '', subject: 'Mathematics', student_id: '', due_date: '', total_marks: 20 });
    setShowAdd(false); load();
  };

  const gradeIt = async (id, total) => {
    const input = prompt(`Enter score (out of ${total}):`);
    if (input === null) return;
    const s = parseFloat(input);
    if (isNaN(s) || s < 0 || s > total) { showToast('Invalid score', 'error'); return; }
    const { error } = await supabase.from('assignments').update({ score: s, status: 'graded', graded_at: new Date().toISOString() }).eq('id', id);
    if (error) showToast(error.message, 'error'); else { showToast('Graded ✓', 'success'); load(); }
  };

  const deleteAssignment = async (id, e) => {
    e?.stopPropagation?.();
    if (!window.confirm('Delete this assignment? This cannot be undone.')) return;
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) showToast(error.message, 'error');
    else { showToast('Assignment deleted', 'success'); load(); }
  };

  const pendingCount = assignments.filter(a => a.status === 'pending' || a.status === 'in_progress').length;

  const emailOverdue = (a) => {
    const studentEmail = a.student?.email;
    const parentEmail = a.student?.parent_email;
    if (!studentEmail) { showToast('No student email on file', 'error'); return; }
    
    const dueDate = new Date(a.due_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const subject = `Overdue Assignment: ${a.title}`;
    const body = [
      `Dear ${a.student?.full_name},`,
      '',
      `This is a reminder that the following assignment is overdue:`,
      '',
      `Assignment: ${a.title}`,
      `Subject: ${a.subject}`,
      `Due Date: ${dueDate}`,
      `Total Marks: ${a.total_marks}`,
      '',
      `Please complete and submit this assignment at your earliest convenience.`,
      '',
      `Best regards,`,
      `${profile.full_name}`,
      `Lumina LMS`
    ].join('%0D%0A');
    
    const cc = parentEmail ? `&cc=${encodeURIComponent(parentEmail)}` : '';
    window.open(`mailto:${studentEmail}?subject=${encodeURIComponent(subject)}&body=${body}${cc}`, '_blank');
    showToast(`Email drafted for ${a.student?.full_name}${parentEmail ? ' (CC: parent)' : ''}`, 'success');
  };

  const overdueAssignments = assignments.filter(a => {
    const daysLeft = Math.ceil((new Date(a.due_date) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft < 0 && !['submitted', 'graded'].includes(a.status);
  });

  return (
    <PageWrapper>
      <PageHeader 
        title="Assignments" 
        subtitle={`${assignments.length} total · ${pendingCount} pending`} 
        action={
          <div className="flex gap-2">
            {overdueAssignments.length > 0 && (
              <Button onClick={() => {
                overdueAssignments.forEach(a => {
                  const studentEmail = a.student?.email;
                  const parentEmail = a.student?.parent_email;
                  if (!studentEmail) return;
                  const dueDate = new Date(a.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
                  const subject = `Overdue Assignment: ${a.title}`;
                  const body = [`Dear ${a.student?.full_name},`, '', `Your assignment "${a.title}" (${a.subject}) was due on ${dueDate} and has not been submitted.`, '', `Please submit it as soon as possible.`, '', `Best regards,`, `${profile.full_name}`].join('%0D%0A');
                  const cc = parentEmail ? `&cc=${encodeURIComponent(parentEmail)}` : '';
                  window.open(`mailto:${studentEmail}?subject=${encodeURIComponent(subject)}&body=${body}${cc}`, '_blank');
                });
                showToast(`Drafts opened for ${overdueAssignments.length} overdue assignment(s)`, 'success');
              }} variant="danger" size="sm">
                <AlertTriangle className="w-4 h-4 mr-1.5" /> Email All Overdue ({overdueAssignments.length})
              </Button>
            )}
            <Button onClick={() => setShowAdd(!showAdd)} variant={showAdd ? 'ghost' : 'primary'}>
              {showAdd ? 'Cancel' : <><Plus className="w-4 h-4 mr-1.5" /> New assignment</>}
            </Button>
          </div>
        } 
      />
      <div className="p-8">
        <motion.div
          initial={false}
          animate={{ height: showAdd ? 'auto' : 0, opacity: showAdd ? 1 : 0, marginBottom: showAdd ? 24 : 0 }}
          className="overflow-hidden"
        >
          <Card className="border-sky-200 bg-sky-50 shadow-md">
            <h3 className="text-base font-bold text-slate-900 mb-5">Create new assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Exponent Laws Practice" />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Student</label>
                <select 
                  value={form.student_id} 
                  onChange={e => setForm({ ...form, student_id: e.target.value })} 
                  className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] transition-all shadow-sm"
                >
                  <option value="" className="text-slate-500">Select student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Subject</label>
                <select 
                  value={form.subject} 
                  onChange={e => setForm({ ...form, subject: e.target.value })} 
                  className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] transition-all shadow-sm"
                >
                  {['Mathematics', 'Excel', 'Power BI'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input label="Due Date" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
              <Input label="Total Marks" type="number" value={form.total_marks} onChange={e => setForm({ ...form, total_marks: parseInt(e.target.value) || 20 })} />
            </div>
            <div className="mt-2">
              <Button onClick={handleAdd} variant="primary">Create assignment</Button>
            </div>
          </Card>
        </motion.div>

        {loading ? <Spinner /> : assignments.length === 0 ? (
          <Card>
            <EmptyState 
              title="No assignments yet" 
              description="Create your first assignment to track student progress." 
              action={<Button onClick={() => setShowAdd(true)} variant="primary"><Plus className="w-4 h-4 mr-1.5" /> New assignment</Button>} 
            />
          </Card>
        ) : (
          <Card padding="p-0" className="overflow-hidden">
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1.2fr_1fr_40px] p-3 border-b border-slate-100 bg-slate-50 hidden md:grid">
              {['Assignment', 'Student', 'Subject', 'Due', 'Status', 'Score', ''].map(h => (
                <div key={h} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</div>
              ))}
            </div>
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="divide-y divide-slate-100">
              {assignments.map((a) => (
                <motion.div key={a.id} variants={staggerItem} className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_1.2fr_1fr_40px] p-4 items-center gap-y-3 hover:bg-slate-50 transition-colors group">
                  <div className="text-sm font-bold text-slate-900">{a.title}</div>
                  <div className="text-sm font-semibold text-slate-600">{a.student?.full_name || '—'}</div>
                  <div className="text-xs font-medium text-slate-500">{a.subject}</div>
                  <div className="text-xs font-medium text-slate-500">{new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  <div><StatusBadge status={a.status} /></div>
                  <div>
                    {a.score != null ? (
                      <span className="text-base font-bold text-slate-900 font-mono tracking-tight">{a.score}<span className="text-[11px] text-slate-500 font-sans ml-0.5">/{a.total_marks}</span></span>
                    ) : a.status === 'submitted' ? (
                      <Button onClick={() => gradeIt(a.id, a.total_marks)} variant="primary" size="xs">Grade</Button>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">—</span>
                    )}
                  </div>
                  <div className="flex justify-end gap-1">
                    {(() => {
                      const daysLeft = Math.ceil((new Date(a.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                      const isOverdue = daysLeft < 0 && !['submitted', 'graded'].includes(a.status);
                      return isOverdue ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); emailOverdue(a); }}
                          className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors focus:outline-none"
                          title="Email student about overdue"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      ) : null;
                    })()}
                    <button
                      onClick={(e) => deleteAssignment(a.id, e)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none opacity-0 group-hover:opacity-100"
                      title="Delete Assignment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};
