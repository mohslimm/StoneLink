'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Lock, FileText, Palette, MessageSquare, Download, Share2, ShieldCheck, ExternalLink } from 'lucide-react';
import { VAULT_VARIANTS } from './VaultModule.variants';
import { useVault } from './vault.hooks';
import { cn } from '@/lib/utils';

export const VaultModule = memo(() => {
  const { activeProspect, currentAssets, isExporting, handleExport, handleShare } = useVault();

  if (!activeProspect) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 bg-[#0f0f20] rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl relative group"
        >
          <div className="absolute inset-0 bg-[#c5a059]/5 blur-xl group-hover:bg-[#c5a059]/10 transition-colors rounded-3xl" />
          <Lock className="text-[#f0ede8]/10 group-hover:text-[#c5a059]/30 transition-colors relative z-10" size={40} />
        </motion.div>
        <h2 className="text-3xl font-['Cormorant_Garamond'] text-[#f0ede8] mb-3 italic">Archives Sécurisées</h2>
        <p className="text-[#f0ede8]/40 max-w-sm mx-auto font-['Outfit'] font-light leading-relaxed">
          Accès restreint. Veuillez sélectionner une entité dans le <span className="text-[#c5a059] font-medium">Pipeline</span> pour déverrouiller ses assets stratégiques.
        </p>
      </div>
    );
  }

  if (!currentAssets) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-24 h-24 bg-[#0f0f20] rounded-3xl flex items-center justify-center mb-8 border border-[#c5a059]/20 shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-[#c5a059]/5 blur-xl rounded-3xl" />
          <ShieldCheck className="text-[#c5a059]/40 relative z-10" size={40} />
        </motion.div>
        <h2 className="text-3xl font-['Cormorant_Garamond'] text-[#f0ede8] mb-3 italic">Coffre-fort Initialisé</h2>
        <p className="text-[#f0ede8]/40 max-w-sm mx-auto font-['Outfit'] font-light leading-relaxed">
          Le périmètre de <span className="text-[#c5a059] font-medium">{activeProspect.companyName}</span> est sécurisé. Générez des assets via <span className="text-[#f0ede8] font-medium">Intelligence</span> pour les archiver ici.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={VAULT_VARIANTS.container} 
      initial="initial" 
      animate="animate"
      className="max-w-7xl mx-auto space-y-12 py-12 px-6 md:px-12"
    >
      {/* Header */}
      <motion.div variants={VAULT_VARIANTS.item} className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5 relative">
        <div className="absolute -left-12 top-0 w-24 h-24 bg-[#c5a059]/5 blur-[60px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-full text-[10px] font-bold text-[#c5a059] uppercase tracking-[0.2em]">
              Deep Storage
            </span>
            <div className="flex items-center gap-1.5 text-[#f0ede8]/20 text-[10px] uppercase tracking-widest font-bold">
               <div className="w-1 h-1 rounded-full bg-[#22c55e]" />
               AES-256 Quantum Shield
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-['Cormorant_Garamond'] text-[#f0ede8] mb-4 italic">The Vault</h1>
          <p className="text-[#f0ede8]/50 text-lg max-w-2xl font-['Outfit'] font-light leading-relaxed">
            Intelligence stratégique et assets de conversion pour <span className="text-[#f0ede8] font-medium border-b border-[#c5a059]/30 pb-0.5">{activeProspect.companyName}</span>.
          </p>
        </div>

        <div className="flex gap-4 relative z-10">
          <button 
            onClick={handleShare}
            className="px-6 py-3.5 bg-[#0f0f20] hover:bg-[#14142a] border border-white/10 rounded-xl text-[#f0ede8] text-sm font-medium transition-all flex items-center gap-2 group"
          >
            <Share2 size={16} className="text-[#f0ede8]/40 group-hover:text-[#c5a059] transition-colors" /> 
            <span>Partager</span>
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="px-8 py-3.5 bg-gradient-to-r from-[#B8924A] via-[#c5a059] to-[#D4B57A] text-[#1A1200] rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-xl shadow-[#c5a059]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Download size={16} /> 
            <span>{isExporting ? 'Exportation...' : 'Tout Exporter'}</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Site Adaptation Card */}
        <motion.div variants={VAULT_VARIANTS.item} className="bg-[#0f0f20]/50 border border-white/5 rounded-3xl p-8 hover:border-[#c5a059]/30 transition-all duration-500 group relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-[#c5a059]/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
              <Palette className="text-blue-400" size={24} />
            </div>
            <h3 className="text-2xl font-['Cormorant_Garamond'] text-[#f0ede8] mb-6 italic">Site Adaptation</h3>
            <div className="space-y-4 mb-10">
              <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors">
                <p className="text-[10px] text-[#f0ede8]/30 uppercase tracking-[0.2em] mb-2 font-bold font-['Outfit']">Proprietary Tagline</p>
                <p className="text-sm text-[#f0ede8]/80 italic font-['Cormorant_Garamond'] leading-relaxed">"{currentAssets.siteAdaptation.tagline}"</p>
              </div>
              <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors">
                <p className="text-[10px] text-[#f0ede8]/30 uppercase tracking-[0.2em] mb-2 font-bold font-['Outfit']">Color DNA</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full border border-white/10 shadow-inner" style={{ backgroundColor: currentAssets.siteAdaptation.colorPrimary }} />
                    <div className="w-7 h-7 rounded-full border border-white/10 shadow-inner" style={{ backgroundColor: currentAssets.siteAdaptation.colorAccent }} />
                  </div>
                  <span className="text-[11px] text-[#f0ede8]/40 font-mono tracking-tighter uppercase">{currentAssets.siteAdaptation.colorPrimary}</span>
                </div>
              </div>
            </div>
            <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[#f0ede8]/60 text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-[#f0ede8] flex items-center justify-center gap-2">
              Lancer le Prototype <ExternalLink size={12} />
            </button>
          </div>
        </motion.div>

        {/* Logo Architecture Card */}
        <motion.div variants={VAULT_VARIANTS.item} className="bg-[#0f0f20]/50 border border-white/5 rounded-3xl p-8 hover:border-[#c5a059]/30 transition-all duration-500 group relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-[#c5a059]/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/20 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all">
              <FileText className="text-purple-400" size={24} />
            </div>
            <h3 className="text-2xl font-['Cormorant_Garamond'] text-[#f0ede8] mb-6 italic">Logo Architecture</h3>
            <div className="space-y-4 mb-10">
              <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors">
                <p className="text-[10px] text-[#f0ede8]/30 uppercase tracking-[0.2em] mb-2 font-bold font-['Outfit']">Design Language</p>
                <p className="text-sm text-[#f0ede8]/80 font-['Outfit'] font-light">{currentAssets.logoConcept.style}</p>
              </div>
              <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors">
                <p className="text-[10px] text-[#f0ede8]/30 uppercase tracking-[0.2em] mb-2 font-bold font-['Outfit']">Symbolism Strategy</p>
                <p className="text-xs text-[#f0ede8]/60 leading-relaxed font-['Outfit'] font-light">{currentAssets.logoConcept.symbol}</p>
              </div>
            </div>
            <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[#f0ede8]/60 text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-[#f0ede8]">
              Ouvrir Canvas Concept
            </button>
          </div>
        </motion.div>

        {/* Sales Script Card */}
        <motion.div variants={VAULT_VARIANTS.item} className="bg-[#0f0f20]/50 border border-white/5 rounded-3xl p-8 hover:border-[#c5a059]/30 transition-all duration-500 group relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-[#c5a059]/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all">
              <MessageSquare className="text-emerald-400" size={24} />
            </div>
            <h3 className="text-2xl font-['Cormorant_Garamond'] text-[#f0ede8] mb-6 italic">Sales Intelligence</h3>
            <div className="space-y-4 mb-10">
              <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors">
                <p className="text-[10px] text-[#f0ede8]/30 uppercase tracking-[0.2em] mb-2 font-bold font-['Outfit']">The Golden Hook</p>
                <p className="text-xs text-[#f0ede8]/60 leading-relaxed italic font-['Cormorant_Garamond']">"{currentAssets.callScript.accroche}"</p>
              </div>
              <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-colors">
                <p className="text-[10px] text-[#f0ede8]/30 uppercase tracking-[0.2em] mb-2 font-bold font-['Outfit']">ROI Transition</p>
                <p className="text-xs text-[#f0ede8]/60 leading-relaxed font-['Outfit'] font-light">{currentAssets.callScript.transitionQuestion}</p>
              </div>
            </div>
            <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[#f0ede8]/60 text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-[#f0ede8]">
              Lancer Interface Appel
            </button>
          </div>
        </motion.div>
      </div>

      {/* Audit Data Table */}
      <motion.div variants={VAULT_VARIANTS.item} className="bg-[#0a0a14] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#c5a059]/2 to-transparent pointer-events-none" />
        <div className="px-10 py-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h3 className="font-['Cormorant_Garamond'] text-2xl text-[#f0ede8] italic">Spécifications Techniques</h3>
            <p className="text-[10px] text-[#f0ede8]/30 uppercase tracking-[0.2em] mt-1 font-bold">Deep Audit Metadata</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
             <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-pulse" />
             <span className="text-[10px] text-[#f0ede8]/40 uppercase tracking-widest font-bold">
               Update: {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
             </span>
          </div>
        </div>
        <div className="p-10 grid grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
          <div className="space-y-1">
            <p className="text-[10px] text-[#f0ede8]/20 uppercase tracking-[0.2em] font-bold">Secteur d'Activité</p>
            <p className="text-xl text-[#f0ede8] font-['Cormorant_Garamond'] italic capitalize">{activeProspect?.niche || 'Générique'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-[#f0ede8]/20 uppercase tracking-[0.2em] font-bold">Perte Annuelle Estimée</p>
            <p className="text-xl text-[#ef4444] font-['Outfit'] font-medium">{(activeProspect?.estimatedLoss ? activeProspect.estimatedLoss * 12 : 0).toLocaleString('fr-FR')}€</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-[#f0ede8]/20 uppercase tracking-[0.2em] font-bold">Lighthouse Core Web</p>
            <div className="flex items-center gap-3">
               <p className="text-xl text-[#f0ede8] font-['Outfit'] font-medium">{activeProspect?.lighthouseScore || '74'}</p>
               <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden max-w-[60px]">
                  <div className="h-full bg-[#ef4444]" style={{ width: `${activeProspect?.lighthouseScore || 74}%` }} />
               </div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-[#f0ede8]/20 uppercase tracking-[0.2em] font-bold">Niveau de Priorité</p>
            <div className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
              activeProspect?.priority === 'hot' 
                ? "bg-red-500/10 border-red-500/20 text-red-400" 
                : "bg-[#c5a059]/10 border-[#c5a059]/20 text-[#c5a059]"
            )}>
              {activeProspect?.priority || 'Standard'}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

VaultModule.displayName = 'VaultModule';

export * from './vault.service';
export * from './vault.hooks';
export * from './VaultModule.variants';

export default VaultModule;
