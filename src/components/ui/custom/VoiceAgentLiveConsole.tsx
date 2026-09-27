"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Volume2, VolumeX, Sparkles, MessageSquare, Send,
  ShieldCheck, AlertTriangle, FileText, ChevronDown, ChevronUp, Copy, Check, ExternalLink
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/custom/GlassPanel';
import { useCallStore } from '@/hooks/useCallStore';
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import { useSettingsStore } from '@/hooks/useSettingsStore';

export function VoiceAgentLiveConsole({ languageMode }: { languageMode: 'fr' | 'ar' | 'en' }) {
  const {
    prospect,
    speakerMode,
    setSpeakerMode,
    channelMode,
    selectedOffer,
    liveTranscript,
    isAiSpeaking,
    isListening,
    addTranscriptMessage,
  } = useCallStore();

  const { formatPhoneNumber } = useSettingsStore();
  const phoneFormatted = prospect?.phone ? formatPhoneNumber(prospect.phone) : null;

  const {
    isProcessingAi,
    lastSuggestedText,
    lastPivotAdvice,
    speakText,
    stopSpeaking,
    handleProspectSpeech,
    emergencyTakeover,
  } = useVoiceAgent({ language: languageMode });

  const [manualInput, setManualInput] = useState('');
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const contactPrenom = prospect?.name?.trim() ? prospect.name.trim().split(' ')[0] : 'Monsieur/Madame';
  const companyName = prospect?.company || 'votre établissement';

  // Strict WhatsApp PDF Devis message template
  const generateWhatsAppProposalUrl = () => {
    if (!prospect?.phone) return '';
    const formatted = formatPhoneNumber(prospect.phone);
    const prefilledText = encodeURIComponent(
      `Bonjour ${contactPrenom},\n\nSuite à notre échange téléphonique concernant ${companyName}, voici la proposition chiffrée détaillée et sur-mesure préparée par Stepping Stones Agency :\n\n📄 Offre : ${selectedOffer === 'vitrine' ? 'Pack Vitrine Digitale Clé en Main' : selectedOffer === 'refonte' ? 'Refonte & Haute Performance Web' : 'Solution Digitale Sur-Mesure'}\n\nNous restons à votre entière disposition pour répondre à vos questions et planifier le déploiement.\n\nBien cordialement,\nMohamed Slimani & Abdelhadi Hammaz\nStepping Stones Agency`
    );
    return `${formatted.waUrl}?text=${prefilledText}`;
  };

  const handleQuickObjection = (objectionText: string) => {
    handleProspectSpeech(objectionText);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleProspectSpeech(manualInput.trim());
    setManualInput('');
  };

  const copyToClipboard = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <GlassPanel className="p-4 sm:p-5 border-[rgba(197,160,89,0.25)] relative overflow-hidden mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      {/* Top Bar: Operational Status & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-[rgba(255,255,255,0.06)]">
        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {isAiSpeaking ? (
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38bdf8] opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#0284c7]" />
              </span>
            ) : isProcessingAi ? (
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fbbf24] opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#f59e0b]" />
              </span>
            ) : isListening ? (
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#22c55e]" />
              </span>
            ) : (
              <span className="w-3 h-3 rounded-full bg-[rgba(255,255,255,0.2)]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[13px] font-body font-semibold text-[#e8e4dc]">
                {speakerMode === 'ai' ? 'Agent Vocal IA Autonome' : 'Copilote IA d\'Appel (Directeur Commercial)'}
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[rgba(197,160,89,0.12)] text-[#c5a059] border border-[rgba(197,160,89,0.25)]">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-[11px] font-body text-[rgba(232,228,220,0.5)]">
              {isAiSpeaking
                ? "L'Agent Vocal Stepping Stones s'exprime vocalement..."
                : isProcessingAi
                ? "Analyse chirurgicale de la réplique du prospect..."
                : isListening
                ? "Reconnaissance vocale active (écoute du haut-parleur)..."
                : "Micro en attente"}
            </p>
          </div>
        </div>

        {/* Dynamic Speaker Mode Selector & Emergency Button */}
        <div className="flex items-center gap-2">
          {speakerMode === 'ai' ? (
            <motion.button
              type="button"
              onClick={emergencyTakeover}
              className="h-8 px-3 rounded-lg bg-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.3)] border border-[#ef4444] text-[#f87171] text-[11px] font-body font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(239,68,68,0.25)] cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Couper immédiatement l'IA et reprendre la parole"
            >
              <AlertTriangle size={13} />
              <span>🚨 Prendre la main au micro</span>
            </motion.button>
          ) : (
            <button
              type="button"
              onClick={() => setSpeakerMode('ai')}
              className="h-8 px-3 rounded-lg bg-[rgba(56,189,248,0.12)] hover:bg-[rgba(56,189,248,0.2)] border border-[rgba(56,189,248,0.3)] text-[#38bdf8] text-[11px] font-body font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Passer en mode autonome : l'IA répond vocalement au prospect"
            >
              <Volume2 size={13} />
              <span>Déléguer la parole à l&apos;IA</span>
            </button>
          )}

          {/* Test Voice Button */}
          <button
            type="button"
            onClick={() => speakText("Bonjour, je suis l'assistant vocal de Stepping Stones Agency. Tout fonctionne parfaitement.")}
            className="h-8 px-2.5 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(197,160,89,0.3)] text-[11px] font-body text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] transition-all cursor-pointer flex items-center gap-1"
            title="Tester le rendu audio de la voix synthétique"
          >
            <Sparkles size={11} className="text-[#c5a059]" />
            <span className="hidden sm:inline">Tester Voix</span>
          </button>
        </div>
      </div>

      {/* Strict Pricing Rule & WhatsApp PDF Devis Banner */}
      <div className="p-2.5 mb-3.5 rounded-[10px] bg-[rgba(197,160,89,0.07)] border border-[rgba(197,160,89,0.22)] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <ShieldCheck size={16} className="text-[#c5a059] flex-shrink-0" />
          <span className="text-[12px] font-body text-[rgba(232,228,220,0.85)] truncate">
            <strong className="text-[#c5a059] font-medium">Règle d&apos;or :</strong> Aucun prix par téléphone. Transmettez la proposition chiffrée détaillée en PDF par WhatsApp.
          </span>
        </div>

        {/* 1-Click WhatsApp Proposal Action */}
        {prospect?.phone && (
          <a
            href={generateWhatsAppProposalUrl()}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-[rgba(37,211,102,0.18)] hover:bg-[rgba(37,211,102,0.28)] border border-[rgba(37,211,102,0.4)] text-[11.5px] font-body font-medium text-[#25d366] flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(37,211,102,0.15)] flex-shrink-0"
          >
            <FileText size={13} />
            <span>Envoyer le Devis PDF sur WhatsApp</span>
            <ExternalLink size={11} className="opacity-70" />
          </a>
        )}
      </div>

      {/* Suggested Spoken Response Box (If Copilot or AI generated) */}
      {lastSuggestedText && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 mb-3.5 rounded-[12px] bg-[rgba(17,17,26,0.85)] border border-[rgba(197,160,89,0.35)] shadow-[0_0_20px_rgba(197,160,89,0.12)]"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-body font-semibold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full bg-[rgba(197,160,89,0.15)] text-[#c5a059]">
              {speakerMode === 'ai' ? 'Dernière Réplique Parlée par l\'IA' : 'Réplique Immédiate Conseillée'}
            </span>
            <div className="flex items-center gap-2">
              {lastPivotAdvice && (
                <span className="text-[11px] font-body text-[#60a5fa] font-medium hidden sm:inline">
                  ⚡ {lastPivotAdvice}
                </span>
              )}
              <button
                type="button"
                onClick={() => copyToClipboard(lastSuggestedText)}
                className="text-[11px] font-body text-[rgba(232,228,220,0.5)] hover:text-[#c5a059] flex items-center gap-1 cursor-pointer"
              >
                {copiedText ? <Check size={12} className="text-[#4ade80]" /> : <Copy size={12} />}
                <span>{copiedText ? 'Copié' : 'Copier'}</span>
              </button>
            </div>
          </div>

          <p className="text-[14px] sm:text-[15px] font-body text-[#e8e4dc] leading-relaxed">
            &ldquo;{lastSuggestedText}&rdquo;
          </p>

          {speakerMode === 'human' && (
            <div className="mt-2.5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => speakText(lastSuggestedText)}
                className="h-7 px-2.5 rounded-md bg-[rgba(197,160,89,0.15)] hover:bg-[rgba(197,160,89,0.25)] border border-[rgba(197,160,89,0.3)] text-[#c5a059] text-[11px] font-body flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Volume2 size={12} />
                <span>Faire prononcer par l&apos;IA</span>
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Quick Objection Attack Chips */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-body font-semibold uppercase tracking-[0.06em] text-[rgba(232,228,220,0.5)]">
            Déclencheurs d&apos;Objection Rapides (1 Clic)
          </span>
          <button
            type="button"
            onClick={() => setShowFullTranscript(!showFullTranscript)}
            className="text-[11px] font-body text-[#c5a059] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showFullTranscript ? 'Masquer historique' : `Historique (${liveTranscript.length})`}</span>
            {showFullTranscript ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleQuickObjection("Combien ça coûte ? Quel est votre tarif ?")}
            className="px-2.5 py-1 rounded-[7px] bg-[rgba(251,191,36,0.12)] hover:bg-[rgba(251,191,36,0.22)] border border-[rgba(251,191,36,0.3)] text-[#fbbf24] text-[11.5px] font-body transition-colors cursor-pointer"
            title="Active la règle stricte du pivot WhatsApp"
          >
            💰 &ldquo;C&apos;est combien ?&rdquo; (Pivot WhatsApp)
          </button>

          <button
            type="button"
            onClick={() => handleQuickObjection("Une simple page Facebook ou Instagram me suffit largement.")}
            className="px-2.5 py-1 rounded-[7px] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.7)] hover:text-[#e8e4dc] text-[11.5px] font-body transition-colors cursor-pointer"
          >
            📱 &ldquo;Facebook me suffit&rdquo;
          </button>

          <button
            type="button"
            onClick={() => handleQuickObjection("Le bouche-à-oreille me suffit, je n'ai pas besoin d'internet.")}
            className="px-2.5 py-1 rounded-[7px] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.7)] hover:text-[#e8e4dc] text-[11.5px] font-body transition-colors cursor-pointer"
          >
            🤝 &ldquo;Bouche-à-oreille suffit&rdquo;
          </button>

          <button
            type="button"
            onClick={() => handleQuickObjection("Je n'ai pas le temps de gérer un site web.")}
            className="px-2.5 py-1 rounded-[7px] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.7)] hover:text-[#e8e4dc] text-[11.5px] font-body transition-colors cursor-pointer"
          >
            ⏳ &ldquo;Pas le temps&rdquo;
          </button>

          <button
            type="button"
            onClick={() => handleQuickObjection("J'ai déjà quelqu'un qui gère mon informatique.")}
            className="px-2.5 py-1 rounded-[7px] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.7)] hover:text-[#e8e4dc] text-[11.5px] font-body transition-colors cursor-pointer"
          >
            👔 &ldquo;J&apos;ai déjà qqun&rdquo;
          </button>

          <button
            type="button"
            onClick={() => handleQuickObjection("Rappelez-moi un autre jour, je suis occupé.")}
            className="px-2.5 py-1 rounded-[7px] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.7)] hover:text-[#e8e4dc] text-[11.5px] font-body transition-colors cursor-pointer"
          >
            📅 &ldquo;Rappelez plus tard&rdquo;
          </button>
        </div>
      </div>

      {/* Manual Input Form (Zero-Dependency fallback if microphone doesn't capture loudspeaker audio) */}
      <form onSubmit={handleManualSubmit} className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)] flex items-center gap-2">
        <input
          type="text"
          placeholder="Saisir la réplique du prospect si micro trop éloigné (ex: 'Envoyez sur WhatsApp')..."
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          className="flex-1 h-9 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] px-3 text-[12px] font-body text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.3)] focus:outline-none focus:border-[rgba(197,160,89,0.35)] transition-colors"
        />
        <button
          type="submit"
          disabled={!manualInput.trim()}
          className="h-9 px-3 rounded-[8px] bg-[rgba(197,160,89,0.15)] hover:bg-[rgba(197,160,89,0.25)] border border-[rgba(197,160,89,0.3)] text-[#c5a059] text-[12px] font-body font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
        >
          <Send size={12} />
          <span>Analyser</span>
        </button>
      </form>

      {/* Collapsible Transcript Drawer */}
      <AnimatePresence>
        {showFullTranscript && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] overflow-hidden"
          >
            <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1 custom-scrollbar text-[12px] font-body">
              {liveTranscript.map((item) => (
                <div
                  key={item.id}
                  className={`p-2 rounded-[8px] border ${
                    item.sender === 'prospect'
                      ? 'bg-[rgba(96,165,250,0.08)] border-[rgba(96,165,250,0.2)] text-[#93c5fd]'
                      : item.sender === 'agent'
                      ? 'bg-[rgba(197,160,89,0.08)] border-[rgba(197,160,89,0.2)] text-[#e8e4dc]'
                      : 'bg-[rgba(167,139,250,0.08)] border-[rgba(167,139,250,0.2)] text-[rgba(232,228,220,0.55)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-0.5 opacity-70">
                    <span className="uppercase font-semibold">
                      {item.sender === 'prospect' ? '👤 Prospect' : item.sender === 'agent' ? '🤖 Agent Stepping Stones' : '⚙️ Système'}
                    </span>
                    <span>{item.timestamp}</span>
                  </div>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}
