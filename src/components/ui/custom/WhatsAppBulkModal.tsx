"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, Phone, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, 
  Sparkles, RotateCcw, ArrowRight, ShieldCheck, Play, Pause, Layers,
  Smile, Edit3, Eye, Trash2, Plus, MessageSquare, Building2, User, MapPin
} from 'lucide-react';
import type { Prospect } from '@/types';
import { 
  TRAVEL_AGENCY_PROTOTYPE_MESSAGE, 
  WHATSAPP_TEMPLATES, 
  EMOJI_PALETTES,
  QUICK_EMOJIS,
  QUICK_SNIPPETS,
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
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<string>('Voyage & Algérie');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setSentMap({});
      setCurrentIndex(0);
    }
  }, [isOpen]);

  const isSingleMode = prospects.length === 1;
  const singleProspect = isSingleMode ? prospects[0] : null;

  // Enrich prospects with phone validation & status
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

  const handleResetTemplate = () => {
    const tmpl = WHATSAPP_TEMPLATES.find((t) => t.id === selectedTemplateId) || WHATSAPP_TEMPLATES[0];
    setMessage(tmpl.message);
    addToast({ type: 'info', message: 'Message réinitialisé au modèle par défaut' });
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopiedMessage(true);
    addToast({ type: 'success', message: 'Texte avec emojis copié dans le presse-papier !' });
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  // Helper to insert emoji or snippet at cursor position in textarea
  const insertTextAtCursor = (textToInsert: string) => {
    if (!textareaRef.current) {
      setMessage((prev) => prev + textToInsert);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart ?? message.length;
    const end = textarea.selectionEnd ?? message.length;

    const updated = message.substring(0, start) + textToInsert + message.substring(end);
    setMessage(updated);

    // Restore caret position after insertion
    setTimeout(() => {
      textarea.focus();
      const newPos = start + textToInsert.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 10);
  };

  // Dispatch individual WhatsApp and auto-update stage to 'prototype'
  const handleSendIndividual = async (prospect: typeof enrichedProspects[0]) => {
    if (!prospect.isValidPhone || !prospect.formattedPhone) {
      addToast({ type: 'error', message: `Numéro invalide pour ${prospect.company}` });
      return;
    }

    // Open WhatsApp with current customized message & emojis
    openWhatsAppDirect(prospect.formattedPhone, message);

    // Mark as sent locally
    setSentMap((prev) => ({ ...prev, [prospect.id]: true }));

    // Automatically update pipeline stage to 'prototype' ("Prototypes envoyés")
    await updateStage(prospect.id, 'prototype');

    addToast({
      type: 'success',
      message: `WhatsApp ouvert pour « ${prospect.company} » & deal passé en « Prototypes envoyés »`,
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
          className="relative w-full max-w-[980px] max-h-[94vh] bg-[rgba(15,15,32,0.98)] border border-[rgba(197,160,89,0.3)] shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-[16px] flex flex-col overflow-hidden backdrop-blur-[24px]"
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
                  <span>{isSingleMode ? 'Message WhatsApp & Emojis' : 'Campagne WhatsApp & Emojis'}</span>
                </span>
                <span className="text-[12px] font-body text-[rgba(232,228,220,0.6)]">
                  {isSingleMode && singleProspect ? `Destinataire : ${singleProspect.company}` : `${prospects.length} prospects sélectionnés`}
                </span>
              </div>
              <h2 className="font-display text-[24px] sm:text-[28px] font-normal text-[#e8e4dc] mt-1.5 leading-tight">
                {isSingleMode && singleProspect 
                  ? `Rédiger un Message WhatsApp pour « ${singleProspect.company} »`
                  : 'Éditeur de Messages WhatsApp & Envoi Prototypes'
                }
              </h2>
              <p className="text-[12.5px] font-body text-[rgba(232,228,220,0.5)] mt-0.5">
                Personnalisez le texte avec des emojis, liens de démo et tarifs avant d&apos;envoyer sur WhatsApp.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.12)] text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stats & Quick Actions Bar */}
          <div className="px-6 py-3 bg-[rgba(10,10,22,0.6)] border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-3 flex-wrap text-[12px] font-body">
            <div className="flex items-center gap-4">
              <span className="text-[#e8e4dc]">
                {isSingleMode ? (
                  <>Destinataire : <strong className="text-[#c5a059]">{singleProspect?.company}</strong></>
                ) : (
                  <>Sélection : <strong className="text-[#c5a059]">{prospects.length}</strong> prospect{prospects.length > 1 ? 's' : ''}</>
                )}
              </span>
              <span className="text-[rgba(232,228,220,0.6)]">
                Téléphones valides : <strong className="text-[#4ade80]">{validCount}</strong>
              </span>
              <span className="text-[rgba(232,228,220,0.6)]">
                Statut : <strong className="text-[#a855f7]">{sentCount}</strong> / {prospects.length} envoyé{sentCount > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetTemplate}
                className="px-2.5 py-1.5 rounded-[8px] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] border border-[rgba(255,255,255,0.06)] flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
                title="Rétablir le modèle de base"
              >
                <RotateCcw size={12} />
                <span>Réinitialiser</span>
              </button>

              <button
                onClick={handleCopyMessage}
                className="px-3 py-1.5 rounded-[8px] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[#e8e4dc] border border-[rgba(255,255,255,0.08)] flex items-center gap-1.5 transition-colors cursor-pointer text-[11.5px]"
                title="Copier le message complet avec emojis"
              >
                {copiedMessage ? <Check size={13} className="text-[#4ade80]" /> : <Copy size={13} />}
                <span>{copiedMessage ? 'Copié !' : 'Copier texte'}</span>
              </button>

              {!isSingleMode && (
                <button
                  onClick={handleMarkAllAsSent}
                  className="px-3 py-1.5 rounded-[8px] bg-[rgba(168,85,247,0.12)] hover:bg-[rgba(168,85,247,0.2)] text-[#c084fc] border border-[rgba(168,85,247,0.3)] flex items-center gap-1.5 transition-colors cursor-pointer text-[11.5px]"
                  title="Marquer tous les prospects comme 'Prototypes envoyés' dans le CRM"
                >
                  <CheckCircle2 size={13} />
                  <span>Marquer tout envoyé</span>
                </button>
              )}
            </div>
          </div>

          {/* Main 2-Column Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Message Editor + Emoji Palette (6 or 7 cols) */}
            <div className={cn(isSingleMode ? "lg:col-span-7" : "lg:col-span-6", "flex flex-col gap-3")}>
              {/* Header & Tabs */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-body uppercase tracking-[0.08em] text-[rgba(232,228,220,0.5)] font-semibold">
                    Modèles :
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {WHATSAPP_TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleTemplateChange(t.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-[6px] text-[11px] font-body transition-all cursor-pointer border",
                          selectedTemplateId === t.id
                            ? "bg-[rgba(197,160,89,0.18)] text-[#e8e4dc] border-[#c5a059]"
                            : "bg-[rgba(255,255,255,0.03)] text-[rgba(232,228,220,0.5)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
                        )}
                      >
                        {t.sector}
                      </button>
                    ))}
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex bg-[#11111e] rounded-lg p-[2px] border border-[rgba(255,255,255,0.06)]">
                  <button
                    onClick={() => setActiveTab('edit')}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-body flex items-center gap-1 transition-colors cursor-pointer",
                      activeTab === 'edit'
                        ? "bg-[#18182a] text-[#c5a059] font-medium shadow-sm"
                        : "text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc]"
                    )}
                  >
                    <Edit3 size={11} />
                    <span>Édition</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-body flex items-center gap-1 transition-colors cursor-pointer",
                      activeTab === 'preview'
                        ? "bg-[#18182a] text-[#c5a059] font-medium shadow-sm"
                        : "text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc]"
                    )}
                  >
                    <Eye size={11} />
                    <span>Aperçu</span>
                  </button>
                </div>
              </div>

              {/* Quick Emojis Bar (Click to Insert) */}
              <div className="p-2 rounded-[10px] bg-[#0d0d1a] border border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1 overflow-x-auto py-0.5 pr-2 flex-1 scrollbar-thin">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#c5a059] pl-1 pr-1.5 shrink-0 flex items-center gap-1">
                    <Smile size={12} />
                    <span>Emojis :</span>
                  </span>
                  {QUICK_EMOJIS.map((emoji, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => insertTextAtCursor(emoji)}
                      className="w-7 h-7 rounded-md bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(197,160,89,0.2)] hover:scale-125 text-[15px] flex items-center justify-center transition-all cursor-pointer shrink-0"
                      title={`Insérer ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[11px] font-body shrink-0 transition-colors border cursor-pointer flex items-center gap-1",
                    showEmojiPicker
                      ? "bg-[#c5a059] text-[#060610] border-[#c5a059] font-semibold"
                      : "bg-[rgba(255,255,255,0.06)] text-[#e8e4dc] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.12)]"
                  )}
                >
                  <Smile size={12} />
                  <span>Palette Emojis</span>
                </button>
              </div>

              {/* Categorized Emoji Palette Dropdown */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-[12px] bg-[#111122] border border-[rgba(197,160,89,0.3)] shadow-xl overflow-hidden"
                  >
                    {/* Category tabs */}
                    <div className="flex gap-1 overflow-x-auto pb-2 border-b border-[rgba(255,255,255,0.06)] mb-2.5">
                      {EMOJI_PALETTES.map((palette) => (
                        <button
                          key={palette.category}
                          type="button"
                          onClick={() => setSelectedEmojiCategory(palette.category)}
                          className={cn(
                            "px-2.5 py-1 rounded text-[11px] font-body whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5",
                            selectedEmojiCategory === palette.category
                              ? "bg-[rgba(197,160,89,0.2)] text-[#c5a059] font-medium border border-[rgba(197,160,89,0.35)]"
                              : "text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc]"
                          )}
                        >
                          <span>{palette.icon}</span>
                          <span>{palette.category}</span>
                        </button>
                      ))}
                    </div>

                    {/* Emoji Grid for Selected Category */}
                    <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {EMOJI_PALETTES.find((p) => p.category === selectedEmojiCategory)?.emojis.map((emoji, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => insertTextAtCursor(emoji)}
                          className="h-8 rounded-lg bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(197,160,89,0.25)] hover:scale-125 text-[17px] flex items-center justify-center transition-all cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Snippets Insertion Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-body">
                <span className="text-[rgba(232,228,220,0.4)] text-[10.5px] uppercase font-mono tracking-wider shrink-0 pr-1">
                  Insérer :
                </span>
                {QUICK_SNIPPETS.map((snip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => insertTextAtCursor(snip.text)}
                    className="px-2.5 py-1 rounded-[6px] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(197,160,89,0.15)] text-[rgba(232,228,220,0.7)] hover:text-[#e8e4dc] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(197,160,89,0.25)] transition-colors cursor-pointer shrink-0"
                  >
                    {snip.label}
                  </button>
                ))}
              </div>

              {/* Textarea or WhatsApp Live Preview */}
              {activeTab === 'edit' ? (
                <div className="relative flex-1 flex flex-col min-h-[250px]">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={12}
                    placeholder="Tapez votre message WhatsApp ici... Vous pouvez insérer des emojis, sauts de ligne et liens."
                    className="w-full flex-1 p-3.5 rounded-[12px] bg-[#0e0e1a] border border-[rgba(197,160,89,0.3)] text-[12.5px] font-body text-[#e8e4dc] leading-relaxed focus:outline-none focus:border-[#c5a059] resize-none font-sans"
                  />
                  <div className="flex items-center justify-between text-[11px] font-body text-[rgba(232,228,220,0.4)] mt-1.5 px-1">
                    <span>Longueur : <strong>{message.length}</strong> caractères</span>
                    <span className="text-[#c5a059]">Emojis & liens supportés ✓</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-4 rounded-[12px] bg-[#0c0c16] border border-[rgba(255,255,255,0.08)] text-[12.5px] font-body text-[#e8e4dc] leading-relaxed whitespace-pre-line overflow-y-auto max-h-[330px] relative">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[rgba(232,228,220,0.4)] mb-2 border-b border-[rgba(255,255,255,0.06)] pb-1">
                    Aperçu Exact WhatsApp
                  </div>
                  {message}
                </div>
              )}

              {/* Quick Links Preview Box */}
              <div className="p-3 rounded-[10px] bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)] text-[11.5px] font-body flex flex-col gap-1.5">
                <span className="text-[#c5a059] font-medium flex items-center gap-1.5">
                  <ExternalLink size={12} />
                  <span>Liens inclus dans le message :</span>
                </span>
                <div className="flex items-center justify-between text-[11px] text-[rgba(232,228,220,0.7)] pl-4">
                  <span>1. Prototype Plateforme :</span>
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

            {/* Right Column: Single Prospect Profile OR Batch Sequential Runner (5 or 6 cols) */}
            <div className={cn(isSingleMode ? "lg:col-span-5" : "lg:col-span-6", "flex flex-col gap-3")}>
              {isSingleMode && enrichedProspects[0] ? (
                /* Single Prospect Focus Card */
                <div className="flex flex-col gap-4 p-5 rounded-[14px] bg-[#0c0c16] border border-[rgba(197,160,89,0.25)]">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10.5px] font-mono uppercase tracking-[0.08em] px-2.5 py-0.5 rounded-full bg-[rgba(197,160,89,0.12)] text-[#c5a059] border border-[rgba(197,160,89,0.25)]">
                        Destinataire
                      </span>
                      {enrichedProspects[0].isSent && (
                        <span className="text-[11px] font-body text-[#c084fc] flex items-center gap-1 bg-[rgba(168,85,247,0.12)] px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 size={12} />
                          <span>Prototype déjà envoyé</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-[20px] font-display font-medium text-[#e8e4dc]">
                      {enrichedProspects[0].company}
                    </h3>
                    <p className="text-[13px] font-body text-[rgba(232,228,220,0.6)] mt-0.5 flex items-center gap-1.5">
                      <User size={13} className="text-[#c5a059]" />
                      <span>{enrichedProspects[0].name || 'Responsable'}</span>
                    </p>
                  </div>

                  <div className="space-y-2 p-3.5 rounded-[10px] bg-[#11111e] border border-[rgba(255,255,255,0.06)] text-[12.5px] font-body">
                    <div className="flex items-center justify-between">
                      <span className="text-[rgba(232,228,220,0.5)]">Secteur :</span>
                      <span className="text-[#e8e4dc] font-medium">{enrichedProspects[0].sector || 'Agence de voyage'}</span>
                    </div>
                    {enrichedProspects[0].city && (
                      <div className="flex items-center justify-between">
                        <span className="text-[rgba(232,228,220,0.5)]">Localisation :</span>
                        <span className="text-[#e8e4dc] font-medium">📍 {enrichedProspects[0].city}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-[rgba(255,255,255,0.04)]">
                      <span className="text-[rgba(232,228,220,0.5)]">Numéro WhatsApp :</span>
                      {enrichedProspects[0].isValidPhone ? (
                        <span className="font-mono text-[#4ade80] font-semibold flex items-center gap-1">
                          <Phone size={12} />
                          +{enrichedProspects[0].formattedPhone}
                        </span>
                      ) : (
                        <span className="text-[#f87171] flex items-center gap-1">
                          <AlertCircle size={12} />
                          <span>Numéro invalide</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Big Primary Send Button */}
                  <div className="pt-2 flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSendIndividual(enrichedProspects[0])}
                      disabled={!enrichedProspects[0].isValidPhone}
                      className={cn(
                        "w-full py-3.5 px-4 rounded-[10px] font-body font-semibold text-[13.5px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg",
                        enrichedProspects[0].isValidPhone
                          ? "bg-gradient-to-r from-[#B8924A] via-[#c5a059] to-[#D4B57A] hover:opacity-95 text-[#1A1200] shadow-[0_4px_20px_rgba(197,160,89,0.3)] hover:scale-[1.01] active:scale-[0.99]"
                          : "bg-[rgba(255,255,255,0.05)] text-[rgba(232,228,220,0.3)] cursor-not-allowed"
                      )}
                    >
                      <Send size={15} />
                      <span>Ouvrir dans WhatsApp & Envoyer</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="w-full py-2.5 px-3 rounded-[8px] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.7)] hover:text-[#e8e4dc] border border-[rgba(255,255,255,0.06)] text-[12px] font-body flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Copy size={13} />
                      <span>{copiedMessage ? 'Message copié avec emojis !' : 'Copier le message complet'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Multi-Prospects Queue List & Sequential Runner */
                <>
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
                          Ouvre la conversation pré-remplie avec vos emojis et met à jour le deal.
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
                  <div className="border border-[rgba(255,255,255,0.06)] rounded-[12px] bg-[#0c0c16] overflow-hidden flex-1 flex flex-col max-h-[440px]">
                    <div className="p-3 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] flex items-center justify-between text-[11px] font-body uppercase tracking-[0.06em] text-[rgba(232,228,220,0.5)]">
                      <span>Prospects ({enrichedProspects.length})</span>
                      <span>Action Directe</span>
                    </div>

                    <div className="overflow-y-auto divide-y divide-[rgba(255,255,255,0.04)] p-1">
                      {enrichedProspects.map((p) => (
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
                </>
              )}
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
