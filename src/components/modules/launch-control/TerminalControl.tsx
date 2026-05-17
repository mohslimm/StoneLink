'use client';

import React, { memo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon } from 'lucide-react';
import { useStoneStore } from '@/stores/useStoneStore';
import { cn } from '@/lib/utils';

export const TerminalControl = memo(() => {
  const terminalEvents = useStoneStore((state) => state.terminalEvents);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [terminalEvents]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a14] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative font-['JetBrains_Mono']">
      <div className="flex items-center justify-between px-6 py-4 bg-[#0f0f20]/60 border-b border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <TerminalIcon size={14} className="text-[#c5a059]" />
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] font-['Outfit']">System Telemetry</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
      </div>

      <div 
        ref={containerRef}
        className="flex-1 p-6 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent text-xs"
      >
        <AnimatePresence initial={false}>
          {terminalEvents.map((evt) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "flex items-start gap-3",
                evt.type === 'error' || evt.type === 'alert' ? 'text-red-400' :
                evt.type === 'success' ? 'text-[#c5a059]' :
                evt.type === 'warning' ? 'text-amber-400' :
                'text-[#f0ede8]/70'
              )}
            >
              <span className="text-[#f0ede8]/20 shrink-0 font-bold">
                [{new Date(evt.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
              </span>
              <span className="flex-1 leading-relaxed break-all">
                <span className="text-white/40 font-semibold mr-1.5 uppercase text-[9px] tracking-wider font-['Outfit']">
                  [{evt.module}]
                </span>
                {evt.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {terminalEvents.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20 font-['Outfit']">
            <TerminalIcon className="w-8 h-8 mb-3 text-white/40" />
            <p className="text-xs">No active telemetry events.</p>
          </div>
        )}
      </div>
    </div>
  );
});

TerminalControl.displayName = 'TerminalControl';
export default TerminalControl;