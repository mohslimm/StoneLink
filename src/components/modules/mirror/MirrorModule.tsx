'use client';

import React, { useState, useEffect, memo } from 'react';
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
  PieChart 
} from 'lucide-react';
import { useStoneStore } from '@/stores/useStoneStore';
import { MIRROR_VARIANTS } from './MirrorModule.variants';


export const MirrorModule = memo(() => {
  const { activeProspect, aiAssets } = useStoneStore();
  const [inactionCost, setInactionCost] = useState(0);
  const [showSimulation, setShowSimulation] = useState(false);

  const monthlyLoss = activeProspect?.estimatedLoss || 0;
  const hourlyLoss = monthlyLoss / (30 * 24);
  const secondLoss = hourlyLoss / 3600;

  useEffect(() => {
    if (!activeProspect) return;
    
    // Simuler l'accumulation depuis l'ouverture du module
    const timer = setInterval(() => {
      setInactionCost(prev => prev + secondLoss);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeProspect, secondLoss]);

  if (!activeProspect) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
          <Monitor className="text-blue-400" size={32} />
        </div>
        <h2 className="text-2xl font-serif text-white mb-2">Activation du Mirror requise</h2>
        <p className="text-white/40 max-w-md mx-auto">
          Sélectionnez un prospect dans le Pipeline pour projeter son futur et calculer son Coût de l'Inaction.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={MIRROR_VARIANTS.container} 
      initial="initial" 
      animate="animate"
      className="max-w-6xl mx-auto py-8"
    >
      <motion.div variants={MIRROR_VARIANTS.item} className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center">
              <Monitor className="text-[#c5a059]" size={20} />
            </div>
            <h2 className="text-3xl font-serif text-white">StoneLink Mirror</h2>
          </div>
          <p className="text-[#EDE9E3]/45 text-lg font-light max-w-xl leading-relaxed">
            Le Jumeau Numérique (Digital Twin) de <strong>{activeProspect.companyName}</strong>. Visualisation immédiate de l'impact financier de l'optimisation.
          </p>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-[0.2em] mb-2">Live Simulation Node</div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Calculateur ROI Actif</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cost of Inaction Card */}
        <motion.div 
          variants={MIRROR_VARIANTS.item}
          className="lg:col-span-1 p-8 rounded-[2.5rem] bg-red-950/10 border border-red-500/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingDown size={120} className="text-red-500" />
          </div>
          <div className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em] mb-12">Coût de l'Inaction (Temps Réel)</div>
          
          <div className="flex flex-col items-center justify-center py-10">
            <div className="text-6xl font-mono font-black text-red-500 mb-2 tabular-nums">
              {inactionCost.toFixed(3)} €
            </div>
            <div className="text-xs text-red-400/40 font-light italic">Perte de revenus estimée depuis {new Date().toLocaleTimeString()}</div>
          </div>

          <div className="pt-8 border-t border-red-500/10 space-y-4">
            <div className="flex justify-between text-xs">
              <span className="text-white/20">Par heure</span>
              <span className="text-red-400 font-mono">{hourlyLoss.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/20">Par mois (Manque à gagner)</span>
              <span className="text-red-500 font-bold font-mono">{monthlyLoss.toLocaleString('fr-FR')} €</span>
            </div>
          </div>
        </motion.div>

        {/* Growth Projection Card */}
        <motion.div 
          variants={MIRROR_VARIANTS.item}
          className="lg:col-span-2 p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#c5a059]/5 blur-[80px] rounded-full" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-[0.2em]">Projection de Croissance StoneLink</div>
              <div className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-slate-500 font-bold uppercase tracking-widest">Confiance 92%</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <div className="text-5xl font-black text-white mb-2 flex items-center gap-3">
                  <TrendingUp className="text-emerald-400" size={32} />
                  +{Math.round((100 - (activeProspect.lighthouseScore ?? 0)) * 3.4)}%
                </div>
                <p className="text-sm text-slate-400 font-light max-w-[200px]">Augmentation estimée de la vélocité digitale.</p>
              </div>
              <div>
                <div className="text-5xl font-black text-white mb-2 flex items-center gap-3">
                  <Sparkles className="text-[#c5a059]" size={32} />
                  ~{(monthlyLoss * 1.5).toLocaleString('fr-FR')} €
                </div>
                <p className="text-sm text-slate-400 font-light max-w-[200px]">CA additionnel mensuel (Target Phase 1).</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 pt-10 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Layout className="text-blue-400" size={16} />
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Optimisation<br/>Lighthouse</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Zap className="text-emerald-400" size={16} />
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Performance<br/>Edge Compute</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <PieChart className="text-purple-400" size={16} />
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Insight<br/>Marketing IA</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        variants={MIRROR_VARIANTS.item}
        className="mt-8 p-10 rounded-[2.5rem] bg-gradient-to-br from-[#c5a059] to-[#8e6d2f] flex flex-col md:flex-row items-center justify-between gap-8 group cursor-pointer overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10">
          <h3 className="text-2xl font-serif text-[#1A1200] font-black italic mb-2">Visualiser le Futur de {activeProspect?.companyName || 'votre Client'}</h3>
          <p className="text-[#1A1200]/60 text-sm max-w-xl">
            Prêt à lancer la simulation interactive ? Nous allons injecter les assets générés dans un prototype "Mirror" pour une démonstration de force immédiate.
          </p>
        </div>
        <button 
          onClick={() => setShowSimulation(true)}
          className="relative z-10 px-10 py-4 bg-[#1A1200] text-[#c5a059] font-black text-xs uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          Lancer la Simulation <ArrowRight size={16} />
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
            className="fixed inset-0 z-[60] bg-[#060610]/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center"
          >
            <motion.div 
              variants={MIRROR_VARIANTS.modal}
              initial="initial"
              animate="animate"
              className="max-w-2xl"
            >
              <div className="w-24 h-24 bg-[#c5a059] rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(197,160,89,0.3)]">
                <ShieldCheck size={48} className="text-[#1A1200]" />
              </div>
              <h2 className="text-4xl font-serif text-white mb-6 italic">Simulation Mirror Active</h2>
              <p className="text-slate-400 text-lg font-light mb-12 leading-relaxed">
                Le pipeline Antigravity prépare l'environnement éphémère pour <strong>{activeProspect?.companyName}</strong>. 
                Le prospect pourra naviguer dans son futur site avec les metrics de performance réelles.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-emerald-400 text-xs font-bold uppercase tracking-widest justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Synchronisation du Vector Store terminée
                </div>
                <button 
                  onClick={() => setShowSimulation(false)}
                  className="px-12 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-[#c5a059] transition-all"
                >
                  Fermer la Preview
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
