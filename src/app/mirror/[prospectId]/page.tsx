'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStoneStore } from '@/stores/useStoneStore';
import { Loader2, ArrowRight, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { Calendar } from 'lucide-react';

// ─── Constants & Variants ─────────────────────────────────────────

const VARIANTS = {
  container: { animate: { transition: { staggerChildren: 0.1 } } },
  item: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  }
};

const DURATION = { base: 0.3, slow: 0.6 };

// ─── Sub-Components ───────────────────────────────────────────────

const InactionCounter = memo(({ estimatedLoss }: { estimatedLoss: number }) => {
  const [loss, setLoss] = useState(0);

  useEffect(() => {
    // estimatedLoss is monthly loss. Convert to loss per millisecond.
    const lossPerMs = estimatedLoss / (30 * 24 * 3600 * 1000);
    const interval = setInterval(() => {
      setLoss(prev => prev + lossPerMs * 100); // add 100ms worth of loss every 100ms
    }, 100);
    return () => clearInterval(interval);
  }, [estimatedLoss]);

  return (
    <div className="bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)] rounded-2xl p-6 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 text-red-500 font-semibold mb-1 text-sm tracking-wide uppercase">
          <AlertTriangle className="w-4 h-4" />
          Coût de l'inaction estimé
        </div>
        <div className="text-[11px] text-slate-400">Pertes cumulées pendant votre visite</div>
      </div>
      <div className="text-right">
        <div className="text-3xl font-display font-bold text-red-500 tabular-nums">
          {loss.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 4, maximumFractionDigits: 4 })}
        </div>
      </div>
    </div>
  );
});
InactionCounter.displayName = 'InactionCounter';

const RoiCalculator = memo(() => {
  const [visitors, setVisitors] = useState(5000);
  const [clientValue, setClientValue] = useState(1500);
  const currentConversion = 1.2; // 1.2%
  const newConversion = 3.5; // 3.5%

  const currentRevenue = (visitors * (currentConversion / 100)) * clientValue;
  const projectedRevenue = (visitors * (newConversion / 100)) * clientValue;
  const difference = projectedRevenue - currentRevenue;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-display text-white mb-6 flex items-center gap-2">
        <TrendingUp className="text-[#c5a059]" />
        Projections de Croissance
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-sm text-slate-300 mb-2 flex justify-between">
            <span>Visiteurs Mensuels</span>
            <span className="font-bold text-[#c5a059]">{visitors.toLocaleString('fr-FR')}</span>
          </label>
          <input
            type="range"
            min="1000" max="50000" step="500"
            value={visitors}
            onChange={(e) => setVisitors(Number(e.target.value))}
            className="w-full accent-[#c5a059]"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-2 flex justify-between">
            <span>Valeur Client Moyenne (€)</span>
            <span className="font-bold text-[#c5a059]">{clientValue.toLocaleString('fr-FR')} €</span>
          </label>
          <input
            type="range"
            min="100" max="10000" step="100"
            value={clientValue}
            onChange={(e) => setClientValue(Number(e.target.value))}
            className="w-full accent-[#c5a059]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/40 p-4 rounded-xl border border-white/5">
          <div className="text-xs text-slate-400 mb-1">Revenus Actuels (1.2%)</div>
          <div className="text-xl font-bold text-white tabular-nums">{currentRevenue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</div>
        </div>
        <div className="bg-black/40 p-4 rounded-xl border border-[#c5a059]/30">
          <div className="text-xs text-[#e8c77a] mb-1">Nouveaux Revenus (3.5%)</div>
          <div className="text-xl font-bold text-white tabular-nums">{projectedRevenue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</div>
        </div>
        <div className="bg-[#c5a059]/10 p-4 rounded-xl border border-[#c5a059]/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#c5a059] blur-2xl opacity-20" />
          <div className="text-xs text-[#c5a059] font-bold mb-1 uppercase tracking-wider">Manque à gagner</div>
          <div className="text-2xl font-bold text-white tabular-nums">+{difference.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</div>
        </div>
      </div>
    </div>
  );
});
RoiCalculator.displayName = 'RoiCalculator';

// ─── Main Page ────────────────────────────────────────────────────

export default function MirrorPage() {
  const { prospectId } = useParams() as { prospectId: string };
  const getProspectById = useStoneStore(s => s.getProspectById);
  const updateProspect = useStoneStore(s => s.updateProspect);
  const addTerminalEvent = useStoneStore(s => s.addTerminalEvent);
  const pushNotification = useStoneStore(s => s.pushNotification);

  const prospect = getProspectById(prospectId);
  
  const [sliderPos, setSliderPos] = useState(50);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contacted, setContacted] = useState(false);

  // Passive Tracking Effect
  useEffect(() => {
    if (prospect && prospect.stage === 'prototype_sent') {
      // simulate tracking
      // Prospect a visité le Mirror.
    }
  }, [prospect]);

  const handleContactSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (prospect) {
      updateProspect(prospect.id, { stage: 'interested' });
      addTerminalEvent({ 
        type: 'success', 
        message: `Le prospect ${prospect.companyName} souhaite être recontacté.`, 
        module: 'mirror' 
      });
      pushNotification({ 
        title: 'Lead entrant',
        message: `${prospect.companyName} est prêt !`, 
        type: 'success' 
      });
      setContacted(true);
    }
  }, [prospect, updateProspect, addTerminalEvent, pushNotification]);

  if (!prospect) {
    return (
      <div className="min-h-screen bg-[--bg-void] flex items-center justify-center text-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#c5a059] mx-auto mb-4" />
          <p className="text-slate-400">Chargement de votre environnement sécurisé...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--bg-void] text-[--text-primary] font-sans selection:bg-[#c5a059] selection:text-black overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 bg-[#060610]/80 backdrop-blur-md z-40 flex items-center px-8 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#8c733f] flex items-center justify-center font-display font-bold text-black text-xl">
            S
          </div>
          <span className="font-display text-xl tracking-wider font-bold">STONELINK</span>
        </div>
        <div className="text-sm text-slate-400 font-medium">
          Dossier Confidentiel — {prospect.companyName}
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.div variants={VARIANTS.container} initial="initial" animate="animate" className="space-y-16">
          
          {/* Header */}
          <motion.header variants={VARIANTS.item} className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/20 text-[#c5a059] text-xs font-bold uppercase tracking-widest">
              Analyse de Performance
            </div>
            <h1 className="text-5xl md:text-7xl font-display">
              Le véritable potentiel de <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B8924A] via-[#e8c77a] to-[#c5a059] italic">
                {prospect.companyName}
              </span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              Nous avons audité votre présence digitale actuelle et conçu une version optimisée. Découvrez l'impact qu'une infrastructure moderne pourrait avoir sur vos revenus.
            </p>
          </motion.header>

          {/* Inaction Counter */}
          <motion.div variants={VARIANTS.item}>
            <InactionCounter estimatedLoss={prospect.estimatedLoss || 18000} />
          </motion.div>

          {/* Slider Avant / Après */}
          <motion.div variants={VARIANTS.item} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display">Le Jumeau Numérique</h2>
              <div className="text-sm text-slate-400">Faites glisser pour comparer</div>
            </div>
            
            <div className="relative w-full aspect-video md:aspect-[21/9] bg-[#14142a] rounded-2xl border border-white/10 overflow-hidden group">
              {/* Image "Après" (Jumeau Numérique) - Fond fixe */}
              {prospect.customizedPrototypeUrl ? (
                <iframe 
                  src={prospect.customizedPrototypeUrl} 
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ opacity: 0.9 }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#c5a059]/20 to-black">
                  <div className="text-[#c5a059] font-display text-2xl">Nouvelle Version Optimisée (Simulation)</div>
                </div>
              )}

              {/* Image "Avant" (Actuel) - Recouvrement dynamique */}
              <div 
                className="absolute inset-0 bg-black overflow-hidden border-r-2 border-[#c5a059]"
                style={{ width: `${sliderPos}%` }}
              >
                {prospect.website ? (
                  <iframe 
                    src={prospect.website} 
                    className="absolute top-0 left-0 h-full pointer-events-none"
                    style={{ width: '100vw', filter: 'grayscale(0.6) blur(1px)' }}
                  />
                ) : (
                  <div className="absolute top-0 left-0 w-screen h-full flex items-center justify-center bg-[#1a1a1a]">
                    <div className="text-slate-500 font-display text-xl">Site Actuel (Simulation)</div>
                  </div>
                )}
                {/* Overlay sombre sur l'avant */}
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />
              </div>

              {/* Le Slider Control */}
              <input 
                type="range" 
                min="0" max="100" 
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
              />

              {/* La poignée visuelle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.8)] pointer-events-none z-0 flex items-center justify-center"
                style={{ left: `calc(${sliderPos}% - 2px)` }}
              >
                <div className="w-8 h-8 bg-[#c5a059] text-black rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Calculateur ROI */}
          <motion.div variants={VARIANTS.item}>
            <RoiCalculator />
          </motion.div>

          {/* CTA Section */}
          <motion.div variants={VARIANTS.item} className="bg-gradient-to-br from-[#14142a] to-black border border-white/10 rounded-2xl p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-display mb-4">Prêt à dominer votre marché ?</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              L'inaction vous coûte {prospect.estimatedLoss?.toLocaleString('fr-FR')} € chaque mois. Planifions une session stratégique de 15 minutes pour vous montrer comment récupérer ce manque à gagner.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-[#1A1200] transition-transform hover:scale-105 active:scale-95 flex items-center gap-3"
                style={{ background: 'linear-gradient(135deg, #B8924A, #c5a059)' }}
              >
                <Calendar className="w-5 h-5" />
                Planifier un Appel Stratégique
              </button>
            </div>
          </motion.div>

        </motion.div>
      </main>

      {/* Modal Contact */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f0f20] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl"
          >
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-8">
              <h3 className="text-2xl font-display mb-2">Passez à l'action</h3>
              <p className="text-sm text-slate-400 mb-6">Confirmez votre intérêt, et notre équipe vous contactera sous 2h pour planifier l'audit complet.</p>
              
              {contacted ? (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-6 rounded-xl text-center space-y-3">
                  <CheckCircle2 className="w-8 h-8 mx-auto" />
                  <div className="font-bold">Demande envoyée</div>
                  <div className="text-sm opacity-80">Nous reviendrons vers vous très rapidement.</div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Nom complet</label>
                    <input type="text" defaultValue={prospect.contactName} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] transition-colors" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Téléphone</label>
                    <input type="tel" defaultValue={prospect.phone} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c5a059] transition-colors" required />
                  </div>
                  <button type="submit" className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-[#1A1200] transition-colors mt-2" style={{ background: 'linear-gradient(135deg, #B8924A, #c5a059)' }}>
                    Confirmer ma demande
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
