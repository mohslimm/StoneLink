"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, TrendingDown, Target, Sparkles, 
  Lightbulb, CheckCircle2, ArrowRight, ShieldAlert,
  BarChart3, PieChart
} from 'lucide-react';
import type { Prospect } from '@/types';
import { 
  calculateStrategyMetrics, 
  STEP_NAMES, 
  FollowUpStep,
  REACTION_CONFIG
} from '@/lib/followup';
import { cn } from '@/lib/utils';

interface StrategyDiagnosticPanelProps {
  prospects: Prospect[];
}

export function StrategyDiagnosticPanel({ prospects }: StrategyDiagnosticPanelProps) {
  const diagnosis = calculateStrategyMetrics(prospects);

  return (
    <div className="space-y-6">
      {/* ─── Top Key Weakness Alert ─── */}
      <div className="p-6 rounded-[16px] bg-gradient-to-r from-[#181120] via-[#1a1428] to-[#121220] border border-[rgba(168,85,247,0.35)] shadow-[0_4px_30px_rgba(168,85,247,0.12)]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-[12px] bg-[rgba(168,85,247,0.18)] border border-[rgba(168,85,247,0.4)] flex items-center justify-center text-[#c084fc] shrink-0">
            <ShieldAlert size={24} />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10.5px] font-mono uppercase px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.18)] text-[#fbbf24] border border-[rgba(245,158,11,0.35)] font-bold">
                ⚠️ Point Faible Stratégique Identifié
              </span>
              <span className="text-[11px] font-mono text-[rgba(232,228,220,0.5)]">
                Basé sur {diagnosis.totalPrototypes} agences en cycle actif
              </span>
            </div>

            <h3 className="font-display font-semibold text-[20px] text-[#e8e4dc]">
              {diagnosis.keyWeakness.title}
            </h3>

            <p className="text-[13px] font-body text-[rgba(232,228,220,0.7)]">
              {diagnosis.keyWeakness.description}
            </p>

            <div className="pt-2">
              <div className="p-3.5 rounded-[10px] bg-[#0c0c16]/80 border border-[rgba(197,160,89,0.3)] flex items-start gap-2.5">
                <Lightbulb size={16} className="text-[#c5a059] shrink-0 mt-0.5" />
                <div className="text-[12.5px] font-body text-[#e8e4dc] leading-relaxed">
                  <span className="font-semibold text-[#c5a059]">Action Corrective Immédiate : </span>
                  {diagnosis.keyWeakness.actionableAdvice}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Funnel d'Attrition & Répartition des Équilibres ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel d'Attrition */}
        <div className="p-5 rounded-[14px] bg-[#0c0c16]/80 border border-[rgba(255,255,255,0.06)] shadow-glass space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-display font-semibold text-[16px] text-[#e8e4dc] flex items-center gap-2">
                <BarChart3 size={16} className="text-[#c5a059]" />
                <span>Entonnoir d&apos;Attrition (Funnel)</span>
              </h4>
              <p className="text-[11.5px] font-body text-[rgba(232,228,220,0.5)]">
                Progression des {diagnosis.totalPrototypes} agences à travers les 4 couches
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {([0, 1, 2, 3] as FollowUpStep[]).map((step) => {
              const meta = STEP_NAMES[step];
              const count = diagnosis.stepDistribution[step];
              const pct = diagnosis.stepPercentages[step];

              return (
                <div key={step} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12px] font-body">
                    <span className="text-[#e8e4dc] font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                      <span>{meta.title}</span>
                    </span>
                    <span className="font-mono text-[11px] text-[rgba(232,228,220,0.6)]">
                      <span className="font-bold text-[#e8e4dc]">{count}</span> agences ({pct}%)
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-[#181826] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[rgba(255,255,255,0.05)] grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 rounded-[8px] bg-[#121220] border border-[rgba(255,255,255,0.04)]">
              <span className="text-[10.5px] font-body text-[rgba(232,228,220,0.45)]">
                Déperdition Étape 0 ➔ 1
              </span>
              <p className="font-mono text-[18px] font-bold text-[#f59e0b] mt-0.5">
                {diagnosis.dropOffRateStep1}%
              </p>
            </div>

            <div className="p-2.5 rounded-[8px] bg-[#121220] border border-[rgba(255,255,255,0.04)]">
              <span className="text-[10.5px] font-body text-[rgba(232,228,220,0.45)]">
                Prêts pour Closing
              </span>
              <p className="font-mono text-[18px] font-bold text-[#4ade80] mt-0.5">
                {diagnosis.stepDistribution[3]}
              </p>
            </div>
          </div>
        </div>

        {/* Matrice des Objections */}
        <div className="p-5 rounded-[14px] bg-[#0c0c16]/80 border border-[rgba(255,255,255,0.06)] shadow-glass space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-display font-semibold text-[16px] text-[#e8e4dc] flex items-center gap-2">
                <PieChart size={16} className="text-[#c5a059]" />
                <span>Matrice des Objections & Réponses Clients</span>
              </h4>
              <p className="text-[11.5px] font-body text-[rgba(232,228,220,0.5)]">
                Pourquoi vos agences hésitent ou ne signent pas encore
              </p>
            </div>
          </div>

          {diagnosis.objectionsBreakdown.length === 0 ? (
            <div className="py-12 text-center text-[rgba(232,228,220,0.4)] text-[12px] font-body italic space-y-1">
              <p>Aucune objection enregistrée pour le moment.</p>
              <p className="text-[11px] text-[rgba(232,228,220,0.3)]">
                Utilisez le tiroir de saisie sur chaque prospect pour consigner leurs réponses.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {diagnosis.objectionsBreakdown.map((item) => (
                <div
                  key={item.type}
                  className="p-3 rounded-[10px] bg-[#10101b] border border-[rgba(255,255,255,0.05)] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-body font-medium flex items-center gap-2" style={{ color: item.meta.color }}>
                      <span>{item.meta.emoji}</span>
                      <span>{item.meta.label}</span>
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#e8e4dc]">
                      {item.count} agences ({item.percentage}%)
                    </span>
                  </div>

                  <div className="h-1.5 rounded-full bg-[#181826] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.meta.color,
                      }}
                    />
                  </div>

                  <p className="text-[11px] font-body text-[rgba(232,228,220,0.55)] italic line-clamp-1">
                    Conseil : {item.meta.recommendedCounterTip}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Top 3 Recommandations IA ─── */}
      <div className="p-5 rounded-[14px] bg-[#0c0c16]/80 border border-[rgba(197,160,89,0.22)] shadow-glass space-y-3">
        <h4 className="font-display font-semibold text-[15px] text-[#c5a059] flex items-center gap-2">
          <Sparkles size={16} />
          <span>Plan d&apos;Action & Recommandations Tactiques StoneLink</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {diagnosis.topRecommendations.map((rec, i) => (
            <div
              key={i}
              className="p-3.5 rounded-[10px] bg-[#121220] border border-[rgba(255,255,255,0.05)] text-[12px] font-body text-[rgba(232,228,220,0.85)] leading-relaxed flex items-start gap-2.5"
            >
              <span className="w-5 h-5 rounded-full bg-[rgba(197,160,89,0.15)] text-[#c5a059] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
