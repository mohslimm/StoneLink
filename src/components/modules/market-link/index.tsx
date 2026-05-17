'use client';

// ─────────────────────────────────────────
// IMPORTS (react → libs → local)
import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Zap, 
  Search, 
  AlertCircle, 
  BarChart3, 
  ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VARIANTS } from './MarketLinkModule.variants';
import { useMarketLink } from './market-link.hooks';
import type { MarketLinkModuleProps } from './MarketLinkModule.types';

// COMPOSANT
export const MarketLinkModule = memo((_props: MarketLinkModuleProps) => {
  // 1. Hooks (Custom hook handles state and service orchestration)
  const {
    url,
    setUrl,
    status,
    step,
    result,
    error,
    runAudit
  } = useMarketLink();

  const isScanning = status === 'loading';

  // 6. JSX principal
  return (
    <motion.div 
      variants={VARIANTS.container} 
      initial="initial" 
      animate="animate"
      className="max-w-5xl mx-auto py-8 px-4"
    >
      {/* Header */}
      <motion.div variants={VARIANTS.item} className="mb-12">
        <h2 className="text-4xl font-display text-[var(--text-primary)] mb-3 italic">
          Market Link
        </h2>
        <p className="text-[var(--text-muted)] text-lg font-light max-w-2xl font-body">
          Audit d'Infrastructure & Scoring. Identifiez les failles techniques de vos prospects pour transformer leur frustration en opportunité stratégique.
        </p>
      </motion.div>

      {/* Search Input */}
      <motion.div variants={VARIANTS.item} className="relative mb-12">
        <div className="flex gap-4 p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl focus-within:border-[var(--border-gold)] transition-all shadow-2xl backdrop-blur-md">
          <div className="flex-1 flex items-center px-4 gap-3">
            <Search size={18} className="text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="URL du prospect (ex: www.clinique-dentaire.com)"
              className="w-full bg-transparent outline-none text-[var(--text-primary)] font-light py-3 font-body placeholder:text-[var(--text-muted)]/30"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runAudit()}
            />
          </div>
          <button 
            onClick={() => runAudit()}
            disabled={isScanning || !url}
            className="px-8 bg-gradient-to-r from-[#B8924A] via-[#c5a059] to-[#D4B57A] text-[#1A1200] font-bold text-xs uppercase tracking-[0.15em] rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale cursor-pointer"
          >
            {isScanning ? 'Analyse...' : 'Scanner la Cible'}
          </button>
        </div>
        {error && (
          <p className="absolute -bottom-6 left-2 text-[var(--danger)] text-xs italic">{error}</p>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {isScanning && (
          <motion.div 
            key="scanning"
            variants={VARIANTS.fade}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
              <div className="absolute inset-0 border-4 border-[var(--gold-500)] border-t-transparent rounded-full animate-spin" />
              <Zap className="absolute inset-0 m-auto text-[var(--gold-500)] w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-2xl font-display text-[var(--text-primary)] mb-2 italic">
              {step === 1 ? 'Négociation WAF & DNS...' : 'Analyse Lighthouse en cours...'}
            </h3>
            <p className="text-[var(--text-muted)] font-light max-w-sm mx-auto font-body">
              Interrogation des serveurs cibles pour extraction des metrics de performance et sécurité.
            </p>
          </motion.div>
        )}

        {result && (
          <motion.div 
            key="result"
            variants={VARIANTS.item}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main Score Card */}
            <div className="lg:col-span-1 p-8 rounded-[2rem] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--border-gold)] to-transparent opacity-50" />
              <div className="mb-6 relative">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/5"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={440}
                    initial={{ strokeDashoffset: 440 }}
                    animate={{ strokeDashoffset: 440 - (440 * result.lighthouseScore) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={result.lighthouseScore < 50 ? "text-[var(--danger)]" : "text-[var(--warning)]"}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-body">
                  <span className={cn("text-5xl font-black", result.lighthouseScore < 50 ? "text-[var(--danger)]" : "text-[var(--warning)]")}>
                    {result.lighthouseScore}
                  </span>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">Score Global</span>
                </div>
              </div>
              <h4 className="text-xl font-display text-[var(--text-primary)] italic mb-2">
                {result.lighthouseScore < 50 ? "Vulnérabilité Élevée" : "Amélioration Requise"}
              </h4>
              <p className="text-xs text-[var(--text-muted)] font-light px-4 leading-relaxed font-body">
                {result.lighthouseScore < 50 
                  ? "L'infrastructure présente des signes critiques de ralentissement impactant directement le taux de conversion."
                  : "Le site est fonctionnel mais manque d'optimisations avancées pour dominer le marché local."}
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 font-body">
              <MetricItem label="Performance" value={result.scores.performance} color="var(--danger)" />
              <MetricItem label="SEO" value={result.scores.seo} color="var(--warning)" />
              <MetricItem label="Mobile UI" value={result.scores.mobile} color="var(--danger)" />
              <MetricItem label="Sécurité SSL" value={98} color="var(--success)" />

              <div className="md:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-[var(--border-subtle)] flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[var(--danger)]/10 flex items-center justify-center shrink-0 border border-[var(--danger)]/20">
                  <AlertCircle size={20} className="text-[var(--danger)]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Résumé de l'Audit</div>
                  <p className="text-sm text-[var(--text-primary)] font-light italic leading-relaxed">
                    "{result.auditSummary}"
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 p-6 rounded-2xl bg-[var(--gold-glow)] border border-[var(--border-gold)] flex justify-between items-center group cursor-pointer hover:bg-[var(--gold-glow)]/20 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <BarChart3 className="text-[var(--gold-500)]" size={20} />
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider">Perte de Revenus Estimée</div>
                    <div className="text-sm text-[var(--gold-500)] font-mono">~{result.estimatedLoss.toLocaleString()} € / mois</div>
                  </div>
                </div>
                <ChevronRight className="text-[var(--gold-500)] group-hover:translate-x-1 transition-transform" size={20} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// SUB-COMPONENTS
const MetricItem = memo(({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col shadow-sm">
    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">{label}</div>
    <div className="flex items-end justify-between">
      <div className="text-3xl font-black" style={{ color: `var(--${color.replace('var(--', '').replace(')', '')})` || color }}>{value}%</div>
      <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full"
          style={{ backgroundColor: `var(--${color.replace('var(--', '').replace(')', '')})` || color }}
        />
      </div>
    </div>
  </div>
));

MetricItem.displayName = 'MetricItem';
MarketLinkModule.displayName = 'MarketLinkModule';

export * from './MarketLinkModule.types';
export * from './MarketLinkModule.variants';
