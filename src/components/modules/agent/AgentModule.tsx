'use client';

import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Shield, 
  Zap, 
  RefreshCcw 
} from 'lucide-react';
import { useStoneStore } from '@/stores/useStoneStore';
import { AGENT_VARIANTS } from './AgentModule.variants';
import { AgentMessage } from './AgentModule.types';


export const AgentModule = memo(() => {
  const { activeProspect, addAgentMessage } = useStoneStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Historique synchronisé avec le prospect actif
  const messages: AgentMessage[] = activeProspect?.agentHistory || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading || !activeProspect) return;

    const userMsg = input.trim();
    setInput('');
    
    // 1. Sauvegarder le message utilisateur
    addAgentMessage(activeProspect.id, { role: 'user', content: userMsg });
    setLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: messages.slice(-10), // Contexte de conversation
          activeProspect: activeProspect
        })
      });

      if (!res.ok) throw new Error('Agent failed');
      const data = await res.json();
      
      // 2. Sauvegarder la réponse de l'assistant
      addAgentMessage(activeProspect.id, { role: 'assistant', content: data.message });
    } catch (error) {
      addAgentMessage(activeProspect.id, { role: 'assistant', content: "Désolé, j'ai rencontré une erreur technique lors du traitement de votre directive." });
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, activeProspect, addAgentMessage]);

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-[#060610] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-8 py-6 bg-white/5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#c5a059]/20 rounded-2xl flex items-center justify-center border border-[#c5a059]/30 relative">
            <Bot className="text-[#c5a059]" size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#060610] animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-serif text-white">StoneLink Agent</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Autonome</span>
              <span className="w-1 h-1 bg-white/10 rounded-full" />
              <span className="text-[10px] text-[#c5a059] uppercase tracking-widest font-bold">Claude 3.7 Optimized</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
           {activeProspect && (
             <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
               <Shield size={12} className="text-emerald-400" />
               <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Context: {activeProspect.companyName}</span>
             </div>
           )}
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
      >
        {!activeProspect ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
             <Bot size={64} className="text-white/20" />
             <div className="space-y-2">
               <p className="text-lg font-serif">En attente de contexte...</p>
               <p className="text-sm max-w-xs mx-auto">Veuillez sélectionner un prospect pour activer l'assistance stratégique.</p>
             </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
             <div className="w-16 h-16 bg-[#c5a059]/10 rounded-full flex items-center justify-center border border-[#c5a059]/20">
               <Sparkles className="text-[#c5a059]" size={24} />
             </div>
             <div className="space-y-2">
               <p className="text-xl font-serif text-white italic">Bonjour Mohamed</p>
               <p className="text-sm text-white/40 max-w-sm mx-auto">
                 Je suis prêt à vous aider avec <strong>{activeProspect.companyName}</strong>.
                 Voulez-vous un script d'appel, un message LinkedIn ou une analyse des objections ?
               </p>
             </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                variants={AGENT_VARIANTS.message}
                initial="initial"
                animate="animate"
                className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  m.role === 'user' ? 'bg-white/10' : 'bg-[#c5a059]/20 border border-[#c5a059]/30'
                }`}>
                  {m.role === 'user' ? <User size={18} className="text-white/60" /> : <Bot size={18} className="text-[#c5a059]" />}
                </div>
                <div className={`max-w-[80%] px-6 py-4 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-white/5 text-white/80 rounded-tr-none' 
                    : 'bg-white/[0.03] border border-white/10 text-white/90 rounded-tl-none font-light'
                }`}>
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#c5a059]/20 border border-[#c5a059]/30 flex items-center justify-center">
              <Bot size={18} className="text-[#c5a059] animate-pulse" />
            </div>
            <div className="bg-white/[0.03] border border-white/10 px-6 py-4 rounded-2xl rounded-tl-none flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#c5a059] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-1.5 h-1.5 bg-[#c5a059] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 bg-[#c5a059] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 bg-white/5 border-t border-white/10">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!activeProspect || loading}
            placeholder={activeProspect ? "Votre directive (ex: 'Rédige un message LinkedIn pour ce prospect')" : "Sélectionnez un prospect..."}
            className="w-full bg-[#0a0a14] border border-white/10 rounded-2xl px-8 py-5 pr-16 text-white placeholder:text-white/20 focus:outline-none focus:border-[#c5a059]/50 transition-all text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || !activeProspect}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-[#c5a059] text-[#1A1200] rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send size={18} />
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {['Rédige un message LinkedIn', 'Gère l\'objection prix', 'Prépare l\'email de suivi'].map(suggestion => (
            <button
              key={suggestion}
              onClick={() => { setInput(suggestion); }}
              className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-[#c5a059] transition-colors border border-white/5 px-3 py-1.5 rounded-lg hover:border-[#c5a059]/30"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

AgentModule.displayName = 'AgentModule';
