import { memo, useMemo, useState, useEffect } from 'react';
import { useStoneStore } from '@/stores/useStoneStore';
import type { Prospect, DealStage } from '@/types/pipeline';
import { Target, Flame, Phone, Mail, DollarSign, Calendar, Clock, AlertTriangle, ArrowRight, CheckCircle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STAGE_CONFIG } from '@/lib/pipelineConfig';

const FUNNEL_STAGES: DealStage[] = [
  'new', 'to_call', 'called', 'interested',
  'prototype_sent', 'meeting', 'proposal', 'closed_won'
];

export const PipelineDashboard = memo(({ onAction }: { onAction: (id: string, tab?: any) => void }) => {
  const { prospects } = useStoneStore();

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      total: prospects.length,
      hotLeads: prospects.filter(p => p.priority === 'hot').length,
      callsToday: prospects.filter(p =>
        p.activities?.some(a =>
          a.type === 'call_made' &&
          new Date(a.timestamp) >= today
        )).length,
      protosSent: prospects.filter(p => p.stage === 'prototype_sent').length,
      pipelineValue: prospects
        .filter(p => !['closed_lost'].includes(p.stage))
        .reduce((sum, p) => sum + (p.estimatedDealValue ?? 0), 0),
      closedThisMonth: prospects.filter(p => {
        if (p.stage !== 'closed_won' || !p.closedAt) return false;
        const d = new Date(p.closedAt);
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      }).length,
    };
  }, [prospects]);

  const priorityActions = useMemo(() => {
    const actions: any[] = [];
    const now = new Date();

    prospects.forEach(p => {
      if (['closed_won', 'closed_lost', 'unqualified'].includes(p.stage)) return;

      const lastContact = p.lastContactedAt ? new Date(p.lastContactedAt) : new Date(p.createdAt);
      const daysSince = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 3600 * 24));

      if (p.priority === 'hot' && daysSince >= 2) {
        actions.push({
          score: 100, prospect: p, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30',
          label: '🔥 Appel urgent', description: `Non contacté depuis ${daysSince}j`,
          cta: 'Appeler', action: () => onAction(p.id, 'call')
        });
      }
      const lastEmail = p.emails?.at(-1);
      if (lastEmail?.opened && p.stage === 'prototype_sent') {
        actions.push({
          score: 95, prospect: p, icon: Mail, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30',
          label: '👀 A ouvert l\'email', description: `Prototype consulté — moment idéal pour appeler`,
          cta: 'Appeler', action: () => onAction(p.id, 'call')
        });
      }
      if (p.stage === 'meeting' && p.nextFollowUpAt) {
        const nextFollowUp = new Date(p.nextFollowUpAt);
        if (nextFollowUp.toDateString() === now.toDateString()) {
          actions.push({
            score: 90, prospect: p, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30',
            label: '📅 RDV aujourd\'hui', description: nextFollowUp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            cta: 'Préparer', action: () => onAction(p.id, 'profile')
          });
        }
      }
      if (p.stage === 'interested' && !p.customizedPrototypeUrl) {
        actions.push({
          score: 80, prospect: p, icon: Target, color: 'text-[#c5a059]', bg: 'bg-[#c5a059]/10', border: 'border-[#c5a059]/30',
          label: '⚡ Envoyer le prototype', description: `Intéressé — ne pas laisser refroidir`,
          cta: 'Envoyer', action: () => onAction(p.id, 'prototype')
        });
      }
    });

    return actions.sort((a, b) => b.score - a.score).slice(0, 5);
  }, [prospects, onAction]);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 pb-32">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Prospects" value={stats.total} icon={<Target className="w-5 h-5 text-blue-400" />} />
        <StatCard title="Hot Leads" value={stats.hotLeads} icon={<Flame className="w-5 h-5 text-orange-400" />} />
        <StatCard title="Appels Today" value={stats.callsToday} icon={<Phone className="w-5 h-5 text-emerald-400" />} />
        <StatCard title="Protos Envoyés" value={stats.protosSent} icon={<Mail className="w-5 h-5 text-purple-400" />} />
        <StatCard title="Valeur Pipeline" value={stats.pipelineValue} prefix="€" icon={<DollarSign className="w-5 h-5 text-[#c5a059]" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Priorités du jour */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
               <AlertTriangle className="w-5 h-5 text-[#c5a059]" /> Priorités du jour
             </h3>
             <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{priorityActions.length} Actions</span>
          </div>
          <div className="space-y-4">
            {priorityActions.length === 0 ? (
              <div className="p-8 text-center border border-white/5 rounded-2xl bg-white/[0.02]">
                <CheckCircle className="w-8 h-8 text-emerald-500/50 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Aucune action urgente en attente.</p>
              </div>
            ) : (
              priorityActions.map((action, i) => (
                <div key={i} className={cn("p-4 rounded-2xl border bg-white/[0.02] flex items-start gap-4 transition-colors hover:bg-white/[0.04]", action.border)}>
                  <div className={cn("p-2 rounded-xl shrink-0 mt-1", action.bg, action.color)}>
                     <action.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-white">{action.prospect.companyName}</h4>
                      <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-slate-300 font-bold">Score {action.score}</span>
                    </div>
                    <div className="text-xs font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{action.label}</div>
                    <p className="text-xs text-slate-400 mb-3">{action.description}</p>
                    <button 
                      onClick={action.action}
                      className={cn("px-4 py-2 w-full text-[10px] uppercase tracking-widest font-bold rounded-xl transition-colors", action.bg, action.color, "hover:opacity-80")}
                    >
                      {action.cta} <ArrowRight className="inline-block w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Funnel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
               <TrendingDown className="w-5 h-5 text-indigo-400" /> Funnel de Conversion
             </h3>
          </div>
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
             {FUNNEL_STAGES.map((stageId, i) => {
               const count = prospects.filter(p => p.stage === stageId).length;
               const maxCount = Math.max(...FUNNEL_STAGES.map(s => prospects.filter(p => p.stage === s).length), 1);
               const width = Math.max((count / maxCount) * 100, 5); // min 5%
               const stageConfig = STAGE_CONFIG[stageId];
               
               return (
                 <div key={stageId} className="flex items-center gap-4">
                    <div className="w-32 text-right shrink-0">
                      <div className="text-xs font-bold text-white">{stageConfig?.label}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">{count} Prospects</div>
                    </div>
                    <div className="flex-1 h-8 bg-white/5 rounded-full overflow-hidden flex items-center">
                       <div 
                         className="h-full bg-gradient-to-r from-[#B8924A] to-[#c5a059] rounded-full transition-all duration-1000 ease-out"
                         style={{ width: `${width}%` }}
                       />
                    </div>
                 </div>
               );
             })}
          </div>
        </div>
      </div>
    </div>
  );
});

PipelineDashboard.displayName = 'PipelineDashboard';

const StatCard = ({ title, value, icon, prefix = '' }: any) => (
  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 hover:border-[#c5a059]/30 transition-colors">
    <div className="flex justify-between items-start mb-4">
       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</span>
       <div className="p-2 bg-white/5 rounded-xl">{icon}</div>
    </div>
    <div className="text-3xl font-serif text-white">
      {prefix}<AnimatedCounter value={value} />
    </div>
  </div>
);

const AnimatedCounter = ({ value, duration = 1000 }: { value: number; duration?: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let animationFrameId: number;

    const step = (now: number) => {
      if (!start) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };
    
    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return <span>{display.toLocaleString('fr-FR')}</span>;
};
