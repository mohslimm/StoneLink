'use client'

import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import type { DealStage, Prospect } from '@/types/pipeline'
import { ProspectCard } from './ProspectCard'
import { STAGE_CONFIG } from '@/lib/pipelineConfig'
import { VARIANTS } from '@/lib/variants'

interface StageColumnProps {
  stage: DealStage
  prospects: Prospect[]
  onProspectClick: (prospect: Prospect) => void
  onQuickCall: (prospect: Prospect) => void
  onStageChange: (id: string, stage: DealStage) => void
}

export const StageColumn = memo(({
  stage,
  prospects,
  onProspectClick,
  onQuickCall,
  onStageChange,
}: StageColumnProps) => {
  const config = STAGE_CONFIG[stage]
  const count = prospects.length
  const isOverLimit = config.limit !== undefined && count >= config.limit

  return (
    <div
      className="flex flex-col shrink-0 rounded-xl overflow-hidden w-[280px] min-h-[200px] bg-white/[0.02] border border-white/[0.06]"
    >
      {/* Column Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 shrink-0 border-b border-white/[0.05]"
        style={{ background: config.bgColor }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{config.icon}</span>
          <span
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: config.color }}
          >
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isOverLimit && (
            <AlertTriangle
              className="w-3 h-3 text-[#f59e0b]"
              aria-label="Limite de colonne atteinte"
            />
          )}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isOverLimit ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-white/[0.08] text-white/50'
            }`}
          >
            {count}
            {config.limit && `/${config.limit}`}
          </span>
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[calc(100vh-260px)] no-scrollbar">
        <AnimatePresence initial={false}>
          {count === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 text-center px-4"
            >
              <div className="text-3xl mb-2 opacity-30">{config.icon}</div>
              <p className="text-[11px] text-white/25 uppercase tracking-widest">Aucun prospect</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={VARIANTS.listContainer}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              {prospects.map((prospect) => (
                <ProspectCard
                  key={prospect.id}
                  prospect={prospect}
                  onClick={() => onProspectClick(prospect)}
                  onQuickCall={() => onQuickCall(prospect)}
                  onStageChange={onStageChange}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
})

StageColumn.displayName = 'StageColumn'
