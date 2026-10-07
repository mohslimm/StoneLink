"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Brain, Zap, AlertTriangle, CheckCircle2, 
  BarChart3, LayoutGrid, List, Sparkles, Send, RefreshCw,
  Search, Filter, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useProspectsStore } from '@/hooks/useProspectsStore';
import { useUIStore } from '@/hooks/useUIStore';
import type { Prospect, PipelineStage } from '@/types';
import { 
  FollowUpStep, 
  STEP_NAMES, 
  REACTION_CONFIG,
  parseLeadFollowUp, 
  serializeLeadNotes,
  calculateStrategyMetrics,
  FOLLOW_UP_SCRIPTS
} from '@/lib/followup';
import { openWhatsAppDirect } from '@/lib/whatsapp';
import { NeuralSynapseCanvas } from '@/components/crm/prototypes/NeuralSynapseCanvas';
import { NeuralConstellationCanvas } from '@/components/crm/prototypes/NeuralConstellationCanvas';
import { NeuralScribeDrawer } from '@/components/crm/prototypes/NeuralScribeDrawer';
import { StrategyDiagnosticPanel } from '@/components/crm/prototypes/StrategyDiagnosticPanel';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type TabView = 'constellation' | 'synapse' | 'diagnostic';

export default function PrototypesLabPage() {
  const { prospects, loading, fetchProspects, updateNotes, updateStage } = useProspectsStore();
  const { addToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<TabView>('constellation');
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  // Filter only prototype stage leads
  const prototypeLeads = useMemo(() => {
    return prospects.filter((p) => p.stage === 'prototype');
  }, [prospects]);

  // Metrics
  const diagnosis = useMemo(() => {
    return calculateStrategyMetrics(prototypeLeads);
  }, [prototypeLeads]);

  // Handle saving follow-up notes & reactions
  const handleSaveFollowUp = async (prospectId: string, updatedNotes: string) => {
    await updateNotes(prospectId, updatedNotes);
    addToast({
      type: 'success',
      message: 'Données de relance synchronisées avec succès !',
    });
  };

  // Handle updating stage (e.g. Won -> ferme, Lost -> perdu)
  const handleUpdateStage = async (prospectId: string, stage: PipelineStage) => {
    await updateStage(prospectId, stage);
    addToast({
      type: 'success',
      message: stage === 'ferme' ? 'Félicitations ! Prospect marqué comme Gagné 🎉' : 'Prospect archivé',
    });
  };

  // Quick WhatsApp trigger from canvas
  const handleQuickWhatsApp = (prospect: Prospect, step: FollowUpStep) => {
    const script = step === 0
      ? `Salam alaykoum,\n\nRavi de notre échange ! Voici le prototype conçu pour votre agence :\n👉 https://parfait-voyage.vercel.app/\n\nFlyer & 3 formules :\n👉 https://flyer-parfait-voyage.vercel.app/\n\nDites-moi ce que vous en pensez 🌍`
      : FOLLOW_UP_SCRIPTS[step as 1 | 2 | 3]?.fr;

    openWhatsAppDirect(prospect.phone, script);
  };

  return (
    <div className="min-h-screen bg-[#07070d] text-[#e8e4dc] pb-24">
      {/* ─── Top Neural Banner & Navigation ─── */}
      <div className="border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a14]/90 backdrop-blur-xl sticky top-14 z-30 px-6 py-4">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-4">
            <Link
              href="/crm"
              className="h-9 px-3 rounded-[8px] bg-[#12121f] hover:bg-[#1a1a2e] border border-[rgba(255,255,255,0.08)] hover:border-[#c5a059]/40 text-[rgba(232,228,220,0.7)] hover:text-[#e8e4dc] text-[12px] font-body font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Retour au CRM</span>
            </Link>

            <div className="h-5 w-[1px] bg-[rgba(255,255,255,0.08)] hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[rgba(168,85,247,0.18)] border border-[rgba(168,85,247,0.35)] flex items-center justify-center text-[#c084fc]">
                  <Brain size={13} />
                </div>
                <h1 className="font-display font-semibold text-[20px] text-[#e8e4dc] tracking-tight flex items-center gap-2">
                  <span>Laboratoire de Suivi & Réseau Neuronal</span>
                  <span className="text-[12px] font-mono px-2 py-0.5 rounded-full bg-[rgba(197,160,89,0.15)] text-[#c5a059] border border-[rgba(197,160,89,0.3)]">
                    {prototypeLeads.length} Prototypes
                  </span>
                </h1>
              </div>
              <p className="text-[12px] font-body text-[rgba(232,228,220,0.5)] mt-0.5">
                Pilotage chronologique des relances WhatsApp & Diagnostic des points de blocage
              </p>
            </div>
          </div>

          {/* Right: Quick Counters & View Switcher */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Urgency Indicators */}
            <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono">
              <span className="px-2 py-1 rounded bg-[rgba(74,222,128,0.12)] border border-[rgba(74,222,128,0.3)] text-[#4ade80] flex items-center gap-1">
                <Zap size={11} />
                <span>{diagnosis.urgencyCounts.today} aujourd&apos;hui</span>
              </span>
              <span className="px-2 py-1 rounded bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.3)] text-[#f87171] flex items-center gap-1">
                <AlertTriangle size={11} />
                <span>{diagnosis.urgencyCounts.overdue} en retard</span>
              </span>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex rounded-[10px] bg-[#12121f] p-1 border border-[rgba(255,255,255,0.08)]">
              <button
                type="button"
                onClick={() => setActiveTab('constellation')}
                className={cn(
                  "px-3 py-1.5 rounded-[7px] text-[12px] font-body font-medium flex items-center gap-1.5 transition-all cursor-pointer",
                  activeTab === 'constellation'
                    ? "bg-[#c5a059] text-[#0a0a12] font-semibold shadow-sm"
                    : "text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc]"
                )}
                title="Option B : Vue Constellation Neurale Spatiale"
              >
                <Sparkles size={14} />
                <span>Constellation (Option B)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('synapse')}
                className={cn(
                  "px-3 py-1.5 rounded-[7px] text-[12px] font-body font-medium flex items-center gap-1.5 transition-all cursor-pointer",
                  activeTab === 'synapse'
                    ? "bg-[#c5a059] text-[#0a0a12] font-semibold shadow-sm"
                    : "text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc]"
                )}
                title="Option A : Vue Flot Synaptique Horizontal"
              >
                <Brain size={14} />
                <span>Flot Synaptique (Option A)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('diagnostic')}
                className={cn(
                  "px-3 py-1.5 rounded-[7px] text-[12px] font-body font-medium flex items-center gap-1.5 transition-all cursor-pointer",
                  activeTab === 'diagnostic'
                    ? "bg-[#c5a059] text-[#0a0a12] font-semibold shadow-sm"
                    : "text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc]"
                )}
                title="Analyseur des Faiblesses de la Stratégie"
              >
                <BarChart3 size={14} />
                <span>Diagnostic Stratégie</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content Container ─── */}
      <div className="max-w-[1720px] mx-auto px-6 mt-6">
        {loading && prototypeLeads.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-[#c5a059]" size={36} />
            <p className="text-[13px] font-body text-[rgba(232,228,220,0.6)]">
              Chargement du réseau neuronal et des prototypes...
            </p>
          </div>
        ) : prototypeLeads.length === 0 ? (
          <div className="py-24 text-center max-w-[480px] mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-[rgba(168,85,247,0.12)] border border-[rgba(168,85,247,0.25)] flex items-center justify-center mx-auto text-[#c084fc]">
              <Brain size={28} />
            </div>
            <h3 className="font-display font-medium text-[20px] text-[#e8e4dc]">
              Aucun prospect au stade « Prototypes envoyés »
            </h3>
            <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)] leading-relaxed">
              Pour alimenter ce laboratoire, passez vos prospects qualifiés au statut « Prototypes envoyés » depuis le tableau Kanban du CRM.
            </p>
            <Link
              href="/crm"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#161625] hover:bg-[#222235] border border-[rgba(255,255,255,0.08)] text-[#c5a059] text-[12.5px] font-body transition-colors"
            >
              <span>Accéder au CRM</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div>
            {/* View 1 : Neural Constellation Canvas (Option B) */}
            {activeTab === 'constellation' && (
              <NeuralConstellationCanvas
                prospects={prototypeLeads}
                selectedProspect={selectedProspect}
                onSelectProspect={(p) => setSelectedProspect(p)}
                onQuickWhatsApp={handleQuickWhatsApp}
              />
            )}

            {/* View 2 : Neural Synapse Canvas (Option A) */}
            {activeTab === 'synapse' && (
              <NeuralSynapseCanvas
                prospects={prototypeLeads}
                selectedProspect={selectedProspect}
                onSelectProspect={(p) => setSelectedProspect(p)}
                onQuickWhatsApp={handleQuickWhatsApp}
              />
            )}

            {/* View 3 : Strategy Diagnosis */}
            {activeTab === 'diagnostic' && (
              <StrategyDiagnosticPanel prospects={prototypeLeads} />
            )}
          </div>
        )}
      </div>

      {/* ─── Neural Scribe Drawer ─── */}
      <AnimatePresence>
        {selectedProspect && (
          <NeuralScribeDrawer
            prospect={selectedProspect}
            onClose={() => setSelectedProspect(null)}
            onSaveFollowUp={handleSaveFollowUp}
            onUpdateStage={handleUpdateStage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
