import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Hexagon, Mail, Lock, User as UserIcon } from 'lucide-react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export const AuthPage = ({ showToast }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };

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
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          particles: {
            color: { value: ["#7C3AED", "#06B6D4"] },
            links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.1, width: 1 },
            move: { enable: true, speed: 1, direction: "none", random: true, straight: false, outModes: { default: "bounce" } },
            number: { density: { enable: true, area: 800 }, value: 40 },
            opacity: { value: 0.3 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 z-0"
      />

      {/* Decorative Orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[var(--primary)]/20 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[var(--cyan)]/20 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[var(--cyan)] box-glow-cyan backdrop-blur-md">
              <Hexagon className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight font-display">ClassTrack</span>
          </motion.div>
        </div>

        <div className="glass-panel-strong rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle gradient border effect on top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--cyan)] via-[var(--primary)] to-[var(--cyan)] opacity-50" />
          
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            {mode === 'login' ? 'Sign in to access your dashboard' : 'Start tracking your learning journey'}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {mode === 'signup' && (
                <div className="space-y-4 mb-4">
                  <Input 
                    icon={<UserIcon className="w-4 h-4" />}
                    label="Full Name" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    placeholder="Adeena Javaid" 
                  />
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wider">Account Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['student', 'teacher'].map(r => (
                        <button 
                          key={r} 
                          onClick={() => setRole(r)} 
                          type="button" 
                          className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                            role === r 
                              ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30' 
                              : 'bg-white/5 text-[var(--text-muted)] hover:bg-white/10 hover:text-white border border-white/5'
                          }`}
                        >
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Input 
                  icon={<Mail className="w-4 h-4" />}
                  label="Email" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="you@example.com" 
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()} 
                />
                <Input 
                  icon={<Lock className="w-4 h-4" />}
                  label="Password" 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()} 
                  error={error} 
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                variant="accent" 
                size="lg" 
                loading={loading} 
                fullWidth 
                className="mt-6"
              >
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </Button>
            </motion.div>
          </AnimatePresence>

          <div className="text-center mt-6 text-sm text-[var(--text-muted)]">
            {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
            <button 
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} 
              className="text-white font-semibold hover:text-[var(--cyan)] transition-colors focus:outline-none"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 text-xs text-[var(--text-muted)] tracking-wider uppercase font-medium"
        >
          Powered by Supabase · Built for teachers & students
        </motion.div>
      </motion.div>
    </div>
  );
};
