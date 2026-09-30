"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Bot, Target, Phone, MessageSquare, Check, X, ArrowRight,
  RotateCcw, Compass, Layers, ShieldCheck, Flame, Send, CheckCircle2,
  Clock, AlertTriangle, ChevronRight, ExternalLink, HelpCircle
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/custom/GlassPanel';
import { AnimatedButton } from '@/components/ui/custom/AnimatedButton';
import { useUIStore } from '@/hooks/useUIStore';
import { cn } from '@/lib/utils';

interface ActionProposal {
  id: string;
  prospectId: string;
  companyName: string;
  actionType: 'update_stage' | 'add_note' | 'set_reminder';
  targetStage?: string;
  note?: string;
  summary: string;
  status?: 'pending' | 'approved' | 'skipped';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionProposal?: ActionProposal | null;
}

export default function CopilotPage() {
  const { addToast } = useUIStore();

  // State
  const [activeFocus, setActiveFocus] = useState('Agence de voyage');
  const [availableNiches, setAvailableNiches] = useState<string[]>(['Agence de voyage']);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [customFocusInput, setCustomFocusInput] = useState('');

  const [briefing, setBriefing] = useState<any>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(true);
  const [refreshingBriefing, setRefreshingBriefing] = useState(false);

  const [activeTab, setActiveTab] = useState<'48h' | 'prototypes' | 'calls' | 'hunter'>('48h');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Bonjour Mohamed & Abdelhadi ! Je suis votre Directeur des Opérations IA. J'ai analysé l'ensemble de votre base MongoDB Atlas. Je suis prêt à vous guider, organiser vos relances et chasser de nouveaux clients.",
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Market Hunter State
  const [hunterNiches, setHunterNiches] = useState<any[]>([]);
  const [loadingHunter, setLoadingHunter] = useState(false);

  // 1. Initial Load: Focus + Briefing
  useEffect(() => {
    loadFocus();
    loadBriefing(false);
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const loadFocus = async () => {
    try {
      const res = await fetch('/api/copilot/focus');
      const data = await res.json();
      if (data.success) {
        setActiveFocus(data.activeFocus || 'Agence de voyage');
        if (data.availableNiches) setAvailableNiches(data.availableNiches);
      }
    } catch (e) {}
  };

  const loadBriefing = async (force = false) => {
    if (force) setRefreshingBriefing(true);
    else setLoadingBriefing(true);

    try {
      const res = await fetch(`/api/copilot/briefing${force ? '?force=true' : ''}`);
      const data = await res.json();
      if (data.success && data.briefing) {
        setBriefing(data.briefing);
        if (data.activeFocus) setActiveFocus(data.activeFocus);
        if (force) addToast({ type: 'success', message: 'Plan de bataille recalculé avec succès !' });
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Erreur lors du chargement du briefing' });
    } finally {
      setLoadingBriefing(false);
      setRefreshingBriefing(false);
    }
  };

  const handleUpdateFocus = async (newFocus: string) => {
    if (!newFocus.trim()) return;
    try {
      const res = await fetch('/api/copilot/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeFocus: newFocus.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveFocus(data.activeFocus);
        setIsFocusModalOpen(false);
        addToast({ type: 'success', message: `Focus mis à jour : ${data.activeFocus}` });
        // Recalculate briefing for the new focus
        loadBriefing(true);
      }
    } catch (e) {
      addToast({ type: 'error', message: 'Impossible de changer le focus' });
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || userInput;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setUserInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: messages.slice(-5).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();

      if (data.success) {
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          actionProposal: data.actionProposal
            ? { ...data.actionProposal, status: 'pending' }
            : null,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      addToast({ type: 'error', message: 'Erreur de communication avec le Copilote' });
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: "Désolé, j'ai rencontré une courte coupure réseau. Peux-tu reformuler ?",
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleApproveAction = async (msgId: string, proposal: ActionProposal) => {
    try {
      const res = await fetch('/api/copilot/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionProposal: proposal }),
      });
      const data = await res.json();

      if (data.success) {
        addToast({ type: 'success', message: data.message });
        // Mark proposal as approved
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId && m.actionProposal
              ? { ...m, actionProposal: { ...m.actionProposal, status: 'approved' } }
              : m
          )
        );
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || "Échec de l'action" });
    }
  };

  const handleSkipAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.actionProposal
          ? { ...m, actionProposal: { ...m.actionProposal, status: 'skipped' } }
          : m
      )
    );
    addToast({ type: 'info', message: 'Action ignorée. Aucune modification en base.' });
  };

  const handleRunMarketHunter = async (query?: string) => {
    setLoadingHunter(true);
    try {
      const res = await fetch('/api/copilot/market-hunter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customQuery: query || '' }),
      });
      const data = await res.json();
      if (data.success && data.niches) {
        setHunterNiches(data.niches);
      }
    } catch (e) {
      addToast({ type: 'error', message: 'Erreur lors du scan du marché' });
    } finally {
      setLoadingHunter(false);
    }
  };

  const formatWhatsAppUrl = (phone?: string) => {
    if (!phone) return '#';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '213' + clean.slice(1);
    return `https://wa.me/${clean}`;
  };

  return (
    <div className="min-h-screen bg-[#07070d] text-[#e8e4dc] pt-20 pb-12 px-4 sm:px-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-[rgba(197,160,89,0.15)] border border-[rgba(197,160,89,0.3)] flex items-center justify-center text-[#c5a059]">
                <Sparkles size={18} />
              </div>
              <h1 className="font-display text-[26px] sm:text-[32px] font-normal text-[#e8e4dc]">
                Directeur des Opérations & Stratégie IA
              </h1>
            </div>
            <p className="text-[13px] font-body text-[rgba(232,228,220,0.6)]">
              Plan de bataille quotidien, relances 48h automatisées et copilote interactif connecté à MongoDB Atlas.
            </p>
          </div>

          {/* Controls: Focus Badge & Refresh */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsFocusModalOpen(true)}
              className="px-4 py-2 rounded-full bg-[rgba(197,160,89,0.12)] hover:bg-[rgba(197,160,89,0.22)] border border-[rgba(197,160,89,0.35)] transition-all cursor-pointer flex items-center gap-2 text-[#c5a059]"
              title="Modifier la niche prioritaire retenue par l'IA"
            >
              <Target size={15} />
              <span className="text-[11.5px] font-mono uppercase tracking-[0.06em]">Focus Actif :</span>
              <span className="text-[12.5px] font-body font-semibold text-[#e8e4dc]">{activeFocus}</span>
            </button>

            <button
              onClick={() => loadBriefing(true)}
              disabled={refreshingBriefing}
              className="px-4 py-2 rounded-full bg-[#12121f] hover:bg-[#1a1a2e] text-[#e8e4dc] border border-[rgba(255,255,255,0.08)] transition-all cursor-pointer flex items-center gap-2 text-[12.5px] font-body disabled:opacity-50"
            >
              <RotateCcw size={14} className={cn(refreshingBriefing && "animate-spin text-[#c5a059]")} />
              <span>{refreshingBriefing ? "Recalcul..." : "Rafraîchir le Plan"}</span>
            </button>
          </div>
        </div>

        {/* Motivational / Headline Alert */}
        {briefing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-[14px] bg-gradient-to-r from-[rgba(197,160,89,0.10)] via-[rgba(16,16,28,0.7)] to-[rgba(10,10,18,0.7)] border border-[rgba(197,160,89,0.25)] flex items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[rgba(197,160,89,0.2)] flex items-center justify-center text-[#c5a059] flex-shrink-0">
                <Flame size={18} />
              </div>
              <div>
                <h2 className="text-[14px] font-body font-semibold text-[#e8e4dc]">
                  {briefing.headline}
                </h2>
                <p className="text-[12px] font-body text-[rgba(232,228,220,0.65)] mt-0.5 italic">
                  💡 {briefing.strategicTip}
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-5 text-right flex-shrink-0 border-l border-[rgba(255,255,255,0.08)] pl-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.06em] text-[rgba(232,228,220,0.5)]">Relances 48h</span>
                <p className="text-[16px] font-display text-[#f87171]">{briefing.urgent48hTasks?.length || 0}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.06em] text-[rgba(232,228,220,0.5)]">Prototypes</span>
                <p className="text-[16px] font-display text-[#a855f7]">{briefing.prototypeTasks?.length || 0}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.06em] text-[rgba(232,228,220,0.5)]">Appels Prêts</span>
                <p className="text-[16px] font-display text-[#4ade80]">{briefing.newCallingTargets?.length || 0}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Grid: Plan de Bataille (Left) + Interactive Copilot Chat (Right) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 cols): Plan de Bataille */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#0d0d18] border border-[rgba(255,255,255,0.06)] overflow-x-auto">
            <button
              onClick={() => setActiveTab('48h')}
              className={cn(
                "px-4 py-2 rounded-full text-[12px] font-body font-medium transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap",
                activeTab === '48h'
                  ? "bg-[rgba(239,68,68,0.18)] text-[#f87171] border border-[rgba(239,68,68,0.3)] shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                  : "text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc]"
              )}
            >
              <AlertTriangle size={13} />
              <span>Relances 48h</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#1b1216] text-[10px] font-mono">
                {briefing?.urgent48hTasks?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('prototypes')}
              className={cn(
                "px-4 py-2 rounded-full text-[12px] font-body font-medium transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap",
                activeTab === 'prototypes'
                  ? "bg-[rgba(168,85,247,0.18)] text-[#c084fc] border border-[rgba(168,85,247,0.3)] shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  : "text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc]"
              )}
            >
              <Layers size={13} />
              <span>Prototypes à Closer</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#1b1226] text-[10px] font-mono">
                {briefing?.prototypeTasks?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('calls')}
              className={cn(
                "px-4 py-2 rounded-full text-[12px] font-body font-medium transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap",
                activeTab === 'calls'
                  ? "bg-[rgba(74,222,128,0.18)] text-[#4ade80] border border-[rgba(74,222,128,0.3)] shadow-[0_0_15px_rgba(74,222,128,0.15)]"
                  : "text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc]"
              )}
            >
              <Phone size={13} />
              <span>Appels du Jour</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#112419] text-[10px] font-mono">
                {briefing?.newCallingTargets?.length || 0}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('hunter');
                if (hunterNiches.length === 0) handleRunMarketHunter();
              }}
              className={cn(
                "px-4 py-2 rounded-full text-[12px] font-body font-medium transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap",
                activeTab === 'hunter'
                  ? "bg-[rgba(197,160,89,0.18)] text-[#c5a059] border border-[rgba(197,160,89,0.3)] shadow-[0_0_15px_rgba(197,160,89,0.15)]"
                  : "text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc]"
              )}
            >
              <Compass size={13} />
              <span>Chasseur de Niches</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            
            {/* 1. Relances 48h */}
            {activeTab === '48h' && (
              <div className="space-y-3">
                {loadingBriefing ? (
                  <div className="p-8 text-center text-[rgba(232,228,220,0.4)]">
                    Analyse du pipeline en cours par Gemini 3.8 Flash...
                  </div>
                ) : !briefing?.urgent48hTasks?.length ? (
                  <div className="p-8 rounded-[16px] bg-[#0c0c16] border border-[rgba(255,255,255,0.06)] text-center">
                    <CheckCircle2 size={32} className="text-[#4ade80] mx-auto mb-2" />
                    <p className="text-[14px] text-[#e8e4dc] font-medium">Aucun prospect en retard de 48h !</p>
                    <p className="text-[12px] text-[rgba(232,228,220,0.5)] mt-1">Vos relances sont parfaitement à jour.</p>
                  </div>
                ) : (
                  briefing.urgent48hTasks.map((task: any, idx: number) => (
                    <motion.div
                      key={task.prospectId || idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-[14px] bg-[#0c0c16] border border-[rgba(239,68,68,0.22)] hover:border-[rgba(239,68,68,0.4)] transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-body font-semibold text-[#e8e4dc]">
                              {task.companyName}
                            </span>
                            <span className="text-[11px] font-mono text-[rgba(232,228,220,0.5)] px-2 py-0.5 rounded-full bg-[#161624]">
                              {task.city}
                            </span>
                          </div>
                          <p className="text-[12px] font-body text-[#f87171] mt-1 flex items-center gap-1.5">
                            <Clock size={12} />
                            <span>{task.reason}</span>
                          </p>
                          <p className="text-[12.5px] font-body text-[rgba(232,228,220,0.7)] mt-2">
                            👉 <strong className="text-[#e8e4dc]">Action :</strong> {task.recommendedAction}
                          </p>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {task.phone && task.phone !== 'Non renseigné' && (
                            <>
                              <a
                                href={`tel:${task.phone}`}
                                className="w-8 h-8 rounded-full bg-[rgba(74,222,128,0.15)] text-[#4ade80] hover:bg-[rgba(74,222,128,0.25)] flex items-center justify-center transition-colors"
                                title={`Appeler ${task.phone}`}
                              >
                                <Phone size={14} />
                              </a>
                              <a
                                href={formatWhatsAppUrl(task.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-full bg-[rgba(16,185,129,0.15)] text-[#10b981] hover:bg-[rgba(16,185,129,0.25)] flex items-center justify-center transition-colors"
                                title="Écrire sur WhatsApp"
                              >
                                <MessageSquare size={14} />
                              </a>
                            </>
                          )}
                          <Link
                            href="/crm"
                            className="px-2.5 py-1 rounded-full text-[11px] font-body bg-[#1b1b2d] hover:bg-[#25253e] text-[#e8e4dc] transition-colors"
                          >
                            CRM
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* 2. Prototypes à Closer */}
            {activeTab === 'prototypes' && (
              <div className="space-y-3">
                {!briefing?.prototypeTasks?.length ? (
                  <div className="p-8 rounded-[16px] bg-[#0c0c16] border border-[rgba(255,255,255,0.06)] text-center">
                    <p className="text-[14px] text-[#e8e4dc]">Aucun prototype actuellement en cours.</p>
                  </div>
                ) : (
                  briefing.prototypeTasks.map((task: any, idx: number) => (
                    <motion.div
                      key={task.prospectId || idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-[14px] bg-[#0c0c16] border border-[rgba(168,85,247,0.22)] hover:border-[rgba(168,85,247,0.4)] transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-body font-semibold text-[#e8e4dc]">
                              {task.companyName}
                            </span>
                            <span className="text-[11px] font-mono text-[#c084fc] px-2 py-0.5 rounded-full bg-[rgba(168,85,247,0.12)]">
                              {task.suggestedOffer || 'Offre Signature'}
                            </span>
                          </div>
                          <p className="text-[12.5px] font-body text-[rgba(232,228,220,0.8)] mt-1.5">
                            🎯 <strong className="text-[#c084fc]">Angle de closing :</strong> {task.closingTip}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {task.phone && (
                            <a
                              href={formatWhatsAppUrl(task.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-full text-[11px] font-body bg-[rgba(16,185,129,0.15)] text-[#10b981] hover:bg-[rgba(16,185,129,0.25)] flex items-center gap-1.5 transition-colors"
                            >
                              <MessageSquare size={13} />
                              <span>Relance WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* 3. Appels Prioritaires du Jour */}
            {activeTab === 'calls' && (
              <div className="space-y-3">
                {!briefing?.newCallingTargets?.length ? (
                  <div className="p-8 rounded-[16px] bg-[#0c0c16] border border-[rgba(255,255,255,0.06)] text-center">
                    <p className="text-[14px] text-[#e8e4dc]">Tous les nouveaux prospects ont été contactés !</p>
                  </div>
                ) : (
                  briefing.newCallingTargets.map((lead: any, idx: number) => (
                    <motion.div
                      key={lead.prospectId || idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-[14px] bg-[#0c0c16] border border-[rgba(74,222,128,0.2)] hover:border-[rgba(74,222,128,0.35)] transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-body font-semibold text-[#e8e4dc]">
                              {lead.companyName}
                            </span>
                            <span className="text-[11px] font-mono text-[rgba(232,228,220,0.5)] px-2 py-0.5 rounded-full bg-[#161624]">
                              {lead.city}
                            </span>
                            <span className="text-[10px] font-mono text-[#f87171] bg-[rgba(239,68,68,0.1)] px-2 py-0.5 rounded-full border border-[rgba(239,68,68,0.2)]">
                              Sans site
                            </span>
                          </div>
                          <p className="text-[12.5px] font-body text-[rgba(232,228,220,0.7)] mt-1.5">
                            ⚡ <strong className="text-[#4ade80]">Accroche Décrochage :</strong> {lead.hookAngle}
                          </p>
                          <p className="text-[12px] font-mono text-[#c5a059] mt-1">
                            📞 {lead.phone}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link
                            href="/call"
                            className="px-3 py-1.5 rounded-full text-[11px] font-body bg-[rgba(74,222,128,0.15)] text-[#4ade80] hover:bg-[rgba(74,222,128,0.25)] flex items-center gap-1.5 transition-colors"
                          >
                            <Phone size={13} />
                            <span>Call Studio</span>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* 4. Chasseur de Niches Algériennes */}
            {activeTab === 'hunter' && (
              <div className="space-y-4">
                <div className="p-4 rounded-[14px] bg-[#0c0c16] border border-[rgba(197,160,89,0.25)] flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[14px] font-body font-semibold text-[#e8e4dc]">
                      Explorateur de Marché B2B Algérie
                    </h3>
                    <p className="text-[12px] font-body text-[rgba(232,228,220,0.6)] mt-0.5">
                      Détection des secteurs à fort panier moyen avec un déficit numérique critique sur Google Maps.
                    </p>
                  </div>
                  <button
                    onClick={() => handleRunMarketHunter()}
                    disabled={loadingHunter}
                    className="px-4 py-2 rounded-full text-[12px] font-body bg-[rgba(197,160,89,0.15)] hover:bg-[rgba(197,160,89,0.25)] text-[#c5a059] border border-[rgba(197,160,89,0.35)] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Compass size={14} className={cn(loadingHunter && "animate-spin")} />
                    <span>{loadingHunter ? "Chasse en cours..." : "Scanner Nouvelles Niches"}</span>
                  </button>
                </div>

                {hunterNiches.map((niche: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-[14px] bg-[#0c0c16] border border-[rgba(255,255,255,0.08)] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-[16px] font-display font-medium text-[#c5a059]">
                          {niche.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[11px] font-mono text-[#4ade80] bg-[rgba(74,222,128,0.1)] px-2 py-0.5 rounded-full">
                            Ticket : {niche.ticketMoyenDA}
                          </span>
                          <span className="text-[11px] font-mono text-[rgba(232,228,220,0.6)] px-2 py-0.5 rounded-full bg-[#161624]">
                            Villes : {niche.targetWilayas?.join(', ')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUpdateFocus(niche.title)}
                        className="px-3 py-1.5 rounded-full text-[11px] font-body bg-[rgba(197,160,89,0.15)] hover:bg-[rgba(197,160,89,0.25)] text-[#c5a059] border border-[rgba(197,160,89,0.3)] transition-colors cursor-pointer"
                        title="Définir comme nouveau focus actif de l'agence"
                      >
                        Adopter ce Focus 🎯
                      </button>
                    </div>

                    <p className="text-[12.5px] font-body text-[rgba(232,228,220,0.8)]">
                      🩸 <strong className="text-[#e8e4dc]">Point de douleur :</strong> {niche.painPoint}
                    </p>

                    <div className="p-3 rounded-[8px] bg-[#07070d] border border-[rgba(255,255,255,0.05)]">
                      <span className="text-[10.5px] font-mono uppercase tracking-[0.06em] text-[rgba(232,228,220,0.5)]">
                        Requêtes prêtes pour Bot-Se Google Maps :
                      </span>
                      <p className="text-[12px] font-mono text-[#4ade80] mt-1">
                        {niche.suggestedBotQueries?.join(' | ')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Interactive Copilot Chat */}
        <div className="lg:col-span-5">
          <div className="h-[750px] rounded-[20px] bg-[#0c0c16] border border-[rgba(197,160,89,0.25)] shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden">
            
            {/* Chat Header */}
            <div className="p-4 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(16,16,28,0.7)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[rgba(197,160,89,0.15)] border border-[rgba(197,160,89,0.35)] flex items-center justify-center text-[#c5a059]">
                  <Bot size={17} />
                </div>
                <div>
                  <h3 className="font-display font-medium text-[15px] text-[#e8e4dc]">
                    Discussion Copilote
                  </h3>
                  <p className="text-[10.5px] font-mono text-[#4ade80] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                    Gemini 3.8 Flash • Validation Sécurisée
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181829] text-[rgba(232,228,220,0.5)]">
                MongoDB Live
              </span>
            </div>

            {/* Chat Messages Flow */}
            <div
              ref={chatScrollRef}
              className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[88%] p-3.5 rounded-[14px] text-[13px] font-body leading-relaxed",
                      msg.role === 'user'
                        ? "bg-[#1f1a14] border border-[rgba(197,160,89,0.35)] text-[#f4efe6] rounded-br-[4px]"
                        : "bg-[#11111e] border border-[rgba(255,255,255,0.08)] text-[#e8e4dc] rounded-bl-[4px]"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Antigravity 2.0-Style Action Proposal Card */}
                    {msg.actionProposal && (
                      <div className="mt-3 p-3.5 rounded-[12px] bg-[#07070d] border border-[rgba(197,160,89,0.4)] shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-2.5">
                        <div className="flex items-center gap-1.5 text-[#c5a059] text-[11px] font-mono uppercase tracking-[0.06em]">
                          <ShieldCheck size={13} />
                          <span>Action Proposée (Requiert votre validation)</span>
                        </div>

                        <p className="text-[12px] font-body text-[#e8e4dc] font-medium">
                          {msg.actionProposal.summary}
                        </p>

                        {/* Status Check / Buttons */}
                        {msg.actionProposal.status === 'approved' ? (
                          <div className="flex items-center gap-1.5 text-[11.5px] font-body text-[#4ade80] bg-[rgba(74,222,128,0.1)] px-2.5 py-1 rounded-[6px]">
                            <Check size={13} />
                            <span>Action validée et appliquée dans MongoDB Atlas !</span>
                          </div>
                        ) : msg.actionProposal.status === 'skipped' ? (
                          <div className="flex items-center gap-1.5 text-[11.5px] font-body text-[rgba(232,228,220,0.5)] bg-[#141420] px-2.5 py-1 rounded-[6px]">
                            <X size={13} />
                            <span>Action ignorée.</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleApproveAction(msg.id, msg.actionProposal!)}
                              className="px-3 py-1.5 rounded-full text-[11px] font-body bg-[rgba(74,222,128,0.18)] hover:bg-[rgba(74,222,128,0.28)] text-[#4ade80] border border-[rgba(74,222,128,0.35)] transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Check size={12} />
                              <span>Valider (Approve)</span>
                            </button>
                            <button
                              onClick={() => handleSkipAction(msg.id)}
                              className="px-3 py-1.5 rounded-full text-[11px] font-body bg-[#181826] hover:bg-[#222236] text-[rgba(232,228,220,0.6)] border border-[rgba(255,255,255,0.08)] transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <X size={12} />
                              <span>Ignorer (Skip)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <span className="block text-[9.5px] font-mono text-[rgba(232,228,220,0.35)] mt-1.5 text-right">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex items-center gap-2 text-[12px] font-body text-[#c5a059] italic p-2">
                  <Sparkles size={14} className="animate-spin" />
                  <span>Analyse et formulation tactique en cours...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 py-2 border-t border-[rgba(255,255,255,0.05)] bg-[#090912] flex items-center gap-1.5 overflow-x-auto">
              {[
                "Qui appeler en premier ?",
                "Fais le point sur les prototypes",
                "Chasser une nouvelle niche",
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  disabled={isSending}
                  className="px-2.5 py-1 rounded-full text-[10.5px] font-body bg-[#141424] hover:bg-[#1f1f38] text-[rgba(232,228,220,0.7)] hover:text-[#e8e4dc] border border-[rgba(255,255,255,0.06)] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 border-t border-[rgba(255,255,255,0.08)] bg-[#0a0a14] flex items-center gap-2"
            >
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Posez une question ou demandez une action..."
                className="flex-1 bg-[#121220] border border-[rgba(255,255,255,0.08)] focus:border-[#c5a059] rounded-full px-4 py-2 text-[12.5px] font-body text-[#e8e4dc] outline-none transition-all placeholder:text-[rgba(232,228,220,0.3)]"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!userInput.trim() || isSending}
                className="w-9 h-9 rounded-full bg-[rgba(197,160,89,0.2)] hover:bg-[rgba(197,160,89,0.35)] text-[#c5a059] border border-[rgba(197,160,89,0.4)] flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Focus Edit Modal */}
      <AnimatePresence>
        {isFocusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-[18px] bg-[#0e0e1a] border border-[rgba(197,160,89,0.35)] p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.08)]">
                <div className="flex items-center gap-2 text-[#c5a059]">
                  <Target size={18} />
                  <h3 className="font-display text-[17px] text-[#e8e4dc]">Changer le Focus Actif</h3>
                </div>
                <button
                  onClick={() => setIsFocusModalOpen(false)}
                  className="text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-[12.5px] font-body text-[rgba(232,228,220,0.65)] leading-relaxed">
                Ce focus sera <strong>retenu en mémoire</strong> par l'IA jour après jour jusqu'à votre prochain changement. Tous les briefings et relances seront calibrés dessus.
              </p>

              {/* Suggestions from DB */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[rgba(232,228,220,0.5)]">
                  Niches existantes dans votre CRM :
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {availableNiches.map((niche) => (
                    <button
                      key={niche}
                      onClick={() => handleUpdateFocus(niche)}
                      className={cn(
                        "px-3 py-1 rounded-full text-[11.5px] font-body transition-colors cursor-pointer border",
                        activeFocus === niche
                          ? "bg-[rgba(197,160,89,0.2)] text-[#c5a059] border-[#c5a059]"
                          : "bg-[#141424] text-[rgba(232,228,220,0.7)] border-[rgba(255,255,255,0.06)] hover:bg-[#1b1b32]"
                      )}
                    >
                      {niche}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="pt-2">
                <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-[rgba(232,228,220,0.5)]">
                  Ou définir une nouvelle cible :
                </span>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="text"
                    value={customFocusInput}
                    onChange={(e) => setCustomFocusInput(e.target.value)}
                    placeholder="Ex: Cliniques privées, Promoteurs..."
                    className="flex-1 bg-[#141424] border border-[rgba(255,255,255,0.08)] rounded-full px-3.5 py-1.5 text-[12px] font-body text-[#e8e4dc] outline-none focus:border-[#c5a059]"
                  />
                  <button
                    onClick={() => handleUpdateFocus(customFocusInput)}
                    disabled={!customFocusInput.trim()}
                    className="px-4 py-1.5 rounded-full text-[12px] font-body bg-[rgba(197,160,89,0.2)] text-[#c5a059] border border-[rgba(197,160,89,0.35)] hover:bg-[rgba(197,160,89,0.3)] transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Valider
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
