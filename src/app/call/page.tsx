"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, Phone, Mic, MicOff, Pause, PhoneOff, ChevronRight, CheckCircle,
  X, Calendar, Send, Clock, Search,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/custom/GlassPanel';
import { CallTimer } from '@/components/ui/custom/CallTimer';
import { AnimatedButton } from '@/components/ui/custom/AnimatedButton';
import { useCallStore } from '@/hooks/useCallStore';
import { useUIStore } from '@/hooks/useUIStore';
import { mockProspects, mockObjections } from '@/data/prospects';

/* ─── Pre-Call State ─── */
function PreCallState({ onStartCall }: { onStartCall: (p: typeof mockProspects[0]) => void }) {
  const [selectedProspect, setSelectedProspect] = useState(mockProspects[0]);
  const [ripples, setRipples] = useState<{ id: number }[]>([]);
  const rippleId = useRef(0);

  const handleDial = () => {
    // Create ripple effect
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        setRipples((prev) => [...prev, { id: ++rippleId.current }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== rippleId.current - 2 + i));
        }, 800);
      }, i * 150);
    }
    setTimeout(() => onStartCall(selectedProspect), 600);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-56px)] px-6">
      <motion.div
        className="w-full max-w-[480px]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.55)]" />
            <select
              className="w-full h-12 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.06)] pl-10 pr-4 font-body text-[15px] text-[#e8e4dc] appearance-none cursor-pointer focus:outline-none focus:border-[rgba(197,160,89,0.25)]"
              value={selectedProspect.id}
              onChange={(e) => {
                const p = mockProspects.find((mp) => mp.id === e.target.value);
                if (p) setSelectedProspect(p);
              }}
            >
              {mockProspects.filter((p) => p.scriptReady).map((p) => (
                <option key={p.id} value={p.id} className="bg-[#11111a] text-[#e8e4dc]">
                  {p.name} — {p.company}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Prospect Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
        >
          <GlassPanel className="p-5">
            <p className="text-[18px] font-body font-semibold text-[#e8e4dc]">{selectedProspect.name}</p>
            <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)]">{selectedProspect.url}</p>
            <div className="flex items-center justify-between mt-4">
              <span
                className="text-[36px] font-body font-normal tracking-[-0.02em]"
                style={{
                  color: selectedProspect.score >= 70 ? '#4ade80' : selectedProspect.score >= 40 ? '#60a5fa' : '#f87171',
                }}
              >
                L: {selectedProspect.score}
              </span>
              <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] px-2.5 py-1 rounded-full bg-[rgba(74,222,128,0.10)] text-[#4ade80]">
                Script IA pret
              </span>
            </div>
          </GlassPanel>
        </motion.div>

        {/* Dial Button */}
        <motion.div
          className="flex flex-col items-center mt-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative">
            {ripples.map((r) => (
              <motion.div
                key={r.id}
                className="absolute inset-0 rounded-full border-2 border-[#4ade80]"
                initial={{ scale: 0, opacity: 0.4 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            ))}
            <motion.button
              onClick={handleDial}
              className="relative w-[72px] h-[72px] rounded-full bg-[#4ade80] flex items-center justify-center cursor-pointer shadow-[0_0_12px_rgba(74,222,128,0.2)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone size={28} className="text-white" />
            </motion.button>
          </div>
          <p className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)] mt-3">
            Appeler
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ─── Call Status Bar ─── */
function CallStatusBar() {
  const { prospect, elapsedSeconds, isMuted, toggleMute, isHeld, toggleHold, endCall } = useCallStore();

  return (
    <div className="sticky top-14 h-16 px-6 flex items-center justify-between bg-[#0a0a12] border-b border-[rgba(197,160,89,0.25)] z-30">
      <div>
        <p className="text-[15px] font-body font-semibold text-[#e8e4dc]">
          {prospect?.name} — {prospect?.company}
        </p>
        <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)]">{prospect?.url}</p>
      </div>

      <CallTimer seconds={elapsedSeconds} size="lg" color="#c5a059" />

      <div className="flex items-center gap-3">
        <motion.button
          onClick={toggleMute}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            isMuted ? 'bg-[rgba(248,113,113,0.10)]' : 'bg-[#11111a]'
          }`}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          {isMuted ? <MicOff size={18} className="text-[#f87171]" /> : <Mic size={18} className="text-[#e8e4dc]" />}
        </motion.button>
        <motion.button
          onClick={toggleHold}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            isHeld ? 'bg-[rgba(96,165,250,0.10)]' : 'bg-[#11111a]'
          }`}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          <Pause size={18} className={isHeld ? 'text-[#60a5fa]' : 'text-[#e8e4dc]'} />
        </motion.button>
        <motion.button
          onClick={endCall}
          className="w-11 h-11 rounded-full bg-[#f87171] flex items-center justify-center cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
        >
          <PhoneOff size={18} className="text-white" />
        </motion.button>
      </div>
    </div>
  );
}

/* ─── ScriptReaderPanel ─── */
function ScriptReaderPanel() {
  const { currentPhase, completedPhases, advancePhase, jumpToPhase, scriptLoading, script, rawScript } = useCallStore();

  const phases = script?.steps || [];
  const phase = phases[currentPhase] || null;

  return (
    <GlassPanel variant="gold-accent" className="p-6 flex flex-col h-full min-h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[rgba(255,255,255,0.06)]">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[18px] font-body font-semibold text-[#e8e4dc]">Script de vente</p>
            {scriptLoading && <Loader2 size={14} className="animate-spin text-[#c5a059]" />}
          </div>
          <p className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.30)] mt-0.5">
            Genere par Claude 3.5
          </p>
        </div>
        <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[#c5a059]">
          Phase {currentPhase + 1}/{phases.length || 6}
        </span>
      </div>

      {/* Phase content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {!script && scriptLoading ? (
          <div className="py-4">
            <p className="text-[13px] font-body font-medium uppercase tracking-[0.1em] text-[#c5a059] mb-4 flex items-center gap-2">
              <Sparkles size={14} /> Generation en cours...
            </p>
            <p className="text-[14px] font-body text-[rgba(232,228,220,0.55)] leading-relaxed whitespace-pre-wrap font-mono">
              {rawScript}
            </p>
          </div>
        ) : phase ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {completedPhases.map((cp) => (
                <div
                  key={cp}
                  className="flex items-center gap-3 py-2 cursor-pointer opacity-50 hover:opacity-75 transition-opacity"
                  onClick={() => jumpToPhase(cp)}
                >
                  <span className="w-6 h-6 rounded-full bg-[#11111a] text-[11px] font-body font-medium flex items-center justify-center text-[rgba(232,228,220,0.55)]">
                    {cp + 1}
                  </span>
                  <span className="text-[13px] font-body text-[rgba(232,228,220,0.55)]">
                    {phases[cp]?.label || 'Phase termin\u00e9e'}
                  </span>
                </div>
              ))}

              <div className="py-4" style={{ boxShadow: 'inset 2px 0 0 #c5a059, 0 0 20px rgba(197, 160, 89, 0.05)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-6 h-6 rounded-full bg-[#c5a059] text-[11px] font-body font-semibold flex items-center justify-center text-[#0a0a12]">
                    {phase.id}
                  </span>
                  <h3 className="text-[18px] font-body font-semibold text-[#e8e4dc]">
                    {phase.label}
                  </h3>
                </div>
                <p className="text-[15px] font-body text-[#e8e4dc] leading-[1.7] whitespace-pre-line">
                  {phase.script}
                </p>
                
                {phase.tip && (
                  <div className="mt-4 p-3 rounded-[8px] bg-[rgba(197,160,89,0.05)] border border-[rgba(197,160,89,0.15)] flex items-start gap-2">
                    <CheckCircle size={14} className="text-[#c5a059] mt-0.5 flex-shrink-0" />
                    <span className="text-[13px] font-body text-[rgba(232,228,220,0.7)]">{phase.tip}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="py-4 text-center">
            <p className="text-[14px] font-body text-[rgba(232,228,220,0.55)]">Erreur de chargement du script</p>
          </div>
        )}
      </div>

      {/* Phase dots + advance */}
      <div className="pt-4 mt-4 border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-center gap-2 mb-4">
          {(phases.length > 0 ? phases : Array(6).fill(null)).map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => completedPhases.includes(i) && jumpToPhase(i)}
              disabled={!script}
              className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                i === currentPhase
                  ? 'bg-[#c5a059]'
                  : completedPhases.includes(i)
                  ? 'bg-[#4ade80]'
                  : 'border border-[rgba(255,255,255,0.10)] bg-transparent'
              }`}
            />
          ))}
        </div>
        <AnimatedButton
          variant={currentPhase >= phases.length - 1 ? 'primary' : 'secondary'}
          onClick={advancePhase}
          icon={currentPhase >= phases.length - 1 ? <CheckCircle size={16} /> : <ChevronRight size={16} />}
          fullWidth
          disabled={!script}
        >
          {currentPhase >= phases.length - 1 ? 'Terminer l\'appel' : 'Phase suivante'}
        </AnimatedButton>
      </div>
    </GlassPanel>
  );
}

// Objections panel is not modified for size limits

/* ─── Objection Panel ─── */
function ObjectionPanel() {
  const { script } = useCallStore();
  const [activeObjection, setActiveObjection] = useState<string | null>(null);
  const objections = script?.objections || mockObjections;
  const activeObj = objections.find((o: any) => o.trigger === activeObjection || o.id === activeObjection);

  return (
    <GlassPanel className="p-5 flex flex-col h-full min-h-[400px] relative overflow-hidden">
      <div className="mb-4">
        <p className="text-[18px] font-body font-semibold text-[#e8e4dc]">Objections & Reponses</p>
        <p className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.30)] mt-0.5">
          Cliquez sur une objection pour voir la reponse preparee
        </p>
      </div>

      {/* Objection grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto flex-1">
        {objections.map((obj: any, i: number) => (
          <motion.div
            key={obj.trigger || obj.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <motion.button
              onClick={() => setActiveObjection(obj.trigger || obj.id)}
              className="w-full text-left p-3.5 rounded-[10px] bg-[rgba(17,17,26,0.7)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(197,160,89,0.25)] hover:shadow-glass transition-all cursor-pointer"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <span
                className="inline-block text-[11px] font-body font-medium uppercase tracking-[0.06em] px-2 py-0.5 rounded-full mb-1.5"
                style={{
                  backgroundColor: 'rgba(96, 165, 250, 0.10)',
                  color: '#60a5fa',
                }}
              >
                {obj.category}
              </span>
              <p className="text-[13px] font-body text-[#e8e4dc]">{obj.label}</p>
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Response drawer */}
      <AnimatePresence>
        {activeObj && (
          <>
            <motion.div
              className="absolute inset-0 bg-[rgba(5,5,9,0.3)] z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActiveObjection(null)}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-20 p-5 bg-[rgba(24,24,36,0.95)] border-t border-[rgba(255,255,255,0.10)] rounded-t-[14px] backdrop-blur-[20px]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={() => setActiveObjection(null)}
                className="absolute top-3 right-3 text-[rgba(232,228,220,0.55)] hover:text-[#e8e4dc] transition-colors"
              >
                <X size={18} />
              </button>
              <span
                className="inline-block text-[11px] font-body font-medium uppercase tracking-[0.06em] px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(96, 165, 250, 0.10)',
                  color: '#60a5fa',
                }}
              >
                {activeObj.category}
              </span>
              <h4 className="text-[18px] font-body font-semibold text-[#e8e4dc] mt-2">
                {activeObj.label}
              </h4>
              <p className="text-[15px] font-body text-[#e8e4dc] leading-[1.7] whitespace-pre-line mt-3">
                {activeObj.response}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[#c5a059]">
                  Pivot : {activeObj.pivot}
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}

/* ─── Outcome Modal ─── */
function OutcomeModal({ onClose }: { onClose: () => void }) {
  const { elapsedSeconds, setOutcome } = useCallStore();
  const { addToast } = useUIStore();
  const router = useRouter();
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const outcomes = [
    { id: 'rdv', label: 'Rendez-vous', icon: Calendar, color: '#4ade80', bg: 'rgba(74,222,128,0.10)' },
    { id: 'prototype', label: 'Prototype envoye', icon: Send, color: '#c5a059', bg: 'rgba(197,160,89,0.15)' },
    { id: 'rappeler', label: 'A rappeler', icon: Clock, color: '#60a5fa', bg: 'rgba(96,165,250,0.10)' },
    { id: 'perdu', label: 'Perdu', icon: X, color: '#f87171', bg: 'rgba(248,113,113,0.10)' },
  ];

  const handleSave = () => {
    if (selectedOutcome) {
      setOutcome(selectedOutcome as 'rdv' | 'prototype' | 'rappeler' | 'perdu');
      addToast({ type: 'success', message: 'Appel enregistre — Prospect mis a jour' });
      onClose();
      setTimeout(() => router.push('/crm'), 1500);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-[rgba(5,5,9,0.7)] backdrop-blur-[8px]" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-[440px] p-8 rounded-[14px] bg-[rgba(24,24,36,0.95)] border border-[rgba(255,255,255,0.10)] shadow-modal backdrop-blur-[20px]"
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <h2 className="font-display text-[32px] font-normal text-[#e8e4dc]">Resultat de l&apos;appel</h2>
        <p className="text-[15px] font-body text-[rgba(232,228,220,0.55)] mt-1">
          Duree : {Math.floor(elapsedSeconds / 60)} min {elapsedSeconds % 60} s
        </p>

        {/* Outcome grid */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {outcomes.map((out) => {
            const Icon = out.icon;
            return (
              <button
                key={out.id}
                onClick={() => setSelectedOutcome(out.id)}
                className={`p-4 rounded-[10px] border text-center transition-all cursor-pointer ${
                  selectedOutcome === out.id
                    ? 'border-[rgba(255,255,255,0.20)]'
                    : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.10)]'
                }`}
                style={
                  selectedOutcome === out.id
                    ? { borderColor: out.color, backgroundColor: out.bg }
                    : undefined
                }
              >
                <Icon size={24} style={{ color: out.color }} className="mx-auto" />
                <p className="text-[13px] font-body text-[#e8e4dc] mt-2">{out.label}</p>
              </button>
            );
          })}
        </div>

        {/* Notes */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes de l'appel..."
          className="w-full mt-4 min-h-[80px] p-3 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.06)] text-[13px] font-body text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.30)] resize-vertical focus:outline-none focus:border-[rgba(197,160,89,0.25)]"
        />

        <AnimatedButton
          variant="primary"
          fullWidth
          className="mt-4"
          onClick={handleSave}
        >
          Enregistrer dans le CRM
        </AnimatedButton>
      </motion.div>
    </motion.div>
  );
}

/* ─── Call Page ─── */
export default function Call() {
  const { isActive, startCall, endCall, resetCall } = useCallStore();
  const [showOutcome, setShowOutcome] = useState(false);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      useCallStore.getState().incrementTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch script via SSE
  const { prospect, script, scriptLoading } = useCallStore();
  useEffect(() => {
    let active = true;
    if (prospect && !script && scriptLoading) {
      const fetchScript = async () => {
        try {
          const res = await fetch('/api/call/script', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prospectId: prospect.id,
              companyName: prospect.company,
              contactName: prospect.name,
              niche: prospect.sector,
              city: 'Paris',
              country: 'France',
              lighthouseScore: prospect.score,
              website: prospect.url,
              phone: prospect.phone,
            })
          });
          
          if (!res.body) throw new Error('No body');
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          
          let done = false;
          let accumulatedRaw = '';
          
          while (!done && active) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            if (value) {
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const dataStr = line.slice(6);
                  if (dataStr === '[DONE]') {
                    done = true;
                    break;
                  }
                  try {
                    const parsed = JSON.parse(dataStr);
                    if (parsed.text) {
                      accumulatedRaw += parsed.text;
                      useCallStore.getState().appendRawScript(parsed.text);
                    } else if (parsed.steps) {
                      // Fallback JSON object
                      useCallStore.getState().setScript(parsed);
                      return;
                    }
                  } catch(e) {}
                }
              }
            }
          }
          
          if (active) {
            try {
              const cleanedRaw = accumulatedRaw.trim();
              const startIdx = cleanedRaw.indexOf('{');
              const endIdx = cleanedRaw.lastIndexOf('}');
              if (startIdx !== -1 && endIdx !== -1) {
                  const json = JSON.parse(cleanedRaw.substring(startIdx, endIdx + 1));
                  useCallStore.getState().setScript(json);
              }
            } catch(e) {
               console.error("Failed to parse streamed JSON", e);
            }
            useCallStore.getState().setScriptLoading(false);
          }
        } catch (err) {
          if (active) useCallStore.getState().setScriptLoading(false);
        }
      };
      fetchScript();
    }
    return () => { active = false; };
  }, [prospect, script, scriptLoading]);

  const handleStartCall = (p: typeof mockProspects[0]) => {
    startCall(p);
  };

  const handleEndCall = () => {
    endCall();
    setShowOutcome(true);
  };

  const handleCloseOutcome = () => {
    setShowOutcome(false);
    resetCall();
  };

  if (!isActive) {
    return <PreCallState onStartCall={handleStartCall} />;
  }

  return (
    <div>
      {/* Override endCall to show outcome modal */}
      <div className="pointer-events-none">
        <CallStatusBar />
      </div>
      {/* Re-render status bar with correct endCall */}
      <CustomStatusBar onEndCall={handleEndCall} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5 p-5 min-h-[calc(100dvh-120px)]">
        <ScriptReaderPanel />
        <ObjectionPanel />
      </div>

      <AnimatePresence>
        {showOutcome && <OutcomeModal onClose={handleCloseOutcome} />}
      </AnimatePresence>
    </div>
  );
}

/* Status bar wrapper to inject custom endCall */
function CustomStatusBar({ onEndCall }: { onEndCall: () => void }) {
  const { prospect, elapsedSeconds, isMuted, toggleMute, isHeld, toggleHold } = useCallStore();

  return (
    <div className="sticky top-14 h-16 px-4 sm:px-6 flex items-center justify-between bg-[#0a0a12] border-b border-[rgba(197,160,89,0.25)] z-30">
      <div className="min-w-0 flex-1 mr-4">
        <p className="text-[15px] font-body font-semibold text-[#e8e4dc] truncate">
          {prospect?.name} — {prospect?.company}
        </p>
        <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)] truncate">{prospect?.url}</p>
      </div>

      <div className="flex-shrink-0 mx-4 hidden sm:block">
        <CallTimer seconds={elapsedSeconds} size="lg" color="#c5a059" />
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <span className="sm:hidden text-[13px] font-body tabular-nums text-[#c5a059]">
          {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:
          {(elapsedSeconds % 60).toString().padStart(2, '0')}
        </span>
        <motion.button
          onClick={toggleMute}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            isMuted ? 'bg-[rgba(248,113,113,0.10)]' : 'bg-[#11111a]'
          }`}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          {isMuted ? <MicOff size={16} className="text-[#f87171]" /> : <Mic size={16} className="text-[#e8e4dc]" />}
        </motion.button>
        <motion.button
          onClick={toggleHold}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            isHeld ? 'bg-[rgba(96,165,250,0.10)]' : 'bg-[#11111a]'
          }`}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          <Pause size={16} className={isHeld ? 'text-[#60a5fa]' : 'text-[#e8e4dc]'} />
        </motion.button>
        <motion.button
          onClick={onEndCall}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f87171] flex items-center justify-center cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
        >
          <PhoneOff size={16} className="text-white" />
        </motion.button>
      </div>
    </div>
  );
}
