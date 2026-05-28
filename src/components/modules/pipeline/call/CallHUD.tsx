'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, AlertCircle, RefreshCw, Loader2, Target, ShieldAlert, FileText, ArrowRight } from 'lucide-react';
import { Device, Call as TwilioCall } from '@twilio/voice-sdk';
import type { Prospect, CallScript, CallOutcome } from '@/types/pipeline';
import { useStoneStore } from '@/stores/useStoneStore';
import { CallTimer } from '../../../ui/CallTimer';
import { CircularScore } from '../../../ui/CircularScore';
import { ScriptSteps } from './ScriptSteps';
import { ObjectionDrawer } from './ObjectionDrawer';
import { CallEndModal } from './CallEndModal';

interface CallHUDProps {
  prospect: Prospect;
  onClose?: () => void;
}

export const CallHUD = memo(({ prospect, onClose }: CallHUDProps) => {
  const addNote = useStoneStore((s) => s.addNote);
  const moveProspectToStage = useStoneStore((s) => s.moveProspectToStage);
  const addActivity = useStoneStore((s) => s.addActivity);

  const [scriptState, setScriptState] = useState<
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: CallScript }
    | { status: 'error'; error: string }
  >({ status: 'idle' });

  const [isCallActive, setCallActive] = useState(false);
  const [isMuted, setMuted] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [callStartTime, setCallStart] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isObjectionDrawerOpen, setIsObjectionDrawerOpen] = useState(false);

  // Twilio State
  const [device, setDevice] = useState<Device | null>(null);
  const [activeCall, setActiveCall] = useState<TwilioCall | null>(null);
  const [twilioError, setTwilioError] = useState<string | null>(null);
  
  const callElapsedRef = useRef(0);

  const generateScript = useCallback(async () => {
    setScriptState({ status: 'loading' });
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);

      const res = await fetch('/api/call/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectId: prospect.id,
          companyName: prospect.companyName,
          contactName: prospect.contactName,
          niche: prospect.niche,
          city: prospect.city,
          country: prospect.country,
          lighthouseScore: prospect.lighthouseScore,
          estimatedLoss: prospect.estimatedLoss,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);

      const json = await res.json() as { script: CallScript };
      setScriptState({ status: 'success', data: json.script });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion';
      setScriptState({ status: 'error', error: msg });
    }
  }, [prospect]);

  const handleStartCall = useCallback(async () => {
    setCallActive(true);
    setCallStart(Date.now());
    setTwilioError(null);
    callElapsedRef.current = 0;

    addActivity(prospect.id, {
      type: 'call_made',
      description: `Appel lancé vers ${prospect.contactName} (${prospect.phone})`,
    });
    moveProspectToStage(prospect.id, 'calling');

    try {
      const res = await fetch('/api/call/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: `agent-${prospect.id}` })
      });
      
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error(data.error || 'Erreur token VoIP');

      const newDevice = new Device(data.token, {
        codecPreferences: [TwilioCall.Codec.Opus, TwilioCall.Codec.PCMU]
      });

      newDevice.on('error', (twilioErr) => {
        setTwilioError(twilioErr.message || 'Erreur réseau Twilio');
      });

      await newDevice.register();
      setDevice(newDevice);

      const call = await newDevice.connect({ params: { To: prospect.phone } });
      
      call.on('disconnect', () => {
        setActiveCall(null);
        setCallActive(false);
        setShowEndModal(true);
      });

      call.on('error', (err) => {
        setTwilioError(err.message);
      });

      setActiveCall(call);
    } catch (err: any) {
      setTwilioError(err.message || "Mode simulation activé");
    }
  }, [prospect, addActivity, moveProspectToStage]);

  const handleEndCall = useCallback(() => {
    if (activeCall) activeCall.disconnect();
    setCallActive(false);
    setShowEndModal(true);
  }, [activeCall]);

  useEffect(() => {
    return () => { if (device) device.destroy(); };
  }, [device]);

  const handleSaveBilan = useCallback(async (outcome: CallOutcome, note: string, nextStage: any) => {
    const duration = callElapsedRef.current;
    addNote(prospect.id, {
      timestamp: new Date(),
      content: note || `Appel ${outcome} — ${duration}s`,
      duration,
      outcome,
    });
    moveProspectToStage(prospect.id, nextStage);
    addActivity(prospect.id, {
      type: 'call_made',
      description: `Appel terminé — Résultat : ${outcome} — Durée : ${duration}s`,
      metadata: { outcome, duration },
    });
    setShowEndModal(false);
    setScriptState({ status: 'idle' });
    setCurrentStep(0);
    if (onClose) onClose();
  }, [prospect.id, addNote, moveProspectToStage, addActivity, onClose]);

  // Initial Empty State
  if (scriptState.status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-full text-center">
        <div className="w-20 h-20 bg-[var(--gold-glow)] rounded-full flex items-center justify-center mb-6 border border-[var(--border-gold)] shadow-[0_0_50px_rgba(201,168,76,0.15)]">
          <Phone className="w-8 h-8 text-[var(--gold-500)]" />
        </div>
        <h2 className="text-3xl font-display text-[var(--text-primary)] mb-4">Cockpit d'Appel</h2>
        <p className="text-[var(--text-secondary)] font-body max-w-md mb-8">
          Préparez-vous à contacter <span className="text-[var(--gold-500)] font-bold">{prospect.contactName}</span> de l'entreprise {prospect.companyName}.
        </p>
        <button
          onClick={generateScript}
          className="px-8 py-4 bg-[var(--gold-500)] text-[#0A0A0F] font-bold uppercase tracking-widest rounded-xl hover:bg-[var(--gold-400)] transition-colors shadow-[0_0_30px_rgba(201,168,76,0.2)]"
        >
          Générer le script IA & Démarrer
        </button>
      </div>
    );
  }

  // Loading State
  if (scriptState.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="w-12 h-12 text-[var(--gold-500)] animate-spin-gpu" />
        <div className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-widest mt-4">
          Génération du script sur-mesure...
        </div>
      </div>
    );
  }

  // Error State
  if (scriptState.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-[var(--danger)] mb-4" />
        <h3 className="text-xl font-display text-[var(--text-primary)]">Erreur de l'IA</h3>
        <p className="text-[var(--text-secondary)]">{scriptState.error}</p>
        <button
          onClick={generateScript}
          className="mt-6 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-sm font-bold uppercase tracking-wider"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Success State
  const script = scriptState.data;

  return (
    <div className="fixed inset-0 z-[200] flex bg-[var(--bg-void)] font-body">
      {/* LEFT COL: Prospect Info & Audit */}
      <div className="w-80 border-r border-[var(--border-default)] bg-[var(--bg-primary)] p-6 flex flex-col justify-between">
        <div>
          <button
            onClick={() => {
              if (onClose) onClose();
              else setScriptState({ status: 'idle' });
            }}
            className="mb-6 flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest"
          >
            ← Retour
          </button>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--gold-500)] to-[#8C733F] flex items-center justify-center text-xl font-display font-bold text-[#0A0A0F] shadow-lg">
              {prospect.contactName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{prospect.contactName}</h2>
              <p className="text-xs text-[var(--text-secondary)]">{prospect.companyName}</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Lighthouse Circular Score */}
            {prospect.lighthouseScore !== undefined && (
              <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex flex-col items-center">
                <div className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-4">Score Lighthouse</div>
                <CircularScore score={prospect.lighthouseScore} size={100} strokeWidth={6} />
              </div>
            )}

            {/* Monthly Loss */}
            {prospect.estimatedLoss !== undefined && (
              <div className="p-5 rounded-2xl bg-[var(--danger)]/5 border border-[var(--danger)]/10">
                <div className="text-[10px] uppercase tracking-widest text-[var(--danger)] mb-2 font-bold">Pertes Estimées</div>
                <div className="text-3xl font-display text-[var(--danger)]">
                  {prospect.estimatedLoss.toLocaleString('fr-FR')} €<span className="text-sm">/mois</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <Phone className="w-4 h-4 text-[var(--gold-500)]" />
                <span>{prospect.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <Target className="w-4 h-4 text-[var(--gold-500)]" />
                <span className="capitalize">{prospect.niche || prospect.sector}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Twilio Error / Notice */}
        {twilioError && (
          <div className="p-3 bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-xl flex items-start gap-2 mt-6">
            <AlertCircle className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[var(--danger)] font-bold">{twilioError}</p>
          </div>
        )}
      </div>

      {/* MIDDLE COL: Call Controls & Script */}
      <div className="flex-1 flex flex-col bg-[var(--bg-surface)]">
        {/* Call Status Bar */}
        <div className="h-24 border-b border-[var(--border-default)] bg-[var(--bg-primary)] px-8 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-6">
            <CallTimer isActive={isCallActive} onTick={(s) => { callElapsedRef.current = s; }} />
            <div className="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest" style={{
              background: isCallActive ? 'var(--success)' : 'rgba(255,255,255,0.05)',
              color: isCallActive ? '#000' : 'var(--text-secondary)'
            }}>
              {isCallActive ? 'En Ligne' : 'Prêt à appeler'}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isCallActive ? (
              <>
                <button
                  onClick={() => setMuted(!isMuted)}
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                  style={{
                    background: isMuted ? 'rgba(224,82,82,0.1)' : 'var(--bg-elevated)',
                    border: `1px solid ${isMuted ? 'rgba(224,82,82,0.3)' : 'var(--border-default)'}`
                  }}
                >
                  {isMuted ? <MicOff className="w-5 h-5 text-[var(--danger)]" /> : <Mic className="w-5 h-5 text-[var(--text-primary)]" />}
                </button>
                <button
                  onClick={handleEndCall}
                  className="px-6 py-3 bg-[var(--danger)] hover:bg-red-600 text-white font-bold uppercase tracking-wider rounded-xl transition-colors shadow-lg flex items-center gap-2"
                >
                  <PhoneOff className="w-4 h-4" /> Terminer
                </button>
              </>
            ) : (
              <button
                onClick={handleStartCall}
                className="px-6 py-3 bg-[var(--success)] hover:bg-green-500 text-black font-bold uppercase tracking-wider rounded-xl transition-colors shadow-[0_0_20px_rgba(82,201,138,0.3)] flex items-center gap-2"
              >
                <Phone className="w-4 h-4" /> Démarrer l'appel
              </button>
            )}
          </div>
        </div>

        {/* Script Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display text-[var(--text-primary)]">Script d'Appel (Généré par IA)</h3>
              <button
                onClick={generateScript}
                className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--gold-500)] flex items-center gap-1 uppercase tracking-widest font-bold transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Regénérer
              </button>
            </div>
            <ScriptSteps script={script} activeStepIndex={currentStep} onStepChange={setCurrentStep} />
          </div>
        </div>
      </div>

      {/* RIGHT COL (Trigger) / Drawer */}
      <div className="w-16 border-l border-[var(--border-default)] bg-[var(--bg-primary)] flex flex-col items-center py-6">
        <button
          onClick={() => setIsObjectionDrawerOpen(true)}
          className="w-12 h-12 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 hover:bg-[var(--danger)]/20 flex flex-col items-center justify-center gap-1 transition-colors relative group"
        >
          <ShieldAlert className="w-5 h-5 text-[var(--danger)]" />
          <span className="absolute right-14 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[10px] font-bold text-[var(--text-primary)] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest">
            Objections
          </span>
        </button>
      </div>

      <ObjectionDrawer
        isOpen={isObjectionDrawerOpen}
        onClose={() => setIsObjectionDrawerOpen(false)}
        objections={script.objections || []}
      />

      <CallEndModal
        isOpen={showEndModal}
        callDuration={callElapsedRef.current}
        prospectName={prospect.contactName}
        onSave={handleSaveBilan}
        onCancel={() => { setShowEndModal(false); setCallActive(false); }}
      />
    </div>
  );
});

CallHUD.displayName = 'CallHUD';
