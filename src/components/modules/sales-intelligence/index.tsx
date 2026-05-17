'use client';

// ─────────────────────────────────────────
// IMPORTS (react → libs → local)
import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Layout, 
  Palette, 
  MessageSquare, 
  MapPin, 
  TrendingUp, 
  Star, 
  ChevronRight, 
  Copy, 
  Check, 
  Zap, 
  Shield, 
  RefreshCcw,
  Target
} from 'lucide-react';
import { SALES_INTEL_VARIANTS } from './SalesIntelModule.variants';
import { useSalesIntel } from './sales-intelligence.hooks';

// COMPOSANT
export const SalesIntelModule = memo(() => {
  // 1. Hooks
  const {
    activeProspect,
    currentAssets,
    step,
    loadingMsg,
    error,
    generatePackage
  } = useSalesIntel();

  const [activeTab, setActiveTab] = useState('site');
  const [copied, setCopied] = useState(false);

  // 4. Handlers
  const copyScript = useCallback(() => {
    if (!currentAssets) return;
    const { callScript: cs } = currentAssets;
    const text = `OPENER: ${cs.opener}\nACCROCHE: ${cs.accroche}\nPITCH: ${cs.pitchCore}\nOBJECTIONS:\n${cs.objections.map(o => `- ${o.trigger}: ${o.response}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [currentAssets]);

  // RENDER GUARDS
  if (step === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-[var(--gold-glow)] rounded-full flex items-center justify-center mb-6 border border-[var(--border-gold)]">
          <Sparkles className="text-[var(--gold-400)]" size={32} />
        </div>
        <h2 className="text-2xl font-display text-[var(--text-primary)] mb-2 italic">Sélectionnez un Prospect</h2>
        <p className="text-[var(--text-muted)] max-w-md mx-auto mb-8 font-body">
          Veuillez sélectionner un prospect dans le Pipeline pour activer la Sales Intelligence.
        </p>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-2xl mx-auto px-4">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-12 rounded-[3rem] bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-full shadow-2xl"
        >
          {error ? (
            <div className="mb-4">
              <div className="w-16 h-16 bg-[var(--danger)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[var(--danger)]/20">
                <Zap className="text-[var(--danger)]" size={24} />
              </div>
              <h2 className="text-xl font-display text-[var(--text-primary)] mb-3 italic">Erreur de Génération</h2>
              <p className="text-[var(--danger)]/70 text-sm mb-8 leading-relaxed px-6 font-body">{error}</p>
              <button 
                onClick={generatePackage}
                className="px-10 py-4 bg-[var(--text-primary)] text-[var(--bg-void)] font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[var(--gold-500)] transition-all flex items-center gap-2 mx-auto cursor-pointer"
              >
                <RefreshCcw size={14} /> Réessayer la Génération
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-[var(--gold-glow)] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[var(--border-gold)]">
                <Sparkles className="text-[var(--gold-500)]" size={24} />
              </div>
              <h2 className="text-2xl font-display text-[var(--text-primary)] mb-3 italic">Prêt pour l'Impact ?</h2>
              <p className="text-[var(--text-muted)] text-sm mb-10 leading-relaxed px-10 font-body">
                Nous allons générer un package complet (site, logo, script) personnalisé pour <strong className="text-[var(--gold-400)]">{activeProspect?.companyName}</strong> en utilisant notre IA orchestrée.
              </p>
              <button 
                onClick={generatePackage}
                className="px-10 py-4 bg-gradient-to-r from-[#B8924A] via-[#c5a059] to-[#D4B57A] text-[#1A1200] font-black text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-[0_10px_30px_rgba(197,160,89,0.2)] cursor-pointer"
              >
                Générer le Package Commercial
              </button>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="relative mb-12">
          <div className="w-24 h-24 rounded-3xl border-2 border-[var(--gold-500)]/20 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
             <Sparkles className="text-[var(--gold-500)] animate-pulse" size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-display text-[var(--text-primary)] mb-4 italic">{loadingMsg}</h2>
        <div className="flex gap-2">
          {[0,1,2].map(i => (
            <motion.div 
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              className="w-1.5 h-1.5 bg-[var(--gold-500)] rounded-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!currentAssets) return null;

  const sa = currentAssets.siteAdaptation;
  const lc = currentAssets.logoConcept;
  const cs = currentAssets.callScript;

  return (
    <motion.div variants={SALES_INTEL_VARIANTS.container} initial="initial" animate="animate" className="max-w-6xl mx-auto py-8 px-4">
      {/* Header Info */}
      <motion.div variants={SALES_INTEL_VARIANTS.item} className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <span className="text-[10px] font-bold text-[var(--gold-500)] uppercase tracking-[0.2em]">Package Généré</span>
             <span className="w-1 h-1 bg-[var(--border-subtle)] rounded-full" />
             <span className="text-xs text-[var(--text-muted)]">{activeProspect?.companyName}</span>
          </div>
          <h2 className="text-4xl font-display text-[var(--text-primary)] italic underline decoration-1 underline-offset-8 decoration-[var(--gold-500)]/30">{activeProspect?.companyName}</h2>
          <div className="flex items-center gap-4 mt-4 text-[var(--text-muted)] text-sm font-body">
            <span className="flex items-center gap-1"><MapPin size={14} className="text-[var(--gold-500)]" /> {activeProspect?.city}</span>
            <span className="w-1 h-1 bg-[var(--border-subtle)] rounded-full" />
            <span className="capitalize">{activeProspect?.niche}</span>
          </div>
        </div>
        
        <div className="flex bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-subtle)] backdrop-blur-md shadow-xl">
          {[
            { id: 'site', label: 'Site Web', icon: <Layout size={14} /> },
            { id: 'logo', label: 'Logo', icon: <Palette size={14} /> },
            { id: 'script', label: 'Script', icon: <MessageSquare size={14} /> }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === t.id ? "bg-gradient-to-r from-[#B8924A] to-[#D4B57A] text-[#1A1200] shadow-lg" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'site' && (
          <motion.div 
            key="site" 
            variants={SALES_INTEL_VARIANTS.tabContent}
            initial="initial" 
            animate="animate" 
            exit="exit" 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
              <div className="p-10 rounded-[2.5rem] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                  <Layout size={180} className="text-white" />
                </div>
                <div className="mb-10">
                  <div className="text-[10px] font-bold text-[var(--gold-500)] uppercase tracking-[0.2em] mb-6">Direction Artistique</div>
                  <div className="flex gap-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl border border-[var(--border-subtle)] shadow-inner" style={{ backgroundColor: sa.colorPrimary }} />
                      <div>
                        <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-tighter">Primaire</p>
                        <p className="text-xs font-mono text-[var(--text-primary)]">{sa.colorPrimary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl border border-[var(--border-subtle)] shadow-inner" style={{ backgroundColor: sa.colorAccent }} />
                      <div>
                        <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-tighter">Accent</p>
                        <p className="text-xs font-mono text-[var(--text-primary)]">{sa.colorAccent}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-4xl font-display text-[var(--text-primary)] mb-6 leading-tight italic">{sa.heroTitle}</h3>
                <p className="text-[var(--text-muted)] text-xl font-light mb-10 max-w-xl leading-relaxed font-body">{sa.heroSubtitle}</p>
                <button className="px-10 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-[var(--text-primary)] text-[var(--bg-void)] hover:bg-[var(--gold-500)] transition-all cursor-pointer">
                  {sa.ctaText}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg">
                  <div className="text-[10px] font-bold text-[var(--gold-500)] uppercase tracking-[0.2em] mb-6">Structure Strategy</div>
                  <div className="space-y-6">
                    {sa.sections.map((s, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="text-[var(--gold-500)] font-mono text-sm opacity-50">0{i+1}</span>
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)] mb-1 font-body">{s.name}</p>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed font-body">{s.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg">
                  <div className="text-[10px] font-bold text-[var(--gold-500)] uppercase tracking-[0.2em] mb-6">Design Philosophy</div>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-8 font-body">{sa.designNotes}</p>
                  <div className="p-6 bg-[var(--gold-glow)] border border-[var(--border-gold)] rounded-2xl shadow-inner">
                    <div className="flex items-center gap-2 text-[var(--gold-500)] font-bold text-[10px] uppercase mb-3">
                      <TrendingUp size={14} /> Performance Gains
                    </div>
                    <p className="text-xs text-[var(--text-primary)] italic leading-relaxed font-body">"{sa.performanceGains}"</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-gradient-to-br from-[var(--gold-glow)] to-transparent border border-[var(--border-gold)] shadow-xl">
                <div className="text-[10px] font-bold text-[var(--gold-500)] uppercase tracking-[0.2em] mb-6">Tagline</div>
                <p className="text-2xl font-display text-[var(--text-primary)] italic leading-relaxed">"{sa.tagline}"</p>
              </div>
              <div className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg">
                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4 opacity-30">Market Context</div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-body">Basé sur un audit de {activeProspect?.website} avec un score Lighthouse de <span className="text-[var(--gold-500)] font-bold">{activeProspect?.lighthouseScore}/100</span>.</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'logo' && (
          <motion.div 
            key="logo" 
            variants={SALES_INTEL_VARIANTS.tabContent}
            initial="initial" 
            animate="animate" 
            exit="exit" 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="p-20 rounded-[3rem] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--gold-glow)] blur-3xl opacity-20" />
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[var(--gold-500)] to-[#8e6d2f] p-1 mb-10 shadow-2xl shadow-[var(--gold-glow)] group">
                <div className="w-full h-full bg-[var(--bg-void)] rounded-[2.2rem] flex items-center justify-center">
                  <Zap size={48} className="text-[var(--gold-500)] group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <h3 className="text-3xl font-display text-[var(--text-primary)] mb-2 italic">{lc.style}</h3>
              <p className="text-[var(--text-muted)] tracking-[0.3em] uppercase text-[9px] font-bold">Architecture Visuelle</p>
            </div>
            <div className="grid grid-cols-1 gap-4 font-body">
              {[
                { label: "Concept & Symbolique", content: lc.symbol, color: "text-[var(--gold-400)]" },
                { label: "Typographie Stratégique", content: lc.typography, color: "text-blue-400" },
                { label: "Rationalité Chromatique", content: lc.colorRationale, color: "text-emerald-400" },
                { label: "Vision Globale", content: lc.concept, color: "text-purple-400" }
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg hover:border-[var(--border-gold)] transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <Star size={14} className={item.color} />
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">{item.label}</span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed font-light">{item.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'script' && (
          <motion.div 
            key="script" 
            variants={SALES_INTEL_VARIANTS.tabContent}
            initial="initial" 
            animate="animate" 
            exit="exit" 
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 gap-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--gold-glow)] rounded-xl flex items-center justify-center border border-[var(--border-gold)]">
                   <TrendingUp className="text-[var(--gold-500)]" size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1 font-bold">Timing de Contact Optimal</p>
                  <p className="text-[var(--text-primary)] font-medium font-body">{cs.bestTimeToCall}</p>
                </div>
              </div>
              <button 
                onClick={copyScript}
                className="flex items-center gap-2 px-8 py-3 bg-[var(--bg-elevated)] hover:bg-[var(--gold-glow)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-md active:scale-95"
              >
                {copied ? <Check size={16} className="text-[var(--success)]" /> : <Copy size={16} className="text-[var(--gold-500)]" />}
                {copied ? 'Copié !' : 'Copier le Script'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-body">
              <div className="space-y-4">
                {[
                  { label: "Ouverture", content: cs.opener },
                  { label: "Accroche Impact", content: cs.accroche },
                  { label: "Pitch Central (ROI)", content: cs.pitchCore },
                  { label: "Preuve Sociale", content: cs.socialProof },
                  { label: "Question de Transition", content: cs.transitionQuestion },
                ].map((item, i) => (
                  <div key={i} className="p-8 rounded-[2rem] bg-[var(--bg-surface)] border border-[var(--border-subtle)] relative shadow-lg group hover:border-[var(--border-gold)] transition-colors">
                    <span className="absolute top-8 right-8 text-[10px] font-mono text-[var(--text-muted)] opacity-20">0{i+1}</span>
                    <p className="text-[10px] font-bold text-[var(--gold-500)] uppercase tracking-[0.2em] mb-4">{item.label}</p>
                    <p className="text-lg text-[var(--text-primary)] font-light leading-relaxed italic">"{item.content}"</p>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-[var(--danger)]/[0.03] border border-[var(--danger)]/20 shadow-xl">
                  <div className="flex items-center gap-3 mb-8">
                    <Shield size={18} className="text-[var(--danger)]" />
                    <span className="text-[10px] font-bold text-[var(--danger)] uppercase tracking-[0.2em]">Anti-Objections Strategy</span>
                  </div>
                  <div className="space-y-8">
                    {cs.objections.map((obj, i) => (
                      <div key={i} className="space-y-2 group">
                        <p className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
                          <ChevronRight size={12} className="text-[var(--danger)] group-hover:translate-x-1 transition-transform" /> {obj.trigger}
                        </p>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed pl-5 italic font-light">{obj.response}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-[#B8924A] via-[#c5a059] to-[#D4B57A] text-[#1A1200] shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                      <Target size={120} />
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 opacity-60">Le Close (Signature)</p>
                   <p className="text-2xl font-display leading-tight mb-10 italic">"{cs.close}"</p>
                   <button className="w-full py-4 bg-black/10 hover:bg-black/20 border border-black/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer">
                     Marquer comme "Appel Planifié"
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

SalesIntelModule.displayName = 'SalesIntelModule';

export * from './SalesIntelModule.types';
export * from './SalesIntelModule.variants';
