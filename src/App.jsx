import React, { useState, useMemo } from 'react';

// ============ MOCK DATA ============
const SUBJECTS = ['Mathematics', 'Excel', 'Power BI'];

const MOCK_STUDENTS = [
  {
    id: 's1', name: 'Adeena Javaid', email: 'adeena.j1win@gmail.com',
    parentEmail: 'zainabj06@gmail.com', grade: 'Grade 11', joinedAt: '2026-04-05',
    subjects: ['Mathematics', 'Excel', 'Power BI'], avatar: 'AJ'
  },
  {
    id: 's2', name: 'Rayan Khan', email: 'rayan.k@gmail.com',
    parentEmail: 'khan.parent@gmail.com', grade: 'Grade 10', joinedAt: '2026-02-12',
    subjects: ['Mathematics', 'Excel'], avatar: 'RK'
  },
  {
    id: 's3', name: 'Sara Malik', email: 'sara.m@gmail.com',
    parentEmail: 'malik.parent@gmail.com', grade: 'Grade 12', joinedAt: '2026-01-08',
    subjects: ['Excel', 'Power BI'], avatar: 'SM'
  },
];

// Generate attendance for the last 60 days for each student
const generateAttendance = () => {
  const records = [];
  const today = new Date('2026-04-05');
  MOCK_STUDENTS.forEach(student => {
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayOfWeek = date.getDay();
      // Classes on Fri(5), Sat(6), Sun(0)
      if ([0, 5, 6].includes(dayOfWeek)) {
        const isPresent = Math.random() > 0.15;
        if (isPresent) {
          records.push({
            id: `a-${student.id}-${i}`,
            studentId: student.id,
            date: date.toISOString().split('T')[0],
            punchTime: `${19 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}`,
            status: 'present',
            subject: dayOfWeek === 5 ? 'Mathematics' : (dayOfWeek === 6 ? 'Excel (Theory)' : 'Excel (Practice)')
          });
        }
      }
    }
  });
  return records;
};

const MOCK_ATTENDANCE = generateAttendance();

const MOCK_ASSIGNMENTS = [
  { id: 'hw1', studentId: 's1', title: 'Exponent Laws Practice', subject: 'Mathematics', dueDate: '2026-04-12', status: 'pending', score: null, totalMarks: 20 },
  { id: 'hw2', studentId: 's1', title: 'Quadratic Factoring', subject: 'Mathematics', dueDate: '2026-04-05', status: 'submitted', score: 18, totalMarks: 20 },
  { id: 'hw3', studentId: 's1', title: 'VLOOKUP Exercises', subject: 'Excel', dueDate: '2026-04-06', status: 'submitted', score: 17, totalMarks: 20 },
  { id: 'hw4', studentId: 's1', title: 'Pivot Table Challenge', subject: 'Excel', dueDate: '2026-04-13', status: 'pending', score: null, totalMarks: 25 },
  { id: 'hw5', studentId: 's2', title: 'Linear Equations', subject: 'Mathematics', dueDate: '2026-04-10', status: 'submitted', score: 15, totalMarks: 20 },
  { id: 'hw6', studentId: 's3', title: 'DAX Measures', subject: 'Power BI', dueDate: '2026-04-15', status: 'pending', score: null, totalMarks: 30 },
];

const MOCK_PROGRESS_NOTES = [
  { id: 'p1', studentId: 's1', date: '2026-03-29', note: 'Strong grasp of exponent laws. Needs more practice with rational exponents.', topic: 'Algebra' },
  { id: 'p2', studentId: 's1', date: '2026-03-22', note: 'Excellent in Excel formulas. Confident with INDEX-MATCH.', topic: 'Excel' },
];

// ============ DESIGN TOKENS ============
const theme = {
  bg: '#FFFFFF',
  ink: '#0A0A0A',
  inkSoft: '#1C1917',
  butter: '#FEF3C7',
  butterDeep: '#FDE68A',
  gold: '#F59E0B',
  goldDark: '#D97706',
  line: '#E7E5E4',
  muted: '#78716C',
  mutedLight: '#A8A29E',
  success: '#16A34A',
  danger: '#DC2626',
};

// ============ UTILITY COMPONENTS ============
const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: { bg: theme.butter, color: theme.ink, border: theme.butterDeep },
    success: { bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0' },
    danger: { bg: '#FEE2E2', color: '#B91C1C', border: '#FECACA' },
    neutral: { bg: '#F5F5F4', color: theme.inkSoft, border: theme.line },
  };
  const v = variants[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      fontSize: '11px', fontWeight: 500, letterSpacing: '0.02em',
      background: v.bg, color: v.color, border: `1px solid ${v.border}`,
      borderRadius: '4px', textTransform: 'uppercase', fontFamily: 'Geist, sans-serif'
    }}>{children}</span>
  );
};

const Button = ({ children, onClick, variant = 'primary', size = 'md', disabled, style = {} }) => {
  const sizes = { sm: '8px 14px', md: '12px 20px', lg: '16px 28px' };
  const variants = {
    primary: { bg: theme.ink, color: '#FFF', border: theme.ink, hoverBg: theme.inkSoft },
    gold: { bg: theme.gold, color: theme.ink, border: theme.gold, hoverBg: theme.goldDark },
    ghost: { bg: 'transparent', color: theme.ink, border: theme.line, hoverBg: theme.butter },
    danger: { bg: '#FFF', color: theme.danger, border: '#FECACA', hoverBg: '#FEE2E2' },
  };
  const v = variants[variant];
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: sizes[size],
        background: disabled ? '#F5F5F4' : (hover ? v.hoverBg : v.bg),
        color: disabled ? theme.mutedLight : v.color,
        border: `1px solid ${disabled ? theme.line : v.border}`,
        borderRadius: '6px',
        fontSize: size === 'sm' ? '12px' : '13px',
        fontWeight: 500, letterSpacing: '0.01em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Geist, sans-serif',
        transition: 'all 0.15s ease',
        ...style
      }}
    >{children}</button>
  );
};

const Card = ({ children, style = {}, padding = '24px' }) => (
  <div style={{
    background: '#FFF', border: `1px solid ${theme.line}`, borderRadius: '8px',
    padding, ...style
  }}>{children}</div>
);

const Input = ({ value, onChange, placeholder, type = 'text', label }) => (
  <div style={{ marginBottom: '14px' }}>
    {label && <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: theme.muted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Geist, sans-serif' }}>{label}</label>}
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{
        width: '100%', padding: '10px 14px', fontSize: '14px',
        border: `1px solid ${theme.line}`, borderRadius: '6px',
        fontFamily: 'Geist, sans-serif', outline: 'none',
        background: '#FFF', color: theme.ink, boxSizing: 'border-box'
      }}
      onFocus={e => e.target.style.borderColor = theme.ink}
      onBlur={e => e.target.style.borderColor = theme.line}
    />
  </div>
);

// ============ LOGIN SCREEN ============
const LoginScreen = ({ onLogin }) => {
  const [mode, setMode] = useState('teacher');
  return (
    <div style={{ minHeight: '100vh', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', border: `1px solid ${theme.line}`, borderRadius: '12px', overflow: 'hidden', minHeight: '560px' }}>
        {/* Left Panel */}
        <div style={{ background: theme.butter, padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
              <div style={{ width: '32px', height: '32px', background: theme.ink, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.gold, fontFamily: 'Instrument Serif, serif', fontSize: '22px', fontStyle: 'italic' }}>C</div>
              <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '14px', fontWeight: 600, letterSpacing: '0.02em' }}>ClassTrack</span>
            </div>
            <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '48px', lineHeight: '1.05', color: theme.ink, margin: 0, fontWeight: 400, letterSpacing: '-0.02em' }}>
              Learning, <em style={{ fontStyle: 'italic' }}>measured.</em>
            </h1>
            <p style={{ fontFamily: 'Geist, sans-serif', fontSize: '15px', lineHeight: '1.6', color: theme.inkSoft, marginTop: '20px', maxWidth: '380px' }}>
              Attendance, progress, and parent communication in one place. Built for tutors and students who value clarity.
            </p>
          </div>
          <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Est. 2026 · Pune → Toronto
          </div>
          {/* Decorative */}
          <div style={{ position: 'absolute', top: '40px', right: '40px', fontFamily: 'Instrument Serif, serif', fontSize: '120px', color: theme.butterDeep, lineHeight: '1', fontStyle: 'italic', pointerEvents: 'none' }}>§</div>
        </div>

        {/* Right Panel */}
        <div style={{ padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', fontWeight: 500, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Sign in as</div>
            <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '28px', color: theme.ink, margin: 0, fontWeight: 400 }}>Welcome back</h2>
          </div>

          {/* Role toggle */}
          <div style={{ display: 'flex', background: '#F5F5F4', borderRadius: '6px', padding: '3px', marginBottom: '24px' }}>
            <button onClick={() => setMode('teacher')} style={{
              flex: 1, padding: '9px', border: 'none', borderRadius: '4px', cursor: 'pointer',
              background: mode === 'teacher' ? '#FFF' : 'transparent',
              boxShadow: mode === 'teacher' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              fontFamily: 'Geist, sans-serif', fontSize: '13px', fontWeight: 500,
              color: mode === 'teacher' ? theme.ink : theme.muted, transition: 'all 0.15s'
            }}>Teacher</button>
            <button onClick={() => setMode('student')} style={{
              flex: 1, padding: '9px', border: 'none', borderRadius: '4px', cursor: 'pointer',
              background: mode === 'student' ? '#FFF' : 'transparent',
              boxShadow: mode === 'student' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              fontFamily: 'Geist, sans-serif', fontSize: '13px', fontWeight: 500,
              color: mode === 'student' ? theme.ink : theme.muted, transition: 'all 0.15s'
            }}>Student</button>
          </div>

          <Input label="Email" placeholder={mode === 'teacher' ? 'apeksha@prosys.com' : 'adeena.j1win@gmail.com'} value="" onChange={() => {}} />
          <Input label="Password" type="password" placeholder="••••••••" value="" onChange={() => {}} />

          <Button onClick={() => onLogin(mode)} variant="primary" style={{ width: '100%', marginTop: '8px' }}>
            Enter ClassTrack →
          </Button>
          <div style={{ marginTop: '24px', fontSize: '12px', color: theme.muted, fontFamily: 'Geist, sans-serif', textAlign: 'center' }}>
            Demo mode · Click above to preview as {mode}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ LAYOUT / SIDEBAR ============
const Sidebar = ({ user, currentPage, setPage, onLogout }) => {
  const teacherNav = [
    { id: 'dashboard', label: 'Dashboard', icon: '◆' },
    { id: 'students', label: 'Students', icon: '○' },
    { id: 'attendance', label: 'Attendance', icon: '◐' },
    { id: 'assignments', label: 'Assignments', icon: '▤' },
    { id: 'reports', label: 'Reports', icon: '◑' },
  ];
  const studentNav = [
    { id: 'home', label: 'Home', icon: '◆' },
    { id: 'attendance', label: 'My Attendance', icon: '◐' },
    { id: 'progress', label: 'My Progress', icon: '◑' },
  ];
  const nav = user.role === 'teacher' ? teacherNav : studentNav;

  return (
    <aside style={{ width: '240px', background: '#FFF', borderRight: `1px solid ${theme.line}`, display: 'flex', flexDirection: 'column', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px 24px', borderBottom: `1px solid ${theme.line}`, marginBottom: '16px' }}>
        <div style={{ width: '32px', height: '32px', background: theme.ink, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.gold, fontFamily: 'Instrument Serif, serif', fontSize: '22px', fontStyle: 'italic' }}>C</div>
        <div>
          <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '13px', fontWeight: 600 }}>ClassTrack</div>
          <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '10px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{user.role}</div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {nav.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 12px', marginBottom: '2px', border: 'none',
            background: currentPage === item.id ? theme.butter : 'transparent',
            borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
            fontFamily: 'Geist, sans-serif', fontSize: '13px',
            fontWeight: currentPage === item.id ? 600 : 400,
            color: currentPage === item.id ? theme.ink : theme.inkSoft,
            transition: 'all 0.12s'
          }}>
            <span style={{ fontSize: '12px', color: currentPage === item.id ? theme.gold : theme.mutedLight }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ borderTop: `1px solid ${theme.line}`, paddingTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', marginBottom: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: theme.butterDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Geist, sans-serif', fontSize: '12px', fontWeight: 600 }}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '10px', color: theme.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
          </div>
        </div>
        <Button onClick={onLogout} variant="ghost" size="sm" style={{ width: '100%' }}>Sign out</Button>
      </div>
    </aside>
  );
};

const PageHeader = ({ title, subtitle, action }) => (
  <div style={{ padding: '32px 40px 24px', borderBottom: `1px solid ${theme.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
    <div>
      {subtitle && <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', fontWeight: 500, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{subtitle}</div>}
      <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '36px', color: theme.ink, margin: 0, fontWeight: 400, letterSpacing: '-0.02em' }}>{title}</h1>
    </div>
    {action}
  </div>
);

// ============ STUDENT: HOME (PUNCH IN) ============
const StudentHome = ({ user, attendance, setAttendance }) => {
  const today = new Date('2026-04-05').toISOString().split('T')[0];
  const myAttendance = attendance.filter(a => a.studentId === user.id);
  const todayRecord = myAttendance.find(a => a.date === today);
  const thisMonth = myAttendance.filter(a => a.date.startsWith('2026-04'));
  const [punchMsg, setPunchMsg] = useState('');

  const handlePunchIn = () => {
    if (todayRecord) { setPunchMsg('Already punched in today'); return; }
    const now = new Date();
    const newRecord = {
      id: `a-${user.id}-${Date.now()}`, studentId: user.id, date: today,
      punchTime: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      status: 'present', subject: 'Excel (Theory)'
    };
    setAttendance([...attendance, newRecord]);
    setPunchMsg('Punched in successfully ✓');
  };

  return (
    <div>
      <PageHeader title={`Hello, ${user.name.split(' ')[0]}`} subtitle={`Saturday · April 5, 2026 · ${user.grade || 'Grade 11'}`} />
      <div style={{ padding: '32px 40px' }}>
        {/* Punch In Card */}
        <div style={{ background: theme.butter, borderRadius: '12px', padding: '40px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', fontFamily: 'Instrument Serif, serif', fontSize: '220px', color: theme.butterDeep, lineHeight: '1', fontStyle: 'italic', pointerEvents: 'none' }}>✓</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', fontWeight: 500, color: theme.inkSoft, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Today's Class</div>
            <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '32px', margin: '0 0 8px', fontWeight: 400 }}>Excel — Theory Session</h2>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '14px', color: theme.inkSoft, marginBottom: '28px' }}>11:30 AM – 1:30 PM · Toronto Time</div>

            {todayRecord ? (
              <div>
                <Badge variant="success">Attended · {todayRecord.punchTime}</Badge>
                <p style={{ fontFamily: 'Geist, sans-serif', fontSize: '13px', color: theme.inkSoft, marginTop: '12px' }}>You're all set for today. See you next class!</p>
              </div>
            ) : (
              <div>
                <Button onClick={handlePunchIn} variant="primary" size="lg">
                  Punch In →
                </Button>
                {punchMsg && <span style={{ marginLeft: '16px', fontFamily: 'Geist, sans-serif', fontSize: '13px', color: theme.success }}>{punchMsg}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <Card>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>This Month</div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '36px', fontWeight: 400 }}>{thisMonth.length}<span style={{ fontSize: '18px', color: theme.muted }}> classes</span></div>
          </Card>
          <Card>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Attendance Rate</div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '36px', fontWeight: 400 }}>92<span style={{ fontSize: '18px', color: theme.muted }}>%</span></div>
          </Card>
          <Card>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Pending Homework</div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '36px', fontWeight: 400 }}>2</div>
          </Card>
        </div>

        {/* Recent Classes */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '22px', fontWeight: 400, margin: '0 0 16px' }}>Recent classes</h3>
          <Card padding="0">
            {myAttendance.slice(0, 6).map((a, i) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: i < 5 ? `1px solid ${theme.line}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: theme.butter, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Instrument Serif, serif', fontSize: '18px' }}>
                    {new Date(a.date).getDate()}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '14px', fontWeight: 500 }}>{a.subject}</div>
                    <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', color: theme.muted }}>{new Date(a.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
                <Badge variant="success">{a.punchTime}</Badge>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};

// ============ ATTENDANCE CALENDAR VIEW ============
const AttendanceCalendar = ({ attendance, studentId, studentName }) => {
  const [viewDate, setViewDate] = useState(new Date('2026-04-01'));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const records = attendance.filter(a => a.studentId === studentId && a.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));
  const recordsMap = {};
  records.forEach(r => { recordsMap[parseInt(r.date.split('-')[2])] = r; });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div>
      <PageHeader
        title={studentName ? `${studentName}'s attendance` : 'My attendance'}
        subtitle="Monthly view"
        action={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button onClick={prevMonth} variant="ghost" size="sm">←</Button>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '18px', minWidth: '160px', textAlign: 'center' }}>{monthName}</div>
            <Button onClick={nextMonth} variant="ghost" size="sm">→</Button>
          </div>
        }
      />
      <div style={{ padding: '32px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <Card>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Present</div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '32px' }}>{records.length}</div>
          </Card>
          <Card>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Scheduled</div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '32px' }}>12</div>
          </Card>
          <Card>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Missed</div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '32px' }}>{12 - records.length}</div>
          </Card>
          <Card>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Rate</div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '32px' }}>{Math.round((records.length / 12) * 100)}<span style={{ fontSize: '16px', color: theme.muted }}>%</span></div>
          </Card>
        </div>

        <Card padding="24px">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ fontFamily: 'Geist, sans-serif', fontSize: '10px', fontWeight: 600, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px', textAlign: 'center' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const record = recordsMap[day];
              const dayOfWeek = new Date(year, month, day).getDay();
              const isClassDay = [0, 5, 6].includes(dayOfWeek);
              return (
                <div key={i} style={{
                  aspectRatio: '1', borderRadius: '8px',
                  background: record ? theme.butter : (isClassDay ? '#FEF2F2' : '#FAFAF9'),
                  border: `1px solid ${record ? theme.butterDeep : (isClassDay ? '#FECACA' : theme.line)}`,
                  padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '13px', fontWeight: 500, color: theme.ink }}>{day}</div>
                  {record && (
                    <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '9px', fontWeight: 600, color: theme.goldDark }}>{record.punchTime}</div>
                  )}
                  {!record && isClassDay && (
                    <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '9px', color: theme.danger }}>missed</div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${theme.line}`, fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: theme.butter, border: `1px solid ${theme.butterDeep}`, borderRadius: '3px' }} /> Present</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '3px' }} /> Missed</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: '#FAFAF9', border: `1px solid ${theme.line}`, borderRadius: '3px' }} /> No class</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ============ STUDENT: PROGRESS ============
const StudentProgress = ({ user, assignments }) => {
  const myAssignments = assignments.filter(a => a.studentId === user.id);
  const submitted = myAssignments.filter(a => a.status === 'submitted');
  const avgScore = submitted.length ? Math.round(submitted.reduce((s, a) => s + (a.score / a.totalMarks * 100), 0) / submitted.length) : 0;

  return (
    <div>
      <PageHeader title="My progress" subtitle="Homework & assessments" />
      <div style={{ padding: '32px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <Card>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Average Score</div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '36px' }}>{avgScore}<span style={{ fontSize: '18px', color: theme.muted }}>%</span></div>
          </Card>
          <Card>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Submitted</div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '36px' }}>{submitted.length}<span style={{ fontSize: '18px', color: theme.muted }}>/{myAssignments.length}</span></div>
          </Card>
          <Card>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Pending</div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '36px' }}>{myAssignments.length - submitted.length}</div>
          </Card>
        </div>

        <h3 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '22px', fontWeight: 400, margin: '0 0 16px' }}>Assignments</h3>
        <Card padding="0">
          {myAssignments.map((a, i) => (
            <div key={a.id} style={{ padding: '18px 24px', borderBottom: i < myAssignments.length - 1 ? `1px solid ${theme.line}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>{a.title}</div>
                <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', color: theme.muted }}>{a.subject} · Due {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {a.status === 'submitted' ? (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '22px' }}>{a.score}<span style={{ fontSize: '13px', color: theme.muted }}>/{a.totalMarks}</span></div>
                  </div>
                ) : (
                  <Badge variant="neutral">Pending</Badge>
                )}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// ============ TEACHER: DASHBOARD ============
const TeacherDashboard = ({ students, attendance, assignments, setPage, setSelectedStudent }) => {
  const today = '2026-04-05';
  const todayAttendance = attendance.filter(a => a.date === today);
  const thisMonth = attendance.filter(a => a.date.startsWith('2026-04'));
  const pendingHw = assignments.filter(a => a.status === 'pending').length;
  const avgAttendance = students.length ? Math.round((thisMonth.length / (students.length * 12)) * 100) : 0;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Saturday · April 5, 2026" />
      <div style={{ padding: '32px 40px' }}>
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <Card>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Total Students</div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '40px', fontWeight: 400 }}>{students.length}</div>
          </Card>
          <Card style={{ background: theme.butter, borderColor: theme.butterDeep }}>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.inkSoft, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Today's Attendance</div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '40px', fontWeight: 400 }}>{todayAttendance.length}<span style={{ fontSize: '20px', color: theme.muted }}>/{students.length}</span></div>
          </Card>
          <Card>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Avg. Attendance</div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '40px', fontWeight: 400 }}>{avgAttendance}<span style={{ fontSize: '20px', color: theme.muted }}>%</span></div>
          </Card>
          <Card>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Pending Homework</div>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '40px', fontWeight: 400 }}>{pendingHw}</div>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          {/* Today's Classes */}
          <div>
            <h3 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '22px', fontWeight: 400, margin: '0 0 16px' }}>Today's check-ins</h3>
            <Card padding="0">
              {students.map((s, i) => {
                const checkedIn = todayAttendance.find(a => a.studentId === s.id);
                return (
                  <div key={s.id} onClick={() => { setSelectedStudent(s); setPage('student-detail'); }} style={{
                    padding: '16px 20px', borderBottom: i < students.length - 1 ? `1px solid ${theme.line}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                    transition: 'background 0.12s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: theme.butterDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Geist, sans-serif', fontSize: '13px', fontWeight: 600 }}>{s.avatar}</div>
                      <div>
                        <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '14px', fontWeight: 500 }}>{s.name}</div>
                        <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', color: theme.muted }}>{s.grade}</div>
                      </div>
                    </div>
                    {checkedIn ? (
                      <Badge variant="success">In · {checkedIn.punchTime}</Badge>
                    ) : (
                      <Badge variant="neutral">Not yet</Badge>
                    )}
                  </div>
                );
              })}
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '22px', fontWeight: 400, margin: '0 0 16px' }}>Quick actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Card padding="18px" style={{ cursor: 'pointer' }}>
                <div onClick={() => setPage('students')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>Add new student</div>
                    <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', color: theme.muted }}>Register and send welcome email</div>
                  </div>
                  <div style={{ color: theme.gold, fontSize: '18px' }}>→</div>
                </div>
              </Card>
              <Card padding="18px" style={{ cursor: 'pointer' }}>
                <div onClick={() => setPage('assignments')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>Grade assignments</div>
                    <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', color: theme.muted }}>{pendingHw} pending review</div>
                  </div>
                  <div style={{ color: theme.gold, fontSize: '18px' }}>→</div>
                </div>
              </Card>
              <Card padding="18px" style={{ cursor: 'pointer' }}>
                <div onClick={() => setPage('reports')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>Send monthly reports</div>
                    <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', color: theme.muted }}>Email parents progress</div>
                  </div>
                  <div style={{ color: theme.gold, fontSize: '18px' }}>→</div>
                </div>
              </Card>
            </div>

            <div style={{ marginTop: '24px', padding: '20px', background: '#FAFAF9', borderRadius: '8px', border: `1px solid ${theme.line}` }}>
              <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '18px', fontStyle: 'italic', marginBottom: '8px' }}>"Quiet attention, consistently applied."</div>
              <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Teaching principle of the week</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ TEACHER: STUDENTS LIST ============
const StudentsList = ({ students, attendance, setStudents, setSelectedStudent, setPage }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', parentEmail: '', grade: '' });

  const handleAdd = () => {
    if (!newStudent.name || !newStudent.email) return;
    const student = {
      id: `s${Date.now()}`, ...newStudent,
      joinedAt: new Date().toISOString().split('T')[0],
      subjects: ['Mathematics'],
      avatar: newStudent.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    };
    setStudents([...students, student]);
    setNewStudent({ name: '', email: '', parentEmail: '', grade: '' });
    setShowAdd(false);
  };

  return (
    <div>
      <PageHeader title="Students" subtitle={`${students.length} enrolled`} action={
        <Button onClick={() => setShowAdd(!showAdd)} variant="gold">{showAdd ? 'Cancel' : '+ Add student'}</Button>
      } />
      <div style={{ padding: '32px 40px' }}>
        {showAdd && (
          <Card style={{ marginBottom: '24px', background: theme.butter, borderColor: theme.butterDeep }}>
            <h3 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '22px', fontWeight: 400, margin: '0 0 20px' }}>Register new student</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input label="Full Name" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} placeholder="e.g. Adeena Javaid" />
              <Input label="Student Email" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} placeholder="student@gmail.com" />
              <Input label="Parent Email" value={newStudent.parentEmail} onChange={e => setNewStudent({ ...newStudent, parentEmail: e.target.value })} placeholder="parent@gmail.com" />
              <Input label="Grade" value={newStudent.grade} onChange={e => setNewStudent({ ...newStudent, grade: e.target.value })} placeholder="Grade 11" />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <Button onClick={handleAdd} variant="primary">Register & Send Invite</Button>
              <Button onClick={() => setShowAdd(false)} variant="ghost">Cancel</Button>
            </div>
          </Card>
        )}

        <Card padding="0">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr', padding: '14px 24px', borderBottom: `1px solid ${theme.line}`, background: '#FAFAF9' }}>
            {['Student', 'Grade', 'Subjects', 'Joined', 'Attendance'].map(h => (
              <div key={h} style={{ fontFamily: 'Geist, sans-serif', fontSize: '10px', fontWeight: 600, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
            ))}
          </div>
          {students.map((s, i) => {
            const studentAtt = attendance.filter(a => a.studentId === s.id && a.date.startsWith('2026-04'));
            const rate = Math.round((studentAtt.length / 12) * 100);
            return (
              <div key={s.id} onClick={() => { setSelectedStudent(s); setPage('student-detail'); }} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr', padding: '16px 24px',
                borderBottom: i < students.length - 1 ? `1px solid ${theme.line}` : 'none', alignItems: 'center',
                cursor: 'pointer', transition: 'background 0.12s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: theme.butterDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Geist, sans-serif', fontSize: '12px', fontWeight: 600 }}>{s.avatar}</div>
                  <div>
                    <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '13px', fontWeight: 500 }}>{s.name}</div>
                    <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted }}>{s.email}</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '13px', color: theme.inkSoft }}>{s.grade}</div>
                <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', color: theme.muted }}>{s.subjects.join(', ')}</div>
                <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', color: theme.muted }}>{new Date(s.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div><Badge variant={rate >= 80 ? 'success' : rate >= 60 ? 'default' : 'danger'}>{rate}%</Badge></div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
};

// ============ TEACHER: STUDENT DETAIL ============
const StudentDetail = ({ student, attendance, assignments, setPage }) => {
  const [tab, setTab] = useState('overview');
  const studentAtt = attendance.filter(a => a.studentId === student.id);
  const studentHw = assignments.filter(a => a.studentId === student.id);
  const avgScore = studentHw.filter(a => a.status === 'submitted').length
    ? Math.round(studentHw.filter(a => a.status === 'submitted').reduce((s, a) => s + (a.score / a.totalMarks * 100), 0) / studentHw.filter(a => a.status === 'submitted').length)
    : 0;

  const emailParent = () => {
    const subject = `${student.name} — Monthly Progress Update`;
    const body = `Dear Parent,%0D%0A%0D%0AHere is ${student.name}'s progress for this month:%0D%0A%0D%0A- Attendance: ${Math.round(studentAtt.filter(a => a.date.startsWith('2026-04')).length / 12 * 100)}%25%0D%0A- Assignments submitted: ${studentHw.filter(a => a.status === 'submitted').length}/${studentHw.length}%0D%0A- Average score: ${avgScore}%25%0D%0A%0D%0ABest regards,%0D%0AApeksha`;
    window.open(`mailto:${student.parentEmail}?subject=${encodeURIComponent(subject)}&body=${body}`, '_blank');
  };

  return (
    <div>
      <div style={{ padding: '24px 40px 0' }}>
        <button onClick={() => setPage('students')} style={{ background: 'none', border: 'none', color: theme.muted, fontFamily: 'Geist, sans-serif', fontSize: '12px', cursor: 'pointer', padding: 0, marginBottom: '16px' }}>← Back to students</button>
      </div>
      <div style={{ padding: '0 40px 24px', borderBottom: `1px solid ${theme.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: theme.butterDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Instrument Serif, serif', fontSize: '26px', fontWeight: 400 }}>{student.avatar}</div>
          <div>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', fontWeight: 500, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{student.grade} · {student.subjects.join(' · ')}</div>
            <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '36px', color: theme.ink, margin: 0, fontWeight: 400, letterSpacing: '-0.02em' }}>{student.name}</h1>
            <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '13px', color: theme.muted, marginTop: '4px' }}>{student.email}</div>
          </div>
        </div>
        <Button onClick={emailParent} variant="gold">✉ Email parent</Button>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 40px', borderBottom: `1px solid ${theme.line}`, display: 'flex', gap: '4px' }}>
        {['overview', 'attendance', 'assignments', 'notes'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'Geist, sans-serif', fontSize: '13px',
            fontWeight: tab === t ? 600 : 400,
            color: tab === t ? theme.ink : theme.muted,
            borderBottom: tab === t ? `2px solid ${theme.gold}` : '2px solid transparent',
            textTransform: 'capitalize', marginBottom: '-1px'
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: '32px 40px' }}>
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <Card><div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Classes Attended</div><div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '32px' }}>{studentAtt.length}</div></Card>
              <Card><div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Avg. Score</div><div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '32px' }}>{avgScore}%</div></Card>
              <Card><div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>HW Submitted</div><div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '32px' }}>{studentHw.filter(a => a.status === 'submitted').length}/{studentHw.length}</div></Card>
              <Card><div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Days Enrolled</div><div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '32px' }}>{Math.round((new Date('2026-04-05') - new Date(student.joinedAt)) / (1000 * 60 * 60 * 24))}</div></Card>
            </div>
            <Card>
              <h3 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '20px', fontWeight: 400, margin: '0 0 16px' }}>Contact details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Student Email</div>
                  <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '14px' }}>{student.email}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Parent Email</div>
                  <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '14px' }}>{student.parentEmail}</div>
                </div>
              </div>
            </Card>
          </div>
        )}
        {tab === 'attendance' && <AttendanceCalendar attendance={attendance} studentId={student.id} studentName="" />}
        {tab === 'assignments' && (
          <Card padding="0">
            {studentHw.map((a, i) => (
              <div key={a.id} style={{ padding: '16px 24px', borderBottom: i < studentHw.length - 1 ? `1px solid ${theme.line}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '14px', fontWeight: 500 }}>{a.title}</div>
                  <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', color: theme.muted }}>{a.subject} · Due {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
                {a.status === 'submitted'
                  ? <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: '22px' }}>{a.score}<span style={{ fontSize: '13px', color: theme.muted }}>/{a.totalMarks}</span></div>
                  : <Badge variant="neutral">Pending</Badge>}
              </div>
            ))}
          </Card>
        )}
        {tab === 'notes' && (
          <Card>
            <h3 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '20px', fontWeight: 400, margin: '0 0 16px' }}>Teacher notes</h3>
            {MOCK_PROGRESS_NOTES.filter(n => n.studentId === student.id).map(n => (
              <div key={n.id} style={{ padding: '14px 0', borderBottom: `1px solid ${theme.line}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <Badge variant="default">{n.topic}</Badge>
                  <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted }}>{new Date(n.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '14px', lineHeight: '1.6', color: theme.inkSoft }}>{n.note}</div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

// ============ TEACHER: ASSIGNMENTS ============
const TeacherAssignments = ({ assignments, students }) => (
  <div>
    <PageHeader title="Assignments" subtitle={`${assignments.length} total · ${assignments.filter(a => a.status === 'pending').length} pending`} />
    <div style={{ padding: '32px 40px' }}>
      <Card padding="0">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', padding: '14px 24px', borderBottom: `1px solid ${theme.line}`, background: '#FAFAF9' }}>
          {['Assignment', 'Student', 'Subject', 'Due', 'Status/Score'].map(h => (
            <div key={h} style={{ fontFamily: 'Geist, sans-serif', fontSize: '10px', fontWeight: 600, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
          ))}
        </div>
        {assignments.map((a, i) => {
          const student = students.find(s => s.id === a.studentId);
          return (
            <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', padding: '14px 24px', borderBottom: i < assignments.length - 1 ? `1px solid ${theme.line}` : 'none', alignItems: 'center' }}>
              <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '13px', fontWeight: 500 }}>{a.title}</div>
              <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '13px', color: theme.inkSoft }}>{student?.name}</div>
              <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', color: theme.muted }}>{a.subject}</div>
              <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', color: theme.muted }}>{new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              <div>{a.status === 'submitted'
                ? <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: '18px' }}>{a.score}<span style={{ fontSize: '11px', color: theme.muted }}>/{a.totalMarks}</span></span>
                : <Badge variant="neutral">Pending</Badge>}</div>
            </div>
          );
        })}
      </Card>
    </div>
  </div>
);

// ============ TEACHER: REPORTS ============
const TeacherReports = ({ students, attendance, assignments }) => {
  const sendReport = (student) => {
    const studentAtt = attendance.filter(a => a.studentId === student.id && a.date.startsWith('2026-04'));
    const studentHw = assignments.filter(a => a.studentId === student.id);
    const submitted = studentHw.filter(a => a.status === 'submitted');
    const avgScore = submitted.length ? Math.round(submitted.reduce((s, a) => s + (a.score / a.totalMarks * 100), 0) / submitted.length) : 0;
    const attRate = Math.round((studentAtt.length / 12) * 100);
    const subject = `${student.name} — Monthly Progress Report (April 2026)`;
    const body = `Dear Parent,%0D%0A%0D%0AHere is ${student.name}'s progress for April 2026:%0D%0A%0D%0A- Attendance Rate: ${attRate}%25 (${studentAtt.length}/12 classes)%0D%0A- Assignments Submitted: ${submitted.length}/${studentHw.length}%0D%0A- Average Score: ${avgScore}%25%0D%0A- Subjects: ${student.subjects.join(', ')}%0D%0A%0D%0APlease reach out if you have any questions or would like to discuss ${student.name.split(' ')[0]}'s progress in detail.%0D%0A%0D%0ABest regards,%0D%0AApeksha`;
    window.open(`mailto:${student.parentEmail}?subject=${encodeURIComponent(subject)}&body=${body}`, '_blank');
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Send monthly progress to parents via Gmail" />
      <div style={{ padding: '32px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {students.map(s => {
            const studentAtt = attendance.filter(a => a.studentId === s.id && a.date.startsWith('2026-04'));
            const studentHw = assignments.filter(a => a.studentId === s.id);
            const submitted = studentHw.filter(a => a.status === 'submitted');
            const avgScore = submitted.length ? Math.round(submitted.reduce((sum, a) => sum + (a.score / a.totalMarks * 100), 0) / submitted.length) : 0;
            const attRate = Math.round((studentAtt.length / 12) * 100);
            return (
              <Card key={s.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: theme.butterDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Geist, sans-serif', fontSize: '13px', fontWeight: 600 }}>{s.avatar}</div>
                  <div>
                    <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '14px', fontWeight: 500 }}>{s.name}</div>
                    <div style={{ fontFamily: 'Geist, sans-serif', fontSize: '11px', color: theme.muted }}>{s.parentEmail}</div>
                  </div>
                </div>
                <div style={{ background: '#FAFAF9', borderRadius: '6px', padding: '14px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', color: theme.muted }}>Attendance</span>
                    <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', fontWeight: 600 }}>{attRate}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', color: theme.muted }}>Homework</span>
                    <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', fontWeight: 600 }}>{submitted.length}/{studentHw.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', color: theme.muted }}>Avg. Score</span>
                    <span style={{ fontFamily: 'Geist, sans-serif', fontSize: '12px', fontWeight: 600 }}>{avgScore}%</span>
                  </div>
                </div>
                <Button onClick={() => sendReport(s)} variant="primary" style={{ width: '100%' }}>✉ Send report</Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============ MAIN APP ============
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [attendance, setAttendance] = useState(MOCK_ATTENDANCE);
  const [assignments] = useState(MOCK_ASSIGNMENTS);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleLogin = (role) => {
    if (role === 'teacher') {
      setUser({ id: 't1', role: 'teacher', name: 'Apeksha Patil', email: 'apeksha@prosys.com' });
      setPage('dashboard');
    } else {
      setUser({ id: 's1', role: 'student', name: 'Adeena Javaid', email: 'adeena.j1win@gmail.com', grade: 'Grade 11' });
      setPage('home');
    }
  };

  if (!user) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Geist', sans-serif; }
      `}</style>
      <LoginScreen onLogin={handleLogin} />
    </>
  );

  const renderPage = () => {
    if (user.role === 'teacher') {
      if (page === 'dashboard') return <TeacherDashboard students={students} attendance={attendance} assignments={assignments} setPage={setPage} setSelectedStudent={setSelectedStudent} />;
      if (page === 'students') return <StudentsList students={students} attendance={attendance} setStudents={setStudents} setSelectedStudent={setSelectedStudent} setPage={setPage} />;
      if (page === 'student-detail' && selectedStudent) return <StudentDetail student={selectedStudent} attendance={attendance} assignments={assignments} setPage={setPage} />;
      if (page === 'attendance') return <AttendanceCalendar attendance={attendance} studentId={students[0].id} studentName={students[0].name} />;
      if (page === 'assignments') return <TeacherAssignments assignments={assignments} students={students} />;
      if (page === 'reports') return <TeacherReports students={students} attendance={attendance} assignments={assignments} />;
    } else {
      if (page === 'home') return <StudentHome user={user} attendance={attendance} setAttendance={setAttendance} />;
      if (page === 'attendance') return <AttendanceCalendar attendance={attendance} studentId={user.id} studentName="" />;
      if (page === 'progress') return <StudentProgress user={user} assignments={assignments} />;
    }
    return <div style={{ padding: '40px' }}>Page not found</div>;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Geist', sans-serif; background: #FFF; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #FAFAF9; }
        ::-webkit-scrollbar-thumb { background: #D6D3D1; border-radius: 4px; }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#FFF' }}>
        <Sidebar user={user} currentPage={page} setPage={setPage} onLogout={() => setUser(null)} />
        <main style={{ flex: 1, overflow: 'auto' }}>{renderPage()}</main>
      </div>
    </>
  );
}
