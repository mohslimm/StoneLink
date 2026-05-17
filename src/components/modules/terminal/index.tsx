'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal as TerminalIcon, 
  ChevronRight, 
  Shield, 
  Zap,
  Lock,
  Cpu,
  Globe
} from 'lucide-react';
import { TERMINAL_VARIANTS } from './StoneTerminal.variants';
import { useTerminal } from './terminal.hooks';
import { cn } from '@/lib/utils';

export const StoneTerminal = memo(() => {
  const { terminalEvents, input, setInput, scrollRef, handleCommand } = useTerminal();

  return (
    <motion.div 
      variants={TERMINAL_VARIANTS.container}
      initial="initial"
      animate="animate"
      className="flex flex-col h-full bg-[#060610] border border-white/5 rounded-[2rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.4)] backdrop-blur-3xl relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/2 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-[#0f0f20]/60 border-b border-white/5 relative z-10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20">
            <TerminalIcon size={14} className="text-[#c5a059]" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#f0ede8] uppercase tracking-[0.3em] font-['Outfit']">StoneLink Kernel</span>
            <div className="flex items-center gap-2 mt-0.5">
               <div className="w-1 h-1 rounded-full bg-[#22c55e] animate-pulse" />
               <span className="text-[8px] font-mono text-[#f0ede8]/20 uppercase tracking-widest">v2.0.4 — Localhost OS</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] font-['Outfit']">
            <span className="flex items-center gap-2 text-[#f0ede8]/30"><Lock size={10} /> Secure</span>
            <span className="flex items-center gap-2 text-[#c5a059]"><Zap size={10} className="animate-pulse" /> Live Matrix</span>
          </div>
          <div className="w-px h-6 bg-white/5" />
          <Globe size={14} className="text-[#f0ede8]/10" />
        </div>
      </div>

      {/* Content */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-3 scrollbar-none relative z-10 font-['JetBrains_Mono'] selection:bg-[#c5a059] selection:text-black"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {terminalEvents.map((event, i) => (
            <motion.div 
              key={`${event.timestamp}-${i}`} 
              variants={TERMINAL_VARIANTS.line}
              initial="initial"
              animate="animate"
              className={cn(
                "flex gap-5 text-xs leading-relaxed group/line",
                event.type === 'error' ? 'text-[#ef4444]' :
                event.type === 'success' ? 'text-[#c5a059]' :
                event.type === 'warning' ? 'text-[#f59e0b]' :
                event.type === 'info' ? 'text-[#3b82f6]/80' :
                'text-[#f0ede8]/70'
              )}
            >
              <span className="text-[#f0ede8]/10 shrink-0 font-bold tracking-tighter w-16 group-hover/line:text-[#f0ede8]/30 transition-colors">
                [{new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
              </span>
              <span className="whitespace-pre-wrap tracking-tight">
                {event.message.startsWith('>') ? (
                   <span className="text-white font-bold">{event.message}</span>
                ) : event.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Terminal Blinker */}
        <div className="flex items-center gap-5 text-[#c5a059]/40 py-2">
           <span className="w-16 shrink-0 opacity-0">spacer</span>
           <motion.div 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-4 bg-[#c5a059]/40 rounded-sm"
           />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleCommand} className="px-8 py-6 bg-[#0a0a14] border-t border-white/5 relative z-10 group/input">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#c5a059]/10 to-transparent rounded-full blur opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
        
        <div className="flex items-center gap-5 relative bg-[#0f0f20]/50 border border-white/5 rounded-2xl px-6 py-4 focus-within:border-[#c5a059]/30 transition-all shadow-inner">
          <div className="flex items-center gap-2">
             <ChevronRight size={16} className="text-[#c5a059]" />
             <Cpu size={12} className="text-[#f0ede8]/10" />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[#c5a059] placeholder:text-[#f0ede8]/5 font-['JetBrains_Mono'] text-sm tracking-tight"
            placeholder="Execute system protocol..."
            autoComplete="off"
            spellCheck="false"
          />
          <div className="flex items-center gap-3 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
             <span className="text-[8px] font-bold text-[#f0ede8]/20 uppercase tracking-widest">Type 'help' for manual</span>
          </div>
        </div>
      </form>
    </motion.div>
  );
});

StoneTerminal.displayName = 'StoneTerminal';

export * from './terminal.service';
export * from './terminal.hooks';
export * from './StoneTerminal.types';
export * from './StoneTerminal.variants';

export default StoneTerminal;
