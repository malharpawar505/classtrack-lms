import React, { useState, useEffect, useCallback } from 'react';
import { supabase, createStudentAccount, resetStudentPassword } from '../lib/supabase';
import { PageHeader } from '../components/layout/PageHeader';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../lib/animations';
import { Search, UserPlus, Trash2, Copy, X, CheckCircle2, KeyRound } from 'lucide-react';

export const StudentsList = ({ setSelectedStudent, setPage, showToast }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ email: '', fullName: '', parentEmail: '', grade: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false });
    const monthStart = new Date(); monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const { data: attData } = await supabase.from('attendance').select('student_id').gte('date', monthStartStr);
    const attCounts = {};
    attData?.forEach(a => { attCounts[a.student_id] = (attCounts[a.student_id] || 0) + 1; });
    setStudents((data || []).map(s => ({ ...s, attendance_count: attCounts[s.id] || 0 })));
    setLoading(false);
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const handleAdd = async () => {
    if (!form.email || !form.fullName || !form.password) { showToast('Email, name, and password are required', 'error'); return; }
    if (form.password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
    setSubmitting(true);
    try {
      const { needsEmailConfirm, error } = await createStudentAccount({
        email: form.email, password: form.password, fullName: form.fullName,
        grade: form.grade, parentEmail: form.parentEmail
      });
      if (error) throw error;
      setCreated({ name: form.fullName, email: form.email, password: form.password, needsEmailConfirm });
      showToast(`${form.fullName} added successfully`, 'success');
      setForm({ email: '', fullName: '', parentEmail: '', grade: '', password: '' });
      setShowAdd(false); loadStudents();
    } catch (err) { showToast(err.message || 'Failed to add student', 'error'); } finally { setSubmitting(false); }
  };

  const genPassword = () => Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);

  const openReset = (student, e) => {
    e.stopPropagation();
    setCreated(null);
    setShowAdd(false);
    setResetTarget(student);
    setResetPassword(genPassword());
  };

  const handleReset = async () => {
    if (resetPassword.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
    setResetting(true);
    const { error } = await resetStudentPassword(resetTarget.id, resetPassword);
    setResetting(false);
    if (error) { showToast(error.message, 'error'); return; }
    showToast(`Password updated for ${resetTarget.full_name}`, 'success');
    setCreated({ name: resetTarget.full_name, email: resetTarget.email, password: resetPassword, needsEmailConfirm: false, isReset: true });
    setResetTarget(null);
  };

  const copyCredentials = async () => {
    try {
      await navigator.clipboard.writeText(`Lumina LMS login\nWebsite: ${window.location.origin}\nEmail: ${created.email}\nPassword: ${created.password}`);
      showToast('Login details copied', 'success');
    } catch { showToast('Could not copy — please copy manually', 'error'); }
  };

  const handleDeleteStudent = async (studentId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this student and all their data? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      await supabase.from('assignments').delete().eq('student_id', studentId);
      await supabase.from('attendance').delete().eq('student_id', studentId);
      const { error } = await supabase.from('profiles').delete().eq('id', studentId);
      if (error) throw error;
      
      showToast('Student deleted successfully', 'success');
      loadStudents();
    } catch (err) {
      showToast('Failed to delete student: ' + err.message, 'error');
      setLoading(false);
    }
  };

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper>
      <PageHeader 
        title="Students" 
        subtitle={`${students.length} enrolled`} 
        action={
          <Button onClick={() => { setShowAdd(!showAdd); setCreated(null); }} variant={showAdd ? 'ghost' : 'primary'}>
            {showAdd ? 'Cancel' : <><UserPlus className="w-4 h-4 mr-2"/> Add student</>}
          </Button>
        } 
      />
      <div className="p-8">
        <motion.div
          initial={false}
          animate={{ height: showAdd ? 'auto' : 0, opacity: showAdd ? 1 : 0, marginBottom: showAdd ? 24 : 0 }}
          className="overflow-hidden"
        >
          <Card className="border-sky-200 bg-sky-50 shadow-md">
            <h3 className="text-base font-bold text-slate-900 mb-4">Register new student</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name *" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Adeena Javaid" />
              <Input label="Student Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="student@gmail.com" />
              <Input label="Temporary Password *" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
              <Input label="Grade" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} placeholder="Grade 11" />
              <div className="md:col-span-2">
                <Input label="Parent Email" type="email" value={form.parentEmail} onChange={e => setForm({ ...form, parentEmail: e.target.value })} placeholder="parent@gmail.com" />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button onClick={handleAdd} variant="primary" loading={submitting}>Create Account</Button>
              <Button onClick={() => setShowAdd(false)} variant="ghost">Cancel</Button>
            </div>
            <div className="text-xs text-sky-700 mt-4 p-3 bg-sky-100 rounded-lg border border-sky-200 flex items-center gap-2 font-medium">
              <span className="text-base">ℹ</span> Share the email + password with the student so they can log in. Note: Please ensure "Confirm Email" is disabled in your Supabase settings if emails are not being received.
            </div>
          </Card>
        </motion.div>

        {resetTarget && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card className="border border-sky-200 bg-sky-50 shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-sky-500" /> Reset password for {resetTarget.full_name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mb-3">
                    Their old password stops working immediately. Share the new one after saving — you can edit the suggestion below.
                  </p>
                  <div className="max-w-sm">
                    <Input label="New password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder="Min 6 characters" />
                  </div>
                </div>
                <button onClick={() => setResetTarget(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-sky-100 rounded-lg transition-colors" title="Cancel">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <Button onClick={handleReset} variant="primary" size="sm" loading={resetting}>Set new password</Button>
                <Button onClick={() => setResetTarget(null)} variant="ghost" size="sm">Cancel</Button>
              </div>
            </Card>
          </motion.div>
        )}

        {created && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card className="border border-emerald-200 bg-emerald-50 shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {created.isReset ? `New password set for ${created.name}` : `Account created for ${created.name}`}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mb-3">
                    {created.needsEmailConfirm
                      ? 'Share these login details — the student must verify their email before signing in.'
                      : 'Share these login details with the student. They can sign in right away.'}
                  </p>
                  <div className="inline-block rounded-lg border border-emerald-200 bg-white px-4 py-2.5 font-mono text-sm text-slate-900 leading-7">
                    <div><span className="text-slate-400">Email&nbsp;&nbsp;&nbsp;&nbsp;</span>{created.email}</div>
                    <div><span className="text-slate-400">Password&nbsp;</span>{created.password}</div>
                  </div>
                </div>
                <button onClick={() => setCreated(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-emerald-100 rounded-lg transition-colors" title="Dismiss">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={copyCredentials} variant="primary" size="sm"><Copy className="w-4 h-4 mr-2" /> Copy login details</Button>
                <Button onClick={() => setCreated(null)} variant="ghost" size="sm">Done</Button>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="mb-6">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students by name or email..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <Card>
            <EmptyState 
              title={search ? 'No matches found' : 'No students yet'} 
              description={search ? 'Try a different search term.' : 'Add your first student to start tracking attendance and progress.'} 
              action={!search && <Button onClick={() => setShowAdd(true)} variant="primary"><UserPlus className="w-4 h-4 mr-2"/> Add student</Button>} 
            />
          </Card>
        ) : (
          <Card padding="p-0" className="overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_76px] p-3 border-b border-slate-100 bg-slate-50">
              {['Student', 'Grade', 'Parent Email', 'This Month', ''].map(h => (
                <div key={h} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</div>
              ))}
            </div>
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <motion.div 
                  key={s.id} 
                  variants={staggerItem}
                  onClick={() => { setSelectedStudent(s); setPage('student-detail'); }} 
                  className="grid grid-cols-[2fr_1fr_1.5fr_1fr_76px] p-4 items-center cursor-pointer hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={s.full_name} size={36} variant="blue" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">{s.full_name}</div>
                      <div className="text-xs font-medium text-slate-500 truncate">{s.email}</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-900 font-bold">{s.grade || '—'}</div>
                  <div className="text-xs font-medium text-slate-500 truncate">{s.parent_email || '—'}</div>
                  <div>
                    <Badge variant={s.attendance_count >= 8 ? 'green' : s.attendance_count >= 4 ? 'accent' : 'default'}>
                      {s.attendance_count} classes
                    </Badge>
                  </div>
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={(e) => openReset(s, e)}
                      className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors focus:outline-none"
                      title="Reset Password"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteStudent(s.id, e)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
                      title="Delete Student"
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
