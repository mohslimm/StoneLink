"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Send, Phone, MessageSquare, Clock, AlertTriangle, 
  CheckCircle2, Sparkles, Filter, ChevronRight, ArrowRight, Zap,
  Globe, Shield, Eye, Activity, Radio
} from 'lucide-react';
import type { Prospect } from '@/types';
import { 
  FollowUpStep, 
  STEP_NAMES, 
  REACTION_CONFIG, 
  parseLeadFollowUp, 
  LeadFollowUpData,
  FOLLOW_UP_SCRIPTS
} from '@/lib/followup';
import { openWhatsAppDirect } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

interface NeuralSynapseCanvasProps {
  prospects: Prospect[];
  selectedProspect: Prospect | null;
  onSelectProspect: (prospect: Prospect) => void;
  onQuickWhatsApp: (prospect: Prospect, step: FollowUpStep) => void;
}

export function NeuralSynapseCanvas({
  prospects,
  selectedProspect,
  onSelectProspect,
  onQuickWhatsApp,
}: NeuralSynapseCanvasProps) {
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'today' | 'overdue' | 'active'>('all');
  const [hoveredLeadId, setHoveredLeadId] = useState<string | null>(null);

  // Parse and enrich all leads
  const enrichedLeads = useMemo(() => {
    return prospects.map((p) => {
      const data = parseLeadFollowUp(p);
      return {
        prospect: p,
        data,
      };
    });
  }, [prospects]);

  // Filtered leads
  const filtered = useMemo(() => {
    return enrichedLeads.filter(({ prospect, data }) => {
      // Urgency filter
      if (urgencyFilter === 'today' && data.urgency !== 'today') return false;
      if (urgencyFilter === 'overdue' && data.urgency !== 'overdue') return false;
      if (urgencyFilter === 'active' && data.currentStep === 0) return false;

      // Text search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = prospect.name.toLowerCase().includes(q);
        const matchesCompany = prospect.company.toLowerCase().includes(q);
        const matchesCity = (prospect.city || '').toLowerCase().includes(q);
        const matchesPhone = prospect.phone.includes(q);
        const matchesNotes = (prospect.notes || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCompany && !matchesCity && !matchesPhone && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedLeads, urgencyFilter, search]);

  // Group by neural tier / step
  const groupedSteps = useMemo(() => {
    const map: Record<FollowUpStep, Array<{ prospect: Prospect; data: LeadFollowUpData }>> = {
      0: [],
      1: [],
      2: [],
      3: [],
    };

    filtered.forEach((item) => {
      map[item.data.currentStep].push(item);
    });

    return map;
  }, [filtered]);

  // Quick stats
  const totalCount = prospects.length;
  const todayCount = enrichedLeads.filter((x) => x.data.urgency === 'today').length;
  const overdueCount = enrichedLeads.filter((x) => x.data.urgency === 'overdue').length;

  return (
    <div className="flex flex-col gap-6 relative">
      {/* ─── Neural Command Bar ─── */}
      <div className="p-4 rounded-[16px] bg-[#090913]/90 border border-[rgba(168,85,247,0.25)] shadow-[0_4px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 relative z-20">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)]" />
          <input
            type="text"
            placeholder="Rechercher une cellule (agence, ville, téléphone, note)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-[12px] bg-[#10101f] border border-[rgba(255,255,255,0.08)] pl-9 pr-9 text-[13px] text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.35)] focus:outline-none focus:border-[#c5a059] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)] hover:text-[#e8e4dc]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Impulse Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setUrgencyFilter('all')}
            className={cn(
              "h-9 px-3.5 rounded-[10px] text-[12px] font-body font-medium transition-all cursor-pointer flex items-center gap-1.5",
              urgencyFilter === 'all'
                ? "bg-[rgba(197,160,89,0.22)] border border-[#c5a059] text-[#c5a059] shadow-[0_0_12px_rgba(197,160,89,0.18)]"
                : "bg-[#111120] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.65)] hover:border-[rgba(255,255,255,0.2)]"
            )}
          >
            <span>Toutes les cellules ({totalCount})</span>
          </button>

          <button
            onClick={() => setUrgencyFilter('today')}
            className={cn(
              "h-9 px-3.5 rounded-[10px] text-[12px] font-body font-medium transition-all cursor-pointer flex items-center gap-1.5",
              urgencyFilter === 'today'
                ? "bg-[rgba(74,222,128,0.22)] border border-[rgba(74,222,128,0.55)] text-[#4ade80] shadow-[0_0_16px_rgba(74,222,128,0.25)]"
                : "bg-[#111120] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.65)] hover:border-[rgba(74,222,128,0.3)]"
            )}
            title="Cellules prêtes pour impulsion électrique aujourd'hui"
          >
            <Zap size={13} className={urgencyFilter === 'today' ? "fill-[#4ade80]" : "text-[#4ade80]"} />
            <span>Impulsion requise (Aujourd&apos;hui)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[rgba(74,222,128,0.2)] text-[#4ade80]">
              {todayCount}
            </span>
          </button>

          <button
            onClick={() => setUrgencyFilter('overdue')}
            className={cn(
              "h-9 px-3.5 rounded-[10px] text-[12px] font-body font-medium transition-all cursor-pointer flex items-center gap-1.5",
              urgencyFilter === 'overdue'
                ? "bg-[rgba(239,68,68,0.22)] border border-[rgba(239,68,68,0.55)] text-[#f87171] shadow-[0_0_16px_rgba(239,68,68,0.25)]"
                : "bg-[#111120] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.65)] hover:border-[rgba(239,68,68,0.3)]"
            )}
            title="Synapses bloquées sans décharge depuis plus de 3 jours"
          >
            <AlertTriangle size={13} className="text-[#f87171]" />
            <span>Synapses bloquées (&gt; 3j)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[rgba(239,68,68,0.2)] text-[#f87171]">
              {overdueCount}
            </span>
          </button>
        </div>
      </div>

      {/* ─── Neural Synapse Schematic Canvas ─── */}
      <div className="relative rounded-[24px] bg-[#06060e] border border-[rgba(168,85,247,0.18)] shadow-[inset_0_0_80px_rgba(0,0,0,0.85)] p-6 overflow-x-auto">
        {/* Ambient Neuro-mesh SVG Backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="neuralGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="1" fill="#a855f7" />
                <path d="M 30 0 L 30 60 M 0 30 L 60 30" stroke="rgba(168,85,247,0.12)" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="axonPulse" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#c5a059" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#neuralGrid)" />
          </svg>
        </div>

        {/* Horizontal Synaptic Highway Header */}
        <div className="min-w-[1280px] grid grid-cols-4 gap-6 mb-8 relative z-10">
          {([0, 1, 2, 3] as FollowUpStep[]).map((step, idx) => {
            const meta = STEP_NAMES[step];
            const count = groupedSteps[step].length;

            return (
              <div key={step} className="relative">
                {/* Connecting Axon Bridge between ganglia */}
                {idx < 3 && (
                  <div className="absolute top-1/2 -right-6 w-6 h-[2px] bg-gradient-to-r from-[rgba(168,85,247,0.5)] to-[rgba(197,160,89,0.5)] z-0 hidden sm:block">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059] shadow-[0_0_8px_#c5a059] absolute top-1/2 -translate-y-1/2 animate-ping" />
                  </div>
                )}

                {/* Ganglion Core Hub */}
                <div
                  className="p-4 rounded-[20px] bg-gradient-to-b from-[#121020] to-[#0c0a18] border transition-all relative overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                  style={{
                    borderColor: `${meta.color}45`,
                  }}
                >
                  {/* Subtle top glow line */}
                  <div
                    className="absolute top-0 left-4 right-4 h-[2px]"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)`,
                    }}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full animate-pulse shadow-sm"
                        style={{ backgroundColor: meta.color }}
                      />
                      <span
                        className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border"
                        style={{
                          borderColor: `${meta.color}40`,
                          backgroundColor: `${meta.color}15`,
                          color: meta.color,
                        }}
                      >
                        {meta.badge}
                      </span>
                    </div>

                    <span className="text-[14px] font-mono font-bold text-[#e8e4dc] px-2 py-0.5 rounded-full bg-[#18182b] border border-[rgba(255,255,255,0.06)]">
                      {count}
                    </span>
                  </div>

                  <h3 className="font-display font-semibold text-[17px] text-[#e8e4dc] mt-2.5">
                    {meta.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] font-body text-[rgba(232,228,220,0.5)] mt-1">
                    <span>{meta.subtitle}</span>
                    <span className="font-mono text-[10px] text-[#c5a059] font-medium">{meta.daysTarget}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── The Neural Axon Cluster Columns ─── */}
        <div className="min-w-[1280px] grid grid-cols-4 gap-6 items-start relative z-10">
          {([0, 1, 2, 3] as FollowUpStep[]).map((step) => {
            const leadsInStep = groupedSteps[step];
            const meta = STEP_NAMES[step];

            return (
              <div
                key={step}
                className="flex flex-col gap-3.5 p-3 rounded-[22px] bg-[#090814]/70 border border-[rgba(255,255,255,0.03)] min-h-[540px] relative backdrop-blur-md"
              >
                {leadsInStep.length === 0 ? (
                  <div className="py-24 text-center text-[rgba(232,228,220,0.35)] text-[12px] font-body italic flex flex-col items-center justify-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.2)] flex items-center justify-center text-[rgba(168,85,247,0.5)]">
                      <Radio size={16} />
                    </div>
                    <span>Aucune synapse active à ce stade</span>
                  </div>
                ) : (
                  leadsInStep.map(({ prospect, data }) => {
                    const isSelected = selectedProspect?.id === prospect.id;
                    const isHovered = hoveredLeadId === prospect.id;
                    const reactionMeta = data.primaryObjection ? REACTION_CONFIG[data.primaryObjection] : null;
                    const companyInitial = (prospect.company || 'A').trim().charAt(0).toUpperCase();

                    return (
                      <motion.div
                        key={prospect.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -3, scale: 1.01 }}
                        onMouseEnter={() => setHoveredLeadId(prospect.id)}
                        onMouseLeave={() => setHoveredLeadId(null)}
                        onClick={() => onSelectProspect(prospect)}
                        className={cn(
                          // Bio-cellular capsule shape
                          "p-4 rounded-[22px] border transition-all cursor-pointer relative group overflow-hidden select-none",
                          isSelected
                            ? "bg-gradient-to-r from-[#1c1830] to-[#141224] border-[#c5a059] shadow-[0_0_30px_rgba(197,160,89,0.3)] ring-1 ring-[#c5a059]/60"
                            : data.urgency === 'today'
                            ? "bg-gradient-to-r from-[#0e1818] to-[#0c0d18] border-[rgba(74,222,128,0.45)] hover:border-[#4ade80] shadow-[0_0_20px_rgba(74,222,128,0.15)]"
                            : data.urgency === 'overdue'
                            ? "bg-gradient-to-r from-[#180e12] to-[#0d0c18] border-[rgba(239,68,68,0.4)] hover:border-[#f87171] shadow-[0_0_16px_rgba(239,68,68,0.12)]"
                            : "bg-[#0d0c18]/90 border-[rgba(255,255,255,0.06)] hover:border-[rgba(197,160,89,0.4)] hover:bg-[#121022]"
                        )}
                      >
                        {/* ─── Biological Soma / Cell Body Structure ─── */}
                        <div className="flex items-start gap-3">
                          {/* Cellular Nucleus (Noyau Circulaire Luminescent) */}
                          <div
                            className={cn(
                              "w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-[14px] relative border transition-transform group-hover:scale-105",
                              data.urgency === 'today'
                                ? "bg-[rgba(74,222,128,0.18)] border-[#4ade80] text-[#4ade80] shadow-[0_0_14px_rgba(74,222,128,0.35)]"
                                : data.urgency === 'overdue'
                                ? "bg-[rgba(239,68,68,0.18)] border-[#f87171] text-[#f87171] shadow-[0_0_14px_rgba(239,68,68,0.3)]"
                                : "bg-[rgba(168,85,247,0.15)] border-[rgba(168,85,247,0.4)] text-[#c084fc] shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                            )}
                          >
                            <span>{companyInitial}</span>

                            {/* Orbiting pulse dot on nucleus */}
                            {data.urgency === 'today' && (
                              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#4ade80] animate-ping" />
                            )}
                          </div>

                          {/* Cell Cytoplasm Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-1.5">
                              <h4 className="font-body font-semibold text-[13.5px] text-[#e8e4dc] leading-tight truncate group-hover:text-[#c5a059] transition-colors">
                                {prospect.company}
                              </h4>

                              {/* Elapsed Days Badge */}
                              <span
                                className={cn(
                                  "text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 tracking-wide font-bold",
                                  data.urgency === 'today'
                                    ? "bg-[rgba(74,222,128,0.18)] border-[rgba(74,222,128,0.45)] text-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.2)]"
                                    : data.urgency === 'overdue'
                                    ? "bg-[rgba(239,68,68,0.18)] border-[rgba(239,68,68,0.45)] text-[#f87171]"
                                    : "bg-[#161628] border-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.5)]"
                                )}
                              >
                                {data.daysSinceLastAction === 0 ? "Aujourd'hui" : `J+${data.daysSinceLastAction}`}
                              </span>
                            </div>

                            <p className="text-[11.5px] font-body text-[rgba(232,228,220,0.55)] truncate mt-0.5">
                              {prospect.name}
                            </p>

                            <div className="flex items-center gap-1.5 text-[10.5px] font-body text-[rgba(232,228,220,0.4)] mt-1.5">
                              <span className="truncate">{prospect.city || 'Algérie'}</span>
                              <span>•</span>
                              <span className="truncate">{prospect.sector || 'Voyage'}</span>
                            </div>
                          </div>
                        </div>

                        {/* ─── Cellular Marker (Objection / Reaction Tag) ─── */}
                        {reactionMeta && (
                          <div
                            className="mt-3 px-2.5 py-1 rounded-[10px] text-[11px] font-body flex items-center gap-1.5 border"
                            style={{
                              backgroundColor: reactionMeta.bgColor,
                              borderColor: `${reactionMeta.color}35`,
                              color: reactionMeta.color,
                            }}
                          >
                            <span>{reactionMeta.emoji}</span>
                            <span className="truncate font-medium">{reactionMeta.label}</span>
                          </div>
                        )}

                        {/* Verbatim quote from prospect */}
                        {data.history.length > 0 && data.history[data.history.length - 1].verbatim && (
                          <div className="mt-2.5 px-2.5 py-1.5 rounded-[10px] bg-[#06060c] border border-[rgba(255,255,255,0.04)] text-[11px] font-body italic text-[rgba(232,228,220,0.75)] line-clamp-1">
                            &ldquo;{data.history[data.history.length - 1].verbatim}&rdquo;
                          </div>
                        )}

                        {/* ─── Synaptic Action Footer ─── */}
                        <div
                          className="mt-3 pt-2.5 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* WhatsApp Impulse Trigger */}
                          <button
                            type="button"
                            onClick={() => onQuickWhatsApp(prospect, data.currentStep)}
                            className="h-6 px-2.5 rounded-full bg-[rgba(34,197,94,0.14)] hover:bg-[rgba(34,197,94,0.25)] border border-[rgba(34,197,94,0.35)] text-[#4ade80] text-[10.5px] font-body font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(34,197,94,0.15)]"
                            title="Déclencher l'impulsion WhatsApp pour cette étape"
                          >
                            <Send size={11} />
                            <span>Impulsion WhatsApp</span>
                          </button>

                          {/* Scribe Inspection Link */}
                          <button
                            type="button"
                            onClick={() => onSelectProspect(prospect)}
                            className="text-[11px] font-body text-[#c5a059] hover:underline flex items-center gap-0.5"
                          >
                            <span>Saisie</span>
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
