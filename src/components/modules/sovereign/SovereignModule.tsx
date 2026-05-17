'use client';

import React, { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Search, Cpu, ChevronRight, Activity, Shield } from 'lucide-react';
import { useStoneStore } from '@/stores/useStoneStore';
import { SOVEREIGN_VARIANTS } from './SovereignModule.variants';
import type { SovereignResult, StatRowProps } from './SovereignModule.types';

const StatRow = ({ label, value }: StatRowProps) => (
  <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-3 last:mb-0 last:border-0">
    <span className="text-xs text-slate-500">{label}</span>
    <span className="text-xs font-mono text-white font-bold">{value}</span>
  </div>
);

export const SovereignModule = memo(() => {
  const { addTerminalEvent } = useStoneStore();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SovereignResult[]>([]);

  const handleSearch = useCallback(() => {
    if (!query) return;
    setSearching(true);
    addTerminalEvent({ 
      message: `Recherche vectorielle (PGVector) initiée: "${query}"`, 
      type: 'info',
      module: 'sovereign'
    });

    setTimeout(() => {
      setResults([
        { title: "Stratégie Q2 2025 - Algérie", score: 94, text: `L'analyse du marché pour "${query}" indique une saturation faible sur le segment premium. Recommandation : Focus sur l'autorité médicale (Garamond Style) et la preuve sociale locale.` },
        { title: "Note Technique - Performance", score: 82, text: "Les infrastructures locales présentent une latence moyenne de 4.2s. Notre solution 'Zero-JS' offre un avantage compétitif immédiat de +250% en vitesse." },
        { title: "Rapport de Conversion - Dental", score: 78, text: "L'intégration d'un système de booking sans friction multiplie par 3 l'engagement des patients de moins de 40 ans." }
      ]);
      setSearching(false);
      addTerminalEvent({ 
        message: `Recherche terminée. 3 documents pertinents trouvés.`, 
        type: 'success',
        module: 'sovereign'
      });
    }, 1500);
  }, [query, addTerminalEvent]);

  return (
    <motion.div 
      variants={SOVEREIGN_VARIANTS.container} 
      initial="initial" 
      animate="animate"
      className="max-w-6xl mx-auto py-8 px-4"
    >
      <div className="flex items-center gap-4 mb-12">
        <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
          <Database className="text-indigo-400" size={28} />
        </div>
        <div>
          <h2 className="text-4xl font-serif text-white">Sovereign Data</h2>
          <p className="text-slate-500 font-light text-lg">Infrastructure de recherche sémantique vectorielle & Base de connaissances.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Stats */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div variants={SOVEREIGN_VARIANTS.item} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <Activity size={14} className="text-indigo-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vector Store Status</span>
            </div>
            <div className="space-y-4">
              <StatRow label="Embeddings" value="1.4M+" />
              <StatRow label="Documents" value="4,532" />
              <StatRow label="Latence" value="24ms" />
              <StatRow label="Souveraineté" value="100%" />
            </div>
          </motion.div>

          <motion.div variants={SOVEREIGN_VARIANTS.item} className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={14} className="text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Chiffrement</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Données chiffrées au repos via AES-256-GCM. Accès limité aux nœuds certifiés de l'agence.
            </p>
          </motion.div>
        </div>

        {/* Search Engine */}
        <div className="lg:col-span-3 space-y-8">
          <motion.div variants={SOVEREIGN_VARIANTS.item} className="relative">
            <div className="flex gap-4 p-2 bg-white/5 border border-white/10 rounded-[2rem] focus-within:border-indigo-500/50 transition-all shadow-2xl backdrop-blur-md">
              <div className="flex-1 flex items-center px-6 gap-4">
                <Search size={20} className="text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Posez une question technique ou stratégique à l'agence..."
                  className="w-full bg-transparent outline-none text-white font-light py-5 text-lg"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button 
                onClick={handleSearch}
                disabled={searching || !query}
                className="px-10 bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest rounded-[1.5rem] hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50"
              >
                {searching ? 'Calcul...' : 'Interroger'}
              </button>
            </div>
          </motion.div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {searching && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8 text-center text-slate-500 text-sm italic font-light"
                >
                  <Cpu className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4 opacity-50" />
                  Génération des embeddings et recherche par similarité cosinus...
                </motion.div>
              )}

              {results.map((res, i) => (
                <motion.div 
                  key={`${res.title}-${i}`}
                  variants={SOVEREIGN_VARIANTS.item}
                  initial="initial"
                  animate="animate"
                  className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all group"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <h4 className="text-white font-bold tracking-tight">{res.title}</h4>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                      Similarité {res.score}%
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed font-light mb-6">
                    {res.text}
                  </p>
                  <div className="flex justify-between items-center pt-6 border-t border-white/5">
                    <div className="flex gap-4">
                       <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Tag: Stratégie</span>
                       <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Source: Rapport Q2</span>
                    </div>
                    <button className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                      Voir le document complet <ChevronRight size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

SovereignModule.displayName = 'SovereignModule';
