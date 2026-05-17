// ─────────────────────────────────────────────────────────────────
// STONELINK PIPELINE — PrototypeCard.tsx
// Carte de sélection dans le wizard étape 1
// ─────────────────────────────────────────────────────────────────
'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Check, Star, ExternalLink } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────

export interface PrototypeCatalogItem {
  id: string
  niche: string
  name: string
  description: string
  thumbnailUrl: string
  recommendedFor: string[]
  tags: string[]
  defaultValues: Record<string, string>
  customizableFields: string[]
}

interface PrototypeCardProps {
  prototype:   PrototypeCatalogItem
  selected:    boolean
  onSelect:    () => void
  onPreview:   () => void
}

// ─── Component ────────────────────────────────────────────────────

export const PrototypeCard = memo(({
  prototype,
  selected,
  onSelect,
  onPreview,
}: PrototypeCardProps) => {
  const isRecommended = prototype.recommendedFor.length > 0

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="relative cursor-pointer rounded-xl overflow-hidden transition-shadow"
      style={{
        background:  selected ? 'rgba(197,160,89,0.06)' : 'rgba(255,255,255,0.025)',
        border:      selected ? '1.5px solid rgba(197,160,89,0.5)' : '1px solid rgba(255,255,255,0.07)',
        boxShadow:   selected ? '0 0 20px rgba(197,160,89,0.12)' : 'none',
      }}
    >
      {/* Selection check */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #B8924A, #c5a059)' }}
        >
          <Check className="w-3.5 h-3.5 text-[#1A1200]" />
        </motion.div>
      )}

      {/* Recommended badge */}
      {isRecommended && !selected && (
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(197,160,89,0.15)', border: '1px solid rgba(197,160,89,0.3)' }}>
          <Star className="w-2.5 h-2.5 text-[#c5a059]" />
          <span className="text-[9px] font-bold text-[#c5a059] uppercase tracking-wider">Recommandé</span>
        </div>
      )}

      {/* Thumbnail */}
      <div className="h-36 flex items-center justify-center overflow-hidden relative"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        
        {prototype.thumbnailUrl ? (
          <img 
            src={prototype.thumbnailUrl} 
            alt={prototype.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : null}

        {/* Placeholder visuel basé sur la couleur primaire (affiché si pas d'image ou erreur) */}
        <div className="absolute inset-0 flex flex-col pointer-events-none z-0">
          {/* Simule une navbar */}
          <div className="h-6 flex items-center px-3 gap-1.5"
            style={{ background: prototype.defaultValues.PRIMARY_COLOR ?? '#1B3A5C' }}>
            <div className="w-10 h-2 rounded-sm bg-white/30" />
            <div className="flex-1" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-1.5 rounded-sm bg-white/20" />
            ))}
          </div>
          {/* Hero zone */}
          <div className="flex-1 flex flex-col items-center justify-center gap-1.5 px-4"
            style={{ background: `linear-gradient(160deg, ${prototype.defaultValues.PRIMARY_COLOR ?? '#1B3A5C'}22 0%, transparent 100%)` }}>
            <div className="w-24 h-2.5 rounded-sm"
              style={{ background: `${prototype.defaultValues.PRIMARY_COLOR ?? '#1B3A5C'}99` }} />
            <div className="w-16 h-1.5 rounded-sm bg-white/15" />
            <div className="w-14 h-5 rounded-md mt-1"
              style={{ background: prototype.defaultValues.PRIMARY_COLOR ?? '#1B3A5C' }} />
          </div>
          {/* Blocs de contenu */}
          <div className="h-10 flex gap-2 px-3 py-1.5 border-t border-white/5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 rounded bg-white/5" />
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div>
            <div className="text-[13px] font-semibold text-[#f0ede8] leading-tight">{prototype.name}</div>
            <div className="text-[11px] text-[rgba(240,237,232,0.4)] mt-0.5 leading-tight">{prototype.description}</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {prototype.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(240,237,232,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Preview button */}
        <button
          onClick={(e) => { e.stopPropagation(); onPreview() }}
          className="flex items-center gap-1.5 text-[10px] font-bold text-[rgba(197,160,89,0.7)] hover:text-[#c5a059] transition-colors uppercase tracking-wider"
        >
          <ExternalLink className="w-3 h-3" />
          Aperçu rapide
        </button>
      </div>
    </motion.div>
  )
})

PrototypeCard.displayName = 'PrototypeCard'
