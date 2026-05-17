'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Phone, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react'
import type { Prospect, DealStage } from '@/types/pipeline'
import {
  PRIORITY_CONFIG,
  NICHE_CONFIG,
  COUNTRY_CONFIG,
  KANBAN_STAGES,
  formatTimeAgo,
  formatCurrency,
  lighthouseColor,
} from '@/lib/pipelineConfig'
import { VARIANTS } from '@/lib/variants'

interface ProspectCardProps {
  prospect: Prospect
  onClick: () => void
  onQuickCall: () => void
  onStageChange: (id: string, stage: DealStage) => void
}

export const ProspectCard = memo(({
  prospect,
  onClick,
  onQuickCall,
  onStageChange,
}: ProspectCardProps) => {
  const priority = PRIORITY_CONFIG[prospect.priority]
  const niche    = NICHE_CONFIG[prospect.niche]
  const country  = COUNTRY_CONFIG[prospect.country]
  const lastLabel = prospect.lastContactedAt
    ? formatTimeAgo(prospect.lastContactedAt)
    : formatTimeAgo(prospect.createdAt)

  const stageIdx  = KANBAN_STAGES.indexOf(prospect.stage)
  const prevStage = stageIdx > 0 ? KANBAN_STAGES[stageIdx - 1] : null
  const nextStage = stageIdx < KANBAN_STAGES.length - 1 ? KANBAN_STAGES[stageIdx + 1] : null

  return (
    <motion.div
      variants={VARIANTS.listItem}
      layout
      layoutId={`card-${prospect.id}`}
      onClick={onClick}
      className="relative rounded-xl border cursor-pointer group bg-white/[0.035] border-white/[0.07] p-[12px_14px] hover:border-[#c5a059]/35 transition-all duration-300"
      whileHover={{
        boxShadow: '0 0 20px rgba(197,160,89,0.07)',
        scale: 1.012,
      }}
    >
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity duration-300 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-[inherit]" />
      
      {/* Row 1 — Priority + Score */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1"
          style={{ color: priority.color, background: priority.bg }}
        >
          {priority.label}
          {priority.pulse && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          )}
        </span>
        {prospect.lighthouseScore !== undefined && (
          <span
            className="text-[10px] font-mono font-bold"
            style={{ color: lighthouseColor(prospect.lighthouseScore) }}
          >
            {prospect.lighthouseScore}/100
          </span>
        )}
      </div>

      {/* Row 2 — Company name */}
      <div className="font-bold text-[13px] text-[#f0ede8] uppercase tracking-wide leading-tight mb-1 truncate">
        {prospect.companyName}
      </div>

      {/* Row 3 — Contact + Niche */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[11px] text-white/45 truncate max-w-[100px]">
          {prospect.contactName}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/35 shrink-0">
          {niche.icon} {niche.label}
        </span>
      </div>

      {/* Row 4 — Location */}
      <div className="text-[11px] text-white/30 mb-2">
        {country?.flag} {prospect.city}, {prospect.country}
      </div>

      {/* Lighthouse bar */}
      {prospect.lighthouseScore !== undefined && (
        <div className="mb-2 h-1 rounded-full overflow-hidden bg-white/5">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${prospect.lighthouseScore}%`,
              background: lighthouseColor(prospect.lighthouseScore),
            }}
          />
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-white/5 mb-2" />

      {/* Row 5 — Value + Last contact */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-[#c5a059]">
          {prospect.estimatedDealValue
            ? `~${formatCurrency(prospect.estimatedDealValue)}`
            : '—'}
        </span>
        <span className="text-[10px] text-white/25">⏱ {lastLabel}</span>
      </div>

      {/* CTAs */}
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => { e.stopPropagation(); onQuickCall() }}
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors shrink-0 bg-[#7c3aed]/15 text-[#a78bfa] border border-[#7c3aed]/30 hover:bg-[#7c3aed]/25"
          aria-label={`Appeler ${prospect.companyName}`}
        >
          <Phone className="w-3 h-3" />
          Appeler
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onClick() }}
          className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-lg transition-colors bg-white/[0.04] text-white/45 border border-white/[0.07] hover:bg-white/[0.08]"
          aria-label={`Voir la fiche de ${prospect.companyName}`}
        >
          Voir fiche <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Stage navigation */}
      <div
        className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {prevStage && (
          <button
            onClick={() => onStageChange(prospect.id, prevStage)}
            className="flex items-center gap-1 text-[9px] uppercase tracking-wider px-2 py-1 rounded bg-white/5 text-white/30 hover:text-white/60 transition-colors"
            aria-label="Reculer d'un stage"
          >
            <ArrowLeft className="w-2.5 h-2.5" /> Reculer
          </button>
        )}
        {nextStage && (
          <button
            onClick={() => onStageChange(prospect.id, nextStage)}
            className="flex items-center gap-1 text-[9px] uppercase tracking-wider px-2 py-1 rounded bg-white/5 text-white/30 hover:text-white/60 transition-colors ml-auto"
            aria-label="Avancer d'un stage"
          >
            Avancer <ArrowRight className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    </motion.div>
  )
}, (prev, next) => (
  prev.prospect.id === next.prospect.id &&
  prev.prospect.stage === next.prospect.stage &&
  prev.prospect.priority === next.prospect.priority &&
  prev.prospect.lighthouseScore === next.prospect.lighthouseScore &&
  prev.prospect.lastContactedAt === next.prospect.lastContactedAt
))

ProspectCard.displayName = 'ProspectCard'
