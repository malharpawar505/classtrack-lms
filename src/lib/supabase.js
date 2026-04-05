import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
