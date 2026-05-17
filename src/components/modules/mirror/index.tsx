'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, 
  TrendingDown, 
  TrendingUp, 
  Sparkles, 
  Layout, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  PieChart,
  Activity
} from 'lucide-react';
import { MIRROR_VARIANTS } from './MirrorModule.variants';
import { useMirror } from './mirror.hooks';
import { cn } from '@/lib/utils';

export const MirrorModule = memo(() => {
  const { 
    activeProspect, 
    inactionCost, 
    showSimulation, 
    setShowSimulation, 
    isInitializing,
    handleStartSimulation,
    growthProjection,
    additionalRevenue,
    hourlyLoss,
    monthlyLoss
  } = useMirror();

  if (!activeProspect) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 bg-[#0f0f20] rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl relative group"
        >
          <div className="absolute inset-0 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-colors rounded-3xl" />
          <Monitor className="text-[#f0ede8]/10 group-hover:text-blue-400/30 transition-colors relative z-10" size={40} />
        </motion.div>
        <h2 className="text-3xl font-['Cormorant_Garamond'] text-[#f0ede8] mb-3 italic">Initialisation du Mirror</h2>
        <p className="text-[#f0ede8]/40 max-w-sm mx-auto font-['Outfit'] font-light leading-relaxed">
          Veuillez sélectionner un prospect pour projeter son <span className="text-[#c5a059] font-medium">Jumeau Numérique</span> et calculer le Coût de l'Inaction.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={MIRROR_VARIANTS.container} 
      initial="initial" 
      animate="animate"
      className="max-w-7xl mx-auto py-12 px-6 md:px-12 space-y-12"
    >
      {/* Header */}
      <motion.div variants={MIRROR_VARIANTS.item} className="flex flex-col md:flex-row justify-between items-end gap-8 pb-10 border-b border-white/5 relative">
        <div className="absolute -left-12 top-0 w-24 h-24 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center shadow-[0_0_15px_rgba(197,160,89,0.1)]">
              <Monitor className="text-[#c5a059]" size={24} />
            </div>
            <h1 className="text-4xl md:text-5xl font-['Cormorant_Garamond'] text-[#f0ede8] italic">StoneLink Mirror</h1>
          </div>
          <p className="text-[#f0ede8]/50 text-lg font-['Outfit'] font-light max-w-2xl leading-relaxed">
            Le Jumeau Numérique (Digital Twin) de <span className="text-[#f0ede8] font-medium border-b border-[#c5a059]/30">{activeProspect.companyName}</span>. Visualisation immédiate de l'impact financier.
          </p>
        </div>
        
        <div className="flex flex-col items-end relative z-10">
          <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-[0.3em] mb-3 px-2 border-r-2 border-[#c5a059]">Simulation Node Active</div>
          <div className="flex items-center gap-2.5 px-5 py-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] font-bold text-[#22c55e] uppercase tracking-widest">Calculateur ROI en Temps Réel</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cost of Inaction Card */}
        <motion.div 
          variants={MIRROR_VARIANTS.item}
          className="lg:col-span-1 p-10 rounded-[2.5rem] bg-[#0f0f20]/50 border border-red-500/20 relative overflow-hidden group backdrop-blur-md"
        >
          <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
            <TrendingDown size={200} className="text-[#ef4444]" />
          </div>
          <div className="text-[10px] font-bold text-[#ef4444]/60 uppercase tracking-[0.2em] mb-12 flex items-center gap-2">
             <Activity size={12} className="animate-pulse" />
             Coût de l'Inaction (Live)
          </div>
          
          <div className="flex flex-col items-center justify-center py-12 relative z-10">
            <div className="text-6xl font-mono font-black text-[#ef4444] mb-3 tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              {inactionCost.toFixed(3)}<span className="text-2xl ml-1">€</span>
            </div>
            <div className="text-[10px] text-[#ef4444]/40 font-bold uppercase tracking-widest italic">Perte de revenus depuis l'ouverture</div>
          </div>

          <div className="pt-8 border-t border-red-500/10 space-y-5 relative z-10">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#f0ede8]/20 font-bold uppercase tracking-widest">Par heure</span>
              <span className="text-[#ef4444]/80 font-mono font-bold bg-red-500/5 px-2 py-1 rounded">{hourlyLoss.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#f0ede8]/20 font-bold uppercase tracking-widest">Par mois</span>
              <span className="text-[#ef4444] font-bold font-mono text-lg">{monthlyLoss.toLocaleString('fr-FR')} €</span>
            </div>
          </div>
        </motion.div>

        {/* Growth Projection Card */}
        <motion.div 
          variants={MIRROR_VARIANTS.item}
          className="lg:col-span-2 p-12 rounded-[2.5rem] bg-[#0a0a14] border border-white/5 relative overflow-hidden flex flex-col justify-between shadow-2xl group"
        >
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#c5a059]/5 blur-[100px] rounded-full group-hover:bg-[#c5a059]/10 transition-colors duration-700" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-16">
              <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-[0.3em]">Projection de Croissance StoneLink</div>
              <div className="px-5 py-2 bg-[#c5a059]/5 border border-[#c5a059]/20 rounded-full text-[10px] text-[#c5a059] font-bold uppercase tracking-widest shadow-inner">
                Confiance 92% — Antigravity Engine
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-4">
                <div className="text-6xl font-black text-[#f0ede8] flex items-center gap-4 font-['Outfit'] tracking-tighter">
                  <TrendingUp className="text-[#22c55e]" size={48} />
                  +{growthProjection}%
                </div>
                <p className="text-sm text-[#f0ede8]/40 font-['Outfit'] font-light max-w-[240px] leading-relaxed">
                  Augmentation estimée de la <span className="text-[#f0ede8]/80 font-medium">vélocité digitale</span> après refonte infrastructurelle.
                </p>
              </div>
              <div className="space-y-4 border-l border-white/5 pl-8 md:pl-16">
                <div className="text-6xl font-black text-[#f0ede8] flex items-center gap-4 font-['Outfit'] tracking-tighter">
                  <Sparkles className="text-[#c5a059]" size={48} />
                  ~{Math.round(additionalRevenue).toLocaleString('fr-FR')}€
                </div>
                <p className="text-sm text-[#f0ede8]/40 font-['Outfit'] font-light max-w-[240px] leading-relaxed">
                  Chiffre d'affaires additionnel <span className="text-[#c5a059] font-medium">mensuel cible</span> (Target Phase 1).
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-16 pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 group/item">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover/item:bg-blue-500/20 transition-colors">
                <Layout className="text-blue-400" size={18} />
              </div>
              <span className="text-[10px] text-[#f0ede8]/40 font-bold uppercase tracking-widest leading-tight group-hover/item:text-[#f0ede8]/60 transition-colors">Optimisation<br/>Lighthouse</span>
            </div>
            <div className="flex items-center gap-4 group/item">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover/item:bg-emerald-500/20 transition-colors">
                <Zap className="text-emerald-400" size={18} />
              </div>
              <span className="text-[10px] text-[#f0ede8]/40 font-bold uppercase tracking-widest leading-tight group-hover/item:text-[#f0ede8]/60 transition-colors">Performance<br/>Edge Compute</span>
            </div>
            <div className="flex items-center gap-4 group/item">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover/item:bg-purple-500/20 transition-colors">
                <PieChart className="text-purple-400" size={18} />
              </div>
              <span className="text-[10px] text-[#f0ede8]/40 font-bold uppercase tracking-widest leading-tight group-hover/item:text-[#f0ede8]/60 transition-colors">Insight<br/>Marketing IA</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        variants={MIRROR_VARIANTS.item}
        className="mt-12 p-12 rounded-[3rem] bg-gradient-to-br from-[#B8924A] via-[#c5a059] to-[#D4B57A] flex flex-col md:flex-row items-center justify-between gap-10 group cursor-pointer overflow-hidden relative shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <h3 className="text-3xl font-['Cormorant_Garamond'] text-[#1A1200] font-black italic mb-3">
            Projeter le Futur de {activeProspect?.companyName}
          </h3>
          <p className="text-[#1A1200]/70 text-base font-['Outfit'] font-medium max-w-2xl leading-relaxed">
            Prêt à lancer la simulation interactive ? Nous allons injecter les assets stratégiques dans un prototype <span className="font-bold">Mirror</span> pour une démonstration de force immédiate.
          </p>
        </div>
        <button 
          onClick={handleStartSimulation}
          disabled={isInitializing}
          className="relative z-10 px-12 py-5 bg-[#1A1200] text-[#c5a059] font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-2xl disabled:opacity-70"
        >
          {isInitializing ? 'Initialisation...' : 'Lancer la Simulation'} <ArrowRight size={18} />
        </button>
      </motion.div>

      {/* Simulation Overlay Mockup */}
      <AnimatePresence>
        {showSimulation && (
          <motion.div 
            variants={MIRROR_VARIANTS.overlay}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-[100] bg-[#060610]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12 text-center"
          >
            <motion.div 
              variants={MIRROR_VARIANTS.modal}
              initial="initial"
              animate="animate"
              className="max-w-3xl relative"
            >
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#c5a059]/20 blur-[100px] rounded-full" />
              
              <div className="w-28 h-28 bg-gradient-to-br from-[#c5a059] to-[#8e6d2f] rounded-[2.5rem] mx-auto mb-10 flex items-center justify-center shadow-[0_0_60px_rgba(197,160,89,0.4)] relative z-10 transform -rotate-6">
                <ShieldCheck size={56} className="text-[#1A1200]" />
              </div>
              <h2 className="text-5xl font-['Cormorant_Garamond'] text-[#f0ede8] mb-8 italic relative z-10 tracking-tight">Simulation Mirror Active</h2>
              <p className="text-[#f0ede8]/40 text-xl font-['Outfit'] font-light mb-16 leading-relaxed relative z-10 max-w-2xl mx-auto">
                Le pipeline <span className="text-[#c5a059] font-medium italic">Antigravity</span> prépare l'environnement éphémère pour <span className="text-[#f0ede8] font-medium">{activeProspect?.companyName}</span>. 
                Le prospect pourra naviguer dans son futur écosystème avec les metrics de performance réelles.
              </p>
              
              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-4 text-[#22c55e] text-[10px] font-bold uppercase tracking-[0.3em] justify-center bg-[#22c55e]/5 py-3 px-8 rounded-full border border-[#22c55e]/20 backdrop-blur-sm inline-flex">
                  <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" /> 
                  Synchronisation du Vector Store terminée
                </div>
                <br />
                <button 
                  onClick={() => setShowSimulation(false)}
                  className="px-16 py-5 bg-[#f0ede8] text-[#060610] font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl hover:bg-[#c5a059] transition-all hover:scale-105 active:scale-95 shadow-2xl"
                >
                  Fermer la Preview Stratégique
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

MirrorModule.displayName = 'MirrorModule';

export * from './mirror.service';
export * from './mirror.hooks';
export * from './MirrorModule.types';
export * from './MirrorModule.variants';

export default MirrorModule;
