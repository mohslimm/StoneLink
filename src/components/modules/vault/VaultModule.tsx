'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Lock, FileText, Palette, MessageSquare, Download, Share2 } from 'lucide-react';
import { useStoneStore } from '@/stores/useStoneStore';
import { VAULT_VARIANTS } from './VaultModule.variants';

export const VaultModule = memo(() => {
  const { aiAssets, activeProspect } = useStoneStore();
  const currentAssets = activeProspect ? aiAssets[activeProspect.id] : null;

  if (!activeProspect) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
          <Lock className="text-white/20" size={32} />
        </div>
        <h2 className="text-2xl font-serif text-white mb-2">Sélectionnez un Prospect</h2>
        <p className="text-white/40 max-w-md mx-auto">
          Veuillez sélectionner un prospect dans le Pipeline pour accéder à son coffre-fort d'assets.
        </p>
      </div>
    );
  }

  if (!currentAssets) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
          <Lock className="text-white/20" size={32} />
        </div>
        <h2 className="text-2xl font-serif text-white mb-2">Le Coffre est Vide</h2>
        <p className="text-white/40 max-w-md mx-auto">
          Générez des assets via le module Sales Intelligence pour <span className="text-[#c5a059]">{activeProspect.companyName}</span> pour les voir apparaître ici.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={VAULT_VARIANTS.container} 
      initial="initial" 
      animate="animate"
      className="max-w-6xl mx-auto space-y-8 py-8 px-4"
    >
      {/* Header */}
      <motion.div variants={VAULT_VARIANTS.item} className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-full text-[10px] font-bold text-[#c5a059] uppercase tracking-widest">
              Stockage Sécurisé
            </span>
            <span className="text-white/20 text-xs">AES-256 Enabled</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">The Vault</h1>
          <p className="text-white/40 text-lg max-w-2xl">
            Assets stratégiques générés pour <span className="text-white font-medium">{activeProspect?.companyName || 'le prospect'}</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium transition-all flex items-center gap-2">
            <Share2 size={16} /> Partager
          </button>
          <button className="px-6 py-3 bg-[#c5a059] hover:bg-[#d4b57a] text-black rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-gold-glow">
            <Download size={16} /> Tout Exporter
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Site Adaptation Card */}
        <motion.div variants={VAULT_VARIANTS.item} className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 hover:border-[#c5a059]/30 transition-colors group">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
            <Palette className="text-blue-400" size={24} />
          </div>
          <h3 className="text-xl font-serif text-white mb-4">Site Adaptation</h3>
          <div className="space-y-4 mb-8">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Tagline</p>
              <p className="text-sm text-white/80 italic">"{currentAssets.siteAdaptation.tagline}"</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Color Palette</p>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full border border-white/10" style={{ backgroundColor: currentAssets.siteAdaptation.colorPrimary }} />
                <div className="w-6 h-6 rounded-full border border-white/10" style={{ backgroundColor: currentAssets.siteAdaptation.colorAccent }} />
                <span className="text-[10px] text-white/40 self-center font-mono">{currentAssets.siteAdaptation.colorPrimary}</span>
              </div>
            </div>
          </div>
          <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white text-xs font-bold uppercase tracking-widest transition-colors">
            Voir le Prototype
          </button>
        </motion.div>

        {/* Logo Concept Card */}
        <motion.div variants={VAULT_VARIANTS.item} className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 hover:border-[#c5a059]/30 transition-colors group">
          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
            <FileText className="text-purple-400" size={24} />
          </div>
          <h3 className="text-xl font-serif text-white mb-4">Logo Architecture</h3>
          <div className="space-y-4 mb-8">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Style</p>
              <p className="text-sm text-white/80">{currentAssets.logoConcept.style}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Symbolique</p>
              <p className="text-xs text-white/60 leading-relaxed">{currentAssets.logoConcept.symbol}</p>
            </div>
          </div>
          <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white text-xs font-bold uppercase tracking-widest transition-colors">
            Ouvrir Canvas
          </button>
        </motion.div>

        {/* Sales Script Card */}
        <motion.div variants={VAULT_VARIANTS.item} className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 hover:border-[#c5a059]/30 transition-colors group">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <MessageSquare className="text-emerald-400" size={24} />
          </div>
          <h3 className="text-xl font-serif text-white mb-4">Sales Script</h3>
          <div className="space-y-4 mb-8">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Accroche</p>
              <p className="text-xs text-white/60 leading-relaxed italic">"{currentAssets.callScript.accroche}"</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">ROI Transition</p>
              <p className="text-xs text-white/60 leading-relaxed">{currentAssets.callScript.transitionQuestion}</p>
            </div>
          </div>
          <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white text-xs font-bold uppercase tracking-widest transition-colors">
            Lancer Call Mode
          </button>
        </motion.div>
      </div>

      {/* Audit Data Table */}
      <motion.div variants={VAULT_VARIANTS.item} className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden">
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-serif text-xl text-white">Données d'Audit Prospect</h3>
          <span className="text-[10px] text-white/40 uppercase tracking-widest">Dernière mise à jour : {new Date().toLocaleDateString()}</span>
        </div>
        <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Niche</p>
            <p className="text-white font-medium capitalize">{activeProspect?.niche || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Manque à Gagner</p>
            <p className="text-[#ef4444] font-medium">{activeProspect?.estimatedLoss?.toLocaleString('fr-FR') || '0'}€ / mois</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Lighthouse Score</p>
            <p className="text-white font-medium">{activeProspect?.lighthouseScore || '?'}/100</p>
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Priority</p>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              activeProspect?.priority === 'hot' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {activeProspect?.priority?.toUpperCase() || 'NORMAL'}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

VaultModule.displayName = 'VaultModule';
