// ─────────────────────────────────────────────────────────────────
// STONELINK PIPELINE — PrototypeWizard.tsx
// Modal Wizard 3 étapes : Sélection → Personnalisation → Email
// ─────────────────────────────────────────────────────────────────
'use client'

import { useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { Prospect } from '@/types/pipeline'
import type { PrototypeCatalogItem } from './PrototypeCard'
import type { CustomizationForm } from './StepCustomize'
import { StepSelectPrototype } from './StepSelectPrototype'
import { StepCustomize }       from './StepCustomize'
import { StepEmailPreview }    from './StepEmailPreview'

// ─── Types ────────────────────────────────────────────────────────

type WizardStep = 1 | 2 | 3

interface PrototypeWizardProps {
  prospect: Prospect
  isOpen:   boolean
  onClose:  () => void
}

// ─── Step Indicator ───────────────────────────────────────────────

const STEP_LABELS = ['Modèle', 'Personnalisation', 'Email']

const StepIndicator = memo(({ current }: { current: WizardStep }) => (
  <div className="flex items-center gap-3">
    {STEP_LABELS.map((label, idx) => {
      const stepNum = (idx + 1) as WizardStep
      const isPast    = current > stepNum
      const isCurrent = current === stepNum
      return (
        <div key={label} className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
            style={{
              background: isPast ? 'rgba(34,197,94,0.15)'
                : isCurrent ? 'linear-gradient(135deg, #B8924A, #c5a059)'
                : 'rgba(255,255,255,0.05)',
              color:      isPast ? '#22c55e'
                : isCurrent ? '#1A1200'
                : 'rgba(240,237,232,0.3)',
              border:     isPast ? '1px solid rgba(34,197,94,0.3)'
                : isCurrent ? 'none'
                : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {isPast ? '✓' : stepNum}
          </div>
          <span
            className="text-[11px] font-semibold transition-colors"
            style={{ color: isCurrent ? '#f0ede8' : 'rgba(240,237,232,0.3)' }}
          >
            {label}
          </span>
          {idx < STEP_LABELS.length - 1 && (
            <div
              className="w-6 h-px transition-colors"
              style={{ background: isPast ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)' }}
            />
          )}
        </div>
      )
    })}
  </div>
))
StepIndicator.displayName = 'StepIndicator'

// ─── Default Form ─────────────────────────────────────────────────

const buildDefaultForm = (prospect: Prospect): CustomizationForm => ({
  companyName:  prospect.companyName,
  logoFile:     null,
  logoBase64:   null,
  logoMimeType: null,
  primaryColor: prospect.brandColor ?? '#1B3A5C',
  tagline:      '',
  phone:        prospect.phone,
  email:        prospect.email,
  address:      prospect.city,
  ctaText:      'Nous contacter',
})

// ─── Main Wizard ──────────────────────────────────────────────────

export const PrototypeWizard = memo(({
  prospect,
  isOpen,
  onClose,
}: PrototypeWizardProps) => {
  const [step, setStep]             = useState<WizardStep>(1)
  const [selectedProto, setProto]   = useState<PrototypeCatalogItem | null>(null)
  const [form, setForm]             = useState<CustomizationForm>(() => buildDefaultForm(prospect))
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const handleFormChange = useCallback((updates: Partial<CustomizationForm>) => {
    setForm((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleClose = useCallback(() => {
    // Reset to step 1 on close for fresh state next time
    setStep(1)
    setProto(null)
    setForm(buildDefaultForm(prospect))
    setPreviewUrl('')
    onClose()
  }, [onClose, prospect])

  const handleStep1Next = useCallback(() => setStep(2), [])
  const handleStep2Next = useCallback((url: string) => {
    setPreviewUrl(url)
    setStep(3)
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full pointer-events-auto flex flex-col rounded-2xl overflow-hidden"
              style={{
                maxWidth:   '960px',
                height:     'min(90vh, 720px)',
                background: '#0a0a14',
                border:     '1px solid rgba(255,255,255,0.08)',
                boxShadow:  '0 32px 80px rgba(0,0,0,0.6)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/6"
                style={{ background: 'rgba(255,255,255,0.015)' }}
              >
                <div>
                  <div className="text-[11px] font-bold text-[rgba(240,237,232,0.35)] uppercase tracking-widest mb-2">
                    Wizard Prototype · {prospect.companyName}
                  </div>
                  <StepIndicator current={step} />
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-[rgba(240,237,232,0.4)] hover:text-[rgba(240,237,232,0.8)] transition-colors"
                  aria-label="Fermer le wizard"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step content */}
              <div className="flex-1 p-6 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: step === 1 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: step === 1 ? 20 : -20 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full"
                  >
                    {step === 1 && (
                      <StepSelectPrototype
                        prospect={prospect}
                        selected={selectedProto}
                        onSelect={setProto}
                        onNext={handleStep1Next}
                      />
                    )}

                    {step === 2 && selectedProto && (
                      <StepCustomize
                        prospect={prospect}
                        prototype={selectedProto}
                        form={form}
                        onChange={handleFormChange}
                        onBack={() => setStep(1)}
                        onNext={handleStep2Next}
                      />
                    )}

                    {step === 3 && (
                      <StepEmailPreview
                        prospect={prospect}
                        previewUrl={previewUrl}
                        onBack={() => setStep(2)}
                        onDone={handleClose}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

PrototypeWizard.displayName = 'PrototypeWizard'
