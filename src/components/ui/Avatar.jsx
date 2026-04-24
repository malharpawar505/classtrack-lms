import React from 'react';
import { cn } from '../../lib/utils';

const colors = {
  accent: "bg-sky-100 text-sky-700 border-sky-200",
  dark: "bg-slate-800 text-white border-slate-700",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
};

export const Avatar = ({ name, size = 36, variant = 'accent' }) => {
  const initials = name?.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  
  return (
    <div 
      className={cn(
        "rounded-full flex items-center justify-center font-bold shrink-0 border shadow-sm font-mono",
        colors[variant]
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
};
