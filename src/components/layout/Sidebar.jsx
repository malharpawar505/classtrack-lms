import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { 
  LayoutDashboard, Users, BookOpen, BarChart3, 
  Home, CalendarCheck, TrendingUp, LogOut, Hexagon
} from 'lucide-react';

export const Sidebar = ({ profile, currentPage, setPage, onLogout }) => {
  const teacherNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];
  const studentNav = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'assignments', label: 'My Assignments', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];
  
  const nav = profile?.role === 'teacher' ? teacherNav : studentNav;

  return (
    <motion.aside 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-[260px] bg-white border-r border-slate-200 flex flex-col p-5 sticky top-0 h-screen shrink-0 z-40"
    >
      <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-4">
        <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600 box-glow-cyan">
          <Hexagon className="w-6 h-6" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-slate-900 tracking-tight">ClassTrack</div>
          <div className="text-[10px] text-sky-600 uppercase tracking-widest font-bold">{profile?.role}</div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {nav.map((item) => {
          const active = currentPage === item.id || (currentPage === 'student-detail' && item.id === 'students');
          const Icon = item.icon;
          
          return (
            <button 
              key={item.id} 
              onClick={() => setPage(item.id)} 
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors w-full text-left group",
                active ? "text-sky-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              {active && (
                <motion.div 
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 bg-sky-50 rounded-lg border border-sky-100"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {active && (
                <motion.div 
                  layoutId="activeNavLine"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sky-500 rounded-r-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn("w-[18px] h-[18px] relative z-10 transition-colors", active ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600")} />
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-3 p-2 mb-3">
          <Avatar name={profile?.full_name} size={36} variant="blue" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-900 truncate">{profile?.full_name}</div>
            <div className="text-[11px] text-slate-500 font-medium truncate">{profile?.email}</div>
          </div>
        </div>
        <Button onClick={onLogout} variant="ghost" size="sm" fullWidth className="text-slate-500 hover:text-slate-900 font-bold border-transparent bg-transparent hover:bg-slate-100">
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
      </div>
    </motion.aside>
  );
};
