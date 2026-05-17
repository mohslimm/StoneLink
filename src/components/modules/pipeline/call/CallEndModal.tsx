// ─────────────────────────────────────────────────────────────────
// STONELINK PIPELINE — CallEndModal.tsx
// Bilan post-appel : outcome, durée, note, avancement automatique
// ─────────────────────────────────────────────────────────────────

import { useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, XCircle, PhoneOff, PhoneMissed, VoicemailIcon,
  RefreshCw, Loader2, Save,
} from 'lucide-react'
import type { CallOutcome, DealStage } from '@/types/pipeline'

// ─── Constants ────────────────────────────────────────────────────

interface OutcomeOption {
  id:          CallOutcome
  label:       string
  icon:        typeof CheckCircle2
  color:       string
  bg:          string
  nextStage:   DealStage
  description: string
}

const OUTCOME_OPTIONS: OutcomeOption[] = [
  {
    id:          'interested',
    label:       'Intéressé',
    icon:        CheckCircle2,
    color:       '#22c55e',
    bg:          'rgba(34,197,94,0.12)',
    nextStage:   'interested',
    description: 'Le prospect veut recevoir le prototype',
  },
  {
    id:          'callback',
    label:       'Rappeler',
    icon:        RefreshCw,
    color:       '#c5a059',
    bg:          'rgba(197,160,89,0.12)',
    nextStage:   'follow_up',
    description: 'Demande d\'être rappelé à un autre moment',
  },
  {
    id:          'no_answer',
    label:       'Pas de réponse',
    icon:        PhoneMissed,
    color:       '#64748b',
    bg:          'rgba(100,116,139,0.12)',
    nextStage:   'to_call',
    description: 'Le prospect n\'a pas décroché',
  },
  {
    id:          'voicemail',
    label:       'Messagerie',
    icon:        VoicemailIcon,
    color:       '#7c3aed',
    bg:          'rgba(124,58,237,0.12)',
    nextStage:   'to_call',
    description: 'Message laissé sur la messagerie',
  },
  {
    id:          'not_interested',
    label:       'Pas intéressé',
    icon:        XCircle,
    color:       '#ef4444',
    bg:          'rgba(239,68,68,0.12)',
    nextStage:   'closed_lost',
    description: 'Refus explicite — archivé',
  },
]

// ─── Props ────────────────────────────────────────────────────────

interface CallEndModalProps {
  isOpen:      boolean
  callDuration: number   // secondes
  prospectName: string
  onSave:      (outcome: CallOutcome, note: string, stage: DealStage) => Promise<void>
  onCancel:    () => void
}

// ─── Main Component ───────────────────────────────────────────────

export const CallEndModal = memo(({
  isOpen, callDuration, prospectName, onSave, onCancel,
}: CallEndModalProps) => {
  const [selected, setSelected] = useState<CallOutcome | null>(null)
  const [note,     setNote]     = useState('')
  const [saving,   setSaving]   = useState(false)

  const selectedOpt = OUTCOME_OPTIONS.find((o) => o.id === selected)

  const durationStr = (() => {
    const m = Math.floor(callDuration / 60)
    const s = callDuration % 60
    if (m === 0) return `${s}s`
    return `${m}min ${s}s`
  })()

  const handleSave = useCallback(async () => {
    if (!selected || !selectedOpt) return
    setSaving(true)
    await onSave(selected, note.trim(), selectedOpt.nextStage)
    setSaving(false)
  }, [selected, selectedOpt, note, onSave])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="w-full max-w-md rounded-3xl overflow-hidden"
              style={{ background: '#0f0f20', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Header */}
              <div
                className="px-6 py-5 text-center"
                style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
                >
                  <PhoneOff className="w-5 h-5 text-[#ef4444]" />
                </div>
                <h3 className="font-display text-xl text-[#f0ede8]">Bilan de l'appel</h3>
                <p className="text-[12px] text-[rgba(240,237,232,0.4)] mt-1">
                  {prospectName} · Durée : <span className="text-[#c5a059] font-bold">{durationStr}</span>
                </p>
              </div>

              {/* Outcome Selection */}
              <div className="px-6 py-5 space-y-4">
                <div className="text-[10px] font-bold text-[rgba(240,237,232,0.4)] uppercase tracking-widest mb-3">
                  Résultat de l'appel
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {OUTCOME_OPTIONS.map((opt) => {
                    const Icon = opt.icon
                    const isSelected = selected === opt.id
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSelected(opt.id)}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
                        style={{
                          background: isSelected ? opt.bg : 'rgba(255,255,255,0.03)',
                          border: isSelected
                            ? `1px solid ${opt.color}40`
                            : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: isSelected ? opt.bg : 'rgba(255,255,255,0.04)',
                          }}
                        >
                          <Icon className="w-4 h-4" style={{ color: opt.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-[13px] font-semibold"
                            style={{ color: isSelected ? opt.color : '#f0ede8' }}
                          >
                            {opt.label}
                          </div>
                          <div className="text-[10px] text-[rgba(240,237,232,0.35)]">
                            {opt.description}
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div
                            layoutId="outcome-check"
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: opt.color }}
                          >
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Note */}
                <div>
                  <div className="text-[10px] font-bold text-[rgba(240,237,232,0.4)] uppercase tracking-widest mb-2">
                    Note (optionnel)
                  </div>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Points importants, prochaines étapes, contexte..."
                    rows={3}
                    className="w-full rounded-xl px-4 py-3 text-[13px] text-[#f0ede8] outline-none resize-none transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  />
                </div>

                {/* Next Stage Preview */}
                {selectedOpt && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px]"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span className="text-[rgba(240,237,232,0.4)]">Prochain statut :</span>
                    <span className="font-bold" style={{ color: selectedOpt.color }}>
                      → {selectedOpt.nextStage.replace(/_/g, ' ')}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div
                className="flex gap-3 px-6 py-4"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <button
                  onClick={onCancel}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(240,237,232,0.5)' }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={!selected || saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all disabled:opacity-40"
                  style={{
                    background: selected
                      ? 'linear-gradient(135deg, #B8924A, #c5a059)'
                      : 'rgba(255,255,255,0.06)',
                    color: selected ? '#1A1200' : 'rgba(240,237,232,0.3)',
                  }}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Enregistrement...' : 'Enregistrer le bilan'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})
CallEndModal.displayName = 'CallEndModal'
