'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Eye, Radar, Target, TrendingUp, AlertTriangle, Twitter, Linkedin, Globe } from 'lucide-react';
import { useStoneStore } from '@/stores/useStoneStore';
import { SHADOW_VARIANTS } from './ShadowModule.variants';
import type { ShadowSignal, FilterButtonProps, TrendItemProps } from './ShadowModule.types';

// Helper for class merging
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

const SIGNALS: ShadowSignal[] = [
  { 
    id: 1,
    time: "Il y a 12 min", 
    company: "Riviera Hotels & Spas", 
    title: "Directeur Marketing (Signal Fort)", 
    text: "Nous cherchons activement un partenaire pour refondre notre plateforme de réservation globale. La performance est notre priorité n°1.",
    source: "LinkedIn",
    type: "intent",
    confidence: 98
  },
  { 
    id: 2,
    time: "Il y a 45 min", 
    company: "SmileTech Group", 
    title: "Levée de fonds (Series A)", 
    text: "SmileTech vient de clôturer un tour de table de 4.5M€ pour son expansion européenne. Recrutement massif en cours.",
    source: "TechCrunch",
    type: "expansion",
    confidence: 85
  },
  { 
    id: 3,
    time: "Il y a 2 heures", 
    company: "Cabinet Avocats Martel", 
    title: "Changement de Direction", 
    text: "Me. Sarah Koné nommée Directrice de l'Innovation Digitale au sein du cabinet Martel & Associés.",
    source: "Twitter",
    type: "personnel",
    confidence: 92
  },
  { 
    id: 4,
    time: "Il y a 5 heures", 
    company: "Luxe Conciergerie", 
    title: "Plainte Client (Opportunité)", 
    text: "Impossible de réserver sur le site de Luxe Conciergerie depuis ce matin. Site lent et non responsive.",
    source: "Web Scan",
    type: "pain",
    confidence: 78
  }
];

const FilterButton = ({ label, active }: FilterButtonProps) => (
  <button className={cn(
    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
    active ? "bg-[#c5a059] text-black" : "text-slate-500 hover:text-slate-300"
  )}>
    {label}
  </button>
);

const TrendItem = ({ label, trend, status }: TrendItemProps) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-slate-400 font-light">{label}</span>
    <span className={cn(
      "text-xs font-mono font-bold",
      status === 'rising' ? "text-emerald-400" : "text-red-400"
    )}>{trend}</span>
  </div>
);

export const ShadowModule = memo(() => {
  const { addTerminalEvent } = useStoneStore();

  return (
    <motion.div 
      variants={SHADOW_VARIANTS.container} 
      initial="initial" 
      animate="animate"
      className="max-w-6xl mx-auto py-8 px-4"
    >
      <div className="flex justify-between items-start mb-12">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-500/10 border border-white/5 rounded-2xl flex items-center justify-center">
            <Eye className="text-white/60" size={28} />
          </div>
          <div>
            <h2 className="text-4xl font-serif text-white">Shadow Intelligence</h2>
            <p className="text-slate-500 font-light text-lg">Détection de signaux faibles & Social Listening en temps réel.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
            <Radar size={16} className="text-[#c5a059] animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-xs font-bold text-white uppercase tracking-widest">Scanning Web...</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Signal Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4 px-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Live Intelligence Stream</div>
            <div className="flex gap-4">
               <FilterButton label="Tous" active />
               <FilterButton label="Intention" />
               <FilterButton label="Douleur" />
            </div>
          </div>

          <div className="space-y-4">
            {SIGNALS.map((sig) => (
              <motion.div 
                key={sig.id}
                variants={SHADOW_VARIANTS.item}
                className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-[#c5a059]/30 transition-all group relative overflow-hidden"
              >
                {sig.type === 'intent' && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#c5a059]/10 to-transparent rounded-bl-full" />
                )}

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      sig.type === 'intent' ? "bg-[#c5a059]/20 text-[#c5a059]" : "bg-white/5 text-slate-500"
                    )}>
                      {sig.source === 'LinkedIn' ? <Linkedin size={18} /> : sig.source === 'Twitter' ? <Twitter size={18} /> : <Globe size={18} />}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{sig.time} via {sig.source}</div>
                      <h4 className="text-white font-bold tracking-tight">{sig.company}</h4>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2",
                      sig.type === 'intent' ? "bg-[#c5a059] text-black" : "bg-white/5 text-slate-500 border border-white/10"
                    )}>
                      {sig.type}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400">Confidence {sig.confidence}%</div>
                  </div>
                </div>

                <p className="text-slate-300 text-lg font-serif italic leading-relaxed mb-8">
                  "{sig.text}"
                </p>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{sig.title}</span>
                  </div>
                  <button 
                    onClick={() => {
                      addTerminalEvent({ 
                        message: `Signal capturé de ${sig.company}. Injection dans le Pipeline...`, 
                        type: 'success',
                        module: 'shadow'
                      });
                    }}
                    className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all border border-white/10 flex items-center gap-2"
                  >
                    Engager avec l'IA <Target size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Global Stats/Trends */}
        <div className="lg:col-span-1 space-y-6">
           <motion.div variants={SHADOW_VARIANTS.item} className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/10">
              <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <TrendingUp size={14} /> Tendances de Niche
              </div>
              <div className="space-y-6">
                <TrendItem label="Dental (Performance)" trend="+24%" status="rising" />
                <TrendItem label="Real Estate (AI Search)" trend="+18%" status="rising" />
                <TrendItem label="Legal (Trust Score)" trend="-4%" status="falling" />
                <TrendItem label="Luxury (Exclusivity)" trend="+42%" status="rising" />
              </div>
           </motion.div>

           <motion.div variants={SHADOW_VARIANTS.item} className="p-8 rounded-[2rem] bg-red-950/10 border border-red-500/20">
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <AlertTriangle size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Alerte Churn Concurrent</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light mb-6">
                3 clients de votre concurrent direct "DigitalBoost" ont exprimé des frustrations techniques ce matin.
              </p>
              <button className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all border border-red-500/30">
                Lancer l'Interception
              </button>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
});

ShadowModule.displayName = 'ShadowModule';
