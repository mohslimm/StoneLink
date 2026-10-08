"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Phone, Globe, Mail, Send, Save, CheckCircle2, 
  Sparkles, AlertCircle, Clock, Check, ChevronRight,
  MessageSquare, User, Building, MapPin, Zap, ArrowRight,
  RotateCcw, ThumbsUp, ThumbsDown, Wand2, Loader2
} from 'lucide-react';
import type { Prospect, PipelineStage } from '@/types';
import { 
  FollowUpStep, 
  ReactionType, 
  REACTION_CONFIG, 
  STEP_NAMES, 
  FOLLOW_UP_SCRIPTS,
  getSmartFollowUpScript,
  parseLeadFollowUp, 
  serializeLeadNotes,
  extractCleanNoteText,
  LeadFollowUpData,
  FollowUpRecord
} from '@/lib/followup';
import { buildWhatsAppUrl, openWhatsAppDirect, formatPhoneForWhatsApp, generateWhatsAppAiMessage } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

interface NeuralScribeDrawerProps {
  prospect: Prospect;
  onClose: () => void;
  onSaveFollowUp: (prospectId: string, updatedNotes: string) => Promise<void>;
  onUpdateStage: (prospectId: string, stage: PipelineStage) => Promise<void>;
}

export function NeuralScribeDrawer({
  prospect,
  onClose,
  onSaveFollowUp,
  onUpdateStage,
}: NeuralScribeDrawerProps) {
  const [followUpData, setFollowUpData] = useState<LeadFollowUpData>(() => parseLeadFollowUp(prospect));
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(null);
  const [verbatimText, setVerbatimText] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'call' | 'audio_note' | 'email'>('whatsapp');
  const [scriptLanguage, setScriptLanguage] = useState<'fr' | 'darija'>('fr');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editableScript, setEditableScript] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Sync state whenever prospect prop changes
  useEffect(() => {
    if (prospect) {
      const parsed = parseLeadFollowUp(prospect);
      setFollowUpData(parsed);
      setSelectedReaction(parsed.primaryObjection || null);
      const lastHistory = parsed.history[parsed.history.length - 1];
      setVerbatimText(lastHistory?.verbatim || '');

      const delayDays = parsed.currentStep === 0
        ? (parsed.daysSincePrototype ?? 0)
        : Math.max(parsed.daysSinceLastAction ?? 0, parsed.daysSincePrototype ?? 0);

      const initialScript = getSmartFollowUpScript(
        parsed.currentStep,
        prospect,
        scriptLanguage,
        parsed.primaryObjection || undefined,
        delayDays
      );
      setEditableScript(initialScript);
    }
  }, [prospect]);

  // Recalculate script when step, language or reaction changes (if not actively customized)
  useEffect(() => {
    if (prospect) {
      const delayDays = followUpData.currentStep === 0
        ? (followUpData.daysSincePrototype ?? 0)
        : Math.max(followUpData.daysSinceLastAction ?? 0, followUpData.daysSincePrototype ?? 0);

      const script = getSmartFollowUpScript(
        followUpData.currentStep,
        prospect,
        scriptLanguage,
        selectedReaction || undefined,
        delayDays
      );
      setEditableScript(script);
    }
  }, [followUpData.currentStep, followUpData.daysSincePrototype, followUpData.daysSinceLastAction, scriptLanguage, selectedReaction]);

  const currentMeta = STEP_NAMES[followUpData.currentStep];
  const reactionMeta = selectedReaction ? REACTION_CONFIG[selectedReaction] : null;

  const handleSendWhatsApp = () => {
    openWhatsAppDirect(prospect.phone, editableScript);
  };

  const handleGenerateWithAi = async () => {
    setIsGeneratingAi(true);
    try {
      const delayDays = followUpData.currentStep === 0
        ? (followUpData.daysSincePrototype ?? 0)
        : Math.max(followUpData.daysSinceLastAction ?? 0, followUpData.daysSincePrototype ?? 0);

      const generated = await generateWhatsAppAiMessage(
        prospect,
        'ultra_persuasive',
        undefined,
        undefined,
        {
          step: followUpData.currentStep,
          reaction: selectedReaction || undefined,
          verbatim: verbatimText.trim() || undefined,
          language: scriptLanguage,
          delayDays,
        }
      );
      if (generated) {
        setEditableScript(generated);
      }
    } catch (err) {
      console.warn('[NeuralScribeDrawer] AI generation error:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleStepChange = (newStep: FollowUpStep) => {
    setFollowUpData((prev) => ({
      ...prev,
      currentStep: newStep,
    }));
  };

  const handleSaveAndAdvance = async (advance: boolean = false) => {
    setIsSaving(true);
    try {
      const nextStep: FollowUpStep = advance
        ? (Math.min(3, followUpData.currentStep + 1) as FollowUpStep)
        : followUpData.currentStep;

      const newRecord: FollowUpRecord | null = selectedReaction || verbatimText.trim() ? {
        step: followUpData.currentStep,
        date: new Date().toISOString(),
        channel: selectedChannel,
        reaction: selectedReaction || 'other',
        verbatim: verbatimText.trim(),
      } : null;

      const updatedHistory = newRecord
        ? [...followUpData.history, newRecord]
        : followUpData.history;

      const actionDate = newRecord
        ? newRecord.date
        : (nextStep === 0 && updatedHistory.length === 0
            ? followUpData.prototypeSentAt
            : followUpData.lastActionAt);

      const updatedData: LeadFollowUpData = {
        ...followUpData,
        currentStep: nextStep,
        lastActionAt: actionDate,
        primaryObjection: selectedReaction || followUpData.primaryObjection,
        history: updatedHistory,
      };

      const baseText = extractCleanNoteText(prospect.notes);
      const serialized = serializeLeadNotes(baseText, updatedData);

      await onSaveFollowUp(prospect.id, serialized);
      setFollowUpData(updatedData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseDeal = async () => {
    await onUpdateStage(prospect.id, 'ferme');
    onClose();
  };

  const handleLoseDeal = async () => {
    await onUpdateStage(prospect.id, 'perdu');
    onClose();
  };

  const activeDelayDays = followUpData.currentStep === 0
    ? (followUpData.daysSincePrototype ?? 0)
    : Math.max(followUpData.daysSinceLastAction ?? 0, followUpData.daysSincePrototype ?? 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#040408]/80 backdrop-blur-[6px]"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-[560px] bg-[#0c0c16] border-l border-[rgba(197,160,89,0.25)] shadow-modal flex flex-col h-full z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-[rgba(255,255,255,0.08)] bg-[#0f0f1c]/70 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[rgba(168,85,247,0.15)] text-[#c084fc] border border-[rgba(168,85,247,0.3)]">
                  Cellule #{prospect.id.slice(-4)}
                </span>
                <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-full bg-[rgba(197,160,89,0.12)] text-[#c5a059] border border-[rgba(197,160,89,0.25)]">
                  {prospect.city || 'Algérie'}
                </span>
                {followUpData.urgency === 'today' && (
                  <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-full bg-[rgba(74,222,128,0.18)] text-[#4ade80] border border-[rgba(74,222,128,0.4)] font-bold animate-pulse">
                    ⚡ Relance Aujourd&apos;hui
                  </span>
                )}
              </div>

              <h2 className="font-display font-semibold text-[20px] text-[#e8e4dc] truncate">
                {prospect.company}
              </h2>
              <p className="text-[13px] font-body text-[rgba(232,228,220,0.6)] flex items-center gap-2 mt-0.5">
                <User size={13} className="text-[#c5a059]" />
                <span>{prospect.name}</span>
                {prospect.phone && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[#c5a059]">{prospect.phone}</span>
                  </>
                )}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#181826] hover:bg-[#252538] text-[rgba(232,228,220,0.55)] hover:text-[#e8e4dc] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Drawer Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {/* ─── 1. Synaptic Stepper (Où en sommes-nous ?) ─── */}
            <div className="p-4 rounded-[12px] bg-[#121220] border border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-body font-semibold uppercase tracking-wider text-[rgba(232,228,220,0.55)] flex items-center gap-1.5">
                  <Sparkles size={12} className="text-[#c5a059]" />
                  <span>Stade du Réseau Neuronal</span>
                </span>
                <span className="text-[11px] font-mono text-[#c5a059]">
                  {followUpData.daysSincePrototype}j depuis l&apos;envoi
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {([0, 1, 2, 3] as FollowUpStep[]).map((step) => {
                  const meta = STEP_NAMES[step];
                  const isActive = followUpData.currentStep === step;
                  const isDone = followUpData.currentStep > step;

                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => handleStepChange(step)}
                      className={cn(
                        "p-2 rounded-[8px] text-left transition-all border cursor-pointer relative",
                        isActive
                          ? "bg-[rgba(197,160,89,0.18)] border-[#c5a059] text-[#e8e4dc] shadow-[0_0_12px_rgba(197,160,89,0.2)]"
                          : isDone
                          ? "bg-[rgba(74,222,128,0.10)] border-[rgba(74,222,128,0.3)] text-[rgba(232,228,220,0.8)]"
                          : "bg-[#0e0e18] border-[rgba(255,255,255,0.05)] text-[rgba(232,228,220,0.4)] hover:border-[rgba(255,255,255,0.15)]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold">
                          {isDone ? '✓' : `#${step}`}
                        </span>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-ping" />}
                      </div>
                      <p className="font-body text-[11.5px] font-semibold mt-1 truncate">
                        {meta.title}
                      </p>
                      <p className="text-[9.5px] font-mono text-[rgba(232,228,220,0.45)] truncate">
                        {meta.daysTarget}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── 2. WhatsApp Outreach Dispatcher ─── */}
            <div className="p-4 rounded-[12px] bg-[#121220] border border-[rgba(255,255,255,0.06)] space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[rgba(34,197,94,0.15)] flex items-center justify-center text-[#4ade80]">
                    <Send size={13} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-body font-semibold text-[#e8e4dc]">
                      Message WhatsApp — {currentMeta.title}
                    </h4>
                    <p className="text-[11px] font-body text-[rgba(232,228,220,0.5)]">
                      Script ultra-personnalisé pour {prospect.company}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* AI Regenerate Button */}
                  <button
                    type="button"
                    onClick={handleGenerateWithAi}
                    disabled={isGeneratingAi}
                    className="px-2.5 py-1 rounded-[6px] bg-gradient-to-r from-[rgba(197,160,89,0.25)] to-[rgba(197,160,89,0.12)] hover:from-[rgba(197,160,89,0.35)] hover:to-[rgba(197,160,89,0.2)] border border-[rgba(197,160,89,0.35)] text-[#e8e4dc] text-[11px] font-body font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 size={12} className="animate-spin text-[#c5a059]" />
                        <span>Génération IA...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={12} className="text-[#c5a059]" />
                        <span>🪄 Générer avec l'IA</span>
                      </>
                    )}
                  </button>

                  {/* Language Switch */}
                  <div className="flex rounded-[6px] bg-[#0c0c16] p-0.5 border border-[rgba(255,255,255,0.08)]">
                    <button
                      type="button"
                      onClick={() => setScriptLanguage('fr')}
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-body font-medium rounded transition-colors cursor-pointer",
                        scriptLanguage === 'fr' ? "bg-[#c5a059] text-[#0a0a12]" : "text-[rgba(232,228,220,0.5)]"
                      )}
                    >
                      Français
                    </button>
                    <button
                      type="button"
                      onClick={() => setScriptLanguage('darija')}
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-body font-medium rounded transition-colors cursor-pointer",
                        scriptLanguage === 'darija' ? "bg-[#c5a059] text-[#0a0a12]" : "text-[rgba(232,228,220,0.5)]"
                      )}
                    >
                      🇩🇿 Darija
                    </button>
                  </div>
                </div>
              </div>

              {/* Strategic Time-Elapsed Milestone Badge */}
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-[7px] bg-[#0c0c16] border border-[rgba(255,255,255,0.06)] text-[11px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  {activeDelayDays >= 14 ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping shrink-0" />
                      <span className="font-medium text-[#fca5a5] truncate">
                        🎯 Scénario J+{activeDelayDays} : Rupture & Clôture (2 sem.+)
                      </span>
                    </>
                  ) : activeDelayDays >= 7 ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#a855f7] shrink-0" />
                      <span className="font-medium text-[#d8b4fe] truncate">
                        💼 Scénario J+{activeDelayDays} : Priorité Secteur & Rush (1 sem.)
                      </span>
                    </>
                  ) : activeDelayDays >= 3 ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#3b82f6] shrink-0" />
                      <span className="font-medium text-[#93c5fd] truncate">
                        ⚡ Scénario J+{activeDelayDays} : Empathie Semaine Chargée (3-6j)
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#22c55e] shrink-0" />
                      <span className="font-medium text-[#86efac] truncate">
                        ✨ Scénario J+{activeDelayDays} : Suivi Doux Mobile (24-48h)
                      </span>
                    </>
                  )}
                </div>
                <span className="text-[10px] text-[rgba(232,228,220,0.4)] font-mono shrink-0 ml-2">
                  {followUpData.currentStep === 0 ? "Prototype envoyé" : `Relance #${followUpData.currentStep}`}
                </span>
              </div>

              {/* Editable Message Textarea */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10.5px] font-body text-[rgba(232,228,220,0.45)] px-0.5">
                  <span>Message prêt avec emojis (modifiable à volonté) :</span>
                  <span>{editableScript.length} caractères</span>
                </div>
                <textarea
                  value={editableScript}
                  onChange={(e) => setEditableScript(e.target.value)}
                  rows={6}
                  placeholder="Génération du message WhatsApp..."
                  className="w-full p-3 rounded-[8px] bg-[#0a0a12] border border-[rgba(255,255,255,0.08)] focus:border-[#c5a059] text-[12px] font-body text-[#e8e4dc] leading-relaxed resize-y focus:outline-none transition-colors custom-scrollbar"
                />
              </div>

              {/* WhatsApp Launch Button */}
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full h-10 rounded-[10px] bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white font-body font-semibold text-[13px] flex items-center justify-center gap-2 shadow-[0_2px_14px_rgba(34,197,94,0.3)] transition-all cursor-pointer"
              >
                <Send size={15} />
                <span>Ouvrir WhatsApp Web / Mobile avec ce message</span>
              </button>
            </div>

            {/* ─── 3. Data Entry : Saisie de la réaction du client ─── */}
            <div className="p-4 rounded-[12px] bg-[#121220] border border-[rgba(197,160,89,0.22)] shadow-glass space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[13.5px] font-body font-semibold text-[#c5a059] flex items-center gap-1.5">
                    <span>Saisie Diagnostic & Réaction Client</span>
                  </h4>
                  <p className="text-[11.5px] font-body text-[rgba(232,228,220,0.5)]">
                    Identifiez ce que le client a répondu pour détecter les faiblesses
                  </p>
                </div>
                <span className="text-[10.5px] font-mono text-[rgba(232,228,220,0.4)]">
                  Canal : WhatsApp
                </span>
              </div>

              {/* Grid of Objection Chips */}
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((type) => {
                  const item = REACTION_CONFIG[type];
                  const isPicked = selectedReaction === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedReaction(isPicked ? null : type)}
                      className={cn(
                        "p-2.5 rounded-[8px] text-left transition-all border flex items-center gap-2 cursor-pointer",
                        isPicked
                          ? "bg-[rgba(197,160,89,0.2)] border-[#c5a059] text-[#e8e4dc] shadow-[0_0_12px_rgba(197,160,89,0.2)] font-medium"
                          : "bg-[#0d0d18] border-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.7)] hover:border-[rgba(255,255,255,0.18)]"
                      )}
                    >
                      <span className="text-[15px] shrink-0">{item.emoji}</span>
                      <span className="text-[11.5px] font-body truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Strategy AI Closing Advice Box */}
              {reactionMeta && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 rounded-[8px] bg-[rgba(197,160,89,0.08)] border border-[rgba(197,160,89,0.25)] space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-body font-semibold text-[#c5a059]">
                    <Sparkles size={12} />
                    <span>Conseil Stratégique StoneLink ({reactionMeta.label})</span>
                  </div>
                  <p className="text-[11.5px] font-body text-[rgba(232,228,220,0.85)] leading-relaxed">
                    {reactionMeta.recommendedCounterTip}
                  </p>
                </motion.div>
              )}

              {/* Freeform Verbatim Text */}
              <div className="space-y-1.5">
                <label className="text-[11.5px] font-body font-medium text-[rgba(232,228,220,0.7)]">
                  Notes détaillées / Ce que le client a dit exactement :
                </label>
                <textarea
                  value={verbatimText}
                  onChange={(e) => setVerbatimText(e.target.value)}
                  placeholder="Ex : 'Il a adoré le design mais son associé rentre de voyage mardi. Rappeler mercredi matin avec devis Omra.'"
                  rows={3}
                  className="w-full p-3 rounded-[8px] bg-[#0c0c16] border border-[rgba(255,255,255,0.08)] text-[12.5px] font-body text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.3)] focus:outline-none focus:border-[#c5a059] transition-colors"
                />
              </div>

              {/* Save Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSaveAndAdvance(false)}
                  disabled={isSaving}
                  className="flex-1 h-10 rounded-[8px] bg-[#1a1a2b] hover:bg-[#25253d] border border-[rgba(255,255,255,0.1)] text-[#e8e4dc] text-[12px] font-body font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save size={14} className="text-[#c5a059]" />
                  <span>Enregistrer la note</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveAndAdvance(true)}
                  disabled={isSaving || followUpData.currentStep >= 3}
                  className="flex-1 h-10 rounded-[8px] bg-gradient-to-r from-[#B8924A] via-[#c5a059] to-[#D4B57A] text-[#1A1200] font-body font-semibold text-[12px] flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] active:scale-95 shadow-[0_2px_14px_rgba(197,160,89,0.3)] cursor-pointer disabled:opacity-50"
                >
                  <span>Valider & Étape suivante</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {saveSuccess && (
                <div className="p-2 rounded bg-[rgba(74,222,128,0.15)] border border-[rgba(74,222,128,0.3)] text-[#4ade80] text-[11.5px] font-body text-center flex items-center justify-center gap-1.5">
                  <Check size={13} />
                  <span>Données de relance synchronisées avec succès !</span>
                </div>
              )}
            </div>

            {/* ─── 4. Pipeline Closing Actions ─── */}
            <div className="p-4 rounded-[12px] bg-[#121220] border border-[rgba(255,255,255,0.06)] space-y-3">
              <h4 className="text-[12.5px] font-body font-semibold text-[rgba(232,228,220,0.7)] uppercase tracking-wider">
                Sortie du Laboratoire de Closing
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseDeal}
                  className="h-10 px-3 rounded-[8px] bg-[rgba(74,222,128,0.15)] hover:bg-[rgba(74,222,128,0.25)] border border-[rgba(74,222,128,0.4)] text-[#4ade80] text-[12px] font-body font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ThumbsUp size={14} />
                  <span>Client Signé (Fermé) 🎉</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoseDeal}
                  className="h-10 px-3 rounded-[8px] bg-[rgba(239,68,68,0.12)] hover:bg-[rgba(239,68,68,0.22)] border border-[rgba(239,68,68,0.35)] text-[#f87171] text-[12px] font-body font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ThumbsDown size={14} />
                  <span>Perdu / Non retenu</span>
                </button>
              </div>
            </div>

            {/* ─── 5. Interaction History ─── */}
            {followUpData.history.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[12px] font-body font-semibold uppercase tracking-wider text-[rgba(232,228,220,0.5)]">
                  Historique Chronologique des Relances ({followUpData.history.length})
                </h4>
                <div className="space-y-2">
                  {followUpData.history.map((rec, idx) => {
                    const reactionInfo = REACTION_CONFIG[rec.reaction];
                    const dateObj = new Date(rec.date);
                    const dateStr = isNaN(dateObj.getTime()) ? '' : `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-[8px] bg-[#0e0e18] border border-[rgba(255,255,255,0.05)] text-[12px] font-body space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-[rgba(232,228,220,0.45)]">
                          <span className="font-semibold text-[#c5a059]">
                            {STEP_NAMES[rec.step]?.title || `Étape ${rec.step}`}
                          </span>
                          <span className="font-mono">{dateStr}</span>
                        </div>
                        {reactionInfo && (
                          <div className="flex items-center gap-1.5 text-[11.5px]" style={{ color: reactionInfo.color }}>
                            <span>{reactionInfo.emoji}</span>
                            <span>{reactionInfo.label}</span>
                          </div>
                        )}
                        {rec.verbatim && (
                          <p className="text-[rgba(232,228,220,0.85)] italic bg-[#080810] p-2 rounded mt-1 border border-[rgba(255,255,255,0.03)]">
                            &ldquo;{rec.verbatim}&rdquo;
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
  );
}
