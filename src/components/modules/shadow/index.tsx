'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Radar, Target, TrendingUp, AlertTriangle, Twitter, Linkedin, Globe, Sparkles, Activity } from 'lucide-react';
import { SHADOW_VARIANTS } from './ShadowModule.variants';
import { useShadow } from './shadow.hooks';
import type { ShadowSignal, FilterButtonProps, TrendItemProps } from './ShadowModule.types';
import { cn } from '@/lib/utils';

const SIGNALS: ShadowSignal[] = [
  { 
    id: 1,
    time: "12m ago", 
    company: "Riviera Hotels & Spas", 
    title: "Marketing Director (Strong Signal)", 
    text: "Nous cherchons activement un partenaire pour refondre notre plateforme de réservation globale. La performance est notre priorité n°1.",
    source: "LinkedIn",
    type: "intent",
    confidence: 98
  },
  { 
    id: 2,
    time: "45m ago", 
    company: "SmileTech Group", 
    title: "Fundraising (Series A)", 
    text: "SmileTech vient de clôturer un tour de table de 4.5M€ pour son expansion européenne. Recrutement massif en cours.",
    source: "TechCrunch",
    type: "expansion",
    confidence: 85
  },
  { 
    id: 3,
    time: "2h ago", 
    company: "Cabinet Avocats Martel", 
    title: "Management Change", 
    text: "Me. Sarah Koné nommée Directrice de l'Innovation Digitale au sein du cabinet Martel & Associés.",
    source: "Twitter",
    type: "personnel",
    confidence: 92
  },
  { 
    id: 4,
    time: "5h ago", 
    company: "Luxe Conciergerie", 
    title: "Customer Complaint (Opportunity)", 
    text: "Impossible de réserver sur le site de Luxe Conciergerie depuis ce matin. Site lent et non responsive.",
    source: "Web Scan",
    type: "pain",
    confidence: 78
  }
];

const FilterButton = memo(({ label, active, onClick }: FilterButtonProps & { onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative group",
      active ? "text-[#c5a059]" : "text-[#f0ede8]/20 hover:text-[#f0ede8]/40"
    )}
  >
    {label}
    {active && (
      <motion.div 
        layoutId="shadow-filter"
        className="absolute inset-0 bg-[#c5a059]/5 border border-[#c5a059]/20 rounded-full -z-10"
      />
    )}
  </button>
));

FilterButton.displayName = 'FilterButton';

const TrendItem = memo(({ label, trend, status }: TrendItemProps) => (
  <div className="flex justify-between items-center group/trend">
    <span className="text-xs text-[#f0ede8]/40 font-light font-['Outfit'] group-hover/trend:text-[#f0ede8]/60 transition-colors">{label}</span>
    <div className="flex items-center gap-3">
       <span className={cn(
        "text-[10px] font-mono font-bold tracking-tighter",
        status === 'rising' ? "text-[#22c55e]" : "text-[#ef4444]"
      )}>{trend}</span>
       <div className={cn(
         "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]",
         status === 'rising' ? "bg-[#22c55e] shadow-[#22c55e]/40" : "bg-[#ef4444] shadow-[#ef4444]/40"
       )} />
    </div>
  </div>
));

TrendItem.displayName = 'TrendItem';

export const ShadowModule = memo(() => {
  const { activeFilter, setActiveFilter, isIntercepting, handleEngage, handleIntercept } = useShadow();

  return (
    <motion.div 
      variants={SHADOW_VARIANTS.container} 
      initial="initial" 
      animate="animate"
      className="max-w-7xl mx-auto py-12 px-6 md:px-12 space-y-12"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative">
        <div className="absolute -left-20 top-0 w-40 h-40 bg-[#c5a059]/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-[#0f0f20] border border-white/5 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Eye className="text-[#c5a059]" size={32} />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-['Cormorant_Garamond'] text-[#f0ede8] italic">Shadow Intelligence</h2>
            <p className="text-[#f0ede8]/40 font-['Outfit'] font-light text-lg mt-1">Détection de signaux faibles & Social Listening en temps réel.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="px-6 py-3 bg-[#0f0f20] border border-white/5 rounded-2xl flex items-center gap-4 backdrop-blur-xl group">
            <div className="relative">
              <Radar size={18} className="text-[#c5a059] animate-spin" style={{ animationDuration: '4s' }} />
              <div className="absolute inset-0 bg-[#c5a059]/20 blur-md rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-[#c5a059] uppercase tracking-[0.3em]">Neural Scan</span>
              <span className="text-[10px] font-mono text-[#f0ede8]/30">Active — 43 sources/sec</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
        {/* Main Signal Feed */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
               <Activity size={12} className="text-[#c5a059]/50" />
               <span className="text-[10px] font-bold text-[#f0ede8]/30 uppercase tracking-[0.3em]">Intelligence Stream</span>
            </div>
            <div className="flex gap-2 p-1 bg-white/5 rounded-full border border-white/5">
               {['Tous', 'Intent', 'Expansion', 'Pain'].map((filter) => (
                 <FilterButton 
                  key={filter} 
                  label={filter} 
                  active={activeFilter === filter} 
                  onClick={() => setActiveFilter(filter)}
                />
               ))}
            </div>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {SIGNALS
                .filter(s => activeFilter === 'Tous' || s.type.toLowerCase() === activeFilter.toLowerCase())
                .map((sig) => (
                <motion.div 
                  key={sig.id}
                  layout
                  variants={SHADOW_VARIANTS.item}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-10 rounded-[2.5rem] bg-[#0a0a14] border border-white/5 hover:border-[#c5a059]/30 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#c5a059]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                          sig.type === 'intent' ? "bg-[#c5a059]/10 text-[#c5a059]" : "bg-white/5 text-[#f0ede8]/20"
                        )}>
                          {sig.source === 'LinkedIn' ? <Linkedin size={20} /> : sig.source === 'Twitter' ? <Twitter size={20} /> : <Globe size={20} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="text-[9px] font-bold text-[#f0ede8]/20 uppercase tracking-[0.2em]">{sig.time} via {sig.source}</span>
                            <div className="w-1 h-1 rounded-full bg-white/10" />
                            <div className="flex items-center gap-1.5">
                              <Sparkles size={10} className="text-[#c5a059]/50" />
                              <span className="text-[9px] font-mono text-[#22c55e] font-bold">Confidence {sig.confidence}%</span>
                            </div>
                          </div>
                          <h4 className="text-2xl font-['Cormorant_Garamond'] text-[#f0ede8] italic tracking-wide group-hover:text-white transition-colors">{sig.company}</h4>
                        </div>
                      </div>
                      
                      <div className={cn(
                        "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] shadow-inner",
                        sig.type === 'intent' ? "bg-[#c5a059] text-black" : "bg-white/5 text-[#f0ede8]/40 border border-white/10"
                      )}>
                        {sig.type}
                      </div>
                    </div>

                    <p className="text-[#f0ede8]/50 text-xl font-['Cormorant_Garamond'] italic leading-relaxed mb-10 group-hover:text-[#f0ede8]/80 transition-colors">
                      "{sig.text}"
                    </p>

                    <div className="flex flex-col md:flex-row md:items-center justify-between pt-8 border-t border-white/5 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                           <Target size={14} className="text-[#f0ede8]/30" />
                        </div>
                        <span className="text-[10px] font-bold text-[#f0ede8]/20 uppercase tracking-[0.2em] font-['Outfit']">{sig.title}</span>
                      </div>
                      
                      <button 
                        onClick={() => handleEngage(sig)}
                        className="px-8 py-3 bg-[#0f0f20] hover:bg-[#c5a059] text-[#c5a059] hover:text-black font-bold text-[10px] uppercase tracking-[0.3em] rounded-xl transition-all border border-[#c5a059]/30 hover:border-[#c5a059] flex items-center justify-center gap-3 active:scale-95 group/btn"
                      >
                        Engager avec l'IA <Target size={14} className="group-hover/btn:rotate-45 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Global Stats/Trends */}
        <div className="space-y-8">
           <motion.div variants={SHADOW_VARIANTS.item} className="p-8 rounded-[2.5rem] bg-[#0f0f20]/50 border border-white/5 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#c5a059]/2 to-transparent pointer-events-none" />
              <div className="flex items-center gap-3 mb-10 relative z-10">
                <TrendingUp size={14} className="text-[#c5a059]" />
                <span className="text-[10px] font-bold text-[#f0ede8]/30 uppercase tracking-[0.3em]">Niche Analytics</span>
              </div>
              <div className="space-y-8 relative z-10">
                <TrendItem label="Dental (Performance)" trend="+24%" status="rising" />
                <TrendItem label="Real Estate (AI Search)" trend="+18%" status="rising" />
                <TrendItem label="Legal (Trust Score)" trend="-4%" status="falling" />
                <TrendItem label="Luxury (Exclusivity)" trend="+42%" status="rising" />
              </div>
           </motion.div>

           <motion.div variants={SHADOW_VARIANTS.item} className="p-8 rounded-[2.5rem] bg-[#ef4444]/5 border border-[#ef4444]/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#ef4444]/5 to-transparent pointer-events-none" />
              <div className="flex items-center gap-3 text-[#ef4444] mb-6 relative z-10">
                <AlertTriangle size={18} className="animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Interception Alert</span>
              </div>
              <p className="text-xs text-[#f0ede8]/40 leading-relaxed font-['Outfit'] font-light mb-8 relative z-10">
                3 clients de votre concurrent direct <span className="text-[#ef4444]/60 font-medium font-['JetBrains_Mono'] tracking-tighter">"DigitalBoost"</span> ont exprimé des frustrations techniques critiques.
              </p>
              <button 
                onClick={() => handleIntercept('DigitalBoost')}
                disabled={isIntercepting}
                className={cn(
                  "w-full py-4 font-bold text-[10px] uppercase tracking-[0.3em] rounded-xl transition-all border relative z-10 active:scale-[0.98]",
                  isIntercepting 
                    ? "bg-[#ef4444]/10 text-[#ef4444]/40 border-[#ef4444]/10 cursor-not-allowed"
                    : "bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30"
                )}
              >
                {isIntercepting ? 'Agents Déployés...' : "Lancer l'Interception"}
              </button>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
});

ShadowModule.displayName = 'ShadowModule';

export * from './shadow.service';
export * from './shadow.hooks';
export * from './ShadowModule.types';
export * from './ShadowModule.variants';

export default ShadowModule;
