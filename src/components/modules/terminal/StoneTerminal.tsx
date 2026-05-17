'use client';

import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal as TerminalIcon, 
  ChevronRight, 
  Shield, 
  Zap 
} from 'lucide-react';
import { useStoneStore } from '@/stores/useStoneStore';
import { TERMINAL_VARIANTS } from './StoneTerminal.variants';


export const StoneTerminal = memo(() => {
  const { terminalEvents, addTerminalEvent } = useStoneStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalEvents]);

  const handleCommand = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    addTerminalEvent({ message: `> ${input}`, type: 'info', module: 'terminal' });
    
    // Command Processing Logic
    const fullCmd = input.trim();
    const args = fullCmd.split(' ');
    const cmd = args[0].toLowerCase();
    const store = useStoneStore.getState();
    
    if (cmd === 'clear') {
      addTerminalEvent({ message: 'Console cleared.', type: 'success', module: 'terminal' });
    } else if (cmd === 'purge' || cmd === 'reset') {
      store.purgeSystem();
    } else if (cmd === 'scan' && args[1]) {
      addTerminalEvent({ message: `[RADAR] Scanning market footprint for ${args[1]}...`, type: 'scan', module: 'market-link' });
      setTimeout(() => {
        addTerminalEvent({ message: `[RADAR] Detection complete: 3 high-intent signals found.`, type: 'detection', module: 'market-link' });
      }, 2000);
    } else if (cmd === 'prospect' && args[1]) {
      const p = store.prospects.find(p => p.id === args[1] || p.companyName.toLowerCase().includes(args[1].toLowerCase()));
      if (p) {
        store.navigateTo('pipeline', p.id, 'profile');
        addTerminalEvent({ message: `Navigating to prospect: ${p.companyName}...`, type: 'info', module: 'pipeline', prospectId: p.id });
      } else {
        addTerminalEvent({ message: `Prospect not found: ${args[1]}`, type: 'alert', module: 'pipeline' });
      }
    } else if (cmd === 'call' && args[1]) {
      const p = store.prospects.find(p => p.id === args[1] || p.companyName.toLowerCase().includes(args[1].toLowerCase()));
      if (p) {
        store.navigateTo('pipeline', p.id, 'call');
        addTerminalEvent({ message: `Initializing call sequence for ${p.companyName}...`, type: 'info', module: 'pipeline', prospectId: p.id });
      } else {
        addTerminalEvent({ message: `Prospect not found: ${args[1]}`, type: 'alert', module: 'pipeline' });
      }
    } else if (cmd === 'generate' && args[1]) {
      const p = store.prospects.find(p => p.id === args[1] || p.companyName.toLowerCase().includes(args[1].toLowerCase()));
      if (p) {
        addTerminalEvent({ message: `Generating AI assets for ${p.companyName}...`, type: 'generation', module: 'sales-intelligence', prospectId: p.id });
      } else {
        addTerminalEvent({ message: `Prospect not found: ${args[1]}`, type: 'alert', module: 'sales-intelligence' });
      }
    } else if (cmd === 'stats') {
      const stats = store.getStats();
      addTerminalEvent({ message: `[BI] Pipeline Value: ${stats.pipelineValue}€ | Active Prospects: ${stats.totalProspects}`, type: 'success', module: 'shadow-intelligence' });
    } else {
      // Fallback: contextual agent
      addTerminalEvent({ message: `[SYSTEM] Command unrecognized. Transferring context to Agent...`, type: 'alert', module: 'agent' });
      store.navigateTo('agent');
      // On pourrait rajouter la gestion du passage d'input à l'agent
    }

    setInput('');
  }, [input, addTerminalEvent]);

  return (
    <motion.div 
      variants={TERMINAL_VARIANTS.container}
      initial="initial"
      animate="animate"
      className="flex flex-col h-full bg-[#060610] border border-white/10 rounded-xl overflow-hidden font-mono text-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-[#c5a059]" />
          <span className="text-white/60 text-xs font-medium uppercase tracking-wider">StoneLink Ultimate Terminal</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-white/40 uppercase tracking-widest">
          <span className="flex items-center gap-1"><Shield size={10} /> Secure</span>
          <span className="flex items-center gap-1 text-[#c5a059]"><Zap size={10} /> Live</span>
        </div>
      </div>

      {/* Content */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10"
      >
        <AnimatePresence mode="popLayout">
          {terminalEvents.map((event, i) => (
            <motion.div 
              key={`${event.timestamp}-${i}`} 
              variants={TERMINAL_VARIANTS.line}
              initial="initial"
              animate="animate"
              className={`flex gap-3 ${
                event.type === 'error' ? 'text-red-400' :
                event.type === 'success' ? 'text-[#c5a059]' :
                event.type === 'warning' ? 'text-amber-400' :
                'text-white/80'
              }`}
            >
              <span className="text-white/20 shrink-0">
                {new Date(event.timestamp).toLocaleTimeString([], { hour12: false })}
              </span>
              <span className="leading-relaxed whitespace-pre-wrap">{event.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <form onSubmit={handleCommand} className="p-4 bg-white/5 border-t border-white/10">
        <div className="flex items-center gap-3">
          <ChevronRight size={16} className="text-[#c5a059]" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[#c5a059] placeholder:text-white/10"
            placeholder="Execute protocol..."
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </form>
    </motion.div>
  );
});

StoneTerminal.displayName = 'StoneTerminal';
