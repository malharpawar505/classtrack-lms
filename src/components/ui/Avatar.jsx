import React from 'react';
import { cn } from '../../lib/utils';

const colors = {
  accent: "bg-[var(--cyan)]/20 text-[var(--cyan)] border-[var(--cyan)]/30",
  dark: "bg-black/50 text-[var(--primary)] border-[var(--primary)]/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export const Avatar = ({ name, size = 36, variant = 'accent' }) => {
  const initials = name?.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  
  return (
    <div 
      className={cn(
        "rounded-full flex items-center justify-center font-semibold shrink-0 border border-transparent font-mono",
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
