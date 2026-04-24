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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          particles: {
            color: { value: ["#0ea5e9", "#3b82f6"] },
            links: { color: "#0ea5e9", distance: 150, enable: true, opacity: 0.2, width: 1 },
            move: { enable: true, speed: 1.5, direction: "none", random: true, straight: false, outModes: { default: "bounce" } },
            number: { density: { enable: true, area: 800 }, value: 50 },
            opacity: { value: 0.6 },
            shape: { type: "circle" },
            size: { value: { min: 2, max: 4 } },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 z-0"
      />

      {/* Decorative Animated Orbs */}
      <motion.div 
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-sky-200/50 blur-[100px] pointer-events-none" 
      />
      <motion.div 
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -30, 0], scale: [1, 0.95, 1.1, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-200/50 blur-[100px] pointer-events-none" 
      />
      <motion.div 
        animate={{ x: [0, 15, -15, 0], y: [0, -15, 15, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-100/30 blur-[80px] pointer-events-none" 
      />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-white border border-sky-100 rounded-2xl flex items-center justify-center text-sky-500 shadow-lg shadow-sky-500/20 backdrop-blur-md">
              <Hexagon className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight font-display">Lumina</span>
          </motion.div>
        </div>

        <div className="glass-panel-strong rounded-2xl p-8 relative overflow-hidden">
          {/* Subtle gradient border effect on top */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400" />
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-sm text-slate-500 font-medium mb-8">
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
                    <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Account Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['student', 'teacher'].map(r => (
                        <button 
                          key={r} 
                          onClick={() => setRole(r)} 
                          type="button" 
                          className={`py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                            role === r 
                              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 ring-2 ring-sky-500 ring-offset-2' 
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
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
                variant="primary" 
                size="lg" 
                loading={loading} 
                fullWidth 
                className="mt-6"
              >
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </Button>
            </motion.div>
          </AnimatePresence>

          <div className="text-center mt-6 text-sm text-slate-500 font-medium">
            {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
            <button 
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} 
              className="text-sky-600 font-bold hover:text-sky-700 transition-colors focus:outline-none"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 text-xs text-slate-400 tracking-wider uppercase font-bold"
        >
          Lumina LMS · Elevating Education
        </motion.div>
      </motion.div>
    </div>
  );
};
