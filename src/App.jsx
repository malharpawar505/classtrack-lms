import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';

// ============================================================
// DESIGN TOKENS — Refined professional palette
// ============================================================
const C = {
  bg: '#FAFAF9',
  panel: '#FFFFFF',
  surface: '#F5F5F4',
  surfaceHover: '#E7E5E4',
  ink: '#0C0A09',
  ink2: '#1C1917',
  ink3: '#292524',
  text: '#44403C',
  textSoft: '#78716C',
  muted: '#A8A29E',
  line: '#E7E5E4',
  lineSoft: '#F5F5F4',
  accent: '#EA580C',
  accentHover: '#C2410C',
  accentSoft: '#FFEDD5',
  accentSubtle: '#FFF7ED',
  blue: '#2563EB',
  blueSoft: '#DBEAFE',
  green: '#059669',
  greenSoft: '#D1FAE5',
  yellow: '#CA8A04',
  yellowSoft: '#FEF3C7',
  red: '#DC2626',
  redSoft: '#FEE2E2',
  purple: '#7C3AED',
  purpleSoft: '#EDE9FE',
};

// ============================================================
// GLOBAL STYLES
// ============================================================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { font-family: 'Geist', -apple-system, sans-serif; background: ${C.bg}; color: ${C.ink}; -webkit-font-smoothing: antialiased; font-feature-settings: 'cv11', 'ss01'; }
    button, input, select, textarea { font-family: inherit; color: ${C.ink}; }
    input::placeholder { color: ${C.muted}; }
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${C.line}; border-radius: 10px; border: 2px solid ${C.bg}; }
    ::-webkit-scrollbar-thumb:hover { background: ${C.muted}; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeInDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes fadeInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
    @keyframes bounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { opacity: 1; transform: scale(1.05); } 70% { transform: scale(0.95); } 100% { transform: scale(1); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes glow { 0%, 100% { box-shadow: 0 0 0 0 ${C.accent}44; } 50% { box-shadow: 0 0 20px 4px ${C.accent}22; } }
    @keyframes slideInToast { from { opacity: 0; transform: translate(100%, 0); } to { opacity: 1; transform: translate(0, 0); } }
    @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
    @keyframes checkmark { 0% { stroke-dashoffset: 50; } 100% { stroke-dashoffset: 0; } }
    @keyframes successPulse { 0% { transform: scale(0); opacity: 0; } 50% { opacity: 1; } 100% { transform: scale(1); opacity: 1; } }

    .fade-in { animation: fadeIn 0.3s ease both; }
    .fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .fade-in-down { animation: fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .fade-in-left { animation: fadeInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .fade-in-right { animation: fadeInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .scale-in { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
    .bounce-in { animation: bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
    .float { animation: float 3s ease-in-out infinite; }
    .glow { animation: glow 2s ease-in-out infinite; }
    .d-1 { animation-delay: 0.05s; } .d-2 { animation-delay: 0.1s; } .d-3 { animation-delay: 0.15s; }
    .d-4 { animation-delay: 0.2s; } .d-5 { animation-delay: 0.25s; } .d-6 { animation-delay: 0.3s; }
    .d-7 { animation-delay: 0.35s; } .d-8 { animation-delay: 0.4s; }

    .hover-lift { transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.2s ease; }
    .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px -4px rgba(12, 10, 9, 0.08); }
    .press:active { transform: scale(0.97); }
  `}</style>
);

// ============================================================
// CORE UI COMPONENTS
// ============================================================
const Button = ({ children, onClick, variant = 'primary', size = 'md', disabled, loading, fullWidth, style = {}, type = 'button' }) => {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const sizes = { xs: { padding: '5px 10px', fontSize: '11px', h: 26 }, sm: { padding: '7px 12px', fontSize: '12px', h: 30 }, md: { padding: '10px 16px', fontSize: '13px', h: 38 }, lg: { padding: '14px 22px', fontSize: '14px', h: 46 } };
  const V = {
    primary: { bg: C.ink, c: '#FFF', b: C.ink, hb: C.ink2 },
    accent: { bg: C.accent, c: '#FFF', b: C.accent, hb: C.accentHover },
    ghost: { bg: C.panel, c: C.ink, b: C.line, hb: C.surface },
    subtle: { bg: C.surface, c: C.ink, b: 'transparent', hb: C.surfaceHover },
    danger: { bg: C.panel, c: C.red, b: '#FECACA', hb: C.redSoft },
    success: { bg: C.green, c: '#FFF', b: C.green, hb: '#047857' },
  };
  const v = V[variant]; const s = sizes[size];
  return (
    <button
      type={type} onClick={onClick} disabled={disabled || loading}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
      style={{
        padding: s.padding, fontSize: s.fontSize, height: s.h, width: fullWidth ? '100%' : 'auto',
        background: disabled ? C.surface : (hover ? v.hb : v.bg), color: disabled ? C.muted : v.c,
        border: `1px solid ${disabled ? C.line : v.b}`, borderRadius: '8px',
        fontWeight: 500, letterSpacing: '-0.005em', cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transform: pressed ? 'scale(0.97)' : 'scale(1)', transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
        boxShadow: hover && !disabled ? '0 2px 4px rgba(0,0,0,0.04)' : 'none',
        ...style
      }}>
      {loading && <div style={{ width: 13, height: 13, border: `2px solid ${v.c}33`, borderTopColor: v.c, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />}
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, type = 'text', label, error, autoFocus, onKeyDown, icon }) => {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: '14px' }}>
      {label && <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: C.text, marginBottom: '6px' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: '14px', pointerEvents: 'none' }}>{icon}</div>}
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder} autoFocus={autoFocus} onKeyDown={onKeyDown}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            width: '100%', padding: icon ? '11px 14px 11px 38px' : '11px 14px', fontSize: '14px',
            border: `1px solid ${error ? C.red : (focus ? C.ink : C.line)}`, borderRadius: '8px',
            outline: 'none', background: C.panel, color: C.ink, transition: 'all 0.15s ease',
            boxShadow: focus ? `0 0 0 3px ${error ? C.redSoft : '#0C0A0910'}` : 'none'
          }} />
      </div>
      {error && <div style={{ fontSize: '12px', color: C.red, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', animation: 'fadeInDown 0.2s' }}>⚠ {error}</div>}
    </div>
  );
};

const Card = ({ children, style = {}, padding = '20px', hoverable, onClick, className = '' }) => (
  <div onClick={onClick} className={className + (hoverable ? ' hover-lift' : '')}
    style={{
      background: C.panel, border: `1px solid ${C.line}`, borderRadius: '12px',
      padding, cursor: hoverable ? 'pointer' : 'default', ...style
    }}>{children}</div>
);

const Badge = ({ children, variant = 'default', size = 'md', icon }) => {
  const V = {
    default: { bg: C.surface, c: C.text, b: C.line },
    accent: { bg: C.accentSoft, c: C.accentHover, b: '#FED7AA' },
    blue: { bg: C.blueSoft, c: '#1E40AF', b: '#BFDBFE' },
    green: { bg: C.greenSoft, c: '#047857', b: '#A7F3D0' },
    yellow: { bg: C.yellowSoft, c: '#854D0E', b: '#FDE68A' },
    red: { bg: C.redSoft, c: '#B91C1C', b: '#FECACA' },
    purple: { bg: C.purpleSoft, c: '#6D28D9', b: '#DDD6FE' },
    dark: { bg: C.ink, c: '#FFF', b: C.ink },
  };
  const v = V[variant];
  const s = size === 'sm' ? { p: '2px 7px', fs: '10px' } : { p: '3px 9px', fs: '11px' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px', padding: s.p, fontSize: s.fs,
      fontWeight: 500, background: v.bg, color: v.c, border: `1px solid ${v.b}`,
      borderRadius: '6px', letterSpacing: '-0.005em', whiteSpace: 'nowrap'
    }}>{icon}{children}</span>
  );
};

const Toast = ({ toast, onDismiss }) => {
  useEffect(() => { if (toast) { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); } }, [toast, onDismiss]);
  if (!toast) return null;
  const styles = { success: { bg: C.green, icon: '✓' }, error: { bg: C.red, icon: '✕' }, info: { bg: C.ink, icon: 'ℹ' } };
  const s = styles[toast.type] || styles.info;
  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, background: C.panel, border: `1px solid ${C.line}`, borderRadius: '10px',
      padding: '12px 16px', boxShadow: '0 16px 48px -8px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '12px',
      zIndex: 9999, minWidth: 280, maxWidth: 400, animation: 'slideInToast 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
    }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: s.bg, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0, animation: 'successPulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>{s.icon}</div>
      <div style={{ flex: 1, fontSize: '13px', color: C.ink, fontWeight: 500, lineHeight: 1.4 }}>{toast.message}</div>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '18px', padding: 0, lineHeight: 1, fontWeight: 400 }}>×</button>
    </div>
  );
};

const Spinner = ({ size = 32 }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
    <div style={{ width: size, height: size, border: `3px solid ${C.line}`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

const EmptyState = ({ title, description, action }) => (
  <div className="fade-in-up" style={{ textAlign: 'center', padding: '56px 20px' }}>
    <div className="float" style={{ width: 56, height: 56, borderRadius: '14px', background: C.surface, margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: C.muted }}>○</div>
    <h3 style={{ fontSize: '16px', fontWeight: 600, color: C.ink, marginBottom: '6px', letterSpacing: '-0.01em' }}>{title}</h3>
    <p style={{ fontSize: '13px', color: C.textSoft, marginBottom: action ? '20px' : 0, maxWidth: 360, margin: action ? '0 auto 20px' : '0 auto', lineHeight: 1.5 }}>{description}</p>
    {action}
  </div>
);

const Avatar = ({ name, size = 36, variant = 'accent' }) => {
  const colors = { accent: { bg: C.accentSoft, c: C.accentHover }, dark: { bg: C.ink, c: C.accent }, blue: { bg: C.blueSoft, c: '#1E40AF' } };
  const v = colors[variant];
  const initials = name?.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: v.bg, color: v.c,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 600, flexShrink: 0,
      fontFamily: 'Geist Mono, monospace', letterSpacing: '-0.02em'
    }}>{initials}</div>
  );
};

// ============================================================
// AUTH PAGE
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
    if (m.includes('password should be at least')) return 'Password must be at least 6 characters.';
    if (m.includes('unable to validate email')) return 'Please enter a valid email address.';
    if (m.includes('rate limit')) return 'Too many attempts. Please wait a moment.';
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
          email, password, options: { data: { full_name: fullName, role } }
        });
        if (error) throw error;
        if (data.user && !data.session) showToast('Account created. Check your email to verify.', 'info');
        else showToast('Account created successfully!', 'success');
      }
    } catch (err) { setError(friendlyError(err)); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${C.accentSoft}aa 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -150, left: -150, width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${C.blueSoft}66 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div className="fade-in-up" style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div className="fade-in-down d-1" style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div className="scale-in d-2" style={{ width: 38, height: 38, background: C.ink, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent, fontFamily: 'Geist Mono, monospace', fontSize: '19px', fontWeight: 700 }}>C</div>
            <span style={{ fontSize: '19px', fontWeight: 600, color: C.ink, letterSpacing: '-0.02em' }}>ClassTrack</span>
          </div>
        </div>

        <div className="scale-in d-2" style={{ border: `1px solid ${C.line}`, borderRadius: 16, padding: '36px 32px', background: C.panel, boxShadow: '0 24px 48px -12px rgba(0,0,0,0.04)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: C.ink, marginBottom: 6, letterSpacing: '-0.02em' }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ fontSize: '13px', color: C.textSoft, marginBottom: 28 }}>
            {mode === 'login' ? 'Sign in to access your dashboard' : 'Start tracking your learning journey'}
          </p>

          {mode === 'signup' && (
            <>
              <Input label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" autoFocus />
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: C.text, marginBottom: 6 }}>Account Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {['student', 'teacher'].map(r => (
                    <button key={r} onClick={() => setRole(r)} type="button" className="press" style={{
                      padding: 12, border: `1px solid ${role === r ? C.ink : C.line}`, borderRadius: 8,
                      background: role === r ? C.ink : C.panel, color: role === r ? '#FFF' : C.text,
                      fontSize: 13, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize',
                      transition: 'all 0.15s ease'
                    }}>{r}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoFocus={mode === 'login'} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleSubmit()} error={error} />

          <Button onClick={handleSubmit} variant="primary" size="lg" loading={loading} fullWidth style={{ marginTop: 8 }}>
            {mode === 'login' ? 'Sign in →' : 'Create account →'}
          </Button>

          <div style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: C.textSoft }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} style={{ background: 'none', border: 'none', color: C.ink, fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: 13 }}>
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>

        <div className="fade-in d-4" style={{ textAlign: 'center', marginTop: 22, fontSize: 11, color: C.muted, letterSpacing: '0.02em' }}>
          Powered by Supabase · Built for teachers & students
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
    { id: 'attendance', label: 'Attendance', icon: '◐' },
    { id: 'assignments', label: 'My Assignments', icon: '▤' },
    { id: 'progress', label: 'Progress', icon: '◑' },
  ];
  const nav = profile.role === 'teacher' ? teacherNav : studentNav;

  return (
    <aside className="fade-in-left" style={{ width: 244, background: C.panel, borderRight: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', padding: '20px 14px', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px 18px', borderBottom: `1px solid ${C.lineSoft}`, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, background: C.ink, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent, fontFamily: 'Geist Mono, monospace', fontSize: 16, fontWeight: 700 }}>C</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, letterSpacing: '-0.01em' }}>ClassTrack</div>
          <div style={{ fontSize: 10, color: C.textSoft, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{profile.role}</div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {nav.map((item, i) => {
          const active = currentPage === item.id || (currentPage === 'student-detail' && item.id === 'students');
          return (
            <button key={item.id} onClick={() => setPage(item.id)} className={`fade-in-left d-${i + 1}`} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 11,
              padding: '10px 11px', marginBottom: 2, border: 'none',
              background: active ? C.surface : 'transparent', borderRadius: 7,
              cursor: 'pointer', textAlign: 'left', fontSize: 13,
              fontWeight: active ? 600 : 500, color: active ? C.ink : C.text,
              transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)', fontFamily: 'inherit', position: 'relative'
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.lineSoft; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
              {active && <div style={{ position: 'absolute', left: -14, top: '50%', transform: 'translateY(-50%)', width: 3, height: 20, background: C.accent, borderRadius: '0 3px 3px 0' }} />}
              <span style={{ fontSize: 11, color: active ? C.accent : C.muted, width: 14 }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop: `1px solid ${C.lineSoft}`, paddingTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 6, marginBottom: 6 }}>
          <Avatar name={profile.full_name} size={34} variant="dark" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.full_name}</div>
            <div style={{ fontSize: 10, color: C.textSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.email}</div>
          </div>
        </div>
        <Button onClick={onLogout} variant="ghost" size="sm" fullWidth>Sign out</Button>
      </div>
    </aside>
  );
};

const PageHeader = ({ title, subtitle, action }) => (
  <div className="fade-in-down" style={{ padding: '28px 36px 22px', borderBottom: `1px solid ${C.lineSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
    <div>
      {subtitle && <div style={{ fontSize: 11, fontWeight: 500, color: C.textSoft, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{subtitle}</div>}
      <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: C.ink }}>{title}</h1>
    </div>
    {action}
  </div>
);

const StatCard = ({ label, value, suffix, variant = 'default', delay = 0, trend }) => {
  const isAccent = variant === 'accent';
  return (
    <Card className={`fade-in-up d-${delay}`} padding="20px" style={isAccent ? { background: C.ink, borderColor: C.ink, position: 'relative', overflow: 'hidden' } : {}}>
      {isAccent && <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${C.accent}44 0%, transparent 70%)` }} />}
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 11, color: isAccent ? 'rgba(255,255,255,0.6)' : C.textSoft, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: 8 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: isAccent ? '#FFF' : C.ink, fontFamily: 'Geist, sans-serif' }}>
            {value}{suffix && <span style={{ fontSize: 14, color: isAccent ? 'rgba(255,255,255,0.5)' : C.muted, marginLeft: 2, fontWeight: 500 }}>{suffix}</span>}
          </div>
          {trend && <span style={{ fontSize: 11, color: trend > 0 ? C.green : C.red, fontWeight: 600 }}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>}
        </div>
      </div>
    </Card>
  );
};

// ============================================================
// TEACHER: DASHBOARD
// ============================================================
const TeacherDashboard = ({ profile, setPage, setSelectedStudent }) => {
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
    const { data: pendingHw } = await supabase.from('assignments').select('id').in('status', ['pending', 'in_progress']);

    const totalPossible = students.length * 12;
    const avgAtt = totalPossible > 0 ? Math.round((monthAtt?.length || 0) / totalPossible * 100) : 0;
    setStats({ students: students.length, todayAtt: todayAtt?.length || 0, avgAtt, pendingHw: pendingHw?.length || 0 });
    setTodayCheckins(todayAtt || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) return <div><PageHeader title={`${greeting}, ${profile.full_name?.split(' ')[0] || ''}`} subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} /><Spinner /></div>;

  return (
    <div>
      <PageHeader title={`${greeting}, ${profile.full_name?.split(' ')[0] || 'Teacher'}`} subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} />
      <div style={{ padding: '28px 36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
          <StatCard label="Students" value={stats.students} delay={1} />
          <StatCard label="Today's Check-ins" value={stats.todayAtt} suffix={`/ ${stats.students}`} variant="accent" delay={2} />
          <StatCard label="Avg. Attendance" value={stats.avgAtt} suffix="%" delay={3} />
          <StatCard label="Pending Homework" value={stats.pendingHw} delay={4} />
        </div>

        <div className="fade-in-up d-5" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.ink, letterSpacing: '-0.01em' }}>Today's check-ins</h3>
          <button onClick={() => setPage('students')} style={{ fontSize: 12, color: C.textSoft, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit' }}>View all →</button>
        </div>

        {todayCheckins.length === 0 ? (
          <Card className="fade-in-up d-6"><EmptyState title="No check-ins yet today" description="Students will appear here once they punch in for class." /></Card>
        ) : (
          <Card className="fade-in-up d-6" padding="0">
            {todayCheckins.map((c, i) => (
              <div key={c.id} className={`fade-in-up d-${i + 1}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < todayCheckins.length - 1 ? `1px solid ${C.lineSoft}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={c.student?.full_name} size={38} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{c.student?.full_name || 'Unknown'}</div>
                    <div style={{ fontSize: 11, color: C.textSoft }}>{c.subject || 'Class'}</div>
                  </div>
                </div>
                <Badge variant="green">● {c.punch_time?.substring(0, 5)}</Badge>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

// ============================================================
// TEACHER: STUDENTS
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
      const { data, error } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { full_name: form.fullName, role: 'student' } }
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from('profiles').update({
          grade: form.grade, parent_email: form.parentEmail,
          avatar: form.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }).eq('id', data.user.id);
      }
      showToast(`${form.fullName} added successfully`, 'success');
      setForm({ email: '', fullName: '', parentEmail: '', grade: '', password: '' });
      setShowAdd(false); loadStudents();
    } catch (err) { showToast(err.message || 'Failed to add student', 'error'); } finally { setSubmitting(false); }
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
          <Card className="scale-in" style={{ marginBottom: 20, borderColor: C.ink3 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 16, letterSpacing: '-0.01em' }}>Register new student</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input label="Full Name *" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Adeena Javaid" />
              <Input label="Student Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="student@gmail.com" />
              <Input label="Temporary Password *" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
              <Input label="Grade" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} placeholder="Grade 11" />
              <Input label="Parent Email" type="email" value={form.parentEmail} onChange={e => setForm({ ...form, parentEmail: e.target.value })} placeholder="parent@gmail.com" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Button onClick={handleAdd} variant="primary" loading={submitting}>Create Account</Button>
              <Button onClick={() => setShowAdd(false)} variant="ghost">Cancel</Button>
            </div>
            <div style={{ fontSize: 11, color: C.text, marginTop: 14, padding: '10px 12px', background: C.accentSubtle, borderRadius: 6, border: `1px solid ${C.accentSoft}` }}>
              ℹ Share the email + password with the student so they can log in.
            </div>
          </Card>
        )}

        <div className="fade-in-up" style={{ marginBottom: 16 }}>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students by name or email..." icon="🔍" />
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <Card><EmptyState title={search ? 'No matches' : 'No students yet'} description={search ? 'Try a different search term.' : 'Add your first student to start tracking attendance and progress.'} action={!search && <Button onClick={() => setShowAdd(true)} variant="accent">+ Add student</Button>} /></Card>
        ) : (
          <Card padding="0" className="fade-in-up d-2">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1fr', padding: '12px 20px', borderBottom: `1px solid ${C.line}`, background: C.surface }}>
              {['Student', 'Grade', 'Parent Email', 'This Month'].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 600, color: C.textSoft, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
              ))}
            </div>
            {filtered.map((s, i) => (
              <div key={s.id} onClick={() => { setSelectedStudent(s); setPage('student-detail'); }} className={`fade-in-up d-${Math.min(i + 1, 8)}`}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1fr', padding: '14px 20px',
                  borderBottom: i < filtered.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
                  alignItems: 'center', cursor: 'pointer', transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.surface}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={s.full_name} size={36} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{s.full_name}</div>
                    <div style={{ fontSize: 11, color: C.textSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{s.grade || '—'}</div>
                <div style={{ fontSize: 12, color: C.textSoft }}>{s.parent_email || '—'}</div>
                <div><Badge variant={s.attendance_count >= 8 ? 'green' : s.attendance_count >= 4 ? 'accent' : 'default'}>{s.attendance_count} classes</Badge></div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

// ============================================================
// STUDENT DETAIL (Teacher View)
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

  const submitted = assignments.filter(a => a.score != null);
  const avgScore = submitted.length ? Math.round(submitted.reduce((s, a) => s + (Number(a.score) / Number(a.total_marks) * 100), 0) / submitted.length) : 0;

  const emailParent = () => {
    if (!student.parent_email) { showToast('No parent email on file', 'error'); return; }
    const monthAtt = attendance.filter(a => a.date.startsWith(new Date().toISOString().substring(0, 7)));
    const subject = `${student.full_name} — Monthly Progress Report`;
    const body = `Dear Parent,%0D%0A%0D%0AHere is ${student.full_name}'s progress:%0D%0A%0D%0A- Classes: ${monthAtt.length}%0D%0A- Homework done: ${submitted.length}/${assignments.length}%0D%0A- Avg score: ${avgScore}%25%0D%0A%0D%0ABest,%0D%0AApeksha`;
    window.open(`mailto:${student.parent_email}?subject=${encodeURIComponent(subject)}&body=${body}`, '_blank');
  };

  return (
    <div>
      <div style={{ padding: '20px 36px 0' }}>
        <button onClick={() => setPage('students')} style={{ background: 'none', border: 'none', color: C.textSoft, fontSize: 12, cursor: 'pointer', padding: 0, marginBottom: 14, fontFamily: 'inherit', fontWeight: 500 }}>← Back to students</button>
      </div>
      <div className="fade-in-down" style={{ padding: '0 36px 22px', borderBottom: `1px solid ${C.lineSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <Avatar name={student.full_name} size={56} variant="dark" />
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: C.textSoft, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{student.grade || 'Student'}</div>
            <h1 style={{ fontSize: 26, fontWeight: 600, color: C.ink, letterSpacing: '-0.02em' }}>{student.full_name}</h1>
            <div style={{ fontSize: 12, color: C.textSoft, marginTop: 4 }}>{student.email}</div>
          </div>
        </div>
        <Button onClick={emailParent} variant="accent">✉ Email parent</Button>
      </div>

      <div style={{ padding: '0 36px', borderBottom: `1px solid ${C.lineSoft}`, display: 'flex', gap: 2 }}>
        {['overview', 'attendance', 'assignments'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '13px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13,
            fontWeight: tab === t ? 600 : 500, color: tab === t ? C.ink : C.textSoft,
            borderBottom: tab === t ? `2px solid ${C.accent}` : '2px solid transparent',
            textTransform: 'capitalize', marginBottom: -1, fontFamily: 'inherit', transition: 'all 0.15s'
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: '28px 36px' }}>
        {loading ? <Spinner /> : (
          <>
            {tab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
                  <StatCard label="Classes Attended" value={attendance.length} delay={1} />
                  <StatCard label="Average Score" value={avgScore} suffix="%" delay={2} />
                  <StatCard label="HW Done" value={submitted.length} suffix={`/ ${assignments.length}`} delay={3} />
                  <StatCard label="Last Active" value={attendance[0]?.date ? new Date(attendance[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'} delay={4} />
                </div>
                <Card className="fade-in-up d-5">
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 14 }}>Contact details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.textSoft, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 500 }}>Student Email</div>
                      <div style={{ fontSize: 13, color: C.ink, fontWeight: 500 }}>{student.email}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: C.textSoft, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 500 }}>Parent Email</div>
                      <div style={{ fontSize: 13, color: C.ink, fontWeight: 500 }}>{student.parent_email || <span style={{ color: C.muted }}>Not provided</span>}</div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            {tab === 'attendance' && <AttendanceGrid attendance={attendance} />}
            {tab === 'assignments' && <AssignmentsReadOnly assignments={assignments} />}
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================
// ATTENDANCE CALENDAR
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
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{monthName}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button onClick={() => setViewDate(new Date(year, month - 1, 1))} variant="ghost" size="sm">←</Button>
          <Button onClick={() => setViewDate(new Date())} variant="ghost" size="sm">Today</Button>
          <Button onClick={() => setViewDate(new Date(year, month + 1, 1))} variant="ghost" size="sm">→</Button>
        </div>
      </div>
      <Card padding="20px">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 10 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ fontSize: 10, fontWeight: 600, color: C.textSoft, textTransform: 'uppercase', letterSpacing: '0.06em', padding: 6, textAlign: 'center' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const record = recMap[day];
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            return (
              <div key={i} className={record ? 'scale-in' : ''} style={{
                aspectRatio: '1', borderRadius: 8,
                background: record ? C.ink : (isToday ? C.accentSubtle : C.surface),
                border: `1px solid ${record ? C.ink : (isToday ? C.accent : C.lineSoft)}`,
                padding: '6px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: record ? '#FFF' : C.ink }}>{day}</div>
                {record && <div style={{ fontSize: 9, fontWeight: 600, color: C.accent, fontFamily: 'Geist Mono, monospace' }}>{record.punch_time?.substring(0, 5)}</div>}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.lineSoft}`, fontSize: 11, color: C.textSoft }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, background: C.ink, borderRadius: 3 }} /> Present</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, background: C.accentSubtle, border: `1px solid ${C.accent}`, borderRadius: 3 }} /> Today</div>
        </div>
      </Card>
    </div>
  );
};

const AssignmentsReadOnly = ({ assignments }) => (
  <div className="fade-in">
    {assignments.length === 0 ? (
      <Card><EmptyState title="No assignments" description="Assignments will appear here." /></Card>
    ) : (
      <Card padding="0">
        {assignments.map((a, i) => (
          <div key={a.id} className={`fade-in-up d-${Math.min(i + 1, 6)}`} style={{ padding: '16px 20px', borderBottom: i < assignments.length - 1 ? `1px solid ${C.lineSoft}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{a.title}</div>
              <div style={{ fontSize: 11, color: C.textSoft }}>{a.subject} · Due {new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StatusBadge status={a.status} />
              {a.score != null && <div style={{ fontSize: 18, fontWeight: 600, color: C.ink }}>{a.score}<span style={{ fontSize: 12, color: C.muted }}>/{a.total_marks}</span></div>}
            </div>
          </div>
        ))}
      </Card>
    )}
  </div>
);

// Status badge component
const StatusBadge = ({ status }) => {
  const map = {
    pending: { variant: 'default', label: 'To Do', icon: '○' },
    in_progress: { variant: 'blue', label: 'In Progress', icon: '◐' },
    submitted: { variant: 'yellow', label: 'Submitted', icon: '✓' },
    graded: { variant: 'green', label: 'Graded', icon: '★' },
  };
  const m = map[status] || map.pending;
  return <Badge variant={m.variant}>{m.icon} {m.label}</Badge>;
};

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

  return (
    <div>
      <PageHeader title="Assignments" subtitle={`${assignments.length} total · ${assignments.filter(a => a.status === 'pending' || a.status === 'in_progress').length} pending`} action={
        <Button onClick={() => setShowAdd(!showAdd)} variant={showAdd ? 'ghost' : 'accent'}>{showAdd ? 'Cancel' : '+ New assignment'}</Button>
      } />
      <div style={{ padding: '28px 36px' }}>
        {showAdd && (
          <Card className="scale-in" style={{ marginBottom: 20, borderColor: C.ink3 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 16 }}>New assignment</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}><Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Exponent Laws Practice" /></div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 6 }}>Student</label>
                <select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} style={{ width: '100%', padding: '11px 14px', fontSize: 14, border: `1px solid ${C.line}`, borderRadius: 8, background: C.panel, color: C.ink, fontFamily: 'inherit' }}>
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 6 }}>Subject</label>
                <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} style={{ width: '100%', padding: '11px 14px', fontSize: 14, border: `1px solid ${C.line}`, borderRadius: 8, background: C.panel, color: C.ink, fontFamily: 'inherit' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1fr 1fr 1.2fr 1fr', padding: '12px 20px', borderBottom: `1px solid ${C.line}`, background: C.surface }}>
              {['Assignment', 'Student', 'Subject', 'Due', 'Status', 'Score'].map(h => <div key={h} style={{ fontSize: 10, fontWeight: 600, color: C.textSoft, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>)}
            </div>
            {assignments.map((a, i) => (
              <div key={a.id} className={`fade-in-up d-${Math.min(i + 1, 8)}`} style={{ display: 'grid', gridTemplateColumns: '2fr 1.3fr 1fr 1fr 1.2fr 1fr', padding: '14px 20px', borderBottom: i < assignments.length - 1 ? `1px solid ${C.lineSoft}` : 'none', alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{a.title}</div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{a.student?.full_name || '—'}</div>
                <div style={{ fontSize: 12, color: C.textSoft }}>{a.subject}</div>
                <div style={{ fontSize: 12, color: C.textSoft }}>{new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div><StatusBadge status={a.status} /></div>
                <div>
                  {a.score != null ? <span style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{a.score}<span style={{ fontSize: 11, color: C.muted }}>/{a.total_marks}</span></span>
                    : a.status === 'submitted' ? <Button onClick={() => gradeIt(a.id, a.total_marks)} variant="accent" size="xs">Grade</Button>
                      : <span style={{ fontSize: 11, color: C.muted }}>—</span>}
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
      <PageHeader title="Reports" subtitle="Monthly parent communication" />
      <div style={{ padding: '28px 36px' }}>
        {loading ? <Spinner /> : students.length === 0 ? (
          <Card><EmptyState title="No students" description="Add students to generate reports." /></Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {students.map((s, i) => (
              <Card key={s.id} className={`fade-in-up d-${Math.min(i + 1, 6)}`} hoverable>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <Avatar name={s.full_name} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.full_name}</div>
                    <div style={{ fontSize: 11, color: C.textSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.parent_email || 'No parent email'}</div>
                  </div>
                </div>
                <div style={{ background: C.surface, borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  {[['Attendance', `${s.att} classes`], ['Homework', `${s.hwDone}/${s.hwTotal}`], ['Avg. Score', `${s.avg}%`]].map(([k, v], idx) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: idx === 2 ? 0 : 6 }}>
                      <span style={{ fontSize: 12, color: C.textSoft }}>{k}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{v}</span>
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
// STUDENT: HOME
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

  if (loading) return <div><PageHeader title={`Hello, ${profile.full_name?.split(' ')[0]}`} /><Spinner /></div>;

  return (
    <div>
      <PageHeader title={`Hello, ${profile.full_name?.split(' ')[0] || 'there'}`} subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} />
      <div style={{ padding: '28px 36px' }}>
        <Card className="fade-in-up" style={{ marginBottom: 24, background: C.ink, borderColor: C.ink, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 240, height: 240, background: `radial-gradient(circle, ${C.accent}55 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Today's Attendance</div>
            {todayRecord ? (
              <div className="fade-in">
                <h2 style={{ fontSize: 22, fontWeight: 600, color: '#FFF', marginBottom: 16 }}>✓ You're checked in</h2>
                <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
                  <div><span style={{ color: 'rgba(255,255,255,0.5)', marginRight: 8 }}>Time</span><span style={{ color: '#FFF', fontFamily: 'Geist Mono, monospace', fontWeight: 600 }}>{todayRecord.punch_time?.substring(0, 5)}</span></div>
                  <div><span style={{ color: 'rgba(255,255,255,0.5)', marginRight: 8 }}>Subject</span><span style={{ color: '#FFF', fontWeight: 600 }}>{todayRecord.subject}</span></div>
                </div>
              </div>
            ) : (
              <div className="fade-in">
                <h2 style={{ fontSize: 22, fontWeight: 600, color: '#FFF', marginBottom: 6 }}>Ready for class?</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>Punch in to mark your attendance for today.</p>
                <Button onClick={handlePunch} variant="accent" size="lg" loading={punching}>Punch In →</Button>
              </div>
            )}
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
          <StatCard label="Classes This Month" value={stats.month} delay={1} />
          <StatCard label="Pending Assignments" value={stats.pending} delay={2} />
        </div>

        <h3 className="fade-in-up d-3" style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 12 }}>Recent classes</h3>
        {recent.length === 0 ? (
          <Card className="fade-in-up d-4"><EmptyState title="No classes yet" description="Punch in for your first class to see history." /></Card>
        ) : (
          <Card className="fade-in-up d-4" padding="0">
            {recent.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < recent.length - 1 ? `1px solid ${C.lineSoft}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: C.ink }}>{new Date(r.date).getDate()}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{r.subject}</div>
                    <div style={{ fontSize: 11, color: C.textSoft }}>{new Date(r.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
                <Badge variant="green">● {r.punch_time?.substring(0, 5)}</Badge>
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
// STUDENT: ASSIGNMENTS (with status change)
// ============================================================
const StudentAssignments = ({ profile, showToast }) => {
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
    <div>
      <PageHeader title="My Assignments" subtitle={`${counts.active} active · ${counts.done} completed`} />
      <div style={{ padding: '28px 36px' }}>
        {/* Filter tabs */}
        <div className="fade-in-down" style={{ display: 'flex', gap: 4, marginBottom: 20, background: C.surface, padding: 4, borderRadius: 10, width: 'fit-content' }}>
          {[['all', 'All'], ['active', 'Active'], ['done', 'Done']].map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)} className="press" style={{
              padding: '8px 16px', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600,
              background: filter === k ? C.panel : 'transparent', color: filter === k ? C.ink : C.textSoft,
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
              boxShadow: filter === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}>
              {label} <span style={{ opacity: 0.5, marginLeft: 4 }}>{counts[k]}</span>
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <Card><EmptyState title="No assignments here" description={filter === 'all' ? 'Your teacher will assign homework that will appear here.' : 'Try a different filter.'} /></Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((a, i) => {
              const daysLeft = Math.ceil((new Date(a.due_date) - new Date()) / (1000 * 60 * 60 * 24));
              const isOverdue = daysLeft < 0 && !['submitted', 'graded'].includes(a.status);
              const isUpdating = updatingId === a.id;

              return (
                <Card key={a.id} className={`fade-in-up d-${Math.min(i + 1, 6)} hover-lift`} padding="18px" style={isOverdue ? { borderColor: C.redSoft, background: '#FFFBFB' } : {}}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <Badge variant={a.subject === 'Mathematics' ? 'purple' : a.subject === 'Excel' ? 'green' : 'blue'}>{a.subject}</Badge>
                        <StatusBadge status={a.status} />
                        {isOverdue && <Badge variant="red">⚠ Overdue</Badge>}
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 4, letterSpacing: '-0.01em' }}>{a.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: C.textSoft }}>
                        <span>Due {new Date(a.due_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        {daysLeft >= 0 && !['submitted', 'graded'].includes(a.status) && (
                          <span style={{ color: daysLeft <= 2 ? C.accent : C.textSoft, fontWeight: 500 }}>
                            {daysLeft === 0 ? 'Due today' : daysLeft === 1 ? 'Due tomorrow' : `${daysLeft} days left`}
                          </span>
                        )}
                        <span>{a.total_marks} marks</span>
                      </div>
                    </div>
                    {a.score != null && (
                      <div className="bounce-in" style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: C.ink, fontFamily: 'Geist Mono, monospace' }}>{a.score}<span style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>/{a.total_marks}</span></div>
                        <div style={{ fontSize: 10, color: C.textSoft, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Scored</div>
                      </div>
                    )}
                  </div>

                  {/* Status change actions */}
                  {!['graded'].includes(a.status) && (
                    <div style={{ display: 'flex', gap: 6, paddingTop: 14, borderTop: `1px solid ${C.lineSoft}` }}>
                      {a.status === 'pending' && (
                        <>
                          <Button onClick={() => updateStatus(a.id, 'in_progress')} variant="subtle" size="sm" loading={isUpdating}>◐ Start Working</Button>
                          <Button onClick={() => updateStatus(a.id, 'submitted')} variant="accent" size="sm" loading={isUpdating}>✓ Mark Submitted</Button>
                        </>
                      )}
                      {a.status === 'in_progress' && (
                        <>
                          <Button onClick={() => updateStatus(a.id, 'pending')} variant="ghost" size="sm" loading={isUpdating}>← Back to Todo</Button>
                          <Button onClick={() => updateStatus(a.id, 'submitted')} variant="accent" size="sm" loading={isUpdating}>✓ Submit</Button>
                        </>
                      )}
                      {a.status === 'submitted' && (
                        <>
                          <Button onClick={() => updateStatus(a.id, 'in_progress')} variant="ghost" size="sm" loading={isUpdating}>← Reopen</Button>
                          <div style={{ fontSize: 12, color: C.textSoft, alignSelf: 'center', marginLeft: 'auto' }}>Waiting for teacher to grade</div>
                        </>
                      )}
                    </div>
                  )}
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
  const graded = assignments.filter(a => a.score != null);
  const avg = graded.length ? Math.round(graded.reduce((s, a) => s + (a.score / a.total_marks * 100), 0) / graded.length) : 0;

  // Subject breakdown
  const bySubject = {};
  graded.forEach(a => {
    if (!bySubject[a.subject]) bySubject[a.subject] = { total: 0, max: 0, count: 0 };
    bySubject[a.subject].total += Number(a.score);
    bySubject[a.subject].max += Number(a.total_marks);
    bySubject[a.subject].count += 1;
  });

  return (
    <div>
      <PageHeader title="My Progress" subtitle="Scores & performance" />
      <div style={{ padding: '28px 36px' }}>
        {loading ? <Spinner /> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
              <StatCard label="Average Score" value={avg} suffix="%" variant="accent" delay={1} />
              <StatCard label="Graded" value={graded.length} delay={2} />
              <StatCard label="Total Assignments" value={assignments.length} delay={3} />
            </div>

            {Object.keys(bySubject).length > 0 && (
              <div className="fade-in-up d-4" style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 14 }}>Performance by subject</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  {Object.entries(bySubject).map(([subj, data], i) => {
                    const pct = Math.round(data.total / data.max * 100);
                    return (
                      <Card key={subj} className={`fade-in-up d-${i + 4}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{subj}</div>
                            <div style={{ fontSize: 11, color: C.textSoft }}>{data.count} assignment{data.count !== 1 ? 's' : ''}</div>
                          </div>
                          <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, fontFamily: 'Geist Mono, monospace' }}>{pct}%</div>
                        </div>
                        <div style={{ height: 6, background: C.surface, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pct >= 80 ? C.green : pct >= 60 ? C.accent : C.red, borderRadius: 3, transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            <h3 className="fade-in-up d-5" style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 14 }}>All assignments</h3>
            <AssignmentsReadOnly assignments={assignments} />
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

  if (loading) return (<><GlobalStyles /><div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}><Spinner size={32} /></div></>);
  if (!session || !profile) return (<><GlobalStyles /><AuthPage showToast={showToast} /><Toast toast={toast} onDismiss={() => setToast(null)} /></>);

  const renderPage = () => {
    if (profile.role === 'teacher') {
      if (page === 'dashboard') return <TeacherDashboard profile={profile} setPage={setPage} setSelectedStudent={setSelectedStudent} />;
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
    return <div style={{ padding: 40, color: C.ink }}>Page not found</div>;
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
        <Sidebar profile={profile} currentPage={page} setPage={setPage} onLogout={handleLogout} />
        <main style={{ flex: 1, overflow: 'auto' }} key={page}>{renderPage()}</main>
      </div>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
