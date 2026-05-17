import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'scanning' | 'idle' | 'error' | 'success';
  label: string;
  pulse?: boolean;
}

export const StatusBadge = ({ 
  status, 
  label, 
  pulse = true 
}: StatusBadgeProps) => {
  const colors = {
    active: 'text-blue-400 bg-blue-400',
    scanning: 'text-amber-400 bg-amber-400',
    idle: 'text-slate-500 bg-slate-500',
    error: 'text-red-500 bg-red-500',
    success: 'text-emerald-400 bg-emerald-400'
  };

  return (
    <div className={cn("flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full")}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        colors[status].split(' ')[1],
        pulse && "animate-pulse shadow-[0_0_8px_currentColor]"
      )} />
      <span className={cn("text-[9px] font-bold uppercase tracking-widest", colors[status].split(' ')[0])}>
        {label}
      </span>
    </div>
  );
};

StatusBadge.displayName = 'StatusBadge';
