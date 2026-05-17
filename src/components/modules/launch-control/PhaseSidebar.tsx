'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PhaseSidebarProps } from './LaunchControl.types';

export const PhaseSidebar = memo(({ phases, activePhaseId, onPhaseSelect }: PhaseSidebarProps) => {
  return (
    <div className="flex flex-col gap-3">
      {phases.map((phase, index) => {
        const isActive = activePhaseId === phase.id;
        const Icon = phase.icon;

        return (
          <motion.button
            key={phase.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => onPhaseSelect(phase.id)}
            className={cn(
              "group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 text-left",
              isActive 
                ? "bg-[#c5a059]/10 border border-[#c5a059]/30 shadow-[0_0_20px_rgba(197,160,89,0.05)]" 
                : "hover:bg-white/5 border border-transparent"
            )}
          >
            {/* Status Indicator Line */}
            {isActive && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-[#c5a059] rounded-r-full shadow-[0_0_10px_#c5a059]"
              />
            )}

            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0",
              isActive 
                ? "bg-[#c5a059] text-[#1A1200] shadow-[0_0_15px_rgba(197,160,89,0.4)]" 
                : "bg-white/5 text-[#f0ede8]/40 group-hover:text-[#f0ede8]/60 group-hover:bg-white/10"
            )}>
              <Icon size={18} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className={cn(
                  "text-[9px] font-bold tracking-widest uppercase",
                  isActive ? "text-[#c5a059]" : "text-[#f0ede8]/20"
                )}>
                  {phase.number}
                </span>
                {phase.status === 'ready' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                )}
              </div>
              <h3 className={cn(
                "text-sm font-['Outfit'] font-medium truncate tracking-wide",
                isActive ? "text-[#f0ede8]" : "text-[#f0ede8]/50 group-hover:text-[#f0ede8]/80"
              )}>
                {phase.title}
              </h3>
            </div>
          </motion.button>
        );
      })}

      <div className="mt-8 pt-6 border-t border-white/5">
        <div className="p-5 rounded-xl bg-[#0f0f20]/50 border border-white/5 backdrop-blur-sm group hover:border-[#c5a059]/20 transition-colors">
          <p className="text-[10px] font-['Outfit'] font-bold text-[#f0ede8]/20 uppercase tracking-[0.2em] mb-4">
            Current Strategy
          </p>
          <p className="text-sm font-['Cormorant_Garamond'] italic text-[#f0ede8]/80 leading-relaxed group-hover:text-[#f0ede8] transition-colors">
            "La discrétion est l'âme du luxe, l'automatisation est son moteur."
          </p>
        </div>
      </div>
    </div>
  );
});

PhaseSidebar.displayName = 'PhaseSidebar';
