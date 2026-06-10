import { createClient } from '@supabase/supabase-js';

// Vercel serverless function. Lets a logged-in teacher set a new password for
// a student account. Requires SUPABASE_SERVICE_ROLE_KEY in the Vercel project
// env — the service key stays server-side and is never shipped to the browser.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return res.status(500).json({ error: 'Server not configured: add SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables' });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // Identify the caller from their Supabase access token
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Not signed in' });
  const { data: caller, error: callerError } = await admin.auth.getUser(token);
  if (callerError || !caller?.user) return res.status(401).json({ error: 'Invalid session' });

  const { data: callerProfile } = await admin.from('profiles').select('role').eq('id', caller.user.id).single();
  if (callerProfile?.role !== 'teacher') {
    return res.status(403).json({ error: 'Only teachers can reset student passwords' });
  }

  const { studentId, newPassword } = req.body || {};
  if (!studentId || typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ error: 'A student and a password of at least 6 characters are required' });
  }

  // Only allow resetting student accounts, never other teachers
  const { data: targetProfile } = await admin.from('profiles').select('role').eq('id', studentId).single();
  if (targetProfile?.role !== 'student') {
    return res.status(403).json({ error: 'Target is not a student account' });
  }

  // email_confirm also unblocks students stuck on "verify your email"
  const { error: updateError } = await admin.auth.admin.updateUserById(studentId, {
    password: newPassword,
    email_confirm: true
  });
  if (updateError) return res.status(500).json({ error: updateError.message });

  return res.status(200).json({ ok: true });
}
