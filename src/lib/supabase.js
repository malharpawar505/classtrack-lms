import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Creates a student account WITHOUT touching the current (teacher) session.
// auth.signUp on the main client would replace the logged-in session with the
// new student's, so we use a throwaway client that never persists its session.
export const createStudentAccount = async ({ email, password, fullName, grade, parentEmail }) => {
  const temp = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'lumina-student-signup' }
  });
  const { data, error } = await temp.auth.signUp({
    email, password,
    options: { data: { full_name: fullName, role: 'student' } }
  });
  if (error) return { data: null, needsEmailConfirm: false, error };

  // No session back means the project requires email confirmation before login.
  const needsEmailConfirm = !data.session;
  if (data.user) {
    // With a session, update as the new student; otherwise try as the teacher.
    const db = data.session ? temp : supabase;
    const { error: profileError } = await db.from('profiles').update({
      grade: grade || null,
      parent_email: parentEmail || null,
      avatar: fullName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }).eq('id', data.user.id);
    if (profileError) console.warn('Student profile details not saved:', profileError.message);
    if (data.session) await temp.auth.signOut();
  }
  return { data, needsEmailConfirm, error: null };
};

// Sets a new password for an existing student via the serverless admin
// endpoint (api/reset-student-password.js). Passwords can't be read back,
// so resetting is the only way to hand an existing student fresh credentials.
export const resetStudentPassword = async (studentId, newPassword) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: { message: 'Not signed in' } };
  try {
    const res = await fetch('/api/reset-student-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ studentId, newPassword })
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { error: { message: body.error || `Request failed (${res.status})` } };
    return { error: null };
  } catch {
    return { error: { message: 'Could not reach the server. Note: this only works on the deployed site, not local dev.' } };
  }
};

export const signUp = async (email, password, fullName, role = 'student') => {
  return await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName, role } }
  });
};

export const signIn = async (email, password) =>
  await supabase.auth.signInWithPassword({ email, password });

export const signOut = async () => await supabase.auth.signOut();

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single();
  return profile;
};

export const getMyStudents = async (teacherId) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select('student:profiles!student_id(*)')
    .eq('teacher_id', teacherId).eq('active', true);
  return { data: data?.map(e => e.student) || [], error };
};

export const punchIn = async (studentId, subject) => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().split(' ')[0];
  return await supabase.from('attendance')
    .insert({ student_id: studentId, date: today, punch_time: now, subject, status: 'present' })
    .select().single();
};

export const getAttendance = async (studentId, startDate, endDate) =>
  await supabase.from('attendance').select('*')
    .eq('student_id', studentId).gte('date', startDate).lte('date', endDate)
    .order('date', { ascending: false });

export const getAssignments = async (studentId) =>
  await supabase.from('assignments').select('*')
    .eq('student_id', studentId).order('due_date', { ascending: true });
