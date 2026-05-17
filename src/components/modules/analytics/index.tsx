'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Activity, 
  Zap, 
  BarChart2, 
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { STAGE_CONFIG } from '@/lib/pipelineConfig';
import { ANALYTICS_VARIANTS } from './AnalyticsModule.variants';
import { useAnalytics } from './analytics.hooks';
import { cn } from '@/lib/utils';

const KPICard = memo(({ label, value, icon: Icon, color, trend }: any) => (
  <motion.div 
    variants={ANALYTICS_VARIANTS.item}
    className="p-8 rounded-[2rem] border border-white/5 bg-[#0f0f20]/50 backdrop-blur-xl relative overflow-hidden group"
  >
    <div className={cn(
      "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700",
      color === 'gold' ? "from-[#c5a059]/5 to-transparent" :
      color === 'green' ? "from-[#22c55e]/5 to-transparent" :
      color === 'blue' ? "from-[#3b82f6]/5 to-transparent" :
      "from-white/5 to-transparent"
    )} />
    
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110",
        color === 'gold' ? "bg-[#c5a059]/10 border-[#c5a059]/20 text-[#c5a059]" :
        color === 'green' ? "bg-[#22c55e]/10 border-[#22c55e]/20 text-[#22c55e]" :
        color === 'blue' ? "bg-[#3b82f6]/10 border-[#3b82f6]/20 text-[#3b82f6]" :
        "bg-white/5 border-white/10 text-[#f0ede8]/40"
      )}>
        <Icon size={20} />
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-full">
          <ArrowUpRight size={10} className="text-[#22c55e]" />
          <span className="text-[9px] font-black text-[#22c55e] uppercase tracking-widest">{trend}</span>
        </div>
      )}
    </div>
    
    <div className="relative z-10">
      <span className="text-[10px] font-bold text-[#f0ede8]/20 uppercase tracking-[0.3em] font-['Outfit'] block mb-2">{label}</span>
      <div className="text-4xl font-['Cormorant_Garamond'] text-[#f0ede8] italic tracking-tight group-hover:text-white transition-colors">{value}</div>
    </div>
  </motion.div>
));

KPICard.displayName = 'KPICard';

export const AnalyticsModule = memo(() => {
  const { stats, winRate, aiReportStatus, report, generateReport } = useAnalytics();

  return (
    <motion.div 
      variants={ANALYTICS_VARIANTS.container} 
      initial="initial" 
      animate="animate"
      className="max-w-7xl mx-auto py-12 px-6 md:px-12 space-y-12"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative">
        <div className="absolute -left-20 top-0 w-40 h-40 bg-[#c5a059]/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-['Cormorant_Garamond'] text-[#f0ede8] italic tracking-wide">Business Analytics</h2>
          <p className="text-[#f0ede8]/40 font-['Outfit'] font-light text-lg mt-1">Matrice de performance & Intelligence prédictive.</p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="px-6 py-3 bg-[#0f0f20] border border-white/5 rounded-2xl flex items-center gap-6 backdrop-blur-xl">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-[#f0ede8]/20 uppercase tracking-[0.3em]">Last Update</span>
              <span className="text-[10px] font-mono text-[#c5a059] font-bold">Just Now</span>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-[#f0ede8]/20 uppercase tracking-[0.3em]">Precision</span>
              <span className="text-[10px] font-mono text-[#22c55e] font-bold">99.9%</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <KPICard label="Leads Total" value={stats.totalProspects} icon={Users} color="white" />
        <KPICard label="Win Rate" value={`${winRate}%`} icon={CheckCircle2} color="green" trend="+4.2%" />
        <KPICard label="CA Pondéré" value={`${stats.weightedPipelineValue.toLocaleString('fr-FR')} €`} icon={TrendingUp} color="gold" />
        <KPICard label="Open Rate" value={`${stats.emailOpenRate.toFixed(1)}%`} icon={Activity} color="blue" />
        <KPICard label="Mirror CTR" value={`${stats.mirrorClickRate.toFixed(1)}%`} icon={Target} color="gold" trend="New" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Weekly Insights */}
        <motion.div variants={ANALYTICS_VARIANTS.item} className="p-10 rounded-[3rem] bg-[#0a0a14] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#c5a059]/5 to-transparent pointer-events-none" />
          
          <div className="flex items-start justify-between mb-12 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#c5a059]/10 rounded-2xl flex items-center justify-center border border-[#c5a059]/20">
                <Zap size={24} className="text-[#c5a059]" />
              </div>
              <h3 className="text-2xl font-['Cormorant_Garamond'] text-[#f0ede8] italic">Shadow Intelligence</h3>
            </div>
            
            {aiReportStatus === 'idle' && (
              <button 
                onClick={generateReport}
                className="px-6 py-2.5 bg-white/5 hover:bg-[#c5a059] text-[#f0ede8]/40 hover:text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all border border-white/10 hover:border-[#c5a059] active:scale-95"
              >
                Générer Insights
              </button>
            )}
          </div>

          <div className="relative z-10 min-h-[160px] flex items-center">
            {aiReportStatus === 'generating' ? (
              <div className="w-full flex flex-col items-center justify-center py-8 space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-2 border-[#c5a059]/10 border-t-[#c5a059] rounded-full animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto text-[#c5a059] animate-pulse" size={24} />
                </div>
                <div className="text-[10px] text-[#c5a059] font-black uppercase tracking-[0.4em] animate-pulse">Neural Matrix Convergence...</div>
              </div>
            ) : aiReportStatus === 'ready' && report ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {report.map((insight, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-[#c5a059]/30 transition-all duration-500 group/insight"
                  >
                    <span className="text-[9px] font-black text-[#c5a059]/40 uppercase tracking-[0.3em] block mb-3 group-hover/insight:text-[#c5a059] transition-colors">
                      {idx === 0 ? 'Top Niche' : idx === 1 ? 'Alert' : 'Action'}
                    </span>
                    <p className="text-sm font-['Outfit'] font-light text-[#f0ede8]/70 leading-relaxed group-hover/insight:text-white transition-colors">
                      {insight}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center opacity-10 space-y-4">
                 <Activity size={48} />
                 <p className="text-[10px] font-bold uppercase tracking-[0.5em]">No recent extraction</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pipeline Distribution */}
        <motion.div variants={ANALYTICS_VARIANTS.item} className="p-10 rounded-[3rem] bg-[#0a0a14] border border-white/5 group">
           <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <BarChart2 size={24} className="text-[#f0ede8]/40" />
            </div>
            <h3 className="text-2xl font-['Cormorant_Garamond'] text-[#f0ede8] italic">Pipeline Distribution</h3>
          </div>

          <div className="space-y-8">
            {Object.entries(stats.byStage).map(([stage, count], idx) => {
              if (count === 0 && stats.totalProspects > 0) return null;
              const cfg = STAGE_CONFIG[stage as keyof typeof STAGE_CONFIG];
              const percent = stats.totalProspects > 0 ? (count / stats.totalProspects) * 100 : 0;
              
              return (
                <div key={stage} className="space-y-3 group/row">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg?.color || '#fff' }} />
                      <span className="text-[10px] font-bold text-[#f0ede8]/30 uppercase tracking-[0.2em]">{cfg?.label || stage}</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-xl font-['Cormorant_Garamond'] italic text-[#f0ede8]">{count}</span>
                      <span className="text-[10px] font-mono text-[#f0ede8]/20 mb-1">{Math.round(percent)}%</span>
                    </div>
                  </div>
                  <div className="h-1 bg-white/[0.02] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full relative" 
                      style={{ background: cfg?.color || '#fff' }}
                    >
                      <div className="absolute inset-0 bg-white/20 blur-sm" />
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Global Performance Matrix */}
      <motion.div variants={ANALYTICS_VARIANTS.item} className="p-12 rounded-[3.5rem] bg-[#0f0f20]/30 border border-white/5 backdrop-blur-3xl relative overflow-hidden text-center group">
         <div className="absolute inset-0 bg-gradient-to-b from-[#c5a059]/5 to-transparent pointer-events-none" />
         <div className="relative z-10 space-y-8">
            <h3 className="text-4xl font-['Cormorant_Garamond'] text-[#f0ede8] italic tracking-tight">StoneLink Performance Matrix</h3>
            <div className="flex flex-wrap justify-center gap-12">
               {[
                 { label: 'Conversion Velocity', value: '4.2 Days' },
                 { label: 'Agency Growth', value: '+340%' },
                 { label: 'Data Sovereignty', value: 'Absolute' }
               ].map((item, i) => (
                 <div key={i} className="flex flex-col items-center">
                    <span className="text-3xl font-['Cormorant_Garamond'] text-[#c5a059] italic mb-2">{item.value}</span>
                    <span className="text-[10px] font-bold text-[#f0ede8]/20 uppercase tracking-[0.4em]">{item.label}</span>
                 </div>
               ))}
            </div>
            <div className="pt-8 flex justify-center">
               <button className="flex items-center gap-4 px-10 py-4 bg-[#c5a059] text-black font-bold text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(197,160,89,0.3)]">
                  Export Executive Report <ChevronRight size={14} />
               </button>
            </div>
         </div>
      </motion.div>
    </motion.div>
  );
});

AnalyticsModule.displayName = 'AnalyticsModule';

export * from './analytics.service';
export * from './analytics.hooks';
export * from './AnalyticsModule.types';
export * from './AnalyticsModule.variants';

export default AnalyticsModule;
