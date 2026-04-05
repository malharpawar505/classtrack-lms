import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';

// ============================================================
// DESIGN TOKENS — Professional, refined, minimal
// ============================================================
const T = {
  bg: '#FFFFFF',
  surface: '#FAFAFA',
  surfaceHover: '#F5F5F5',
  ink: '#0A0A0A',
  ink2: '#171717',
  ink3: '#404040',
  muted: '#737373',
  mutedLight: '#A3A3A3',
  line: '#E5E5E5',
  lineSoft: '#F0F0F0',
  accent: '#D97706',
  accentHover: '#B45309',
  accentSoft: '#FEF3C7',
  accentSubtle: '#FFFBEB',
  success: '#059669',
  successSoft: '#D1FAE5',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
};

// ============================================================
// GLOBAL STYLES & ANIMATIONS
// ============================================================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { font-family: 'Geist', -apple-system, sans-serif; background: ${T.bg}; color: ${T.ink}; -webkit-font-smoothing: antialiased; }
    button { font-family: inherit; }
    input, select, textarea { font-family: inherit; }
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: ${T.bg}; }
    ::-webkit-scrollbar-thumb { background: ${T.line}; border-radius: 10px; border: 2px solid ${T.bg}; }
    ::-webkit-scrollbar-thumb:hover { background: ${T.mutedLight}; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeInDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes slideInToast { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }

    .fade-in { animation: fadeIn 0.3s ease; }
    .fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .fade-in-down { animation: fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .slide-in-right { animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    .scale-in { animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    .stagger-1 { animation-delay: 0.05s; animation-fill-mode: backwards; }
    .stagger-2 { animation-delay: 0.1s; animation-fill-mode: backwards; }
    .stagger-3 { animation-delay: 0.15s; animation-fill-mode: backwards; }
    .stagger-4 { animation-delay: 0.2s; animation-fill-mode: backwards; }
  `}</style>
);

// ============================================================
// UI COMPONENTS
// ============================================================
const Button = ({ children, onClick, variant = 'primary', size = 'md', disabled, loading, style = {}, type = 'button', fullWidth }) => {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const sizes = { sm: { padding: '7px 12px', fontSize: '12px', height: '30px' }, md: { padding: '10px 16px', fontSize: '13px', height: '38px' }, lg: { padding: '14px 22px', fontSize: '14px', height: '46px' } };
  const variants = {
    primary: { bg: T.ink, color: '#FFF', border: T.ink, hoverBg: T.ink2 },
    accent: { bg: T.accent, color: '#FFF', border: T.accent, hoverBg: T.accentHover },
    ghost: { bg: 'transparent', color: T.ink, border: T.line, hoverBg: T.surface },
    danger: { bg: '#FFF', color: T.danger, border: '#FECACA', hoverBg: T.dangerSoft },
    success: { bg: T.success, color: '#FFF', border: T.success, hoverBg: '#047857' },
  };
  const v = variants[variant];
  const s = sizes[size];
  return (
    <button
      type={type} onClick={onClick} disabled={disabled || loading}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
      style={{
        ...s, width: fullWidth ? '100%' : 'auto',
        background: disabled ? T.surface : (hover ? v.hoverBg : v.bg),
        color: disabled ? T.mutedLight : v.color,
        border: `1px solid ${disabled ? T.line : v.border}`, borderRadius: '8px',
        fontWeight: 500, letterSpacing: '-0.005em',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        ...style
      }}>
      {loading && <div style={{ width: '14px', height: '14px', border: `2px solid ${v.color}33`, borderTopColor: v.color, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />}
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, type = 'text', label, error, autoFocus, onKeyDown }) => {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: T.ink3, marginBottom: '6px' }}>{label}</label>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} autoFocus={autoFocus} onKeyDown={onKeyDown}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: '100%', padding: '11px 14px', fontSize: '14px',
          border: `1px solid ${error ? T.danger : (focus ? T.ink : T.line)}`, borderRadius: '8px',
          outline: 'none', background: '#FFF', color: T.ink,
          transition: 'all 0.15s ease',
          boxShadow: focus ? `0 0 0 3px ${error ? T.dangerSoft : '#00000008'}` : 'none'
        }} />
      {error && <div style={{ fontSize: '12px', color: T.danger, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>⚠ {error}</div>}
    </div>
  );
};

const Card = ({ children, style = {}, padding = '24px', hoverable, onClick, className = '' }) => {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className={className}
      style={{
        background: '#FFF', border: `1px solid ${hoverable && hover ? T.ink3 : T.line}`, borderRadius: '12px',
        padding, transition: 'all 0.2s ease', cursor: hoverable ? 'pointer' : 'default',
        transform: hoverable && hover ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hoverable && hover ? '0 4px 12px rgba(0,0,0,0.04)' : 'none',
        ...style
      }}>{children}</div>
  );
};

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: { bg: T.surface, color: T.ink3, border: T.line },
    success: { bg: T.successSoft, color: '#047857', border: '#A7F3D0' },
    danger: { bg: T.dangerSoft, color: '#B91C1C', border: '#FECACA' },
    accent: { bg: T.accentSoft, color: T.accentHover, border: '#FDE68A' },
  };
  const v = variants[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 9px', fontSize: '11px', fontWeight: 500,
      background: v.bg, color: v.color, border: `1px solid ${v.border}`, borderRadius: '6px', letterSpacing: '-0.005em'
    }}>{children}</span>
  );
};

const Toast = ({ toast, onDismiss }) => {
  useEffect(() => { if (toast) { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t); } }, [toast, onDismiss]);
  if (!toast) return null;
  const colors = { success: { bg: T.success, icon: '✓' }, error: { bg: T.danger, icon: '✕' }, info: { bg: T.ink, icon: 'ℹ' } };
  const c = colors[toast.type] || colors.info;
  return (
    <div className="slide-in-right" style={{ position: 'fixed', top: '20px', right: '20px', background: '#FFF', border: `1px solid ${T.line}`, borderRadius: '10px', padding: '14px 18px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 9999, minWidth: '280px', maxWidth: '400px' }}>
      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: c.bg, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>{c.icon}</div>
      <div style={{ flex: 1, fontSize: '13px', color: T.ink, fontWeight: 500 }}>{toast.message}</div>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.mutedLight, fontSize: '18px', padding: 0, lineHeight: 1 }}>×</button>
    </div>
  );
};

const Spinner = ({ size = 40 }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
    <div style={{ width: size, height: size, border: `3px solid ${T.line}`, borderTopColor: T.ink, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

const EmptyState = ({ title, description, action }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: T.surface, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: T.mutedLight }}>○</div>
    <h3 style={{ fontSize: '16px', fontWeight: 600, color: T.ink, marginBottom: '6px' }}>{title}</h3>
    <p style={{ fontSize: '13px', color: T.muted, marginBottom: action ? '20px' : 0, maxWidth: '340px', margin: action ? '0 auto 20px' : '0 auto' }}>{description}</p>
    {action}
  </div>
);

// ============================================================
// AUTH PAGES
// ============================================================
const AuthPage = ({ showToast }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const friendlyError = (err) => {
    const m = (err?.message || '').toLowerCase();
    if (m.includes('invalid login')) return 'Wrong email or password. Please try again.';
    if (m.includes('email not confirmed')) return 'Please verify your email first.';
    if (m.includes('user already')) return 'This email is already registered. Try logging in instead.';
    if (m.includes('password should be at least')) return 'Password must be at least 6 characters long.';
    if (m.includes('unable to validate email')) return 'Please enter a valid email address.';
    if (m.includes('rate limit')) return 'Too many attempts. Please wait a moment and try again.';
    return err?.message || 'Something went wrong. Please try again.';
  };

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    if (mode === 'signup' && !fullName) { setError('Please enter your full name.'); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showToast('Welcome back!', 'success');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName, role } }
        });
        if (error) throw error;
        if (data.user && !data.session) {
          showToast('Account created. Check your email to verify.', 'info');
        } else {
          showToast('Account created successfully!', 'success');
        }
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="fade-in-up" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', background: T.ink, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, fontFamily: 'Geist Mono, monospace', fontSize: '18px', fontWeight: 700 }}>C</div>
            <span style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em' }}>ClassTrack</span>
          </div>
        </div>

        <div style={{ border: `1px solid ${T.line}`, borderRadius: '16px', padding: '36px 32px', background: '#FFF' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '6px', letterSpacing: '-0.02em' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ fontSize: '13px', color: T.muted, marginBottom: '28px' }}>
            {mode === 'login' ? 'Sign in to access your dashboard' : 'Start tracking attendance and progress'}
          </p>

          {mode === 'signup' && (
            <>
              <Input label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" autoFocus />
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: T.ink3, marginBottom: '6px' }}>Account Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['student', 'teacher'].map(r => (
                    <button key={r} onClick={() => setRole(r)} type="button" style={{
                      padding: '10px', border: `1px solid ${role === r ? T.ink : T.line}`, borderRadius: '8px',
                      background: role === r ? T.ink : '#FFF', color: role === r ? '#FFF' : T.ink3,
                      fontSize: '13px', fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize',
                      transition: 'all 0.15s ease'
                    }}>{r}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoFocus={mode === 'login'}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} error={error} />

          <Button onClick={handleSubmit} variant="primary" size="lg" loading={loading} fullWidth style={{ marginTop: '8px' }}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: T.muted }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} style={{
              background: 'none', border: 'none', color: T.ink, fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '13px'
            }}>{mode === 'login' ? 'Sign up' : 'Sign in'}</button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: T.mutedLight, letterSpacing: '0.02em' }}>
          Powered by Supabase · Secured with RLS
        </div>
      </div>
    </div>
  );
};

// ============================================================
// LAYOUT
// ============================================================
const Sidebar = ({ profile, currentPage, setPage, onLogout }) => {
  const teacherNav = [
    { id: 'dashboard', label: 'Dashboard', icon: '◆' },
    { id: 'students', label: 'Students', icon: '◎' },
    { id: 'assignments', label: 'Assignments', icon: '▤' },
    { id: 'reports', label: 'Reports', icon: '◑' },
  ];
  const studentNav = [
    { id: 'home', label: 'Home', icon: '◆' },
    { id: 'attendance', label: 'My Attendance', icon: '◐' },
    { id: 'progress', label: 'My Progress', icon: '◑' },
  ];
  const nav = profile.role === 'teacher' ? teacherNav : studentNav;

  return (
    <aside style={{ width: '240px', background: '#FFF', borderRight: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', padding: '20px 14px', position: 'sticky', top: 0, height: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px 20px', borderBottom: `1px solid ${T.lineSoft}`, marginBottom: '14px' }}>
        <div style={{ width: '30px', height: '30px', background: T.ink, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, fontFamily: 'Geist Mono, monospace', fontSize: '15px', fontWeight: 700 }}>C</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '-0.01em' }}>ClassTrack</div>
          <div style={{ fontSize: '10px', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{profile.role}</div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {nav.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '11px',
            padding: '9px 11px', marginBottom: '2px', border: 'none',
            background: currentPage === item.id || currentPage === 'student-detail' && item.id === 'students' ? T.surface : 'transparent',
            borderRadius: '7px', cursor: 'pointer', textAlign: 'left',
            fontSize: '13px', fontWeight: currentPage === item.id ? 600 : 400,
            color: currentPage === item.id ? T.ink : T.ink3,
            transition: 'all 0.12s', fontFamily: 'inherit'
          }}
            onMouseEnter={e => { if (currentPage !== item.id) e.currentTarget.style.background = T.surface; }}
            onMouseLeave={e => { if (currentPage !== item.id) e.currentTarget.style.background = 'transparent'; }}>
            <span style={{ fontSize: '11px', color: currentPage === item.id ? T.accent : T.mutedLight, width: '14px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ borderTop: `1px solid ${T.lineSoft}`, paddingTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px', marginBottom: '6px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: T.ink, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 }}>
            {profile.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.full_name}</div>
            <div style={{ fontSize: '10px', color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.email}</div>
          </div>
        </div>
        <Button onClick={onLogout} variant="ghost" size="sm" fullWidth>Sign out</Button>
      </div>
    </aside>
  );
};

const PageHeader = ({ title, subtitle, action }) => (
  <div className="fade-in-down" style={{ padding: '28px 36px 20px', borderBottom: `1px solid ${T.lineSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
    <div>
      {subtitle && <div style={{ fontSize: '11px', fontWeight: 500, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{subtitle}</div>}
      <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em', color: T.ink }}>{title}</h1>
    </div>
    {action}
  </div>
);

const StatCard = ({ label, value, suffix, accent, delay = 0 }) => (
  <Card className={`fade-in-up stagger-${delay}`} padding="20px" style={accent ? { background: T.ink, borderColor: T.ink, color: '#FFF' } : {}}>
    <div style={{ fontSize: '11px', color: accent ? 'rgba(255,255,255,0.6)' : T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: '8px' }}>{label}</div>
    <div style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', color: accent ? '#FFF' : T.ink }}>
      {value}{suffix && <span style={{ fontSize: '15px', color: accent ? 'rgba(255,255,255,0.5)' : T.mutedLight, marginLeft: '2px' }}>{suffix}</span>}
    </div>
  </Card>
);

// ============================================================
// TEACHER: DASHBOARD
// ============================================================
const TeacherDashboard = ({ profile, setPage, setSelectedStudent, showToast }) => {
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
    const { data: pendingHw } = await supabase.from('assignments').select('id').eq('status', 'pending');

    const totalPossible = students.length * 12;
    const avgAtt = totalPossible > 0 ? Math.round((monthAtt?.length || 0) / totalPossible * 100) : 0;

    setStats({
      students: students.length,
      todayAtt: todayAtt?.length || 0,
      avgAtt,
      pendingHw: pendingHw?.length || 0
    });
    setTodayCheckins(todayAtt || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div><PageHeader title="Dashboard" subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} /><Spinner /></div>;

  return (
    <div>
      <PageHeader title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${profile.full_name?.split(' ')[0] || 'Teacher'}`} subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} />
      <div style={{ padding: '28px 36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '32px' }}>
          <StatCard label="Students" value={stats.students} delay={1} />
          <StatCard label="Today's Check-ins" value={stats.todayAtt} suffix={`/ ${stats.students}`} accent delay={2} />
          <StatCard label="Avg. Attendance" value={stats.avgAtt} suffix="%" delay={3} />
          <StatCard label="Pending Homework" value={stats.pendingHw} delay={4} />
        </div>

        <div className="fade-in-up stagger-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '-0.01em' }}>Today's check-ins</h3>
            <button onClick={() => setPage('students')} style={{ fontSize: '12px', color: T.muted, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>View all →</button>
          </div>
          {todayCheckins.length === 0 ? (
            <Card><EmptyState title="No check-ins yet today" description="Students will appear here once they punch in for class." /></Card>
          ) : (
            <Card padding="0">
              {todayCheckins.map((c, i) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < todayCheckins.length - 1 ? `1px solid ${T.lineSoft}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: T.accentSoft, color: T.accentHover, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>
                      {c.student?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{c.student?.full_name || 'Unknown'}</div>
                      <div style={{ fontSize: '11px', color: T.muted }}>{c.subject || 'Class'}</div>
                    </div>
                  </div>
                  <Badge variant="success">{c.punch_time?.substring(0, 5) || 'checked in'}</Badge>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// TEACHER: STUDENTS LIST
// ============================================================
const StudentsList = ({ setSelectedStudent, setPage, showToast }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ email: '', fullName: '', parentEmail: '', grade: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false });
    // Fetch attendance counts for this month
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
    if (!form.email || !form.fullName || !form.password) {
      showToast('Email, name, and password are required', 'error'); return;
    }
    if (form.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error'); return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { full_name: form.fullName, role: 'student' } }
      });
      if (error) throw error;
      // Update profile with extra fields
      if (data.user) {
        await supabase.from('profiles').update({
          grade: form.grade, parent_email: form.parentEmail,
          avatar: form.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }).eq('id', data.user.id);
      }
      showToast(`${form.fullName} added successfully`, 'success');
      setForm({ email: '', fullName: '', parentEmail: '', grade: '', password: '' });
      setShowAdd(false);
      loadStudents();
    } catch (err) {
      showToast(err.message || 'Failed to add student', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Students" subtitle={`${students.length} enrolled`} action={
        <Button onClick={() => setShowAdd(!showAdd)} variant={showAdd ? 'ghost' : 'accent'}>{showAdd ? 'Cancel' : '+ Add student'}</Button>
      } />
      <div style={{ padding: '28px 36px' }}>
        {showAdd && (
          <Card className="scale-in" style={{ marginBottom: '20px', borderColor: T.ink3 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', letterSpacing: '-0.01em' }}>Register new student</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Input label="Full Name *" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Adeena Javaid" />
              <Input label="Student Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="student@gmail.com" />
              <Input label="Temporary Password *" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
              <Input label="Grade" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} placeholder="Grade 11" />
              <Input label="Parent Email" type="email" value={form.parentEmail} onChange={e => setForm({ ...form, parentEmail: e.target.value })} placeholder="parent@gmail.com" />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <Button onClick={handleAdd} variant="primary" loading={submitting}>Create Account</Button>
              <Button onClick={() => setShowAdd(false)} variant="ghost">Cancel</Button>
            </div>
            <div style={{ fontSize: '11px', color: T.muted, marginTop: '12px', padding: '10px 12px', background: T.accentSubtle, borderRadius: '6px' }}>
              ℹ Share the email + password with the student so they can log in.
            </div>
          </Card>
        )}

        <div style={{ marginBottom: '16px' }}>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students by name or email..." />
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <Card><EmptyState title={search ? 'No matches' : 'No students yet'} description={search ? 'Try a different search.' : 'Add your first student to start tracking.'} action={!search && <Button onClick={() => setShowAdd(true)} variant="accent">+ Add student</Button>} /></Card>
        ) : (
          <Card padding="0">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1fr', padding: '12px 20px', borderBottom: `1px solid ${T.line}`, background: T.surface }}>
              {['Student', 'Grade', 'Parent Email', 'This Month'].map(h => (
                <div key={h} style={{ fontSize: '10px', fontWeight: 600, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
              ))}
            </div>
            {filtered.map((s, i) => (
              <div key={s.id} onClick={() => { setSelectedStudent(s); setPage('student-detail'); }} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1fr', padding: '14px 20px',
                borderBottom: i < filtered.length - 1 ? `1px solid ${T.lineSoft}` : 'none', alignItems: 'center', cursor: 'pointer', transition: 'background 0.12s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = T.surface}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: T.accentSoft, color: T.accentHover, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 }}>
                    {s.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{s.full_name}</div>
                    <div style={{ fontSize: '11px', color: T.muted }}>{s.email}</div>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: T.ink3 }}>{s.grade || '—'}</div>
                <div style={{ fontSize: '12px', color: T.muted }}>{s.parent_email || '—'}</div>
                <div><Badge variant={s.attendance_count >= 8 ? 'success' : s.attendance_count >= 4 ? 'accent' : 'default'}>{s.attendance_count} classes</Badge></div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

// ============================================================
// TEACHER: STUDENT DETAIL
// ============================================================
const StudentDetail = ({ student, setPage, showToast }) => {
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

  const submitted = assignments.filter(a => a.status === 'submitted' || a.status === 'graded');
  const avgScore = submitted.length && submitted.every(a => a.score != null)
    ? Math.round(submitted.reduce((s, a) => s + (Number(a.score) / Number(a.total_marks) * 100), 0) / submitted.length) : 0;

  const emailParent = () => {
    if (!student.parent_email) { showToast('No parent email on file', 'error'); return; }
    const monthAtt = attendance.filter(a => a.date.startsWith(new Date().toISOString().substring(0, 7)));
    const subject = `${student.full_name} — Monthly Progress Report`;
    const body = `Dear Parent,%0D%0A%0D%0AHere is ${student.full_name}'s progress this month:%0D%0A%0D%0A- Classes attended: ${monthAtt.length}%0D%0A- Assignments submitted: ${submitted.length}/${assignments.length}%0D%0A- Average score: ${avgScore}%25%0D%0A%0D%0APlease reach out with any questions.%0D%0A%0D%0ABest regards,%0D%0AApeksha`;
    window.open(`mailto:${student.parent_email}?subject=${encodeURIComponent(subject)}&body=${body}`, '_blank');
  };

  return (
    <div>
      <div style={{ padding: '20px 36px 0' }}>
        <button onClick={() => setPage('students')} style={{ background: 'none', border: 'none', color: T.muted, fontSize: '12px', cursor: 'pointer', padding: 0, marginBottom: '14px', fontFamily: 'inherit', fontWeight: 500 }}>← Back to students</button>
      </div>
      <div className="fade-in-down" style={{ padding: '0 36px 22px', borderBottom: `1px solid ${T.lineSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: T.ink, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 600, fontFamily: 'Geist Mono, monospace' }}>
            {student.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 500, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{student.grade || 'Student'}</div>
            <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em' }}>{student.full_name}</h1>
            <div style={{ fontSize: '12px', color: T.muted, marginTop: '4px' }}>{student.email}</div>
          </div>
        </div>
        <Button onClick={emailParent} variant="accent">✉ Email parent</Button>
      </div>

      <div style={{ padding: '0 36px', borderBottom: `1px solid ${T.lineSoft}`, display: 'flex', gap: '2px' }}>
        {['overview', 'attendance', 'assignments'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '13px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px',
            fontWeight: tab === t ? 600 : 500, color: tab === t ? T.ink : T.muted,
            borderBottom: tab === t ? `2px solid ${T.accent}` : '2px solid transparent',
            textTransform: 'capitalize', marginBottom: '-1px', fontFamily: 'inherit', transition: 'all 0.15s'
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: '28px 36px' }}>
        {loading ? <Spinner /> : (
          <>
            {tab === 'overview' && (
              <div className="fade-in">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
                  <StatCard label="Classes Attended" value={attendance.length} delay={1} />
                  <StatCard label="Average Score" value={avgScore} suffix="%" delay={2} />
                  <StatCard label="HW Submitted" value={submitted.length} suffix={`/ ${assignments.length}`} delay={3} />
                  <StatCard label="Last Active" value={attendance[0]?.date ? new Date(attendance[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'} delay={4} />
                </div>
                <Card>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>Contact details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px', fontWeight: 500 }}>Student Email</div>
                      <div style={{ fontSize: '13px' }}>{student.email}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px', fontWeight: 500 }}>Parent Email</div>
                      <div style={{ fontSize: '13px' }}>{student.parent_email || <span style={{ color: T.mutedLight }}>Not provided</span>}</div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            {tab === 'attendance' && <AttendanceGrid attendance={attendance} />}
            {tab === 'assignments' && <AssignmentsList assignments={assignments} />}
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================
// ATTENDANCE CALENDAR GRID (shared)
// ============================================================
const AttendanceGrid = ({ attendance }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthRecs = attendance.filter(a => a.date.startsWith(monthKey));
  const recMap = {};
  monthRecs.forEach(r => { recMap[parseInt(r.date.split('-')[2])] = r; });
  const cells = []; for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600 }}>{monthName}</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button onClick={() => setViewDate(new Date(year, month - 1, 1))} variant="ghost" size="sm">←</Button>
          <Button onClick={() => setViewDate(new Date())} variant="ghost" size="sm">Today</Button>
          <Button onClick={() => setViewDate(new Date(year, month + 1, 1))} variant="ghost" size="sm">→</Button>
        </div>
      </div>
      <Card padding="20px">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '10px' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ fontSize: '10px', fontWeight: 600, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px', textAlign: 'center' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const record = recMap[day];
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            return (
              <div key={i} style={{
                aspectRatio: '1', borderRadius: '8px',
                background: record ? T.ink : (isToday ? T.accentSubtle : T.surface),
                border: `1px solid ${record ? T.ink : (isToday ? T.accent : T.lineSoft)}`,
                padding: '6px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                transition: 'all 0.15s'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: record ? '#FFF' : T.ink }}>{day}</div>
                {record && <div style={{ fontSize: '9px', fontWeight: 600, color: T.accent, fontFamily: 'Geist Mono, monospace' }}>{record.punch_time?.substring(0, 5)}</div>}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '14px', borderTop: `1px solid ${T.lineSoft}`, fontSize: '11px', color: T.muted }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: T.ink, borderRadius: '3px' }} /> Present</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: T.accentSubtle, border: `1px solid ${T.accent}`, borderRadius: '3px' }} /> Today</div>
        </div>
      </Card>
    </div>
  );
};

const AssignmentsList = ({ assignments }) => (
  <div className="fade-in">
    {assignments.length === 0 ? (
      <Card><EmptyState title="No assignments" description="Assignments will appear here once created." /></Card>
    ) : (
      <Card padding="0">
        {assignments.map((a, i) => (
          <div key={a.id} style={{ padding: '16px 20px', borderBottom: i < assignments.length - 1 ? `1px solid ${T.lineSoft}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>{a.title}</div>
              <div style={{ fontSize: '11px', color: T.muted }}>{a.subject} · Due {new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
            {a.status === 'submitted' || a.status === 'graded'
              ? <div style={{ fontSize: '18px', fontWeight: 600 }}>{a.score}<span style={{ fontSize: '12px', color: T.mutedLight }}>/{a.total_marks}</span></div>
              : <Badge>Pending</Badge>}
          </div>
        ))}
      </Card>
    )}
  </div>
);

// ============================================================
// TEACHER: ASSIGNMENTS
// ============================================================
const TeacherAssignments = ({ profile, showToast }) => {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', subject: 'Mathematics', student_id: '', due_date: '', total_marks: 20 });

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: asn }, { data: sts }] = await Promise.all([
      supabase.from('assignments').select('*, student:profiles!student_id(full_name)').order('due_date', { ascending: false }),
      supabase.from('profiles').select('id, full_name').eq('role', 'student').order('full_name')
    ]);
    setAssignments(asn || []); setStudents(sts || []); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.title || !form.student_id || !form.due_date) { showToast('All fields required', 'error'); return; }
    const { error } = await supabase.from('assignments').insert({ ...form, teacher_id: profile.id });
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Assignment created', 'success');
    setForm({ title: '', subject: 'Mathematics', student_id: '', due_date: '', total_marks: 20 });
    setShowAdd(false); load();
  };

  const gradeIt = async (id, score, total) => {
    const input = prompt(`Enter score (out of ${total}):`);
    if (input === null) return;
    const s = parseFloat(input);
    if (isNaN(s) || s < 0 || s > total) { showToast('Invalid score', 'error'); return; }
    const { error } = await supabase.from('assignments').update({ score: s, status: 'graded', graded_at: new Date().toISOString() }).eq('id', id);
    if (error) showToast(error.message, 'error'); else { showToast('Graded ✓', 'success'); load(); }
  };

  return (
    <div>
      <PageHeader title="Assignments" subtitle={`${assignments.length} total · ${assignments.filter(a => a.status === 'pending').length} pending`} action={
        <Button onClick={() => setShowAdd(!showAdd)} variant={showAdd ? 'ghost' : 'accent'}>{showAdd ? 'Cancel' : '+ New assignment'}</Button>
      } />
      <div style={{ padding: '28px 36px' }}>
        {showAdd && (
          <Card className="scale-in" style={{ marginBottom: '20px', borderColor: T.ink3 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>New assignment</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: '1 / -1' }}><Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Exponent Laws Practice" /></div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: T.ink3, marginBottom: '6px' }}>Student</label>
                <select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', fontSize: '14px', border: `1px solid ${T.line}`, borderRadius: '8px', background: '#FFF', fontFamily: 'inherit', marginBottom: '16px' }}>
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: T.ink3, marginBottom: '6px' }}>Subject</label>
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', fontSize: '14px', border: `1px solid ${T.line}`, borderRadius: '8px', background: '#FFF', fontFamily: 'inherit', marginBottom: '16px' }}>
                  {['Mathematics', 'Excel', 'Power BI'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input label="Due Date" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
              <Input label="Total Marks" type="number" value={form.total_marks} onChange={e => setForm({ ...form, total_marks: parseInt(e.target.value) || 20 })} />
            </div>
            <Button onClick={handleAdd} variant="primary">Create assignment</Button>
          </Card>
        )}

        {loading ? <Spinner /> : assignments.length === 0 ? (
          <Card><EmptyState title="No assignments yet" description="Create your first assignment to track student progress." action={<Button onClick={() => setShowAdd(true)} variant="accent">+ New assignment</Button>} /></Card>
        ) : (
          <Card padding="0">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: `1px solid ${T.line}`, background: T.surface }}>
              {['Assignment', 'Student', 'Subject', 'Due', 'Score'].map(h => <div key={h} style={{ fontSize: '10px', fontWeight: 600, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>)}
            </div>
            {assignments.map((a, i) => (
              <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: i < assignments.length - 1 ? `1px solid ${T.lineSoft}` : 'none', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{a.title}</div>
                <div style={{ fontSize: '13px', color: T.ink3 }}>{a.student?.full_name || '—'}</div>
                <div style={{ fontSize: '12px', color: T.muted }}>{a.subject}</div>
                <div style={{ fontSize: '12px', color: T.muted }}>{new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div>
                  {a.score != null ? <span style={{ fontSize: '15px', fontWeight: 600 }}>{a.score}<span style={{ fontSize: '11px', color: T.mutedLight }}>/{a.total_marks}</span></span>
                    : <button onClick={() => gradeIt(a.id, a.score, a.total_marks)} style={{ background: 'none', border: `1px solid ${T.line}`, borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', color: T.ink3, fontWeight: 500 }}>Grade</button>}
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

// ============================================================
// TEACHER: REPORTS
// ============================================================
const TeacherReports = ({ showToast }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const monthStart = new Date(); monthStart.setDate(1);
      const monthStartStr = monthStart.toISOString().split('T')[0];
      const { data: sts } = await supabase.from('profiles').select('*').eq('role', 'student');
      const { data: att } = await supabase.from('attendance').select('student_id').gte('date', monthStartStr);
      const { data: asn } = await supabase.from('assignments').select('*');
      const attMap = {}; att?.forEach(a => attMap[a.student_id] = (attMap[a.student_id] || 0) + 1);
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
    const body = `Dear Parent,%0D%0A%0D%0AHere is ${s.full_name}'s progress this month:%0D%0A%0D%0A- Classes attended: ${s.att}%0D%0A- Assignments submitted: ${s.hwDone}/${s.hwTotal}%0D%0A- Average score: ${s.avg}%25%0D%0A%0D%0APlease reach out with any questions.%0D%0A%0D%0ABest regards,%0D%0AApeksha`;
    window.open(`mailto:${s.parent_email}?subject=${encodeURIComponent(subject)}&body=${body}`, '_blank');
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Send monthly progress to parents" />
      <div style={{ padding: '28px 36px' }}>
        {loading ? <Spinner /> : students.length === 0 ? (
          <Card><EmptyState title="No students" description="Add students to generate reports." /></Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
            {students.map((s, i) => (
              <Card key={s.id} className={`fade-in-up stagger-${Math.min(i + 1, 4)}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: T.accentSoft, color: T.accentHover, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>
                    {s.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.full_name}</div>
                    <div style={{ fontSize: '11px', color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.parent_email || 'No parent email'}</div>
                  </div>
                </div>
                <div style={{ background: T.surface, borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                  {[['Attendance', `${s.att} classes`], ['Homework', `${s.hwDone}/${s.hwTotal}`], ['Avg. Score', `${s.avg}%`]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: k === 'Avg. Score' ? 0 : '6px' }}>
                      <span style={{ fontSize: '12px', color: T.muted }}>{k}</span>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={() => sendReport(s)} variant="primary" fullWidth size="sm" disabled={!s.parent_email}>✉ Send report</Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// STUDENT: HOME (PUNCH IN)
// ============================================================
const StudentHome = ({ profile, showToast }) => {
  const [todayRecord, setTodayRecord] = useState(null);
  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState({ month: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(); monthStart.setDate(1);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const [{ data: tod }, { data: rec }, { data: month }, { data: hw }] = await Promise.all([
      supabase.from('attendance').select('*').eq('student_id', profile.id).eq('date', today).maybeSingle(),
      supabase.from('attendance').select('*').eq('student_id', profile.id).order('date', { ascending: false }).limit(6),
      supabase.from('attendance').select('id').eq('student_id', profile.id).gte('date', monthStartStr),
      supabase.from('assignments').select('id').eq('student_id', profile.id).eq('status', 'pending')
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

  if (loading) return <div><PageHeader title={`Hello, ${profile.full_name?.split(' ')[0]}`} /><Spinner /></div>;

  return (
    <div>
      <PageHeader title={`Hello, ${profile.full_name?.split(' ')[0] || 'there'}`} subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} />
      <div style={{ padding: '28px 36px' }}>
        {/* Punch In */}
        <Card className="fade-in-up" style={{ marginBottom: '24px', background: T.ink, borderColor: T.ink, color: '#FFF', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '180px', height: '180px', background: `radial-gradient(circle, ${T.accent}40 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Today's Attendance</div>
            {todayRecord ? (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '16px' }}>✓ You're checked in</h2>
                <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                  <div><span style={{ color: 'rgba(255,255,255,0.5)', marginRight: '8px' }}>Time</span><span style={{ color: '#FFF', fontFamily: 'Geist Mono, monospace', fontWeight: 500 }}>{todayRecord.punch_time?.substring(0, 5)}</span></div>
                  <div><span style={{ color: 'rgba(255,255,255,0.5)', marginRight: '8px' }}>Subject</span><span style={{ color: '#FFF', fontWeight: 500 }}>{todayRecord.subject}</span></div>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '6px' }}>Ready for class?</h2>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>Punch in to mark your attendance for today.</p>
                <Button onClick={handlePunch} variant="accent" size="lg" loading={punching}>Punch In →</Button>
              </>
            )}
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          <StatCard label="Classes This Month" value={stats.month} delay={1} />
          <StatCard label="Pending Homework" value={stats.pending} delay={2} />
        </div>

        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Recent classes</h3>
        {recent.length === 0 ? (
          <Card><EmptyState title="No classes yet" description="Punch in for your first class to see history here." /></Card>
        ) : (
          <Card padding="0">
            {recent.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < recent.length - 1 ? `1px solid ${T.lineSoft}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 600 }}>{new Date(r.date).getDate()}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{r.subject}</div>
                    <div style={{ fontSize: '11px', color: T.muted }}>{new Date(r.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
                <Badge variant="success">{r.punch_time?.substring(0, 5)}</Badge>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

// ============================================================
// STUDENT: ATTENDANCE
// ============================================================
const StudentAttendance = ({ profile }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('attendance').select('*').eq('student_id', profile.id).order('date', { ascending: false });
      setAttendance(data || []); setLoading(false);
    })();
  }, [profile.id]);
  return (
    <div>
      <PageHeader title="My Attendance" subtitle="Monthly view" />
      <div style={{ padding: '28px 36px' }}>{loading ? <Spinner /> : <AttendanceGrid attendance={attendance} />}</div>
    </div>
  );
};

// ============================================================
// STUDENT: PROGRESS
// ============================================================
const StudentProgress = ({ profile }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('assignments').select('*').eq('student_id', profile.id).order('due_date', { ascending: false });
      setAssignments(data || []); setLoading(false);
    })();
  }, [profile.id]);
  const submitted = assignments.filter(a => a.score != null);
  const avg = submitted.length ? Math.round(submitted.reduce((s, a) => s + (a.score / a.total_marks * 100), 0) / submitted.length) : 0;
  return (
    <div>
      <PageHeader title="My Progress" subtitle="Homework & scores" />
      <div style={{ padding: '28px 36px' }}>
        {loading ? <Spinner /> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
              <StatCard label="Average Score" value={avg} suffix="%" delay={1} />
              <StatCard label="Submitted" value={submitted.length} suffix={`/ ${assignments.length}`} delay={2} />
              <StatCard label="Pending" value={assignments.length - submitted.length} delay={3} />
            </div>
            <AssignmentsList assignments={assignments} />
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================
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
      if (session) loadProfile(session.user.id);
      else setLoading(false);
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
    if (error) {
      console.error('Profile load error:', error);
      showToast('Error loading profile', 'error');
    } else {
      setProfile(data);
      setPage(data.role === 'teacher' ? 'dashboard' : 'home');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null); setSession(null);
    showToast('Signed out', 'info');
  };

  if (loading) return (<><GlobalStyles /><div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner size={32} /></div></>);
  if (!session || !profile) return (<><GlobalStyles /><AuthPage showToast={showToast} /><Toast toast={toast} onDismiss={() => setToast(null)} /></>);

  const renderPage = () => {
    if (profile.role === 'teacher') {
      if (page === 'dashboard') return <TeacherDashboard profile={profile} setPage={setPage} setSelectedStudent={setSelectedStudent} showToast={showToast} />;
      if (page === 'students') return <StudentsList setSelectedStudent={setSelectedStudent} setPage={setPage} showToast={showToast} />;
      if (page === 'student-detail' && selectedStudent) return <StudentDetail student={selectedStudent} setPage={setPage} showToast={showToast} />;
      if (page === 'assignments') return <TeacherAssignments profile={profile} showToast={showToast} />;
      if (page === 'reports') return <TeacherReports showToast={showToast} />;
    } else {
      if (page === 'home') return <StudentHome profile={profile} showToast={showToast} />;
      if (page === 'attendance') return <StudentAttendance profile={profile} />;
      if (page === 'progress') return <StudentProgress profile={profile} />;
    }
    return <div style={{ padding: '40px' }}>Page not found</div>;
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
        <Sidebar profile={profile} currentPage={page} setPage={setPage} onLogout={handleLogout} />
        <main style={{ flex: 1, overflow: 'auto' }} key={page}>{renderPage()}</main>
      </div>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
