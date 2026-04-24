import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { AnimatePresence } from 'framer-motion';

// Layout
import { Sidebar } from './components/layout/Sidebar';
// UI
import { Spinner } from './components/ui/Spinner';
import { Toast } from './components/ui/Toast';

// Pages
import { AuthPage } from './pages/AuthPage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentsList } from './pages/StudentsList';
import { StudentDetail } from './pages/StudentDetail';
import { TeacherAssignments } from './pages/TeacherAssignments';
import { TeacherReports } from './pages/TeacherReports';
import { StudentHome } from './pages/StudentHome';
import { StudentAttendance } from './pages/StudentAttendance';
import { StudentAssignments } from './pages/StudentAssignments';
import { StudentProgress } from './pages/StudentProgress';

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => setToast({ message, type });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadProfile(session.user.id); else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) { console.error('Profile load error:', error); showToast('Error loading profile', 'error'); }
    else { setProfile(data); setPage(data.role === 'teacher' ? 'dashboard' : 'home'); }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null); setSession(null);
    showToast('Signed out', 'info');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <Spinner size={32} />
    </div>
  );
  
  if (!session || !profile) return (
    <>
      <AuthPage showToast={showToast} />
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );

  const renderPage = () => {
    if (profile.role === 'teacher') {
      if (page === 'dashboard') return <TeacherDashboard profile={profile} setPage={setPage} />;
      if (page === 'students') return <StudentsList setSelectedStudent={setSelectedStudent} setPage={setPage} showToast={showToast} />;
      if (page === 'student-detail' && selectedStudent) return <StudentDetail student={selectedStudent} setPage={setPage} showToast={showToast} />;
      if (page === 'assignments') return <TeacherAssignments profile={profile} showToast={showToast} />;
      if (page === 'reports') return <TeacherReports showToast={showToast} />;
    } else {
      if (page === 'home') return <StudentHome profile={profile} showToast={showToast} />;
      if (page === 'attendance') return <StudentAttendance profile={profile} />;
      if (page === 'assignments') return <StudentAssignments profile={profile} showToast={showToast} />;
      if (page === 'progress') return <StudentProgress profile={profile} />;
    }
    return <div className="p-10 text-white">Page not found</div>;
  };

  return (
    <>
      <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--cyan)] selection:text-white">
        <Sidebar profile={profile} currentPage={page} setPage={setPage} onLogout={handleLogout} />
        <main className="flex-1 min-w-0 relative h-screen overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            {React.cloneElement(renderPage(), { key: page })}
          </AnimatePresence>
        </main>
      </div>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
