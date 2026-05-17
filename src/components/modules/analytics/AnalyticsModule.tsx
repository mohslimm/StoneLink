import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Activity, 
  Zap, 
  BarChart2, 
  CheckCircle2 
} from 'lucide-react';
import { useStoneStore } from '@/stores/useStoneStore';
import { STAGE_CONFIG } from '@/lib/pipelineConfig';
import { ANALYTICS_VARIANTS } from './AnalyticsModule.variants';
import { AIReportStatus } from './AnalyticsModule.types';


export const AnalyticsModule = memo(() => {
  const { getStats } = useStoneStore();
  const stats = getStats();
  const [aiReportStatus, setAiReportStatus] = useState<AIReportStatus>('idle');
  const [report, setReport] = useState<string | null>(null);

  const generateReport = useCallback(() => {
    setAiReportStatus('generating');
    setTimeout(() => {
      const insightData = {
        insights: [
          "Immobilier premium (Conversion: +15%)",
          "Cliniques esthétiques (Cycle trop long)",
          "Relancer les 3 leads 'hot' inactifs depuis 48h"
        ]
      };
      setReport(JSON.stringify(insightData, null, 2));
      setAiReportStatus('ready');
    }, 2500);
  }, []);

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto" style={{ background: '#0a0a14' }}>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[#f0ede8] mb-1">Business Analytics</h1>
          <p className="text-sm text-[rgba(240,237,232,0.4)]">Vue d'ensemble de la performance commerciale</p>
        </div>
      </div>

      <motion.div variants={ANALYTICS_VARIANTS.container} initial="initial" animate="animate" className="space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div variants={ANALYTICS_VARIANTS.item} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#c5a059] font-bold mb-3">
              <Users className="w-4 h-4" /> Leads Total
            </div>
            <div className="text-3xl font-serif text-white">{stats.totalProspects}</div>
          </motion.div>
          <motion.div variants={ANALYTICS_VARIANTS.item} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-green-400 font-bold mb-3">
              <CheckCircle2 className="w-4 h-4" /> Win Rate
            </div>
            <div className="text-3xl font-serif text-white">
              {stats.totalProspects > 0 ? Math.round((stats.closedWonThisMonth / stats.totalProspects) * 100) : 0}
              <span className="text-lg text-white/40">%</span>
            </div>
          </motion.div>
          <motion.div variants={ANALYTICS_VARIANTS.item} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#c5a059] font-bold mb-3">
              <TrendingUp className="w-4 h-4" /> CA Pondéré
            </div>
            <div className="text-3xl font-serif text-white">{stats.weightedPipelineValue.toLocaleString('fr-FR')} €</div>
          </motion.div>
          <motion.div variants={ANALYTICS_VARIANTS.item} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-3">
              <Activity className="w-4 h-4" /> Open Emails
            </div>
            <div className="text-3xl font-serif text-white">{stats.emailOpenRate.toFixed(1)}<span className="text-lg text-white/40">%</span></div>
          </motion.div>
          <motion.div variants={ANALYTICS_VARIANTS.item} className="p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-[#c5a059]/10 to-transparent border-[#c5a059]/20">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-[#c5a059] font-bold mb-3">
              <Target className="w-4 h-4" /> Mirror Clicks
            </div>
            <div className="text-3xl font-serif text-white">{stats.mirrorClickRate.toFixed(1)}<span className="text-lg text-white/40">%</span></div>
          </motion.div>
        </div>

        {/* AI Weekly Report */}
        <motion.div variants={ANALYTICS_VARIANTS.item} className="p-6 rounded-3xl border border-white/5 bg-black/40 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#c5a059] blur-[100px] opacity-10" />
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 text-[#c5a059]">
              <Zap className="w-5 h-5" />
              <h2 className="font-serif text-xl">Shadow Intelligence — Insights Hebdo</h2>
            </div>
            {aiReportStatus === 'idle' && (
              <button onClick={generateReport} className="text-xs px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors border border-white/10">
                Générer les Insights
              </button>
            )}
          </div>
          
          {aiReportStatus === 'generating' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#c5a059]/20 border-t-[#c5a059] rounded-full animate-spin mb-4" />
              <div className="text-xs text-white/50 uppercase tracking-widest animate-pulse">Calcul de la matrice prédictive en cours...</div>
            </div>
          )}
          
          {aiReportStatus === 'ready' && report && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {JSON.parse(report).insights.map((insight: string, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 leading-relaxed">
                  <span className="text-[#c5a059] font-bold block mb-2 text-xs uppercase tracking-widest">
                    {idx === 0 ? 'Top Niche' : idx === 1 ? 'Worst Niche' : 'Action Recommandée'}
                  </span>
                  {insight}
                </div>
              ))}
            </motion.div>
          )}
          
          {aiReportStatus === 'idle' && (
            <div className="text-sm text-white/40 italic">Aucune extraction de données effectuée cette semaine.</div>
          )}
        </motion.div>

        {/* Stage Distribution */}
        <motion.div variants={ANALYTICS_VARIANTS.item} className="p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
          <h2 className="font-serif text-xl text-white mb-6 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-[#c5a059]" /> Répartition du Pipeline</h2>
          <div className="space-y-4">
            {Object.entries(stats.byStage).map(([stage, count]) => {
              if (count === 0) return null;
              const cfg = STAGE_CONFIG[stage as keyof typeof STAGE_CONFIG];
              const percent = (count / stats.totalProspects) * 100;
              return (
                <div key={stage} className="flex items-center gap-4">
                  <div className="w-32 text-xs text-white/60 truncate">{cfg.label}</div>
                  <div className="flex-1 h-2 bg-black/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: `${percent}%` }}
                      className="h-full rounded-full" style={{ background: cfg.color }}
                    />
                  </div>
                  <div className="w-8 text-right text-xs font-mono text-white/80">{count}</div>
                </div>
              );
            })}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
});

AnalyticsModule.displayName = 'AnalyticsModule';
