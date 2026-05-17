// ─────────────────────────────────────────────────────────────────
// STONELINK PIPELINE — ObjectionPanel.tsx
// Gestion des objections en direct pendant l'appel
// ─────────────────────────────────────────────────────────────────

import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, CornerDownRight, X } from 'lucide-react'
import type { ObjectionHandler } from '@/types/pipeline'

// ─── Item Variants ────────────────────────────────────────────────

const ITEM_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit:    { opacity: 0, scale: 0.97, transition: { duration: 0.2 } },
}

// ─── Props ────────────────────────────────────────────────────────

interface ObjectionPanelProps {
  objections: ObjectionHandler[]
}

// ─── Main Component ───────────────────────────────────────────────

export const ObjectionPanel = memo(({ objections }: ObjectionPanelProps) => {
  const [activeObjId, setActiveObjId] = useState<string | null>(null)

  const activeObj = objections.find((o) => o.trigger === activeObjId)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <ShieldAlert className="w-3.5 h-3.5 text-[#ef4444]" />
        <span className="text-[10px] font-bold text-[#ef4444] uppercase tracking-widest">
          Gestion des Objections
        </span>
      </div>

      {/* Objection Triggers */}
      <div className="flex flex-wrap gap-2">
        {objections.map((obj) => (
          <button
            key={obj.trigger}
            onClick={() =>
              setActiveObjId((prev) => (prev === obj.trigger ? null : obj.trigger))
            }
            className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
            style={{
              background:
                activeObjId === obj.trigger
                  ? 'rgba(239,68,68,0.18)'
                  : 'rgba(255,255,255,0.05)',
              border:
                activeObjId === obj.trigger
                  ? '1px solid rgba(239,68,68,0.4)'
                  : '1px solid rgba(255,255,255,0.07)',
              color:
                activeObjId === obj.trigger
                  ? '#ef4444'
                  : 'rgba(240,237,232,0.45)',
            }}
          >
            {obj.label}
          </button>
        ))}
      </div>

      {/* Active Objection Response */}
      <AnimatePresence>
        {activeObj && (
          <motion.div
            key={activeObj.trigger}
            variants={ITEM_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(239,68,68,0.12)]">
              <span className="text-[11px] font-bold text-[#ef4444] uppercase tracking-wider">
                Réponse — {activeObj.label}
              </span>
              <button
                onClick={() => setActiveObjId(null)}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-[rgba(240,237,232,0.4)] transition-colors"
                aria-label="Fermer l'objection"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Response Script */}
            <div className="px-4 py-3">
              <p className="text-[13px] leading-relaxed text-[#f0ede8] font-light">
                {activeObj.response}
              </p>

              {/* Pivot */}
              <div
                className="flex items-start gap-2 mt-3 px-3 py-2.5 rounded-xl"
                style={{
                  background: 'rgba(197,160,89,0.08)',
                  border: '1px solid rgba(197,160,89,0.2)',
                }}
              >
                <CornerDownRight className="w-3.5 h-3.5 text-[#c5a059] shrink-0 mt-0.5" />
                <p className="text-[12px] italic text-[rgba(240,237,232,0.65)] leading-relaxed">
                  {activeObj.pivot}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
ObjectionPanel.displayName = 'ObjectionPanel'
