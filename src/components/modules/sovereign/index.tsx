'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Search, Cpu, ChevronRight, Activity, Shield, Sparkles } from 'lucide-react';
import { SOVEREIGN_VARIANTS } from './SovereignModule.variants';
import { useSovereign } from './sovereign.hooks';
import type { StatRowProps } from './SovereignModule.types';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';

const StatRow = ({ label, value }: StatRowProps) => (
  <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4 last:mb-0 last:border-0 group/row">
    <span className="text-[10px] text-[#f0ede8]/30 uppercase tracking-widest font-bold font-['Outfit'] group-hover/row:text-[#f0ede8]/50 transition-colors">{label}</span>
    <span className="text-xs font-mono text-[#c5a059] font-bold">{value}</span>
  </div>
);

// Helper function to parse our beautiful mock markdown into rich React elements
const parseSimpleMarkdown = (text?: string) => {
  if (!text) return null;
  return text.split('\n\n').map((block, idx) => {
    if (block.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-xl font-serif text-[#c5a059] italic mt-6 mb-4 font-['Cormorant_Garamond']">
          {block.replace('### ', '')}
        </h3>
      );
    }
    if (block.startsWith('#### ')) {
      return (
        <h4 key={idx} className="text-sm font-bold text-white uppercase tracking-wider mt-4 mb-2 font-['Outfit']">
          {block.replace('#### ', '')}
        </h4>
      );
    }
    if (block.startsWith('- ')) {
      return (
        <ul key={idx} className="list-disc pl-5 space-y-2 text-[#f0ede8]/70 my-2">
          {block.split('\n').map((line, lIdx) => (
            <li key={lIdx} className="font-['Outfit'] font-light">
              {line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '$1')}
            </li>
          ))}
        </ul>
      );
    }
    
    // Handle inline bold formatting (**bold**)
    const parts = block.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={idx} className="text-[#f0ede8]/70 font-['Outfit'] font-light leading-relaxed mb-4 text-base">
        {parts.map((part, pIdx) => (
          pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-medium">{part}</strong> : part
        ))}
      </p>
    );
  });
};

export const SovereignModule = memo(() => {
  const { 
    query, 
    setQuery, 
    searching, 
    results, 
    handleSearch, 
    selectedDoc, 
    openDocument, 
    closeDocument 
  } = useSovereign();

  return (
    <motion.div 
      variants={SOVEREIGN_VARIANTS.container} 
      initial="initial" 
      animate="animate"
      className="max-w-7xl mx-auto py-12 px-6 md:px-12 space-y-12"
    >
      {/* Header Section */}
      <div className="flex items-center gap-6 mb-12 relative">
        <div className="absolute -left-16 top-0 w-32 h-32 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="w-16 h-16 bg-[#0f0f20] border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.15)] relative z-10">
          <Database className="text-indigo-400" size={32} />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-['Cormorant_Garamond'] text-[#f0ede8] italic">Sovereign Data</h2>
          <p className="text-[#f0ede8]/40 font-['Outfit'] font-light text-lg mt-1">Infrastructure de recherche sémantique vectorielle & Base de connaissances.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">
        {/* Sidebar Stats */}
        <div className="space-y-6">
          <motion.div variants={SOVEREIGN_VARIANTS.item} className="p-8 rounded-[2rem] bg-[#0f0f20]/50 border border-white/5 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/2 to-transparent pointer-events-none" />
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <Activity size={14} className="text-indigo-400 animate-pulse" />
              <span className="text-[10px] font-bold text-[#f0ede8]/30 uppercase tracking-[0.2em]">Vector Store Status</span>
            </div>
            <div className="space-y-1 relative z-10">
              <StatRow label="Embeddings" value="1.4M+" />
              <StatRow label="Documents" value="4,532" />
              <StatRow label="Latence" value="24ms" />
              <StatRow label="Souveraineté" value="100%" />
            </div>
          </motion.div>

          <motion.div variants={SOVEREIGN_VARIANTS.item} className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20 group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <Shield size={14} className="text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Quantum Shield</span>
            </div>
            <p className="text-xs text-[#f0ede8]/40 leading-relaxed font-['Outfit'] font-light relative z-10">
              Données chiffrées au repos via <span className="text-indigo-400/60 font-medium">AES-256-GCM</span>. Accès limité aux nœuds certifiés de l'agence Stepping Stones.
            </p>
          </motion.div>
        </div>

        {/* Search Engine Area */}
        <div className="space-y-10">
          <motion.div variants={SOVEREIGN_VARIANTS.item} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
            
            <div className="relative flex gap-4 p-2 bg-[#0f0f20] border border-white/10 rounded-[2.2rem] focus-within:border-indigo-500/50 transition-all duration-500 shadow-2xl backdrop-blur-xl">
              <div className="flex-1 flex items-center px-8 gap-5">
                <Search size={22} className={cn(
                  "transition-colors duration-300",
                  searching ? "text-indigo-400" : "text-[#f0ede8]/20"
                )} />
                <input 
                  type="text" 
                  placeholder="Posez une question technique ou stratégique à l'IA de l'agence..."
                  className="w-full bg-transparent outline-none text-[#f0ede8] font-['Outfit'] font-light py-5 text-xl placeholder:text-[#f0ede8]/10"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button 
                onClick={handleSearch}
                disabled={searching || !query.trim()}
                className="px-12 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-[1.8rem] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale disabled:hover:shadow-none"
              >
                {searching ? (
                   <div className="flex items-center gap-2">
                      <Cpu size={14} className="animate-spin" />
                      <span>Calcul...</span>
                   </div>
                ) : 'Interroger'}
              </button>
            </div>
          </motion.div>

          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {searching && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-12 text-center text-[#f0ede8]/20 text-sm italic font-['Outfit'] font-light border border-dashed border-white/5 rounded-[2.5rem]"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full mx-auto mb-6"
                  />
                  Génération des embeddings et recherche par similarité cosinus sur 1.4M de vecteurs...
                </motion.div>
              )}

              {results.map((res, i) => (
                <motion.div 
                  key={`${res.title}-${i}`}
                  variants={SOVEREIGN_VARIANTS.item}
                  initial="initial"
                  animate="animate"
                  className="p-10 rounded-[2.5rem] bg-[#0a0a14] border border-white/5 hover:border-indigo-500/30 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                        <h4 className="text-[#f0ede8] text-xl font-['Cormorant_Garamond'] italic group-hover:text-white transition-colors">{res.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full text-[10px] font-bold text-[#22c55e] uppercase tracking-widest shadow-inner">
                        <Sparkles size={12} />
                        Similarité {res.score}%
                      </div>
                    </div>
                    
                    <p className="text-[#f0ede8]/50 text-base leading-relaxed font-['Outfit'] font-light mb-10 group-hover:text-[#f0ede8]/70 transition-colors">
                      {res.text}
                    </p>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between pt-8 border-t border-white/5 gap-6">
                      <div className="flex gap-6">
                         <div className="flex items-center gap-2">
                            <span className="text-[9px] text-[#f0ede8]/20 font-bold uppercase tracking-[0.2em]">Domain:</span>
                            <span className="text-[9px] text-indigo-400/60 font-bold uppercase tracking-[0.2em]">{res.metadata?.category || 'Stratégie'}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-[9px] text-[#f0ede8]/20 font-bold uppercase tracking-[0.2em]">Origin:</span>
                            <span className="text-[9px] text-indigo-400/60 font-bold uppercase tracking-[0.2em]">Proprietary Dataset</span>
                         </div>
                      </div>
                      <button 
                        onClick={() => openDocument(res)}
                        className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-3 group-hover:text-indigo-300 transition-all cursor-pointer"
                      >
                        Consulter le document <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {!searching && results.length === 0 && (
               <div className="p-20 text-center opacity-10 space-y-4">
                  <Database size={64} className="mx-auto" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.5em]">System Idle — Awaiting Vector Query</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Premium Document Detail Viewer Modal */}
      <Modal
        isOpen={!!selectedDoc}
        onClose={closeDocument}
        title={selectedDoc?.title || ''}
      >
        {selectedDoc && (
          <div className="space-y-6">
            {/* Structured Quiet Luxury Metadata Panel */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 mb-8">
              <div>
                <div className="text-[9px] text-[#f0ede8]/30 uppercase tracking-[0.2em] font-bold font-['Outfit']">Confidentialité</div>
                <div className="text-xs font-mono text-indigo-400 mt-1.5 font-bold">{selectedDoc.metadata?.confidentiality || 'INTERNE'}</div>
              </div>
              <div>
                <div className="text-[9px] text-[#f0ede8]/30 uppercase tracking-[0.2em] font-bold font-['Outfit']">Indexation</div>
                <div className="text-xs font-mono text-indigo-400 mt-1.5 font-bold">{selectedDoc.metadata?.lastIndexed || 'Récent'}</div>
              </div>
              <div>
                <div className="text-[9px] text-[#f0ede8]/30 uppercase tracking-[0.2em] font-bold font-['Outfit']">Auteur</div>
                <div className="text-xs font-mono text-indigo-400 mt-1.5 font-bold">{selectedDoc.metadata?.author || 'Système'}</div>
              </div>
              <div>
                <div className="text-[9px] text-[#f0ede8]/30 uppercase tracking-[0.2em] font-bold font-['Outfit']">Catégorie</div>
                <div className="text-xs font-mono text-[#c5a059] mt-1.5 font-bold">{selectedDoc.metadata?.category || 'Général'}</div>
              </div>
              <div>
                <div className="text-[9px] text-[#f0ede8]/30 uppercase tracking-[0.2em] font-bold font-['Outfit']">ID Vecteur</div>
                <div className="text-xs font-mono text-[#f0ede8]/50 mt-1.5 font-bold">{selectedDoc.metadata?.vectorId || 'vec_gen_00000'}</div>
              </div>
            </div>

            {/* Document Rich Content Body */}
            <div className="space-y-6 text-[#f0ede8]/85 border-t border-white/5 pt-6">
              {parseSimpleMarkdown(selectedDoc.fullContent)}
            </div>

            {/* Footer Action */}
            <div className="flex justify-end pt-8 border-t border-white/5 mt-8">
              <button 
                onClick={closeDocument}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-['Outfit'] font-medium text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer"
              >
                Fermer l'Aperçu
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
});

SovereignModule.displayName = 'SovereignModule';

export * from './sovereign.service';
export * from './sovereign.hooks';
export * from './SovereignModule.types';
export * from './SovereignModule.variants';

export default SovereignModule;
