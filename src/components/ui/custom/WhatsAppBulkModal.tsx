"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, Phone, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, 
  Sparkles, RotateCcw, ArrowRight, ShieldCheck, Play, Pause, Layers
} from 'lucide-react';
import type { Prospect } from '@/types';
import { 
  TRAVEL_AGENCY_PROTOTYPE_MESSAGE, 
  WHATSAPP_TEMPLATES, 
  formatPhoneForWhatsApp, 
  isValidWhatsAppPhone, 
  buildWhatsAppUrl, 
  openWhatsAppDirect 
} from '@/lib/whatsapp';
import { useProspectsStore } from '@/hooks/useProspectsStore';
import { useUIStore } from '@/hooks/useUIStore';
import { cn } from '@/lib/utils';

interface WhatsAppBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospects: Prospect[];
  onComplete?: () => void;
}

export function WhatsAppBulkModal({
  isOpen,
  onClose,
  prospects,
  onComplete,
}: WhatsAppBulkModalProps) {
  const { updateStage, batchUpdateStage } = useProspectsStore();
  const { addToast } = useUIStore();

  const [message, setMessage] = useState<string>(TRAVEL_AGENCY_PROTOTYPE_MESSAGE);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('travel_parfait_voyage');
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isEditingMessage, setIsEditingMessage] = useState<boolean>(false);

  // Filter prospects with valid phone vs invalid
  const enrichedProspects = useMemo(() => {
    return prospects.map((p) => {
      const formattedPhone = formatPhoneForWhatsApp(p.phone);
      const isValid = Boolean(formattedPhone && formattedPhone.length >= 9);
      const isSent = Boolean(sentMap[p.id] || p.stage === 'prototype');
      return {
        ...p,
        formattedPhone,
        isValidPhone: isValid,
        isSent,
      };
    });
  }, [prospects, sentMap]);

  const validCount = enrichedProspects.filter((p) => p.isValidPhone).length;
  const sentCount = enrichedProspects.filter((p) => p.isSent).length;

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = WHATSAPP_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setMessage(tmpl.message);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopiedMessage(true);
    addToast({ type: 'success', message: 'Texte copié dans le presse-papier' });
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  // Dispatch individual WhatsApp and auto-update stage to 'prototype'
  const handleSendIndividual = async (prospect: typeof enrichedProspects[0]) => {
    if (!prospect.isValidPhone || !prospect.formattedPhone) {
      addToast({ type: 'error', message: `Numéro invalide pour ${prospect.company}` });
      return;
    }

    // Open WhatsApp
    openWhatsAppDirect(prospect.formattedPhone, message);

    // Mark as sent locally
    setSentMap((prev) => ({ ...prev, [prospect.id]: true }));

    // Automatically update pipeline stage to 'prototype' ("Prototypes envoyés")
    await updateStage(prospect.id, 'prototype');

    addToast({
      type: 'success',
      message: `WhatsApp ouvert pour ${prospect.company} & statut mis à jour (Prototype envoyé)`,
    });
  };

  // Advance queue sequentially
  const handleSendNextInQueue = async () => {
    const pending = enrichedProspects.filter((p) => p.isValidPhone && !p.isSent);
    if (pending.length === 0) {
      addToast({ type: 'info', message: 'Tous les prospects valides ont déjà été contactés !' });
      return;
    }

    const nextProspect = pending[0];
    await handleSendIndividual(nextProspect);
    
    // Find next index
    const nextIdx = enrichedProspects.findIndex((p) => p.id === nextProspect.id);
    if (nextIdx !== -1) {
      setCurrentIndex(Math.min(enrichedProspects.length - 1, nextIdx + 1));
    }
  };

  // Mark all selected as 'prototype' stage in 1 batch
  const handleMarkAllAsSent = async () => {
    const ids = prospects.map((p) => p.id);
    await batchUpdateStage(ids, 'prototype');
    const newSent: Record<string, boolean> = {};
    ids.forEach((id) => {
      newSent[id] = true;
    });
    setSentMap((prev) => ({ ...prev, ...newSent }));
    addToast({
      type: 'success',
      message: `${ids.length} prospects marqués comme « Prototypes envoyés »`,
    });
    if (onComplete) onComplete();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-[rgba(6,6,16,0.85)] backdrop-blur-[10px]" 
          onClick={onClose} 
        />

        {/* Modal Window */}
        <motion.div
          className="relative w-full max-w-[940px] max-h-[92vh] bg-[rgba(15,15,32,0.98)] border border-[rgba(197,160,89,0.3)] shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-[16px] flex flex-col overflow-hidden backdrop-blur-[24px]"
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[rgba(255,255,255,0.08)] flex items-start justify-between gap-4 bg-[rgba(20,20,40,0.5)]">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-mono uppercase tracking-[0.1em] bg-[rgba(197,160,89,0.15)] text-[#c5a059] border border-[rgba(197,160,89,0.3)] flex items-center gap-1">
                  <Sparkles size={11} />
                  <span>Automatisation WhatsApp</span>
                </span>
                <span className="text-[12px] font-body text-[rgba(232,228,220,0.6)]">
                  Parfait Voyage — Algérie
                </span>
              </div>
              <h2 className="font-display text-[24px] sm:text-[28px] font-normal text-[#e8e4dc] mt-1.5 leading-tight">
                Envoi Prototype Agence de Voyage
              </h2>
              <p className="text-[12.5px] font-body text-[rgba(232,228,220,0.5)] mt-0.5">
                Redirige directement vers WhatsApp avec le pitch complet et passe automatiquement le lead en statut <strong className="text-[#a855f7]">« Prototypes envoyés »</strong>.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.12)] text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="px-6 py-3 bg-[rgba(10,10,22,0.6)] border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-3 flex-wrap text-[12px] font-body">
            <div className="flex items-center gap-4">
              <span className="text-[#e8e4dc]">
                Sélection : <strong className="text-[#c5a059]">{prospects.length}</strong> prospect{prospects.length > 1 ? 's' : ''}
              </span>
              <span className="text-[rgba(232,228,220,0.6)]">
                Téléphones valides : <strong className="text-[#4ade80]">{validCount}</strong>
              </span>
              <span className="text-[rgba(232,228,220,0.6)]">
                Déjà envoyés : <strong className="text-[#a855f7]">{sentCount}</strong> / {prospects.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMessage}
                className="px-3 py-1.5 rounded-[8px] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#e8e4dc] border border-[rgba(255,255,255,0.08)] flex items-center gap-1.5 transition-colors cursor-pointer text-[11.5px]"
                title="Copier le message complet"
              >
                {copiedMessage ? <Check size={13} className="text-[#4ade80]" /> : <Copy size={13} />}
                <span>{copiedMessage ? 'Copié !' : 'Copier le pitch'}</span>
              </button>

              <button
                onClick={handleMarkAllAsSent}
                className="px-3 py-1.5 rounded-[8px] bg-[rgba(168,85,247,0.12)] hover:bg-[rgba(168,85,247,0.2)] text-[#c084fc] border border-[rgba(168,85,247,0.3)] flex items-center gap-1.5 transition-colors cursor-pointer text-[11.5px]"
                title="Marquer tous les prospects comme 'Prototypes envoyés' dans le CRM"
              >
                <CheckCircle2 size={13} />
                <span>Marquer tout envoyé</span>
              </button>
            </div>
          </div>

          {/* Main 2-Column Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Message Preview & Templates (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-body uppercase tracking-[0.08em] text-[rgba(232,228,220,0.5)] font-semibold">
                  Modèle de Message
                </label>
                <button
                  onClick={() => setIsEditingMessage(!isEditingMessage)}
                  className="text-[11.5px] font-body text-[#c5a059] hover:underline cursor-pointer"
                >
                  {isEditingMessage ? 'Aperçu propre' : 'Modifier le texte'}
                </button>
              </div>

              {/* Template selector */}
              <div className="flex gap-2 flex-wrap">
                {WHATSAPP_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateChange(t.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-[6px] text-[11px] font-body transition-all cursor-pointer border",
                      selectedTemplateId === t.id
                        ? "bg-[rgba(197,160,89,0.15)] text-[#e8e4dc] border-[#c5a059]"
                        : "bg-[rgba(255,255,255,0.03)] text-[rgba(232,228,220,0.5)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
                    )}
                  >
                    {t.sector}
                  </button>
                ))}
              </div>

              {/* Message Box */}
              {isEditingMessage ? (
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={14}
                  className="w-full p-3.5 rounded-[12px] bg-[#11111e] border border-[rgba(197,160,89,0.3)] text-[12.5px] font-body text-[#e8e4dc] leading-relaxed focus:outline-none focus:border-[#c5a059] resize-none"
                />
              ) : (
                <div className="p-4 rounded-[12px] bg-[#0c0c16] border border-[rgba(255,255,255,0.08)] text-[12.5px] font-body text-[#e8e4dc] leading-relaxed whitespace-pre-line overflow-y-auto max-h-[360px] relative">
                  {message}
                </div>
              )}

              {/* Quick Links Preview */}
              <div className="p-3 rounded-[10px] bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)] text-[11.5px] font-body flex flex-col gap-1.5">
                <span className="text-[#c5a059] font-medium flex items-center gap-1.5">
                  <ExternalLink size={12} />
                  <span>Liens inclus dans le message :</span>
                </span>
                <div className="flex items-center justify-between text-[11px] text-[rgba(232,228,220,0.7)] pl-4">
                  <span>1. Prototype Platforme :</span>
                  <a 
                    href="https://parfait-voyage.vercel.app/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[#4ade80] hover:underline"
                  >
                    parfait-voyage.vercel.app ↗
                  </a>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[rgba(232,228,220,0.7)] pl-4">
                  <span>2. Flyer Tarifs & Offres :</span>
                  <a 
                    href="https://flyer-parfait-voyage.vercel.app/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[#4ade80] hover:underline"
                  >
                    flyer-parfait-voyage.vercel.app ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Prospects Queue & Sequential Runner (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              {/* Sequential Action Banner */}
              <div className="p-3.5 rounded-[12px] bg-[rgba(197,160,89,0.12)] border border-[rgba(197,160,89,0.35)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#c5a059] flex items-center justify-center text-[#060610]">
                    <Send size={15} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-body font-semibold text-[#e8e4dc]">
                      Envoi Pas à Pas (WhatsApp Web)
                    </h4>
                    <p className="text-[11px] font-body text-[rgba(232,228,220,0.6)]">
                      Ouvre la conversation pré-remplie et met à jour le prospect.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSendNextInQueue}
                  className="px-4 py-2 rounded-[8px] bg-gradient-to-r from-[#B8924A] via-[#c5a059] to-[#D4B57A] text-[#1A1200] font-body font-semibold text-[12px] flex items-center gap-1.5 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-[0_4px_16px_rgba(197,160,89,0.25)]"
                >
                  <span>Envoyer au Suivant</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Prospects Queue List */}
              <div className="border border-[rgba(255,255,255,0.06)] rounded-[12px] bg-[#0c0c16] overflow-hidden flex-1 flex flex-col max-h-[420px]">
                <div className="p-3 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] flex items-center justify-between text-[11px] font-body uppercase tracking-[0.06em] text-[rgba(232,228,220,0.5)]">
                  <span>Prospects ({enrichedProspects.length})</span>
                  <span>Action Directe</span>
                </div>

                <div className="overflow-y-auto divide-y divide-[rgba(255,255,255,0.04)] p-1">
                  {enrichedProspects.map((p, idx) => (
                    <div
                      key={p.id}
                      className={cn(
                        "p-3 rounded-[8px] flex items-center justify-between gap-3 transition-colors",
                        p.isSent
                          ? "bg-[rgba(168,85,247,0.06)]"
                          : "hover:bg-[rgba(255,255,255,0.02)]"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[13.5px] font-body font-medium text-[#e8e4dc] truncate">
                            {p.company}
                          </p>
                          <span className="text-[10px] font-body px-2 py-0.2 rounded-full bg-[rgba(255,255,255,0.05)] text-[rgba(232,228,220,0.6)]">
                            {p.sector || 'Agence'}
                          </span>
                          {p.city && (
                            <span className="text-[10px] font-body text-[rgba(232,228,220,0.4)]">
                              📍 {p.city}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[11.5px] font-body">
                          {p.isValidPhone ? (
                            <span className="font-mono text-[#4ade80] flex items-center gap-1">
                              <Phone size={11} />
                              +{p.formattedPhone}
                            </span>
                          ) : (
                            <span className="text-[#f87171] flex items-center gap-1">
                              <AlertCircle size={11} />
                              <span>Numéro manquant ou invalide</span>
                            </span>
                          )}

                          <span className="text-[rgba(232,228,220,0.3)]">·</span>
                          <span className="text-[rgba(232,228,220,0.5)] truncate">
                            {p.name}
                          </span>
                        </div>
                      </div>

                      {/* Status / Send Button */}
                      <div className="flex items-center gap-2 shrink-0">
                        {p.isSent ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-body font-medium bg-[rgba(168,85,247,0.15)] text-[#c084fc] border border-[rgba(168,85,247,0.3)] flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            <span>Envoyé</span>
                          </span>
                        ) : p.isValidPhone ? (
                          <button
                            onClick={() => handleSendIndividual(p)}
                            className="px-3 py-1.5 rounded-[8px] bg-[rgba(34,197,94,0.12)] hover:bg-[rgba(34,197,94,0.22)] border border-[rgba(34,197,94,0.35)] text-[#4ade80] text-[11.5px] font-body font-medium flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02]"
                          >
                            <Send size={12} />
                            <span>WhatsApp</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-body text-[rgba(232,228,220,0.3)] italic">
                            Non joignable
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-[rgba(20,20,38,0.95)] border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-3">
            <span className="text-[12px] font-body text-[rgba(232,228,220,0.5)]">
              Statut synchronisé en temps réel avec le CRM & MongoDB Atlas
            </span>
            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-[8px] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#e8e4dc] font-body text-[12.5px] transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
