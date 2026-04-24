import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 32 }) => (
  <div className="flex items-center justify-center p-10">
    <Loader2 
      className="animate-spin text-[var(--primary)]" 
      size={size} 
    />
  </div>
);
