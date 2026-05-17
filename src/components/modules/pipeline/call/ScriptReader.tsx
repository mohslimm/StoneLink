// ─────────────────────────────────────────────────────────────────
// STONELINK PIPELINE — ScriptReader.tsx
// Téléprompter étape par étape pour l'assistant IA en mode appel
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Lightbulb, Timer, CheckCircle2,
} from 'lucide-react'
import type { CallScript, ScriptStep } from '@/types/pipeline'

// ─── Constants ────────────────────────────────────────────────────

const PHASE_COLORS: Record<string, { color: string; bg: string }> = {
  opener:       { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  audit_reveal: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  pitch:        { color: '#c5a059', bg: 'rgba(197,160,89,0.12)' },
  social_proof: { color: '#2563eb', bg: 'rgba(37,99,235,0.12)'  },
  transition:   { color: '#0891b2', bg: 'rgba(8,145,178,0.12)'  },
  close:        { color: '#16a34a', bg: 'rgba(22,163,74,0.12)'  },
}

const STEP_VARIANTS = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit:    { opacity: 0, x: -40, transition: { duration: 0.2 } },
}

// ─── Step Timer ───────────────────────────────────────────────────

const StepTimer = memo(({ targetSeconds, isActive }: { targetSeconds: number; isActive: boolean }) => {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setElapsed(0)
    if (isActive) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1_000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive])

  const progress  = Math.min(elapsed / targetSeconds, 1)
  const isOver    = elapsed > targetSeconds
  const mins      = Math.floor(elapsed / 60)
  const secs      = elapsed % 60
  const timeStr   = `${mins}:${String(secs).padStart(2, '0')}`
  const strokeClr = isOver ? '#ef4444' : progress > 0.75 ? '#f59e0b' : '#c5a059'
  const circumf   = 2 * Math.PI * 14
  const dashOff   = circumf * (1 - progress)

  return (
    <div className="flex items-center gap-2">
      <svg width="36" height="36" viewBox="0 0 36 36" className="shrink-0 -rotate-90">
        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
        <circle cx="18" cy="18" r="14" fill="none" stroke={strokeClr} strokeWidth="2.5"
          strokeDasharray={circumf} strokeDashoffset={dashOff}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s, stroke 0.3s' }} />
      </svg>
      <div className="flex items-center gap-1">
        <Timer className="w-3 h-3" style={{ color: strokeClr }} />
        <span className="font-mono text-[12px]" style={{ color: strokeClr }}>{timeStr}</span>
      </div>
    </div>
  )
})
StepTimer.displayName = 'StepTimer'

// ─── Props ────────────────────────────────────────────────────────

interface ScriptReaderProps {
  script:      CallScript
  isCallActive: boolean
  onStepChange: (step: number) => void
  onComplete:   () => void
}

// ─── Main Component ───────────────────────────────────────────────

export const ScriptReader = memo(({
  script, isCallActive, onStepChange, onComplete,
}: ScriptReaderProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompleted] = useState<Set<number>>(new Set())
  const [showTip, setShowTip] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')

  const step     = script.steps[currentStep] as ScriptStep
  const isLast   = currentStep === script.steps.length - 1
  const phaseClr = PHASE_COLORS[step.phase] ?? PHASE_COLORS['opener']

  const goTo = useCallback((idx: number, dir: 'next' | 'prev') => {
    setDirection(dir)
    setCurrentStep(idx)
    setShowTip(false)
    onStepChange(idx)
    if (dir === 'prev') return
    setCompleted((prev) => {
      const next = new Set(prev)
      next.add(currentStep)
      return next
    })
  }, [currentStep, onStepChange])

  const handleNext = useCallback(() => {
    if (isLast) {
      setCompleted((prev) => {
        const next = new Set(prev)
        next.add(currentStep)
        return next
      })
      onComplete()
    } else {
      goTo(currentStep + 1, 'next')
    }
  }, [isLast, currentStep, goTo, onComplete])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) goTo(currentStep - 1, 'prev')
  }, [currentStep, goTo])

  return (
    <div className="flex flex-col gap-4">
      {/* Step Progress */}
      <div className="flex items-center gap-1.5">
        {script.steps.map((s, i) => {
          const cfg = PHASE_COLORS[s.phase] ?? PHASE_COLORS['opener']
          const done = completedSteps.has(i)
          const active = i === currentStep
          return (
            <button
              key={s.id}
              onClick={() => goTo(i, i > currentStep ? 'next' : 'prev')}
              className="flex-1 h-1.5 rounded-full transition-all duration-300 relative overflow-hidden"
              style={{
                background: done
                  ? cfg.color
                  : active
                    ? cfg.bg
                    : 'rgba(255,255,255,0.07)',
                border: active ? `1px solid ${cfg.color}60` : '1px solid transparent',
              }}
              aria-label={s.label}
            >
              {active && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: cfg.color }}
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          variants={STEP_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          className="rounded-2xl p-5"
          style={{
            background: phaseClr.bg,
            border: `1px solid ${phaseClr.color}25`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {completedSteps.has(currentStep) && (
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              )}
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: phaseClr.color }}
              >
                Étape {currentStep + 1} · {step.label}
              </span>
            </div>
            {isCallActive && (
              <StepTimer
                targetSeconds={step.durationTarget ?? 30}
                isActive={isCallActive}
              />
            )}
          </div>

          {/* Script Text */}
          <p
            className="text-[15px] leading-relaxed text-[#f0ede8] font-light"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {step.script}
          </p>

          {/* Tip Toggle */}
          {step.tip && (
            <div className="mt-4">
              <button
                onClick={() => setShowTip((v) => !v)}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-opacity hover:opacity-80"
                style={{ color: phaseClr.color }}
              >
                <Lightbulb className="w-3 h-3" />
                {showTip ? 'Masquer le conseil' : 'Conseil commercial'}
              </button>
              <AnimatePresence>
                {showTip && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 overflow-hidden"
                  >
                    <div
                      className="text-[12px] italic leading-relaxed px-3 py-2 rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        color: 'rgba(240,237,232,0.55)',
                        borderLeft: `2px solid ${phaseClr.color}50`,
                      }}
                    >
                      💡 {step.tip}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all disabled:opacity-30"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(240,237,232,0.5)' }}
          aria-label="Étape précédente"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Retour
        </button>
        <button
          onClick={handleNext}
          className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: isLast
              ? 'linear-gradient(135deg, #16a34a, #22c55e)'
              : `linear-gradient(135deg, ${phaseClr.color}cc, ${phaseClr.color})`,
            color: '#fff',
          }}
        >
          {isLast ? '✓ Terminer l\'appel' : 'Étape suivante'}
          {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
})
ScriptReader.displayName = 'ScriptReader'
