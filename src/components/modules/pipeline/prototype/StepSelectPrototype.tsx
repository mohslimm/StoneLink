// ─────────────────────────────────────────────────────────────────
// STONELINK PIPELINE — StepSelectPrototype.tsx
// Wizard Étape 1 : Sélection du modèle prototype
// ─────────────────────────────────────────────────────────────────
'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle, ChevronRight, X } from 'lucide-react'
import type { Prospect } from '@/types/pipeline'
import type { PrototypeCatalogItem } from './PrototypeCard'
import { PrototypeCard } from './PrototypeCard'
import type { AsyncState } from '@/types/pipeline'

// ─── Types ────────────────────────────────────────────────────────

interface StepSelectPrototypeProps {
  prospect:         Prospect
  selected:         PrototypeCatalogItem | null
  onSelect:         (proto: PrototypeCatalogItem) => void
  onNext:           () => void
}

// ─── Skeleton ─────────────────────────────────────────────────────

const PrototypeSkeleton = () => (
  <div className="grid grid-cols-3 gap-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="rounded-xl overflow-hidden animate-pulse"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="h-36" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="p-3 space-y-2">
          <div className="h-3 rounded bg-white/8 w-3/4" />
          <div className="h-2.5 rounded bg-white/5 w-full" />
          <div className="flex gap-1">
            {[1, 2].map((j) => (
              <div key={j} className="h-3 rounded-full bg-white/5 w-10" />
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
)

// ─── Preview Iframe ───────────────────────────────────────────────

const PrototypePreviewModal = memo(({
  prototypeId,
  onClose,
}: {
  prototypeId: string
  onClose: () => void
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a14' }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <span className="text-[12px] font-bold text-[rgba(240,237,232,0.5)] uppercase tracking-wider">
          Aperçu — {prototypeId}
        </span>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-[rgba(240,237,232,0.4)] transition-colors" aria-label="Fermer l'aperçu">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="relative" style={{ paddingBottom: '56.25%' }}>
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-center space-y-3">
            <div className="text-5xl">🎨</div>
            <div className="text-[14px] font-semibold text-[#f0ede8]">Aperçu {prototypeId}</div>
            <div className="text-[11px] text-[rgba(240,237,232,0.35)]">
              En production : iframe du prototype réel depuis /prototypes/
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
))
PrototypePreviewModal.displayName = 'PrototypePreviewModal'

// ─── Main Step ────────────────────────────────────────────────────

export const StepSelectPrototype = memo(({
  prospect,
  selected,
  onSelect,
  onNext,
}: StepSelectPrototypeProps) => {
  const [state, setState] = useState<AsyncState<PrototypeCatalogItem[]>>({ status: 'loading' })
  const [previewId, setPreviewId] = useState<string | null>(null)

  // Fetch prototypes list
  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })

    fetch(`/api/prototypes?niche=${prospect.niche}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<{ prototypes: PrototypeCatalogItem[] }>
      })
      .then((data) => {
        if (data.prototypes.length === 0) {
          setState({ status: 'empty', cta: 'Charger tous les prototypes' })
        } else {
          setState({ status: 'success', data: data.prototypes })
        }
      })
      .catch((err: unknown) => {
        if ((err as Error).name === 'AbortError') return
        setState({
          status: 'error',
          error: 'Impossible de charger les prototypes.',
          retry: () => setState({ status: 'loading' }),
        })
      })

    return () => controller.abort()
  }, [prospect.niche])

  const handlePreview = useCallback((id: string) => setPreviewId(id), [])
  const closePreview  = useCallback(() => setPreviewId(null), [])

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div>
        <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest mb-1">Étape 1 sur 3</div>
        <h3 className="font-display text-xl text-[#f0ede8]">
          Choisissez un modèle
        </h3>
        <p className="text-[12px] text-[rgba(240,237,232,0.4)] mt-0.5">
          {prospect.companyName} · {prospect.niche} — {state.status === 'success' ? `${state.data.length} modèles disponibles` : 'Chargement...'}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        {state.status === 'loading' && <PrototypeSkeleton />}

        {state.status === 'error' && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <div>
              <div className="text-[13px] font-semibold text-red-400">{state.error}</div>
              {state.retry && (
                <button onClick={state.retry} className="mt-3 text-[11px] font-bold text-[#c5a059] hover:underline">
                  Réessayer →
                </button>
              )}
            </div>
          </div>
        )}

        {state.status === 'empty' && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <div className="text-4xl">📂</div>
            <div>
              <div className="text-[13px] font-semibold text-[#f0ede8]">Aucun prototype pour cette niche</div>
              <div className="text-[11px] text-[rgba(240,237,232,0.4)] mt-1">Les prototypes pour {prospect.niche} seront ajoutés prochainement</div>
            </div>
          </div>
        )}

        {state.status === 'success' && (
          <motion.div
            className="grid grid-cols-3 gap-3"
            initial="initial"
            animate="animate"
            variants={{ animate: { transition: { staggerChildren: 0.06 } } }}
          >
            {state.data.map((proto) => (
              <motion.div
                key={proto.id}
                variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}
              >
                <PrototypeCard
                  prototype={proto}
                  selected={selected?.id === proto.id}
                  onSelect={() => onSelect(proto)}
                  onPreview={() => handlePreview(proto.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* CTA */}
      <div className="flex justify-end pt-3 border-t border-white/6 shrink-0">
        <button
          onClick={onNext}
          disabled={!selected}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: selected ? 'linear-gradient(135deg, #B8924A, #c5a059)' : 'rgba(255,255,255,0.05)',
            color:      selected ? '#1A1200' : 'rgba(240,237,232,0.3)',
            border:     selected ? 'none' : '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {selected ? `Personnaliser ${selected.name}` : 'Sélectionnez un modèle'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {previewId && (
          <PrototypePreviewModal prototypeId={previewId} onClose={closePreview} />
        )}
      </AnimatePresence>
    </div>
  )
})

StepSelectPrototype.displayName = 'StepSelectPrototype'
