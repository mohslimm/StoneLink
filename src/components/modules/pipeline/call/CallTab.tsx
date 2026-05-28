// ─────────────────────────────────────────────────────────────────
// STONELINK PIPELINE — CallTab.tsx
// Onglet Appel — Assistant IA Live avec script + objections + timer
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, PhoneOff, Loader2, RefreshCw, AlertCircle,
  Mic, MicOff, PhoneCall,
} from 'lucide-react'
import { Device, Call as TwilioCall } from '@twilio/voice-sdk'
import type { Prospect, CallScript, CallOutcome, DealStage } from '@/types/pipeline'
import { useStoneStore } from '@/stores/useStoneStore'
import { ScriptReader } from './ScriptReader'
import { ObjectionPanel } from './ObjectionPanel'
import { CallEndModal } from './CallEndModal'

// ─── Constants ────────────────────────────────────────────────────

const CALL_PHASES = ['En attente', 'Script', 'Objections', 'Clôture'] as const

// ─── Call Timer ───────────────────────────────────────────────────

const GlobalCallTimer = memo(({ isActive }: { isActive: boolean }) => {
  const [elapsed, setElapsed] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isActive) {
      ref.current = setInterval(() => setElapsed((e) => e + 1), 1_000)
    } else {
      setElapsed(0)
    }
    return () => {
      if (ref.current) clearInterval(ref.current)
    }
  }, [isActive])

  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="w-2 h-2 rounded-full bg-[#ef4444]"
        animate={{ opacity: isActive ? [1, 0.3, 1] : 1 }}
        transition={{ repeat: Infinity, duration: 1.2 }}
      />
      <span className="font-mono text-[14px] font-bold text-[#f0ede8]">{timeStr}</span>
    </div>
  )
})
GlobalCallTimer.displayName = 'GlobalCallTimer'

// ─── Props ────────────────────────────────────────────────────────

interface CallTabProps {
  prospect: Prospect
}

// ─── Main Component ───────────────────────────────────────────────

export const CallTab = memo(({ prospect }: CallTabProps) => {
  // ── Store ──────────────────────────────────────────────────────
  const addNote            = useStoneStore((s) => s.addNote)
  const moveProspectToStage = useStoneStore((s) => s.moveProspectToStage)
  const addActivity        = useStoneStore((s) => s.addActivity)

  // ── State ──────────────────────────────────────────────────────
  const [scriptState, setScriptState] = useState<
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: CallScript }
    | { status: 'error'; error: string }
  >({ status: 'idle' })

  const [isCallActive,   setCallActive]   = useState(false)
  const [isMuted,        setMuted]        = useState(false)
  const [activePanel,    setActivePanel]  = useState<'script' | 'objections'>('script')
  const [showEndModal,   setShowEndModal] = useState(false)
  const [callStartTime,  setCallStart]    = useState<number>(0)
  const [currentStep,    setCurrentStep]  = useState(0)

  // Twilio VoIP State
  const [device, setDevice] = useState<Device | null>(null)
  const [activeCall, setActiveCall] = useState<TwilioCall | null>(null)
  const [twilioError, setTwilioError] = useState<string | null>(null)

  const callElapsedRef = useRef(0)

  // Track elapsed time
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (isCallActive) {
      interval = setInterval(() => { callElapsedRef.current += 1 }, 1_000)
    } else {
      callElapsedRef.current = 0
    }
    return () => { if (interval) clearInterval(interval) }
  }, [isCallActive])

  // ── Generate Script ────────────────────────────────────────────

  const generateScript = useCallback(async () => {
    setScriptState({ status: 'loading' })
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30_000)

      const res = await fetch('/api/call/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectId:      prospect.id,
          companyName:     prospect.companyName,
          contactName:     prospect.contactName,
          niche:           prospect.niche,
          city:            prospect.city,
          country:         prospect.country,
          lighthouseScore: prospect.lighthouseScore,
          estimatedLoss:   prospect.estimatedLoss,
          website:         prospect.website,
          phone:           prospect.phone,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!res.ok) {
        throw new Error(`Erreur serveur (${res.status})`)
      }

      const json = await res.json() as { script: CallScript }
      setScriptState({ status: 'success', data: json.script })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion'
      setScriptState({ status: 'error', error: msg })
    }
  }, [prospect])

  // ── Call Controls ──────────────────────────────────────────────

  const handleStartCall = useCallback(async () => {
    setCallActive(true)
    setCallStart(Date.now())
    setTwilioError(null)

    addActivity(prospect.id, {
      type:        'call_made',
      description: `Appel lancé vers ${prospect.contactName} (${prospect.phone})`,
    })
    moveProspectToStage(prospect.id, 'calling')

    try {
      // 1. Récupérer le token depuis le backend
      const res = await fetch('/api/call/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: `agent-${prospect.id}` })
      })
      
      const data = await res.json()
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Erreur token VoIP')
      }

      // 2. Initialiser le Device Twilio
      const newDevice = new Device(data.token, {
        codecPreferences: [TwilioCall.Codec.Opus, TwilioCall.Codec.PCMU]
      })

      newDevice.on('error', (twilioErr) => {
        console.error('Twilio Error:', twilioErr)
        setTwilioError(twilioErr.message || 'Erreur réseau Twilio')
      })

      await newDevice.register()
      setDevice(newDevice)

      // 3. Connecter l'appel
      const call = await newDevice.connect({ params: { To: prospect.phone } })
      
      call.on('disconnect', () => {
        setActiveCall(null)
        setCallActive(false)
        setShowEndModal(true)
      })

      call.on('error', (err) => {
        setTwilioError(err.message)
      })

      setActiveCall(call)
      
    } catch (err: any) {
      console.error('VoIP Init Failed:', err)
      setTwilioError(err.message || "Mode simulation activé")
    }
  }, [prospect, addActivity, moveProspectToStage])

  const handleEndCall = useCallback(() => {
    if (activeCall) {
      activeCall.disconnect()
    }
    setCallActive(false)
    setShowEndModal(true)
  }, [activeCall])

  // Cleanup Twilio device
  useEffect(() => {
    return () => {
      if (device) device.destroy()
    }
  }, [device])

  const handleSaveBilan = useCallback(async (
    outcome: CallOutcome,
    note: string,
    nextStage: DealStage,
  ) => {
    const duration = Math.floor((Date.now() - callStartTime) / 1_000)

    addNote(prospect.id, {
      timestamp: new Date(),
      content:  note || `Appel ${outcome} — ${duration}s`,
      duration,
      outcome,
    })

    moveProspectToStage(prospect.id, nextStage)

    addActivity(prospect.id, {
      type:        'call_made',
      description: `Appel terminé — Résultat : ${outcome} — Durée : ${Math.floor(duration / 60)}min${duration % 60}s`,
      metadata:    { outcome, duration },
    })

    setShowEndModal(false)
    setScriptState({ status: 'idle' })
    setCurrentStep(0)
  }, [callStartTime, prospect.id, addNote, moveProspectToStage, addActivity])

  // ── Render States ──────────────────────────────────────────────

  if (scriptState.status === 'idle') {
    return (
      <motion.div
        className="flex flex-col items-center justify-center gap-6 py-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Prospect Info Banner */}
        <div
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0"
            style={{ background: 'rgba(197,160,89,0.12)', color: '#c5a059', border: '1px solid rgba(197,160,89,0.2)' }}
          >
            {prospect.contactName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-base text-[#f0ede8]">{prospect.contactName}</div>
            <div className="text-[12px] text-[rgba(240,237,232,0.4)] truncate">{prospect.companyName}</div>
          </div>
          <a
            href={`tel:${prospect.phone}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-[#22c55e] transition-opacity hover:opacity-80"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <Phone className="w-3 h-3" />
            {prospect.phone}
          </a>
        </div>

        {/* Lighthouse Score */}
        {prospect.lighthouseScore !== undefined && (
          <div
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            <div>
              <div className="text-[10px] font-bold text-[#ef4444] uppercase tracking-widest mb-0.5">Argument Principal</div>
              <div className="text-[13px] text-[#f0ede8]">
                Score Lighthouse : <span className="font-bold text-[#ef4444]">{prospect.lighthouseScore}/100</span>
              </div>
            </div>
            {prospect.estimatedLoss && (
              <div className="text-right">
                <div className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest mb-0.5">Manque à gagner</div>
                <div className="text-[13px] font-bold text-[#f59e0b]">
                  {Math.abs(prospect.estimatedLoss).toLocaleString('fr-FR')} €/mois
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA — Generate Script */}
        <button
          onClick={generateScript}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-[14px] font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #B8924A, #c5a059)', color: '#1A1200' }}
        >
          <PhoneCall className="w-5 h-5" />
          Générer le Script &amp; Lancer l'Appel
        </button>

        {/* Past Calls */}
        {prospect.notes.length > 0 && (
          <div className="w-full space-y-2">
            <div className="text-[10px] font-bold text-[rgba(240,237,232,0.35)] uppercase tracking-widest">
              Appels précédents ({prospect.notes.length})
            </div>
            {prospect.notes.slice(0, 3).map((note) => (
              <div
                key={note.id}
                className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <Phone className="w-3.5 h-3.5 text-[rgba(240,237,232,0.3)] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-[#f0ede8] leading-relaxed">{note.content}</div>
                  <div className="text-[10px] text-[rgba(240,237,232,0.3)] mt-0.5">
                    {note.outcome} · {note.duration ? `${Math.floor(note.duration / 60)}min` : '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    )
  }

  if (scriptState.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-[#c5a059]" />
        </motion.div>
        <div className="text-center">
          <div className="text-[14px] font-semibold text-[#f0ede8]">Génération du script IA</div>
          <div className="text-[12px] text-[rgba(240,237,232,0.4)] mt-1">
            Personnalisation en cours pour {prospect.companyName}...
          </div>
        </div>
      </div>
    )
  }

  if (scriptState.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          <AlertCircle className="w-6 h-6 text-[#ef4444]" />
        </div>
        <div className="text-center">
          <div className="text-[14px] font-semibold text-[#f0ede8]">Génération impossible</div>
          <div className="text-[12px] text-[rgba(240,237,232,0.4)] mt-1">{scriptState.error}</div>
        </div>
        <button
          onClick={generateScript}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold text-[rgba(240,237,232,0.6)] transition-all hover:text-[#f0ede8]"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Réessayer
        </button>
      </div>
    )
  }

  // ── Success — Script Loaded ────────────────────────────────────
  const { data: script } = scriptState

  return (
    <div className="flex flex-col gap-4">
      {/* Call Control Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-2xl"
        style={{
          background: isCallActive ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.06)',
          border: `1px solid ${isCallActive ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.15)'}`,
        }}
      >
        <div className="flex items-center gap-3">
          {isCallActive ? (
            <div className="flex items-center gap-2">
              <GlobalCallTimer isActive={isCallActive} />
              {twilioError && (
                <span className="text-[10px] text-[#ef4444] bg-[rgba(239,68,68,0.1)] px-2 py-0.5 rounded-full border border-[rgba(239,68,68,0.2)]">
                  Simulé
                </span>
              )}
            </div>
          ) : (
            <span className="text-[12px] font-bold text-[#22c55e] uppercase tracking-wider">
              Script prêt
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isCallActive && (
            <button
              onClick={() => {
                setMuted((v) => {
                  if (activeCall) {
                    activeCall.mute(!v)
                  }
                  return !v
                })
              }}
              className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
              style={{
                background: isMuted ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
                border: isMuted ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.08)',
              }}
              aria-label={isMuted ? 'Activer le micro' : 'Couper le micro'}
            >
              {isMuted
                ? <MicOff className="w-3.5 h-3.5 text-[#ef4444]" />
                : <Mic className="w-3.5 h-3.5 text-[rgba(240,237,232,0.5)]" />
              }
            </button>
          )}

          {!isCallActive ? (
            <button
              onClick={handleStartCall}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#fff' }}
            >
              <Phone className="w-3.5 h-3.5" />
              Démarrer l'appel
            </button>
          ) : (
            <button
              onClick={handleEndCall}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
            >
              <PhoneOff className="w-3.5 h-3.5" />
              Terminer
            </button>
          )}

          <button
            onClick={generateScript}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-[rgba(240,237,232,0.4)] transition-all hover:text-[#c5a059]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            aria-label="Regénérer le script"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Panel Tabs */}
      <div className="flex gap-2">
        {(['script', 'objections'] as const).map((panel) => (
          <button
            key={panel}
            onClick={() => setActivePanel(panel)}
            className="flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all"
            style={{
              background: activePanel === panel ? 'rgba(197,160,89,0.12)' : 'rgba(255,255,255,0.04)',
              border: activePanel === panel
                ? '1px solid rgba(197,160,89,0.25)'
                : '1px solid rgba(255,255,255,0.06)',
              color: activePanel === panel ? '#c5a059' : 'rgba(240,237,232,0.4)',
            }}
          >
            {panel === 'script' ? '📜 Script' : '🛡️ Objections'}
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePanel}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activePanel === 'script' && (
            <ScriptReader
              script={script}
              isCallActive={isCallActive}
              onStepChange={setCurrentStep}
              onComplete={handleEndCall}
            />
          )}
          {activePanel === 'objections' && (
            <ObjectionPanel objections={script.objections} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Close Scripts — always visible when call is active */}
      {isCallActive && script.closes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="text-[10px] font-bold text-[#16a34a] uppercase tracking-widest">
            🏆 Scripts de clôture
          </div>
          {script.closes.map((close) => (
            <div
              key={close.id}
              className="px-4 py-3 rounded-xl text-[12px] text-[rgba(240,237,232,0.65)] leading-relaxed"
              style={{
                background: 'rgba(22,163,74,0.05)',
                border: '1px solid rgba(22,163,74,0.12)',
                borderLeft: '3px solid #16a34a',
              }}
            >
              <span
                className="text-[9px] font-bold uppercase tracking-wider mr-2"
                style={{ color: '#16a34a' }}
              >
                {close.type === 'soft' ? 'Doux' : close.type === 'assumptive' ? 'Assumptif' : 'Urgence'}
              </span>
              {close.script}
            </div>
          ))}
        </motion.div>
      )}

      {/* Call End Modal */}
      <CallEndModal
        isOpen={showEndModal}
        callDuration={callElapsedRef.current}
        prospectName={prospect.contactName}
        onSave={handleSaveBilan}
        onCancel={() => { setShowEndModal(false); setCallActive(false) }}
      />
    </div>
  )
})
CallTab.displayName = 'CallTab'
