import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PageHeader } from '../components/layout/PageHeader';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem } from '../lib/animations';
import { ArrowLeft, CheckCircle2, AlertTriangle, CircleDashed } from 'lucide-react';

export const StudentAssignments = ({ profile, showToast }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('assignments').select('*').eq('student_id', profile.id).order('due_date', { ascending: true });
    setAssignments(data || []); setLoading(false);
  }, [profile.id]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    const updates = { status: newStatus };
    if (newStatus === 'submitted') updates.submitted_at = new Date().toISOString();
    const { error } = await supabase.from('assignments').update(updates).eq('id', id);
    if (error) showToast(error.message, 'error');
    else {
      showToast(`Marked as ${newStatus.replace('_', ' ')}`, 'success');
      setAssignments(assignments.map(a => a.id === id ? { ...a, ...updates } : a));
    }
    setUpdatingId(null);
  };

  const filtered = filter === 'all' ? assignments : assignments.filter(a => {
    if (filter === 'active') return ['pending', 'in_progress'].includes(a.status);
    if (filter === 'done') return ['submitted', 'graded'].includes(a.status);
    return a.status === filter;
  });

  const counts = {
    all: assignments.length,
    active: assignments.filter(a => ['pending', 'in_progress'].includes(a.status)).length,
    done: assignments.filter(a => ['submitted', 'graded'].includes(a.status)).length,
  };

  return (
    <PageWrapper>
      <PageHeader title="My Assignments" subtitle={`${counts.active} active · ${counts.done} completed`} />
      <div className="p-8">
        
        {/* Filter tabs */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200"
        >
          {[['all', 'All'], ['active', 'Active'], ['done', 'Done']].map(([k, label]) => (
            <button 
              key={k} 
              onClick={() => setFilter(k)} 
              className={`relative px-4 py-2 rounded-lg text-sm font-bold transition-colors focus:outline-none ${
                filter === k ? 'text-sky-700' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {filter === k && (
                <motion.div 
                  layoutId="assignmentFilter"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {label} <span className="text-xs opacity-70">{counts[k]}</span>
              </span>
            </button>
          ))}
        </motion.div>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <Card><EmptyState title="No assignments here" description={filter === 'all' ? 'Your teacher will assign homework that will appear here.' : 'Try a different filter.'} /></Card>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-4">
            <AnimatePresence>
              {filtered.map((a) => {
                const daysLeft = Math.ceil((new Date(a.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                const isOverdue = daysLeft < 0 && !['submitted', 'graded'].includes(a.status);
                const isUpdating = updatingId === a.id;

                return (
                  <motion.div 
                    key={a.id}
                    variants={staggerItem}
                    layout
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  >
                    <Card hoverable className={isOverdue ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"}>
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant={a.subject === 'Mathematics' ? 'purple' : a.subject === 'Excel' ? 'green' : 'blue'}>{a.subject}</Badge>
                            <StatusBadge status={a.status} />
                            {isOverdue && <Badge variant="red" icon={<AlertTriangle className="w-3 h-3"/>}>Overdue</Badge>}
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">{a.title}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 font-medium">
                            <span>Due {new Date(a.due_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            {daysLeft >= 0 && !['submitted', 'graded'].includes(a.status) && (
                              <span className={daysLeft <= 2 ? "text-red-500 font-bold" : ""}>
                                {daysLeft === 0 ? 'Due today' : daysLeft === 1 ? 'Due tomorrow' : `${daysLeft} days left`}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> {a.total_marks} marks</span>
                          </div>
                        </div>
                        
                        {a.score != null && (
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring" }}
                            className="text-right shrink-0 bg-sky-50 px-4 py-2 rounded-xl border border-sky-100"
                          >
                            <div className="text-2xl font-bold text-sky-600 font-mono tracking-tight">{a.score}<span className="text-sm text-sky-400 font-sans ml-0.5">/{a.total_marks}</span></div>
                            <div className="text-[10px] text-sky-500 uppercase tracking-widest font-bold">Scored</div>
                          </motion.div>
                        )}
                      </div>

                      {/* Status change actions */}
                      {!['graded'].includes(a.status) && (
                        <div className="flex gap-2 pt-4 border-t border-slate-100 mt-2">
                          {a.status === 'pending' && (
                            <>
                              <Button onClick={() => updateStatus(a.id, 'in_progress')} variant="ghost" size="sm" loading={isUpdating}>
                                <CircleDashed className="w-4 h-4 mr-1.5" /> Start Working
                              </Button>
                              <Button onClick={() => updateStatus(a.id, 'submitted')} variant="primary" size="sm" loading={isUpdating}>
                                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Submitted
                              </Button>
                            </>
                          )}
                          {a.status === 'in_progress' && (
                            <>
                              <Button onClick={() => updateStatus(a.id, 'pending')} variant="ghost" size="sm" loading={isUpdating}>
                                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Todo
                              </Button>
                              <Button onClick={() => updateStatus(a.id, 'submitted')} variant="primary" size="sm" loading={isUpdating}>
                                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Submit
                              </Button>
                            </>
                          )}
                          {a.status === 'submitted' && (
                            <>
                              <Button onClick={() => updateStatus(a.id, 'in_progress')} variant="ghost" size="sm" loading={isUpdating}>
                                <ArrowLeft className="w-4 h-4 mr-1.5" /> Reopen
                              </Button>
                              <div className="text-xs text-slate-400 self-center ml-auto font-bold">Waiting for teacher to grade</div>
                            </>
                          )}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
};
