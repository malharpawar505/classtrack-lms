import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './lib/supabase';

// ============================================================
// DESIGN TOKENS — Professional Indigo/Slate/White
// ============================================================
const t = {
  primary: '#4F46E5', primaryDark: '#4338CA', primaryLight: '#EEF2FF', primaryHover: '#6366F1',
  ink: '#0F172A', body: '#334155', muted: '#64748B', mutedLight: '#94A3B8',
  surface: '#F8FAFC', border: '#E2E8F0', borderLight: '#F1F5F9', white: '#FFFFFF',
  success: '#10B981', successLight: '#D1FAE5', successDark: '#059669',
  error: '#EF4444', errorLight: '#FEE2E2', errorDark: '#DC2626',
  warning: '#F59E0B', warningLight: '#FEF3C7',
};

// ============================================================
// GLOBAL STYLES & ANIMATIONS
// ============================================================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; background: ${t.surface}; color: ${t.ink}; -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: ${t.surface}; }
    ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 5px; }
    ::-webkit-scrollbar-thumb:hover { background: ${t.mutedLight}; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
    .fade-in { animation: fadeIn 0.4s ease-out; }
    .slide-down { animation: slideDown 0.3s ease-out; }
    .slide-right { animation: slideRight 0.3s ease-out; }
    .scale-in { animation: scaleIn 0.2s ease-out; }
    .shake { animation: shake 0.4s ease-out; }
    button:active { transform: scale(0.98); }
    input:focus { outline: none; }
  `}</style>
);

// ============================================================
// TOAST SYSTEM
// ============================================================
const ToastContext = createContext();
const useToast = () => useContext(ToastContext);

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000);
  };
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map(x => (
          <div key={x.id} className="slide-down" style={{
            background: t.white, borderRadius: '10px', padding: '14px 18px',
            boxShadow: '0 10px 40px -10px rgba(15,23,42,0.2)',
            border: `1px solid ${x.type === 'error' ? t.errorLight : x.type === 'success' ? t.successLight : t.border}`,
            borderLeft: `4px solid ${x.type === 'error' ? t.error : x.type === 'success' ? t.success : t.primary}`,
            display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px', maxWidth: '420px'
          }}>
            <div style={{ fontSize: '18px' }}>{x.type === 'error' ? '⚠' : x.type === 'success' ? '✓' : 'ℹ'}</div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: t.ink, flex: 1 }}>{x.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// ============================================================
// AUTH CONTEXT
// ============================================================
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); fetchProfile(session.user.id); }
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) { setUser(session.user); fetchProfile(session.user.id); }
      else { setUser(null); setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email, password, fullName, role) => {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role } }
    });
    if (error) throw error;
    // Auto-enroll student to first available teacher
    if (role === 'student' && data.user) {
      const { data: teacher } = await supabase.from('profiles').select('id').eq('role', 'teacher').limit(1).single();
      if (teacher) {
        await supabase.from('enrollments').insert({ teacher_id: teacher.id, student_id: data.user.id });
      }
    }
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================
// UI PRIMITIVES
// ============================================================
const Button = ({ children, onClick, variant = 'primary', size = 'md', disabled, loading, style = {}, type = 'button' }) => {
  const [hover, setHover] = useState(false);
  const sizes = { sm: { p: '8px 14px', fs: '12px' }, md: { p: '11px 20px', fs: '13px' }, lg: { p: '14px 24px', fs: '14px' } };
  const variants = {
    primary: { bg: t.primary, color: t.white, border: t.primary, hoverBg: t.primaryHover, shadow: hover ? '0 4px 12px -2px rgba(79,70,229,0.4)' : 'none' },
    secondary: { bg: t.white, color: t.ink, border: t.border, hoverBg: t.surface, shadow: 'none' },
    ghost: { bg: 'transparent', color: t.body, border: 'transparent', hoverBg: t.surface, shadow: 'none' },
    danger: { bg: t.white, color: t.error, border: t.errorLight, hoverBg: t.errorLight, shadow: 'none' },
    success: { bg: t.success, color: t.white, border: t.success, hoverBg: t.successDark, shadow: hover ? '0 4px 12px -2px rgba(16,185,129,0.4)' : 'none' }
  };
  const v = variants[variant]; const s = sizes[size];
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        padding: s.p, fontSize: s.fs, fontWeight: 600, borderRadius: '8px', cursor: disabled || loading ? 'not-allowed' : 'pointer',
        background: disabled ? t.borderLight : (hover ? v.hoverBg : v.bg),
        color: disabled ? t.mutedLight : v.color, border: `1px solid ${disabled ? t.border : v.border}`,
        fontFamily: 'inherit', transition: 'all 0.15s ease', boxShadow: v.shadow,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', ...style
      }}>
      {loading && <span style={{ width: '14px', height: '14px', border: `2px solid ${v.color}40`, borderTopColor: v.color, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />}
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, type = 'text', label, error, icon }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: t.body, marginBottom: '6px' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: t.muted, fontSize: '14px' }}>{icon}</div>}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: icon ? '11px 14px 11px 40px' : '11px 14px', fontSize: '14px', fontFamily: 'inherit',
            border: `1.5px solid ${error ? t.error : focused ? t.primary : t.border}`, borderRadius: '8px',
            background: t.white, color: t.ink, transition: 'all 0.15s ease',
            boxShadow: focused ? `0 0 0 3px ${error ? t.errorLight : t.primaryLight}` : 'none'
          }} />
      </div>
      {error && <div style={{ fontSize: '12px', color: t.error, marginTop: '4px', fontWeight: 500 }}>{error}</div>}
    </div>
  );
};

const Card = ({ children, style = {}, padding = '24px', hoverable = false }) => {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => hoverable && setHover(true)} onMouseLeave={() => hoverable && setHover(false)}
      style={{
        background: t.white, border: `1px solid ${t.border}`, borderRadius: '12px', padding,
        transition: 'all 0.2s ease', boxShadow: hover ? '0 8px 24px -8px rgba(15,23,42,0.12)' : '0 1px 2px rgba(15,23,42,0.04)',
        transform: hover ? 'translateY(-2px)' : 'none', cursor: hoverable ? 'pointer' : 'default', ...style
      }}>{children}</div>
  );
};

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: { bg: t.primaryLight, color: t.primaryDark }, success: { bg: t.successLight, color: t.successDark },
    error: { bg: t.errorLight, color: t.errorDark }, warning: { bg: t.warningLight, color: '#92400E' },
    neutral: { bg: t.borderLight, color: t.body }
  };
  const v = variants[variant];
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', fontSize: '11px', fontWeight: 600, background: v.bg, color: v.color, borderRadius: '6px', letterSpacing: '0.01em' }}>{children}</span>;
};

const Spinner = ({ size = 24 }) => (
  <div style={{ width: `${size}px`, height: `${size}px`, border: `2.5px solid ${t.border}`, borderTopColor: t.primary, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
);

const EmptyState = ({ icon, title, message, action }) => (
  <div style={{ textAlign: 'center', padding: '48px 24px' }}>
    <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>{icon}</div>
    <h3 style={{ fontSize: '16px', fontWeight: 600, color: t.ink, marginBottom: '6px' }}>{title}</h3>
    <p style={{ fontSize: '13px', color: t.muted, marginBottom: action ? '20px' : 0 }}>{message}</p>
    {action}
  </div>
);

// ============================================================
// LOGIN / SIGNUP SCREEN
// ============================================================
const AuthScreen = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const { signIn, signUp } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
        toast('Welcome back!', 'success');
      } else {
        if (!fullName.trim()) throw new Error('Please enter your full name');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await signUp(email, password, fullName, role);
        toast(`Account created! ${role === 'teacher' ? 'Welcome, teacher.' : 'Welcome to ClassTrack.'}`, 'success');
      }
    } catch (err) {
      const msg = err.message?.includes('Invalid login credentials') ? 'Wrong email or password. Please try again.'
        : err.message?.includes('already registered') ? 'An account with this email already exists. Try logging in.'
        : err.message?.includes('Email not confirmed') ? 'Please check your email and confirm your account first.'
        : err.message || 'Something went wrong. Please try again.';
      setError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: `linear-gradient(135deg, ${t.surface} 0%, ${t.primaryLight} 100%)` }}>
      <div className="scale-in" style={{ width: '100%', maxWidth: '960px', display: 'grid', gridTemplateColumns: '1fr 1fr', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 24px 80px -20px rgba(15,23,42,0.25)', background: t.white, minHeight: '620px' }}>
        {/* Left panel */}
        <div style={{ background: `linear-gradient(135deg, ${t.primary} 0%, ${t.primaryDark} 100%)`, padding: '56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '80px' }}>
              <div style={{ width: '40px', height: '40px', background: t.white, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.primary, fontSize: '20px', fontWeight: 800 }}>C</div>
              <span style={{ fontSize: '16px', fontWeight: 700, color: t.white, letterSpacing: '-0.01em' }}>ClassTrack</span>
            </div>
            <h1 style={{ fontSize: '40px', fontWeight: 800, color: t.white, lineHeight: '1.1', letterSpacing: '-0.02em', marginBottom: '20px' }}>
              Where learning<br />gets measured.
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6', maxWidth: '360px' }}>
              Attendance tracking, progress reports, and parent communication — all in one beautifully simple platform.
            </p>
          </div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '24px' }}>
            {['Track', 'Measure', 'Communicate'].map((label, i) => (
              <div key={label}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: t.white }}>0{i + 1}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ padding: '56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: t.primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              {mode === 'login' ? 'Welcome back' : 'Get started'}
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: t.ink, letterSpacing: '-0.01em' }}>
              {mode === 'login' ? 'Sign in to ClassTrack' : 'Create your account'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className={shake ? 'shake' : ''}>
            {mode === 'signup' && (
              <>
                <Input label="Full name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" />
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: t.body, marginBottom: '6px' }}>I am a</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {['student', 'teacher'].map(r => (
                      <button key={r} type="button" onClick={() => setRole(r)} style={{
                        padding: '11px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                        border: `1.5px solid ${role === r ? t.primary : t.border}`,
                        background: role === r ? t.primaryLight : t.white, color: role === r ? t.primary : t.body,
                        transition: 'all 0.15s', fontFamily: 'inherit', textTransform: 'capitalize'
                      }}>{r}</button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" error={error} />

            <Button type="submit" variant="primary" loading={loading} style={{ width: '100%', marginTop: '8px' }}>
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: t.muted }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              style={{ background: 'none', border: 'none', color: t.primary, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px' }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SIDEBAR
// ============================================================
const Sidebar = ({ currentPage, setPage }) => {
  const { profile, signOut } = useAuth();
  const toast = useToast();
  const teacherNav = [
    { id: 'dashboard', label: 'Dashboard', icon: '◈' },
    { id: 'students', label: 'Students', icon: '◉' },
    { id: 'assignments', label: 'Assignments', icon: '◧' },
    { id: 'reports', label: 'Reports', icon: '◐' },
  ];
  const studentNav = [
    { id: 'home', label: 'Home', icon: '◈' },
    { id: 'attendance', label: 'My Attendance', icon: '◑' },
    { id: 'progress', label: 'My Progress', icon: '◐' },
  ];
  const nav = profile?.role === 'teacher' ? teacherNav : studentNav;

  return (
    <aside style={{ width: '240px', background: t.white, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', padding: '20px 14px', position: 'sticky', top: 0, height: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px 20px', borderBottom: `1px solid ${t.border}`, marginBottom: '16px' }}>
        <div style={{ width: '34px', height: '34px', background: `linear-gradient(135deg, ${t.primary}, ${t.primaryDark})`, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.white, fontSize: '17px', fontWeight: 800 }}>C</div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: t.ink }}>ClassTrack</div>
          <div style={{ fontSize: '10px', color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{profile?.role}</div>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {nav.map(item => {
          const active = currentPage === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px',
              border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: '13px',
              fontWeight: active ? 600 : 500, color: active ? t.primary : t.body,
              background: active ? t.primaryLight : 'transparent', transition: 'all 0.12s'
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = t.surface; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
              <span style={{ fontSize: '14px', color: active ? t.primary : t.mutedLight }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px 10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `linear-gradient(135deg, ${t.primary}, ${t.primaryDark})`, color: t.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
            {profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: t.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name}</div>
            <div style={{ fontSize: '11px', color: t.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email}</div>
          </div>
        </div>
        <Button onClick={async () => { await signOut(); toast('Signed out', 'info'); }} variant="secondary" size="sm" style={{ width: '100%' }}>Sign out</Button>
      </div>
    </aside>
  );
};

const PageHeader = ({ title, subtitle, action }) => (
  <div style={{ padding: '28px 36px', borderBottom: `1px solid ${t.border}`, background: t.white, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px' }}>
    <div>
      {subtitle && <div style={{ fontSize: '12px', fontWeight: 600, color: t.primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{subtitle}</div>}
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: t.ink, letterSpacing: '-0.02em' }}>{title}</h1>
    </div>
    {action}
  </div>
);

const StatCard = ({ label, value, suffix, variant = 'default' }) => {
  const colors = { default: t.primary, success: t.success, warning: t.warning, error: t.error };
  return (
    <Card padding="20px" hoverable>
      <div style={{ fontSize: '11px', fontWeight: 600, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <div style={{ fontSize: '30px', fontWeight: 800, color: colors[variant], letterSpacing: '-0.02em' }}>{value}</div>
        {suffix && <div style={{ fontSize: '14px', fontWeight: 600, color: t.muted }}>{suffix}</div>}
      </div>
    </Card>
  );
};

// ============================================================
// ATTENDANCE CALENDAR (shared)
// ============================================================
const AttendanceCalendarView = ({ studentId }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const year = viewDate.getFullYear(); const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const end = `${year}-${String(month + 1).padStart(2, '0')}-${daysInMonth}`;
      const { data } = await supabase.from('attendance').select('*').eq('student_id', studentId).gte('date', start).lte('date', end);
      setRecords(data || []);
      setLoading(false);
    };
    load();
  }, [studentId, year, month]);

  const recMap = {};
  records.forEach(r => { recMap[parseInt(r.date.split('-')[2])] = r; });
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const classDays = cells.filter(d => d && [0, 5, 6].includes(new Date(year, month, d).getDay())).length;
  const presentCount = records.length;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <StatCard label="Present" value={presentCount} variant="success" />
        <StatCard label="Scheduled" value={classDays} />
        <StatCard label="Missed" value={Math.max(0, classDays - presentCount)} variant="error" />
        <StatCard label="Rate" value={classDays ? Math.round((presentCount / classDays) * 100) : 0} suffix="%" />
      </div>

      <Card padding="20px">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: t.ink }}>{monthName}</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <Button onClick={() => setViewDate(new Date(year, month - 1, 1))} variant="ghost" size="sm">←</Button>
            <Button onClick={() => setViewDate(new Date())} variant="ghost" size="sm">Today</Button>
            <Button onClick={() => setViewDate(new Date(year, month + 1, 1))} variant="ghost" size="sm">→</Button>
          </div>
        </div>

        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner /></div> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '8px' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ fontSize: '10px', fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px', textAlign: 'center' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {cells.map((day, i) => {
                if (day === null) return <div key={i} />;
                const rec = recMap[day];
                const dayOfWeek = new Date(year, month, day).getDay();
                const isClassDay = [0, 5, 6].includes(dayOfWeek);
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                return (
                  <div key={i} style={{
                    aspectRatio: '1', borderRadius: '8px', padding: '8px',
                    background: rec ? t.primaryLight : (isClassDay ? t.errorLight : t.surface),
                    border: `1.5px solid ${isToday ? t.primary : (rec ? t.primary + '40' : (isClassDay ? t.errorLight : t.border))}`,
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.15s'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: t.ink }}>{day}</div>
                    {rec && <div style={{ fontSize: '9px', fontWeight: 700, color: t.primary }}>{rec.punch_time?.slice(0, 5)}</div>}
                    {!rec && isClassDay && <div style={{ fontSize: '9px', fontWeight: 600, color: t.error }}>missed</div>}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '18px', paddingTop: '16px', borderTop: `1px solid ${t.border}`, fontSize: '11px', color: t.muted, fontWeight: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: t.primaryLight, border: `1.5px solid ${t.primary}40`, borderRadius: '3px' }} /> Present</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: t.errorLight, border: `1.5px solid ${t.errorLight}`, borderRadius: '3px' }} /> Missed</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: '3px' }} /> No class</div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

// ============================================================
// STUDENT: HOME (PUNCH IN)
// ============================================================
const StudentHome = () => {
  const { profile } = useAuth();
  const toast = useToast();
  const [todayRecord, setTodayRecord] = useState(null);
  const [monthCount, setMonthCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const monthStart = today.slice(0, 7) + '-01';

  const loadData = async () => {
    const { data: today_ } = await supabase.from('attendance').select('*').eq('student_id', profile.id).eq('date', today).maybeSingle();
    const { data: month } = await supabase.from('attendance').select('id').eq('student_id', profile.id).gte('date', monthStart);
    setTodayRecord(today_);
    setMonthCount(month?.length || 0);
    setLoading(false);
  };

  useEffect(() => { if (profile) loadData(); }, [profile]);

  const handlePunchIn = async () => {
    setPunching(true);
    const now = new Date();
    const punchTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
    const { data, error } = await supabase.from('attendance').insert({
      student_id: profile.id, date: today, punch_time: punchTime, status: 'present'
    }).select().single();
    if (error) toast('Failed to punch in: ' + error.message, 'error');
    else { setTodayRecord(data); setMonthCount(monthCount + 1); toast('Punched in successfully!', 'success'); }
    setPunching(false);
  };

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="fade-in">
      <PageHeader title={`Hello, ${profile?.full_name?.split(' ')[0]}`} subtitle={dayName} />
      <div style={{ padding: '32px 36px' }}>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div> : (
          <>
            <div style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.primaryDark})`, borderRadius: '16px', padding: '40px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Today's Class</div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: t.white, marginBottom: '8px', letterSpacing: '-0.02em' }}>Class Session</h2>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', marginBottom: '28px' }}>Mark your attendance for today</div>
                {todayRecord ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 16px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: t.white, fontWeight: 700, fontSize: '14px' }}>✓ Checked in at {todayRecord.punch_time?.slice(0, 5)}</span>
                    </div>
                  </div>
                ) : (
                  <button onClick={handlePunchIn} disabled={punching} style={{
                    background: t.white, color: t.primary, border: 'none', padding: '14px 28px', borderRadius: '10px',
                    fontSize: '14px', fontWeight: 700, cursor: punching ? 'wait' : 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 4px 20px -4px rgba(0,0,0,0.2)', transition: 'all 0.15s',
                    display: 'inline-flex', alignItems: 'center', gap: '10px'
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    {punching ? <Spinner size={16} /> : '→'} Punch In Now
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
              <StatCard label="This Month" value={monthCount} suffix="classes" />
              <StatCard label="Status" value={todayRecord ? 'Present' : 'Pending'} variant={todayRecord ? 'success' : 'warning'} />
              <StatCard label="Grade" value={profile?.grade || '—'} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StudentAttendance = () => {
  const { profile } = useAuth();
  return (
    <div className="fade-in">
      <PageHeader title="My Attendance" subtitle="Monthly overview" />
      <div style={{ padding: '32px 36px' }}>
        {profile && <AttendanceCalendarView studentId={profile.id} />}
      </div>
    </div>
  );
};

const StudentProgress = () => {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data } = await supabase.from('assignments').select('*').eq('student_id', profile.id).order('due_date', { ascending: false });
      setAssignments(data || []);
      setLoading(false);
    })();
  }, [profile]);

  const submitted = assignments.filter(a => a.score !== null);
  const avgScore = submitted.length ? Math.round(submitted.reduce((s, a) => s + (a.score / a.total_marks * 100), 0) / submitted.length) : 0;

  return (
    <div className="fade-in">
      <PageHeader title="My Progress" subtitle="Assignments & scores" />
      <div style={{ padding: '32px 36px' }}>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
              <StatCard label="Average Score" value={avgScore} suffix="%" variant="success" />
              <StatCard label="Submitted" value={submitted.length} suffix={`/ ${assignments.length}`} />
              <StatCard label="Pending" value={assignments.length - submitted.length} variant="warning" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: t.ink, marginBottom: '14px' }}>All assignments</h3>
            {assignments.length === 0 ? <Card><EmptyState icon="◧" title="No assignments yet" message="Your teacher hasn't assigned anything yet." /></Card> : (
              <Card padding="0">
                {assignments.map((a, i) => (
                  <div key={a.id} style={{ padding: '16px 20px', borderBottom: i < assignments.length - 1 ? `1px solid ${t.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: t.ink, marginBottom: '3px' }}>{a.title}</div>
                      <div style={{ fontSize: '12px', color: t.muted }}>{a.subject} · Due {new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                    {a.score !== null ? <div style={{ fontSize: '20px', fontWeight: 800, color: t.ink }}>{a.score}<span style={{ fontSize: '13px', color: t.muted, fontWeight: 500 }}>/{a.total_marks}</span></div> : <Badge variant="warning">Pending</Badge>}
                  </div>
                ))}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================
// TEACHER PAGES
// ============================================================
const TeacherDashboard = ({ setPage, setSelectedStudent }) => {
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [pendingHw, setPendingHw] = useState(0);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: enroll } = await supabase.from('enrollments').select('student:profiles!student_id(*)').eq('teacher_id', profile.id).eq('active', true);
      const s = enroll?.map(e => e.student) || [];
      setStudents(s);
      const ids = s.map(x => x.id);
      if (ids.length > 0) {
        const { data: att } = await supabase.from('attendance').select('*').in('student_id', ids).eq('date', today);
        setTodayAttendance(att || []);
        const { data: hw } = await supabase.from('assignments').select('id').in('student_id', ids).eq('status', 'pending');
        setPendingHw(hw?.length || 0);
      }
      setLoading(false);
    })();
  }, [profile, today]);

  return (
    <div className="fade-in">
      <PageHeader title="Dashboard" subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} />
      <div style={{ padding: '32px 36px' }}>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
              <StatCard label="Total Students" value={students.length} />
              <StatCard label="Present Today" value={todayAttendance.length} suffix={`/ ${students.length}`} variant="success" />
              <StatCard label="Pending HW" value={pendingHw} variant="warning" />
              <StatCard label="Rate Today" value={students.length ? Math.round((todayAttendance.length / students.length) * 100) : 0} suffix="%" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: t.ink, marginBottom: '14px' }}>Today's check-ins</h3>
                {students.length === 0 ? <Card><EmptyState icon="◉" title="No students yet" message="Share your signup link with students to get started" action={<Button onClick={() => setPage('students')} variant="primary" size="sm">Go to Students</Button>} /></Card> : (
                  <Card padding="0">
                    {students.map((s, i) => {
                      const checked = todayAttendance.find(a => a.student_id === s.id);
                      return (
                        <div key={s.id} onClick={() => { setSelectedStudent(s); setPage('student-detail'); }} style={{
                          padding: '14px 18px', borderBottom: i < students.length - 1 ? `1px solid ${t.border}` : 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.12s'
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = t.surface}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${t.primary}, ${t.primaryDark})`, color: t.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                              {s.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: t.ink }}>{s.full_name}</div>
                              <div style={{ fontSize: '11px', color: t.muted }}>{s.grade || s.email}</div>
                            </div>
                          </div>
                          {checked ? <Badge variant="success">In · {checked.punch_time?.slice(0, 5)}</Badge> : <Badge variant="neutral">Not yet</Badge>}
                        </div>
                      );
                    })}
                  </Card>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: t.ink, marginBottom: '14px' }}>Quick actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Manage students', sub: `${students.length} enrolled`, page: 'students' },
                    { label: 'Assignments', sub: `${pendingHw} pending`, page: 'assignments' },
                    { label: 'Send reports', sub: 'Email parents', page: 'reports' }
                  ].map(a => (
                    <Card key={a.page} padding="16px" hoverable>
                      <div onClick={() => setPage(a.page)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: t.ink, marginBottom: '2px' }}>{a.label}</div>
                          <div style={{ fontSize: '11px', color: t.muted }}>{a.sub}</div>
                        </div>
                        <div style={{ color: t.primary, fontSize: '16px', fontWeight: 700 }}>→</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const TeacherStudents = ({ setSelectedStudent, setPage }) => {
  const { profile } = useAuth();
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  const loadStudents = async () => {
    const { data } = await supabase.from('enrollments').select('student:profiles!student_id(*)').eq('teacher_id', profile.id).eq('active', true);
    setStudents(data?.map(e => e.student) || []);
    setLoading(false);
  };

  useEffect(() => { if (profile) loadStudents(); }, [profile]);

  const inviteLink = window.location.origin + '?invite=' + profile?.id;
  const copyLink = () => { navigator.clipboard.writeText(inviteLink); toast('Signup link copied!', 'success'); };

  return (
    <div className="fade-in">
      <PageHeader title="Students" subtitle={`${students.length} enrolled`} action={<Button onClick={() => setShowInvite(!showInvite)} variant="primary" size="md">+ Invite student</Button>} />
      <div style={{ padding: '32px 36px' }}>
        {showInvite && (
          <Card style={{ marginBottom: '20px', background: t.primaryLight, borderColor: t.primary + '40' }} padding="20px">
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: t.ink, marginBottom: '6px' }}>Share this signup link</h3>
            <p style={{ fontSize: '12px', color: t.body, marginBottom: '14px' }}>Students who sign up through this link are automatically enrolled with you.</p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ flex: 1, padding: '10px 14px', background: t.white, borderRadius: '8px', fontSize: '12px', color: t.body, border: `1px solid ${t.border}`, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inviteLink}</div>
              <Button onClick={copyLink} variant="primary" size="md">Copy</Button>
            </div>
          </Card>
        )}

        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div> :
          students.length === 0 ? <Card><EmptyState icon="◉" title="No students yet" message="Share the signup link above to enroll your first student" /></Card> : (
          <Card padding="0">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr', padding: '12px 20px', borderBottom: `1px solid ${t.border}`, background: t.surface }}>
              {['Student', 'Grade', 'Email', 'Joined'].map(h => (
                <div key={h} style={{ fontSize: '10px', fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
              ))}
            </div>
            {students.map((s, i) => (
              <div key={s.id} onClick={() => { setSelectedStudent(s); setPage('student-detail'); }} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr', padding: '14px 20px',
                borderBottom: i < students.length - 1 ? `1px solid ${t.border}` : 'none', alignItems: 'center',
                cursor: 'pointer', transition: 'background 0.12s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = t.surface}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `linear-gradient(135deg, ${t.primary}, ${t.primaryDark})`, color: t.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                    {s.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: t.ink }}>{s.full_name}</div>
                </div>
                <div style={{ fontSize: '12px', color: t.body }}>{s.grade || '—'}</div>
                <div style={{ fontSize: '12px', color: t.muted }}>{s.email}</div>
                <div style={{ fontSize: '12px', color: t.muted }}>{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

const StudentDetail = ({ student, setPage }) => {
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [assignments, setAssignments] = useState([]);
  const [attCount, setAttCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: hw } = await supabase.from('assignments').select('*').eq('student_id', student.id);
      const { data: att } = await supabase.from('attendance').select('id').eq('student_id', student.id);
      setAssignments(hw || []);
      setAttCount(att?.length || 0);
    })();
  }, [student.id]);

  const submitted = assignments.filter(a => a.score !== null);
  const avgScore = submitted.length ? Math.round(submitted.reduce((s, a) => s + (a.score / a.total_marks * 100), 0) / submitted.length) : 0;

  const emailParent = () => {
    if (!student.parent_email) { toast('No parent email on file', 'error'); return; }
    const subject = `${student.full_name} — Progress Update`;
    const body = `Dear Parent,\n\n${student.full_name}'s progress:\n\n- Classes attended: ${attCount}\n- Assignments submitted: ${submitted.length}/${assignments.length}\n- Average score: ${avgScore}%\n\nBest regards`;
    window.open(`mailto:${student.parent_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <div className="fade-in">
      <div style={{ padding: '20px 36px 0' }}>
        <button onClick={() => setPage('students')} style={{ background: 'none', border: 'none', color: t.muted, fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>← Back to students</button>
      </div>
      <div style={{ padding: '16px 36px 20px', borderBottom: `1px solid ${t.border}`, background: t.white, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `linear-gradient(135deg, ${t.primary}, ${t.primaryDark})`, color: t.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 800 }}>
            {student.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: t.primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{student.grade || 'Student'}</div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: t.ink, letterSpacing: '-0.02em' }}>{student.full_name}</h1>
            <div style={{ fontSize: '12px', color: t.muted, marginTop: '2px' }}>{student.email}</div>
          </div>
        </div>
        <Button onClick={emailParent} variant="primary">✉ Email parent</Button>
      </div>

      <div style={{ padding: '0 36px', borderBottom: `1px solid ${t.border}`, background: t.white, display: 'flex', gap: '4px' }}>
        {['overview', 'attendance', 'assignments'].map(x => (
          <button key={x} onClick={() => setTab(x)} style={{
            padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px',
            fontWeight: tab === x ? 700 : 500, color: tab === x ? t.primary : t.muted,
            borderBottom: tab === x ? `2px solid ${t.primary}` : '2px solid transparent', textTransform: 'capitalize', marginBottom: '-1px'
          }}>{x}</button>
        ))}
      </div>

      <div style={{ padding: '28px 36px' }}>
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            <StatCard label="Classes" value={attCount} />
            <StatCard label="Avg. Score" value={avgScore} suffix="%" variant="success" />
            <StatCard label="Assignments" value={`${submitted.length}/${assignments.length}`} />
            <StatCard label="Parent" value={student.parent_email ? '✓' : '—'} />
          </div>
        )}
        {tab === 'attendance' && <AttendanceCalendarView studentId={student.id} />}
        {tab === 'assignments' && (
          assignments.length === 0 ? <Card><EmptyState icon="◧" title="No assignments" message="Create one from the Assignments page" /></Card> : (
            <Card padding="0">
              {assignments.map((a, i) => (
                <div key={a.id} style={{ padding: '14px 18px', borderBottom: i < assignments.length - 1 ? `1px solid ${t.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: t.ink }}>{a.title}</div>
                    <div style={{ fontSize: '11px', color: t.muted }}>{a.subject} · Due {new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>
                  {a.score !== null ? <div style={{ fontSize: '18px', fontWeight: 800 }}>{a.score}<span style={{ fontSize: '12px', color: t.muted }}>/{a.total_marks}</span></div> : <Badge variant="warning">Pending</Badge>}
                </div>
              ))}
            </Card>
          )
        )}
      </div>
    </div>
  );
};

const TeacherAssignments = () => {
  const { profile } = useAuth();
  const toast = useToast();
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ student_id: '', title: '', subject: 'Mathematics', due_date: '', total_marks: 20 });
  const [gradingId, setGradingId] = useState(null);
  const [gradeValue, setGradeValue] = useState('');

  const load = async () => {
    const { data: enroll } = await supabase.from('enrollments').select('student:profiles!student_id(*)').eq('teacher_id', profile.id).eq('active', true);
    const s = enroll?.map(e => e.student) || [];
    setStudents(s);
    const ids = s.map(x => x.id);
    if (ids.length > 0) {
      const { data: hw } = await supabase.from('assignments').select('*').in('student_id', ids).order('due_date', { ascending: false });
      setAssignments(hw || []);
    }
    setLoading(false);
  };
  useEffect(() => { if (profile) load(); }, [profile]);

  const createAssignment = async () => {
    if (!form.student_id || !form.title || !form.due_date) { toast('Please fill all fields', 'error'); return; }
    const { error } = await supabase.from('assignments').insert({ ...form, teacher_id: profile.id });
    if (error) toast(error.message, 'error');
    else { toast('Assignment created', 'success'); setShowForm(false); setForm({ student_id: '', title: '', subject: 'Mathematics', due_date: '', total_marks: 20 }); load(); }
  };

  const saveGrade = async (id) => {
    const score = parseFloat(gradeValue);
    if (isNaN(score)) { toast('Enter a valid number', 'error'); return; }
    const { error } = await supabase.from('assignments').update({ score, status: 'graded', graded_at: new Date().toISOString() }).eq('id', id);
    if (error) toast(error.message, 'error');
    else { toast('Grade saved', 'success'); setGradingId(null); setGradeValue(''); load(); }
  };

  return (
    <div className="fade-in">
      <PageHeader title="Assignments" subtitle={`${assignments.length} total`} action={<Button onClick={() => setShowForm(!showForm)} variant="primary">+ New assignment</Button>} />
      <div style={{ padding: '32px 36px' }}>
        {showForm && (
          <Card style={{ marginBottom: '20px', background: t.primaryLight, borderColor: t.primary + '40' }} padding="20px">
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>Create assignment</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: t.body, marginBottom: '6px' }}>Student</label>
                <select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} style={{ width: '100%', padding: '11px 14px', fontSize: '14px', fontFamily: 'inherit', border: `1.5px solid ${t.border}`, borderRadius: '8px', background: t.white }}>
                  <option value="">Select student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Chapter 3 Exercises" />
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: t.body, marginBottom: '6px' }}>Subject</label>
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} style={{ width: '100%', padding: '11px 14px', fontSize: '14px', fontFamily: 'inherit', border: `1.5px solid ${t.border}`, borderRadius: '8px', background: t.white }}>
                  <option>Mathematics</option><option>Excel</option><option>Power BI</option>
                </select>
              </div>
              <Input label="Due date" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
              <Input label="Total marks" type="number" value={form.total_marks} onChange={e => setForm({ ...form, total_marks: parseInt(e.target.value) || 0 })} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button onClick={createAssignment} variant="primary">Create</Button>
              <Button onClick={() => setShowForm(false)} variant="secondary">Cancel</Button>
            </div>
          </Card>
        )}

        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div> :
          assignments.length === 0 ? <Card><EmptyState icon="◧" title="No assignments yet" message="Create your first assignment above" /></Card> : (
          <Card padding="0">
            {assignments.map((a, i) => {
              const student = students.find(s => s.id === a.student_id);
              return (
                <div key={a.id} style={{ padding: '14px 20px', borderBottom: i < assignments.length - 1 ? `1px solid ${t.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: t.ink }}>{a.title}</div>
                    <div style={{ fontSize: '11px', color: t.muted }}>{student?.full_name} · {a.subject} · Due {new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>
                  {gradingId === a.id ? (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input type="number" value={gradeValue} onChange={e => setGradeValue(e.target.value)} placeholder="Score" style={{ width: '60px', padding: '6px 8px', border: `1.5px solid ${t.primary}`, borderRadius: '6px', fontSize: '13px' }} />
                      <span style={{ fontSize: '13px', color: t.muted }}>/{a.total_marks}</span>
                      <Button onClick={() => saveGrade(a.id)} variant="success" size="sm">Save</Button>
                      <Button onClick={() => { setGradingId(null); setGradeValue(''); }} variant="ghost" size="sm">✕</Button>
                    </div>
                  ) : a.score !== null ? (
                    <div onClick={() => { setGradingId(a.id); setGradeValue(a.score.toString()); }} style={{ fontSize: '18px', fontWeight: 800, cursor: 'pointer' }}>{a.score}<span style={{ fontSize: '12px', color: t.muted }}>/{a.total_marks}</span></div>
                  ) : (
                    <Button onClick={() => { setGradingId(a.id); setGradeValue(''); }} variant="secondary" size="sm">Grade</Button>
                  )}
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </div>
  );
};

const TeacherReports = () => {
  const { profile } = useAuth();
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: enroll } = await supabase.from('enrollments').select('student:profiles!student_id(*)').eq('teacher_id', profile.id).eq('active', true);
      const s = enroll?.map(e => e.student) || [];
      setStudents(s);
      const monthStart = new Date().toISOString().slice(0, 7) + '-01';
      const stats_ = {};
      for (const st of s) {
        const { data: att } = await supabase.from('attendance').select('id').eq('student_id', st.id).gte('date', monthStart);
        const { data: hw } = await supabase.from('assignments').select('score,total_marks,status').eq('student_id', st.id);
        const submitted = hw?.filter(x => x.score !== null) || [];
        const avg = submitted.length ? Math.round(submitted.reduce((sum, a) => sum + (a.score / a.total_marks * 100), 0) / submitted.length) : 0;
        stats_[st.id] = { attendance: att?.length || 0, hw: hw?.length || 0, submitted: submitted.length, avg };
      }
      setStats(stats_);
      setLoading(false);
    })();
  }, [profile]);

  const sendReport = (s) => {
    if (!s.parent_email) { toast('No parent email on file for ' + s.full_name, 'error'); return; }
    const st = stats[s.id];
    const subject = `${s.full_name} — Monthly Progress Report`;
    const body = `Dear Parent,\n\nHere is ${s.full_name}'s progress for this month:\n\n- Classes attended: ${st.attendance}\n- Assignments submitted: ${st.submitted}/${st.hw}\n- Average score: ${st.avg}%\n\nPlease reach out if you have any questions.\n\nBest regards`;
    window.open(`mailto:${s.parent_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <div className="fade-in">
      <PageHeader title="Reports" subtitle="Send monthly progress to parents" />
      <div style={{ padding: '32px 36px' }}>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Spinner /></div> :
          students.length === 0 ? <Card><EmptyState icon="◐" title="No students" message="Enroll students first" /></Card> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {students.map(s => {
              const st = stats[s.id] || {};
              return (
                <Card key={s.id} hoverable>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `linear-gradient(135deg, ${t.primary}, ${t.primaryDark})`, color: t.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
                      {s.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: t.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.full_name}</div>
                      <div style={{ fontSize: '11px', color: t.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.parent_email || 'No parent email'}</div>
                    </div>
                  </div>
                  <div style={{ background: t.surface, borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ fontSize: '11px', color: t.muted, fontWeight: 500 }}>Attendance</span><span style={{ fontSize: '12px', fontWeight: 700 }}>{st.attendance}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ fontSize: '11px', color: t.muted, fontWeight: 500 }}>HW Submitted</span><span style={{ fontSize: '12px', fontWeight: 700 }}>{st.submitted}/{st.hw}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '11px', color: t.muted, fontWeight: 500 }}>Avg Score</span><span style={{ fontSize: '12px', fontWeight: 700 }}>{st.avg}%</span></div>
                  </div>
                  <Button onClick={() => sendReport(s)} variant="primary" style={{ width: '100%' }}>✉ Send Report</Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================
const AppRouter = () => {
  const { user, profile, loading } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (profile?.role === 'teacher') setPage('dashboard');
    else if (profile?.role === 'student') setPage('home');
  }, [profile]);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner size={32} /></div>;
  }
  if (!user || !profile) return <AuthScreen />;

  const renderPage = () => {
    if (profile.role === 'teacher') {
      if (page === 'dashboard') return <TeacherDashboard setPage={setPage} setSelectedStudent={setSelectedStudent} />;
      if (page === 'students') return <TeacherStudents setSelectedStudent={setSelectedStudent} setPage={setPage} />;
      if (page === 'student-detail' && selectedStudent) return <StudentDetail student={selectedStudent} setPage={setPage} />;
      if (page === 'assignments') return <TeacherAssignments />;
      if (page === 'reports') return <TeacherReports />;
    } else {
      if (page === 'home') return <StudentHome />;
      if (page === 'attendance') return <StudentAttendance />;
      if (page === 'progress') return <StudentProgress />;
    }
    return <div style={{ padding: '40px' }}>Page not found</div>;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.surface }}>
      <Sidebar currentPage={page} setPage={setPage} />
      <main style={{ flex: 1 }}>{renderPage()}</main>
    </div>
  );
};

export default function App() {
  return (
    <>
      <GlobalStyles />
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ToastProvider>
    </>
  );
}
