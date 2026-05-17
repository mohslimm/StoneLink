'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Shield, 
  Zap, 
  Cpu,
  Terminal,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { AGENT_VARIANTS } from './AgentModule.variants';
import { useAgent } from './agent.hooks';
import { cn } from '@/lib/utils';

export const AgentModule = memo(() => {
  const { 
    input, 
    setInput, 
    loading, 
    messages, 
    activeProspect, 
    scrollRef, 
    handleSend 
  } = useAgent();

  return (
    <motion.div 
      variants={AGENT_VARIANTS.container} 
      initial="initial" 
      animate="animate"
      className="max-w-6xl mx-auto h-[85vh] flex flex-col bg-[#0a0a14] border border-white/5 rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#c5a059]/2 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="px-12 py-8 bg-[#0f0f20]/50 border-b border-white/5 flex items-center justify-between relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#0f0f20] rounded-2xl flex items-center justify-center border border-[#c5a059]/30 relative group">
            <div className="absolute inset-0 bg-[#c5a059]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Bot className="text-[#c5a059] relative z-10" size={32} />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#22c55e] rounded-full border-[3px] border-[#0f0f20] animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-['Cormorant_Garamond'] text-[#f0ede8] italic">StoneLink Agent</h2>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-black">Neural Ready</span>
              </div>
              <span className="text-[10px] text-[#f0ede8]/20 uppercase tracking-[0.2em] font-bold font-['Outfit']">Claude 3.7 Opus Kernel</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeProspect ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 py-3 bg-[#c5a059]/5 border border-[#c5a059]/20 rounded-2xl flex items-center gap-4 group"
            >
              <div className="w-8 h-8 rounded-full bg-[#c5a059]/20 flex items-center justify-center border border-[#c5a059]/30">
                 <Shield size={14} className="text-[#c5a059]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-[#c5a059]/60 font-bold uppercase tracking-[0.3em]">Active Context</span>
                <span className="text-xs font-['Cormorant_Garamond'] italic text-[#f0ede8] group-hover:text-white transition-colors">{activeProspect.companyName}</span>
              </div>
            </motion.div>
          ) : (
            <div className="px-6 py-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3 opacity-20">
               <Terminal size={14} className="text-[#f0ede8]" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Listening...</span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-none relative z-10"
      >
        {!activeProspect ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
             <div className="relative">
                <Bot size={80} className="text-[#f0ede8]/5" />
                <motion.div 
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 bg-[#c5a059]/5 blur-[60px] rounded-full"
                />
             </div>
             <div className="space-y-3">
               <p className="text-2xl font-['Cormorant_Garamond'] italic text-[#f0ede8]/20">En attente de directive stratégique...</p>
               <p className="text-xs text-[#f0ede8]/10 max-w-xs mx-auto font-['Outfit'] tracking-wide">Veuillez sélectionner un prospect dans le pipeline pour activer l'intelligence contextuelle.</p>
             </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-10">
             <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 bg-gradient-to-br from-[#c5a059]/20 to-transparent rounded-[2rem] flex items-center justify-center border border-[#c5a059]/30 shadow-[0_20px_50px_rgba(197,160,89,0.1)]"
             >
               <Sparkles className="text-[#c5a059]" size={40} />
             </motion.div>
             <div className="space-y-4">
               <p className="text-4xl font-['Cormorant_Garamond'] text-[#f0ede8] italic">Bonjour Mohamed,</p>
               <p className="text-lg text-[#f0ede8]/40 max-w-md mx-auto font-['Outfit'] font-light leading-relaxed">
                 L'IA est synchronisée avec l'écosystème de <strong className="text-[#c5a059] font-medium tracking-tight">{activeProspect.companyName}</strong>.<br/>
                 Quelle est notre prochaine manœuvre ?
               </p>
             </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                variants={AGENT_VARIANTS.message}
                initial="initial"
                animate="animate"
                className={cn(
                  "flex gap-8 group/msg",
                  m.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 shadow-xl",
                  m.role === 'user' 
                    ? 'bg-white/5 border border-white/10 group-hover/msg:border-white/20' 
                    : 'bg-[#0f0f20] border border-[#c5a059]/30 group-hover/msg:border-[#c5a059]/60 shadow-[0_10px_30px_rgba(197,160,89,0.1)]'
                )}>
                  {m.role === 'user' ? <User size={20} className="text-[#f0ede8]/40" /> : <Bot size={20} className="text-[#c5a059]" />}
                </div>
                
                <div className={cn(
                  "max-w-[75%] px-10 py-7 rounded-[2.5rem] text-lg leading-relaxed relative",
                  m.role === 'user' 
                    ? 'bg-[#0f0f20]/80 text-[#f0ede8]/90 rounded-tr-none border border-white/5 font-["Outfit"] font-light shadow-2xl' 
                    : 'bg-[#0a0a14] border border-white/5 text-[#f0ede8] rounded-tl-none font-["Cormorant_Garamond"] italic shadow-2xl'
                )}>
                   {/* Message decorative line */}
                  <div className={cn(
                    "absolute top-8 w-1 h-8 rounded-full opacity-20",
                    m.role === 'user' ? "-right-0.5 bg-white" : "-left-0.5 bg-[#c5a059]"
                  )} />
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-8">
            <div className="w-12 h-12 rounded-2xl bg-[#0f0f20] border border-[#c5a059]/30 flex items-center justify-center shadow-[0_10px_30px_rgba(197,160,89,0.1)]">
              <Cpu size={20} className="text-[#c5a059] animate-spin" />
            </div>
            <div className="bg-[#0a0a14] border border-white/5 px-10 py-7 rounded-[2.5rem] rounded-tl-none flex items-center gap-2">
               <div className="flex gap-1.5">
                  <motion.span 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-[#c5a059] rounded-full" 
                  />
                  <motion.span 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-[#c5a059] rounded-full" 
                  />
                  <motion.span 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-[#c5a059] rounded-full" 
                  />
               </div>
               <span className="text-[10px] text-[#f0ede8]/20 uppercase tracking-[0.4em] font-black ml-4">Génération...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-12 bg-[#0f0f20]/50 border-t border-white/5 relative z-20 backdrop-blur-2xl">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#c5a059]/20 to-transparent rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!activeProspect || loading}
              placeholder={activeProspect ? "Votre directive (ex: 'Rédige un message LinkedIn pour ce prospect')" : "Sélectionnez un prospect..."}
              className="w-full bg-[#0a0a14] border border-white/10 rounded-[1.8rem] px-10 py-7 pr-24 text-[#f0ede8] placeholder:text-[#f0ede8]/10 focus:outline-none focus:border-[#c5a059]/40 transition-all text-lg font-['Outfit'] font-light disabled:opacity-30 shadow-inner"
            />
            
            <button
              type="submit"
              disabled={!input.trim() || loading || !activeProspect}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-gradient-to-br from-[#c5a059] to-[#B8924A] text-[#1A1200] rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:hover:scale-100 shadow-[0_10px_20px_rgba(197,160,89,0.3)] flex items-center justify-center group/send"
            >
              <Send size={20} className="group-hover/send:translate-x-1 group-hover/send:-translate-y-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {[
              { text: 'Rédige un message LinkedIn', icon: <MessageSquare size={12} /> },
              { text: 'Gère l\'objection prix', icon: <Shield size={12} /> },
              { text: 'Prépare l\'email de suivi', icon: <ChevronRight size={12} /> }
            ].map(suggestion => (
              <button
                key={suggestion.text}
                onClick={() => { setInput(suggestion.text); }}
                className="flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#f0ede8]/20 hover:text-[#c5a059] transition-all border border-white/5 px-5 py-2.5 rounded-full hover:bg-[#c5a059]/5 hover:border-[#c5a059]/30 group/suggest active:scale-95"
              >
                <span className="text-[#f0ede8]/10 group-hover/suggest:text-[#c5a059]/40 transition-colors">{suggestion.icon}</span>
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

AgentModule.displayName = 'AgentModule';

export * from './agent.service';
export * from './agent.hooks';
export * from './AgentModule.types';
export * from './AgentModule.variants';

export default AgentModule;
