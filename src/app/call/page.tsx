"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Loader2, Sparkles, Phone, Mic, MicOff, Pause, PhoneOff, ChevronRight, ChevronLeft, ChevronDown,
  CheckCircle, X, Calendar, Send, Clock, Search, Copy, Check, MessageSquare,
  ShieldAlert, Globe, MapPin, Building2, Flame, Languages, AlertCircle, Filter, RotateCcw, Star, FileText,
  Bot, Smartphone, Volume2, ShieldCheck
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/custom/GlassPanel';
import { CallTimer } from '@/components/ui/custom/CallTimer';
import { AnimatedButton } from '@/components/ui/custom/AnimatedButton';
import { VoiceAgentLiveConsole } from '@/components/ui/custom/VoiceAgentLiveConsole';
import { useCallStore } from '@/hooks/useCallStore';
import { useUIStore } from '@/hooks/useUIStore';
import { useSettingsStore } from '@/hooks/useSettingsStore';
import { useProspectsStore } from '@/hooks/useProspectsStore';
import { mockProspects, mockObjections } from '@/data/prospects';
import { generatePitches } from '@/services/pitch/PitchGenerator';
import { STAGE_LABELS, type PipelineStage } from '@/types';

/* Helper: Check if prospect actually has a website */
function hasValidWebsite(url?: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return clean !== '' &&
         clean !== 'pas de site web' &&
         clean !== 'non renseigné' &&
         clean !== 'aucun' &&
         clean.length > 3;
}

/* Helper: Extract area / wilaya from prospect notes or address */
function extractArea(p: any): string {
  if (p.notes && p.notes.includes('Zone:')) {
    const match = p.notes.match(/Zone:\s*([^|]+)/);
    if (match) return match[1].trim();
  }
  if (p.city) return p.city.trim();
  return 'Général';
}

/* ─── Custom Quiet Luxury Dropdown with Dynamic Filters ─── */
function ProspectCustomDropdown({
  prospects,
  selected,
  onSelect,
  nicheFilter,
  areaFilter,
  noWebsiteOnly,
  priorityOnly,
}: {
  prospects: typeof mockProspects;
  selected: typeof mockProspects[0];
  onSelect: (p: typeof mockProspects[0]) => void;
  nicheFilter: string;
  areaFilter: string;
  noWebsiteOnly: boolean;
  priorityOnly: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filtered = useMemo(() => {
    return prospects.filter(p => {
      const matchNiche = nicheFilter === 'all' || p.sector === nicheFilter;
      const matchArea = areaFilter === 'all' || extractArea(p) === areaFilter;
      const hasWeb = hasValidWebsite(p.url);
      const matchNoWeb = !noWebsiteOnly || !hasWeb;
      const matchPriority = !priorityOnly || (!hasWeb && p.score >= 40);

      const q = search.toLowerCase().trim();
      const matchSearch = !q ||
        p.company.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.sector.toLowerCase().includes(q) ||
        (p.notes && p.notes.toLowerCase().includes(q));

      return matchNiche && matchArea && matchNoWeb && matchPriority && matchSearch;
    });
  }, [prospects, nicheFilter, areaFilter, noWebsiteOnly, priorityOnly, search]);

  const hasSite = hasValidWebsite(selected.url);
  const selectedScoreColor = selected.score >= 70 ? '#4ade80' : selected.score >= 40 ? '#60a5fa' : '#f87171';

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 rounded-[14px] bg-[rgba(17,17,26,0.85)] border text-left flex items-center justify-between gap-3 transition-all cursor-pointer shadow-lg backdrop-blur-[16px] ${
          isOpen
            ? 'border-[rgba(197,160,89,0.45)] ring-2 ring-[rgba(197,160,89,0.15)] shadow-[0_0_30px_rgba(197,160,89,0.15)]'
            : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(197,160,89,0.3)]'
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-body font-semibold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full bg-[rgba(197,160,89,0.12)] text-[#c5a059] border border-[rgba(197,160,89,0.2)]">
              {selected.sector}
            </span>
            <span className="text-[10px] font-body text-[rgba(232,228,220,0.5)] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
              📍 {extractArea(selected)}
            </span>
            <span className="text-[11px] font-body text-[rgba(232,228,220,0.5)] truncate">
              {selected.name}
            </span>
          </div>
          <div className="text-[15px] font-body font-semibold text-[#e8e4dc] truncate">
            {selected.company}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {hasSite ? (
            <span
              className="text-[11px] font-body font-semibold px-2.5 py-1 rounded-full border border-[rgba(255,255,255,0.08)]"
              style={{ color: selectedScoreColor, backgroundColor: `${selectedScoreColor}15` }}
            >
              L: {selected.score}
            </span>
          ) : (
            <span className="text-[11px] font-body font-semibold px-2.5 py-1 rounded-full bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.25)] text-[#f87171] flex items-center gap-1">
              <span>🚫 Sans site</span>
              <span className="text-[#fbbf24] font-normal">⭐ 4.8★</span>
            </span>
          )}
          <div className={`text-[rgba(232,228,220,0.5)] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#c5a059]' : ''}`}>
            <ChevronDown size={18} />
          </div>
        </div>
      </button>

      {/* Floating Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 rounded-[14px] bg-[rgba(15,15,24,0.98)] border border-[rgba(197,160,89,0.25)] shadow-[0_16px_48px_rgba(0,0,0,0.85)] backdrop-blur-[24px] overflow-hidden"
          >
            {/* Header info + search */}
            <div className="p-3 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,18,0.7)] flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Rechercher parmi les prospects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] pl-9 pr-3 text-[13px] font-body text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.35)] focus:outline-none focus:border-[rgba(197,160,89,0.4)] transition-colors"
                />
              </div>
              <span className="text-[11px] font-mono text-[rgba(232,228,220,0.45)] whitespace-nowrap px-2">
                {filtered.length} trouvés
              </span>
            </div>

            {/* List */}
            <div className="max-h-[320px] overflow-y-auto divide-y divide-[rgba(255,255,255,0.03)] p-1.5 custom-scrollbar">
              {filtered.length > 0 ? (
                filtered.map((p) => {
                  const isCur = p.id === selected.id;
                  const itemHasSite = hasValidWebsite(p.url);
                  const itemColor = p.score >= 70 ? '#4ade80' : p.score >= 40 ? '#60a5fa' : '#f87171';
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onSelect(p);
                        setIsOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-[10px] text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isCur
                          ? 'bg-[rgba(197,160,89,0.12)] border border-[rgba(197,160,89,0.3)] text-[#e8e4dc]'
                          : 'hover:bg-[rgba(255,255,255,0.05)] text-[rgba(232,228,220,0.8)]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13.5px] font-body font-medium text-[#e8e4dc] truncate">
                            {p.company}
                          </span>
                          {isCur && <Check size={14} className="text-[#c5a059] flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-body text-[rgba(232,228,220,0.45)] mt-0.5">
                          <span className="truncate">{p.name}</span>
                          <span>•</span>
                          <span className="text-[#c5a059] truncate">{p.sector}</span>
                          <span>•</span>
                          <span className="text-[rgba(232,228,220,0.5)] truncate">📍 {extractArea(p)}</span>
                        </div>
                      </div>

                      {itemHasSite ? (
                        <span
                          className="text-[10.5px] font-body font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ color: itemColor, backgroundColor: `${itemColor}15` }}
                        >
                          L: {p.score}
                        </span>
                      ) : (
                        <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.1)] text-[#f87171] border border-[rgba(239,68,68,0.2)] flex-shrink-0">
                          Sans site
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="py-8 text-center text-[13px] font-body text-[rgba(232,228,220,0.4)]">
                  Aucun prospect ne correspond à cette combinaison de filtres.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Pre-Call State ─── */
function PreCallState({ onStartCall }: { onStartCall: (p: typeof mockProspects[0]) => void }) {
  const [selectedProspect, setSelectedProspect] = useState(mockProspects[0]);
  const [nicheFilter, setNicheFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [noWebsiteOnly, setNoWebsiteOnly] = useState(false);
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [ripples, setRipples] = useState<{ id: number }[]>([]);
  const rippleId = useRef(0);

  // 1. DYNAMIC EXTRACTION OF NICHES & AREAS FROM SCRAPED LEADS (No hardcoding)
  const dynamicNiches = useMemo(() => {
    const list = Array.from(new Set(mockProspects.map(p => p.sector).filter(Boolean))).sort();
    return [{ label: 'Toutes les niches', value: 'all' }, ...list.map(n => ({ label: n, value: n }))];
  }, []);

  const dynamicAreas = useMemo(() => {
    const set = new Set<string>();
    mockProspects.forEach(p => {
      const a = extractArea(p);
      if (a && a !== 'Général') set.add(a);
    });
    const list = Array.from(set).sort();
    return [{ label: 'Toutes les zones', value: 'all' }, ...list.map(a => ({ label: a, value: a }))];
  }, []);

  // Check URL parameter ?id=... on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const targetId = params.get('id');
      if (targetId) {
        const found = mockProspects.find(p => p.id === targetId);
        if (found) {
          setSelectedProspect(found);
          if (found.sector) setNicheFilter(found.sector);
          const area = extractArea(found);
          if (area && area !== 'Général') setAreaFilter(area);
        }
      }
    }
  }, []);

  const {
    speakerMode,
    setSpeakerMode,
    channelMode,
    setChannelMode,
    selectedOffer,
    setSelectedOffer,
  } = useCallStore();

  const { callingMethod, formatPhoneNumber } = useSettingsStore();
  const phoneFormatted = formatPhoneNumber(selectedProspect.phone);

  const hasSite = hasValidWebsite(selectedProspect.url);
  const scoreColor = selectedProspect.score >= 70 ? '#4ade80' : selectedProspect.score >= 40 ? '#60a5fa' : '#f87171';

  // Smart offer recommendation based on prospect digital presence
  useEffect(() => {
    if (!hasSite) {
      setSelectedOffer('vitrine');
    } else if (selectedProspect.score < 60) {
      setSelectedOffer('refonte');
    } else {
      setSelectedOffer('seo');
    }
  }, [hasSite, selectedProspect.score, setSelectedOffer]);

  const handleDial = (targetMode?: 'phonelink' | 'whatsapp') => {
    const activeMode = targetMode || channelMode;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        setRipples((prev) => [...prev, { id: ++rippleId.current }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== rippleId.current - 2 + i));
        }, 800);
      }, i * 150);
    }

    if (activeMode === 'whatsapp') {
      if (phoneFormatted.waUrl) {
        window.open(phoneFormatted.waUrl, '_blank');
      }
    } else {
      // Default: trigger native tel: protocol to launch Windows Phone Link (SIM)
      if (phoneFormatted.telUrl) {
        window.location.href = phoneFormatted.telUrl;
      }
    }

    setTimeout(() => onStartCall(selectedProspect), 600);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-70px)] px-4 py-8">
      <motion.div
        className="w-full max-w-[620px]"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(197,160,89,0.1)] border border-[rgba(197,160,89,0.25)] text-[#c5a059] text-[11px] font-body font-semibold uppercase tracking-[0.15em]">
            <Sparkles size={12} />
            <span>Studio d&apos;Appel Intelligent (Gemini Flash)</span>
          </div>
          <h1 className="font-display text-[32px] sm:text-[38px] font-light text-[#e8e4dc] mt-3 tracking-tight">
            Prêt à engager le prospect
          </h1>
          <p className="text-[14px] font-body text-[rgba(232,228,220,0.55)] mt-1">
            Filtrez les cibles récoltées par vos scrapers pour lancer un appel chirurgical.
          </p>
        </div>

        {/* Dynamic Bot-Se Filters Bar */}
        <div className="p-3.5 mb-4 rounded-[14px] bg-[rgba(17,17,26,0.6)] border border-[rgba(255,255,255,0.06)] backdrop-blur-md space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Dynamic Niche Select */}
            <div className="relative">
              <select
                value={nicheFilter}
                onChange={(e) => setNicheFilter(e.target.value)}
                className="w-full h-10 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] px-3 text-[12.5px] font-body text-[#e8e4dc] appearance-none cursor-pointer focus:outline-none focus:border-[rgba(197,160,89,0.4)] transition-colors"
              >
                {dynamicNiches.map(n => (
                  <option key={n.value} value={n.value} className="bg-[#11111a] text-[#e8e4dc]">
                    {n.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)] pointer-events-none" />
            </div>

            {/* Dynamic Area / Wilaya Select */}
            <div className="relative">
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-full h-10 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] px-3 text-[12.5px] font-body text-[#e8e4dc] appearance-none cursor-pointer focus:outline-none focus:border-[rgba(197,160,89,0.4)] transition-colors"
              >
                {dynamicAreas.map(a => (
                  <option key={a.value} value={a.value} className="bg-[#11111a] text-[#e8e4dc]">
                    {a.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)] pointer-events-none" />
            </div>
          </div>

          {/* Tactical Toggles from Bot-Se */}
          <div className="flex items-center gap-2 pt-1 border-t border-[rgba(255,255,255,0.04)] flex-wrap">
            <button
              type="button"
              onClick={() => setNoWebsiteOnly(!noWebsiteOnly)}
              className={`px-3 py-1.5 rounded-full text-[11.5px] font-body font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                noWebsiteOnly
                  ? 'bg-[rgba(239,68,68,0.18)] border-[#ef4444] text-[#f87171] shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                  : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.6)] hover:border-[rgba(255,255,255,0.15)]'
              }`}
            >
              <span>🚫 Sans site web uniquement</span>
            </button>

            <button
              type="button"
              onClick={() => setPriorityOnly(!priorityOnly)}
              className={`px-3 py-1.5 rounded-full text-[11.5px] font-body font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                priorityOnly
                  ? 'bg-[rgba(251,191,36,0.18)] border-[#fbbf24] text-[#fbbf24] shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                  : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.6)] hover:border-[rgba(255,255,255,0.15)]'
              }`}
            >
              <Star size={12} className={priorityOnly ? 'fill-[#fbbf24]' : ''} />
              <span>⭐ Avis élevés sans site (Prioritaires)</span>
            </button>
          </div>
        </div>

        {/* Custom Luxury Dropdown */}
        <div className="mb-5">
          <ProspectCustomDropdown
            prospects={mockProspects}
            selected={selectedProspect}
            onSelect={(p) => setSelectedProspect(p)}
            nicheFilter={nicheFilter}
            areaFilter={areaFilter}
            noWebsiteOnly={noWebsiteOnly}
            priorityOnly={priorityOnly}
          />
        </div>

        {/* Prospect Dossier Card (Smart Adaptation: With Website vs No Website) */}
        <motion.div
          key={selectedProspect.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-4"
        >
          <GlassPanel className="p-6 border-[rgba(255,255,255,0.08)] relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-body font-semibold uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-full bg-[rgba(197,160,89,0.15)] text-[#c5a059] border border-[rgba(197,160,89,0.25)]">
                    {selectedProspect.sector}
                  </span>
                  <span className="text-[10px] font-body text-[rgba(232,228,220,0.6)] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.04)]">
                    📍 {extractArea(selectedProspect)}
                  </span>
                </div>
                <h3 className="text-[20px] font-display font-medium text-[#e8e4dc] mt-2">
                  {selectedProspect.company}
                </h3>
                <p className="text-[13px] font-body text-[rgba(232,228,220,0.7)] mt-0.5">
                  Interlocuteur : <span className="text-[#e8e4dc] font-medium">{selectedProspect.name}</span>
                </p>
              </div>

              {/* Status Badge: Audit vs Zero Website */}
              <div className="text-right flex-shrink-0">
                {hasSite ? (
                  <>
                    <span className="text-[11px] font-body text-[rgba(232,228,220,0.45)] uppercase block">
                      Audit Lighthouse
                    </span>
                    <span className="text-[32px] font-display font-normal tracking-tight" style={{ color: scoreColor }}>
                      {selectedProspect.score}
                      <span className="text-[16px] text-[rgba(232,228,220,0.35)]">/100</span>
                    </span>
                  </>
                ) : (
                  <div className="p-2.5 rounded-[12px] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] text-center">
                    <span className="text-[10px] font-body uppercase tracking-[0.08em] text-[#f87171] font-semibold block">
                      Zéro Site Web
                    </span>
                    <span className="text-[16px] font-display text-[#fbbf24] font-medium block mt-0.5">
                      ⭐ 4.8★ Maps
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)] grid grid-cols-2 gap-3 text-[12.5px] font-body">
              <div className="flex items-center gap-2 text-[rgba(232,228,220,0.6)]">
                <Phone size={13} className="text-[#c5a059]" />
                <span className="text-[#e8e4dc] truncate">{selectedProspect.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[rgba(232,228,220,0.6)]">
                <Globe size={13} className="text-[#c5a059]" />
                <span className="text-[#e8e4dc] truncate">
                  {hasSite ? selectedProspect.url : 'Aucune présence web'}
                </span>
              </div>
            </div>

            {/* Smart Sales Opportunity Tag */}
            <div className="mt-3.5 p-3 rounded-[9px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] text-[12px] font-body text-[rgba(232,228,220,0.7)] flex items-start gap-2">
              <Flame size={14} className="text-[#c5a059] flex-shrink-0 mt-0.5" />
              <div>
                {hasSite ? (
                  <>
                    <strong className="text-[#c5a059] font-medium">Angle Refonte :</strong> Site web existant avec score de {selectedProspect.score}/100. Présenter le prototype de conversion.
                  </>
                ) : (
                  <>
                    <strong className="text-[#f87171] font-medium">Angle Création Vitrine :</strong> Forte réputation locale sur Maps mais invisible sur le web. Les clients partent chez les concurrents.
                  </>
                )}
              </div>
            </div>
          </GlassPanel>
        </motion.div>

        {/* ─── Pre-Call Control Matrix ─── */}
        <div className="mt-6 space-y-4">
          {/* Control 1: Speaker Mode (Who speaks?) */}
          <div className="p-4 rounded-[14px] bg-[rgba(17,17,26,0.65)] border border-[rgba(255,255,255,0.06)] backdrop-blur-md">
            <label className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#c5a059] flex items-center gap-1.5 mb-2.5">
              <Mic size={13} />
              <span>1. Sélection de l&apos;Orateur (Qui mène la discussion ?)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Moi-même (Humain) */}
              <button
                type="button"
                onClick={() => setSpeakerMode('human')}
                className={`p-3.5 rounded-[12px] border text-left transition-all cursor-pointer relative ${
                  speakerMode === 'human'
                    ? 'bg-[rgba(197,160,89,0.12)] border-[#c5a059] ring-2 ring-[rgba(197,160,89,0.2)] shadow-[0_0_20px_rgba(197,160,89,0.15)]'
                    : 'bg-[rgba(10,10,18,0.6)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[18px]">🎙️</span>
                  <span className={`text-[10px] font-body uppercase tracking-[0.08em] px-2 py-0.5 rounded-full font-semibold ${
                    speakerMode === 'human' ? 'bg-[#c5a059] text-[#060610]' : 'bg-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.5)]'
                  }`}>
                    Copilote IA Actif
                  </span>
                </div>
                <h4 className="text-[13.5px] font-body font-semibold text-[#e8e4dc]">
                  Parler Moi-même (Humain)
                </h4>
                <p className="text-[11px] font-body text-[rgba(232,228,220,0.55)] mt-0.5 leading-relaxed">
                  Vous parlez au micro. L&apos;IA écoute en continu et affiche en temps réel les répliques d&apos;objection idéales.
                </p>
              </button>

              {/* Option B: Agent Vocal IA */}
              <button
                type="button"
                onClick={() => setSpeakerMode('ai')}
                className={`p-3.5 rounded-[12px] border text-left transition-all cursor-pointer relative ${
                  speakerMode === 'ai'
                    ? 'bg-[rgba(56,189,248,0.12)] border-[#38bdf8] ring-2 ring-[rgba(56,189,248,0.2)] shadow-[0_0_20px_rgba(56,189,248,0.15)]'
                    : 'bg-[rgba(10,10,18,0.6)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[18px]">🤖</span>
                  <span className={`text-[10px] font-body uppercase tracking-[0.08em] px-2 py-0.5 rounded-full font-semibold ${
                    speakerMode === 'ai' ? 'bg-[#38bdf8] text-[#060610]' : 'bg-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.5)]'
                  }`}>
                    100% Autonome
                  </span>
                </div>
                <h4 className="text-[13.5px] font-body font-semibold text-[#e8e4dc]">
                  Laisser l&apos;IA Parler (Agent Vocal)
                </h4>
                <p className="text-[11px] font-body text-[rgba(232,228,220,0.55)] mt-0.5 leading-relaxed">
                  L&apos;IA prend la parole oralement et converse avec le client. Vous pouvez reprendre la main au micro à tout instant.
                </p>
              </button>
            </div>
          </div>

          {/* Control 2: Call Channel (Where to call?) */}
          <div className="p-4 rounded-[14px] bg-[rgba(17,17,26,0.65)] border border-[rgba(255,255,255,0.06)] backdrop-blur-md">
            <label className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#c5a059] flex items-center gap-1.5 mb-2.5">
              <Phone size={13} />
              <span>2. Canal d&apos;Appel (Où composer ?)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option SIM */}
              <button
                type="button"
                onClick={() => setChannelMode('phonelink')}
                className={`p-3.5 rounded-[12px] border text-left transition-all cursor-pointer ${
                  channelMode === 'phonelink'
                    ? 'bg-[rgba(74,222,128,0.12)] border-[#4ade80] ring-2 ring-[rgba(74,222,128,0.2)] shadow-[0_0_20px_rgba(74,222,128,0.15)]'
                    : 'bg-[rgba(10,10,18,0.6)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[16px]">📱</span>
                  <span className="text-[10px] font-body uppercase tracking-[0.08em] px-2 py-0.5 rounded-full bg-[rgba(74,222,128,0.15)] text-[#4ade80] font-semibold">
                    SIM Mobile Algérie
                  </span>
                </div>
                <h4 className="text-[13.5px] font-body font-semibold text-[#e8e4dc]">
                  Téléphone Direct (Phone Link)
                </h4>
                <p className="text-[11px] font-body text-[rgba(232,228,220,0.5)] mt-0.5">
                  Compose via l&apos;application Windows Phone Link reliée à votre mobile Android.
                </p>
              </button>

              {/* Option WhatsApp */}
              <button
                type="button"
                onClick={() => setChannelMode('whatsapp')}
                className={`p-3.5 rounded-[12px] border text-left transition-all cursor-pointer ${
                  channelMode === 'whatsapp'
                    ? 'bg-[rgba(37,211,102,0.12)] border-[#25d366] ring-2 ring-[rgba(37,211,102,0.2)] shadow-[0_0_20px_rgba(37,211,102,0.15)]'
                    : 'bg-[rgba(10,10,18,0.6)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[16px]">💬</span>
                  <span className="text-[10px] font-body uppercase tracking-[0.08em] px-2 py-0.5 rounded-full bg-[rgba(37,211,102,0.15)] text-[#25d366] font-semibold">
                    International / Wi-Fi
                  </span>
                </div>
                <h4 className="text-[13.5px] font-body font-semibold text-[#e8e4dc]">
                  Appel WhatsApp Direct
                </h4>
                <p className="text-[11px] font-body text-[rgba(232,228,220,0.5)] mt-0.5">
                  Ouvre WhatsApp Web / Desktop pour engager l&apos;appel vocal ou le contact direct.
                </p>
              </button>
            </div>
          </div>

          {/* Control 3: Strategic Offer Target */}
          <div className="p-4 rounded-[14px] bg-[rgba(17,17,26,0.65)] border border-[rgba(255,255,255,0.06)] backdrop-blur-md">
            <label className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-[#c5a059] flex items-center gap-1.5 mb-2.5">
              <Sparkles size={13} />
              <span>3. Pack & Angle Commercial Cible</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'vitrine', label: 'Vitrine Clé en Main', icon: '🌐', badge: !hasSite ? 'Recommandé' : undefined },
                { id: 'refonte', label: 'Refonte & Vitesse', icon: '⚡', badge: hasSite && selectedProspect.score < 60 ? 'Recommandé' : undefined },
                { id: 'seo', label: 'Google Maps & SEO Local', icon: '📍' },
                { id: 'custom', label: 'Solution Sur-Mesure', icon: '🤖' },
              ].map((off) => {
                const isSel = selectedOffer === off.id;
                return (
                  <button
                    key={off.id}
                    type="button"
                    onClick={() => setSelectedOffer(off.id)}
                    className={`p-2.5 rounded-[10px] border text-left transition-all cursor-pointer relative ${
                      isSel
                        ? 'bg-[rgba(197,160,89,0.15)] border-[#c5a059] text-[#e8e4dc]'
                        : 'bg-[rgba(10,10,18,0.5)] border-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.7)] hover:border-[rgba(255,255,255,0.12)]'
                    }`}
                  >
                    {off.badge && (
                      <span className="absolute -top-1.5 right-1.5 text-[8.5px] font-mono px-1.5 py-0.2 rounded-full bg-[#c5a059] text-[#060610] font-bold">
                        {off.badge}
                      </span>
                    )}
                    <div className="text-[16px] mb-1">{off.icon}</div>
                    <p className="text-[11.5px] font-body font-semibold truncate">{off.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Adaptive Launch Trigger */}
          <div className="flex flex-col items-center pt-2 space-y-3.5">
            <div className="relative w-full">
              {ripples.map((r) => (
                <motion.div
                  key={r.id}
                  className="absolute inset-0 rounded-[14px] border border-[#c5a059]"
                  initial={{ scale: 0.98, opacity: 0.8 }}
                  animate={{ scale: 1.04, opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              ))}
              <motion.button
                type="button"
                onClick={() => handleDial(channelMode)}
                className={`w-full py-4 px-6 rounded-[14px] font-body font-semibold text-[14.5px] flex items-center justify-center gap-3 cursor-pointer shadow-xl transition-all ${
                  speakerMode === 'ai'
                    ? 'bg-gradient-to-r from-[#0284c7] via-[#38bdf8] to-[#0284c7] shadow-[0_0_25px_rgba(56,189,248,0.3)] text-[#060610]'
                    : channelMode === 'whatsapp'
                    ? 'bg-gradient-to-r from-[#16a34a] via-[#22c55e] to-[#16a34a] shadow-[0_0_25px_rgba(34,197,94,0.3)] text-white'
                    : 'bg-gradient-to-r from-[#c5a059] via-[#dfba73] to-[#c5a059] shadow-[0_0_25px_rgba(197,160,89,0.3)] text-[#060610]'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {speakerMode === 'ai' ? (
                  <>
                    <span className="text-[19px]">🤖</span>
                    <span>
                      {channelMode === 'phonelink'
                        ? "Démarrer l'Appel SIM avec l'Agent Vocal IA"
                        : "Démarrer l'Appel WhatsApp avec l'Agent Vocal IA"}
                    </span>
                  </>
                ) : (
                  <>
                    {channelMode === 'phonelink' ? (
                      <>
                        <Phone size={18} />
                        <span>Lancer l&apos;Appel SIM (Moi-même) & Activer Copilote</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare size={18} />
                        <span>Ouvrir WhatsApp Direct & Activer Copilote</span>
                      </>
                    )}
                  </>
                )}
              </motion.button>
            </div>

            {/* Target Number */}
            <p className="text-[12px] font-body text-[rgba(232,228,220,0.5)] text-center font-mono">
              {phoneFormatted.telUrl ? `Cible : ${phoneFormatted.displayPhone} • ${extractArea(selectedProspect)}` : 'Numéro non renseigné'}
            </p>

            {/* Strict Pricing Rule Security Notice */}
            <div className="w-full p-3 rounded-[11px] bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.22)] text-[12px] font-body text-[rgba(232,228,220,0.75)] flex items-start gap-2.5">
              <ShieldAlert size={15} className="text-[#c5a059] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#c5a059] font-medium mr-1">Règle d&apos;or Stepping Stones :</strong>
                Aucun prix n&apos;est divulgué par téléphone. L&apos;IA et le copilote pivotent systématiquement pour envoyer la proposition chiffrée détaillée en PDF par WhatsApp.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Executive Unified Call Header ─── */
function UnifiedCallHeader({ onEndCall }: { onEndCall: () => void }) {
  const {
    prospect,
    elapsedSeconds,
    isMuted,
    toggleMute,
    isHeld,
    toggleHold,
    speakerMode,
    channelMode,
    takeoverMicrophone,
  } = useCallStore();
  const { formatPhoneNumber } = useSettingsStore();
  const [copiedPhone, setCopiedPhone] = useState(false);

  const hasSite = hasValidWebsite(prospect?.url);
  const phoneFormatted = prospect?.phone ? formatPhoneNumber(prospect.phone) : null;

  const copyPhoneNumber = () => {
    if (prospect?.phone && prospect.phone !== 'Non renseigné') {
      navigator.clipboard.writeText(phoneFormatted?.displayPhone || prospect.phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-18 px-5 sm:px-8 flex items-center justify-between bg-[rgba(10,10,18,0.92)] border-b border-[rgba(197,160,89,0.2)] backdrop-blur-[20px] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Prospect Information */}
      <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
        <div className="w-10 h-10 rounded-full bg-[rgba(197,160,89,0.12)] border border-[rgba(197,160,89,0.25)] flex items-center justify-center text-[#c5a059] flex-shrink-0">
          <Building2 size={18} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-[16px] font-body font-semibold text-[#e8e4dc] truncate">
              {prospect?.company}
            </h2>
            <span className="hidden sm:inline-block text-[11px] font-body px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.6)]">
              {prospect?.name}
            </span>
            {!hasSite ? (
              <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]">
                Zéro site web
              </span>
            ) : null}

            {/* Matrix Status Badges */}
            <div className="flex items-center gap-1.5 ml-1">
              {speakerMode === 'ai' ? (
                <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-[rgba(56,189,248,0.15)] text-[#38bdf8] border border-[rgba(56,189,248,0.3)] font-semibold flex items-center gap-1">
                  🤖 Agent Vocal IA
                </span>
              ) : (
                <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-[rgba(197,160,89,0.15)] text-[#c5a059] border border-[rgba(197,160,89,0.3)] font-semibold flex items-center gap-1">
                  🎙️ Copilote Actif
                </span>
              )}

              {channelMode === 'whatsapp' ? (
                <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-[rgba(37,211,102,0.12)] text-[#25d366] border border-[rgba(37,211,102,0.25)] font-medium">
                  💬 WhatsApp
                </span>
              ) : (
                <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] text-[rgba(232,228,220,0.6)] border border-[rgba(255,255,255,0.08)] font-medium">
                  📱 SIM Phone Link
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[12px] font-body text-[rgba(232,228,220,0.5)] mt-0.5 flex-wrap">
            {prospect?.phone && (
              <div className="flex items-center gap-2">
                <button
                  onClick={copyPhoneNumber}
                  className="inline-flex items-center gap-1 text-[#c5a059] hover:underline cursor-pointer"
                  title="Copier le numéro"
                >
                  <Phone size={11} />
                  <span>{phoneFormatted?.displayPhone || prospect.phone}</span>
                  {copiedPhone ? <Check size={11} className="text-[#4ade80]" /> : <Copy size={11} />}
                </button>

                {phoneFormatted && phoneFormatted.telUrl && (
                  <div className="flex items-center gap-1.5 ml-1">
                    <a
                      href={phoneFormatted.telUrl}
                      className="px-2 py-0.5 rounded-[6px] bg-[rgba(197,160,89,0.12)] border border-[rgba(197,160,89,0.3)] text-[11px] font-medium text-[#c5a059] hover:bg-[rgba(197,160,89,0.22)] transition-all flex items-center gap-1"
                      title="Composer via Windows Phone Link (SIM mobile)"
                    >
                      <Phone size={10} />
                      <span className="hidden lg:inline">Phone Link</span>
                    </a>
                    {phoneFormatted.waUrl && (
                      <a
                        href={phoneFormatted.waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 rounded-[6px] bg-[rgba(37,211,102,0.12)] border border-[rgba(37,211,102,0.3)] text-[11px] font-medium text-[#25d366] hover:bg-[rgba(37,211,102,0.22)] transition-all flex items-center gap-1"
                        title="Ouvrir WhatsApp Direct"
                      >
                        <MessageSquare size={10} />
                        <span className="hidden lg:inline">WhatsApp</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
            {hasSite && (
              <a
                href={prospect!.url.startsWith('http') ? prospect!.url : `https://${prospect!.url}`}
                target="_blank"
                rel="noreferrer"
                className="hidden md:inline-flex items-center gap-1 hover:text-[#e8e4dc] transition-colors truncate max-w-[200px]"
              >
                <Globe size={11} />
                <span className="truncate">{prospect!.url.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Live Digital Call Chrono */}
      <div className="flex items-center gap-3 mx-2 sm:mx-6 flex-shrink-0">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ef4444]"></span>
        </span>
        <div className="px-3.5 py-1.5 rounded-[10px] bg-[rgba(17,17,26,0.8)] border border-[rgba(255,255,255,0.08)]">
          <CallTimer seconds={elapsedSeconds} size="lg" color="#c5a059" />
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {speakerMode === 'ai' && (
          <motion.button
            type="button"
            onClick={takeoverMicrophone}
            className="h-10 px-3 rounded-full bg-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.3)] border border-[#ef4444] text-[#f87171] flex items-center gap-1.5 font-body font-semibold text-[11.5px] shadow-[0_0_15px_rgba(239,68,68,0.25)] cursor-pointer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            title="Interrompre l'IA et reprendre la parole au micro"
          >
            <ShieldAlert size={14} />
            <span className="hidden md:inline">Prendre la main</span>
          </motion.button>
        )}

        <motion.button
          onClick={toggleMute}
          title={isMuted ? "Réactiver le micro" : "Couper le micro"}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
            isMuted
              ? 'bg-[rgba(248,113,113,0.18)] border-[#f87171] text-[#f87171]'
              : 'bg-[#11111a] border-[rgba(255,255,255,0.08)] text-[#e8e4dc] hover:border-[rgba(255,255,255,0.2)]'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </motion.button>

        <motion.button
          onClick={toggleHold}
          title={isHeld ? "Reprendre l'appel" : "Mettre en attente"}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
            isHeld
              ? 'bg-[rgba(96,165,250,0.18)] border-[#60a5fa] text-[#60a5fa]'
              : 'bg-[#11111a] border-[rgba(255,255,255,0.08)] text-[#e8e4dc] hover:border-[rgba(255,255,255,0.2)]'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Pause size={18} />
        </motion.button>

        <motion.button
          onClick={onEndCall}
          className="h-10 px-4 rounded-full bg-[#ef4444] hover:bg-[#dc2626] text-white flex items-center gap-2 font-body font-medium text-[13px] shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all cursor-pointer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <PhoneOff size={15} />
          <span className="hidden sm:inline">Terminer</span>
        </motion.button>
      </div>
    </header>
  );
}

/* ─── Script Reader Panel (Smart Has-Web vs No-Web) ─── */
function ScriptReaderPanel({
  onRegenerateGemini,
  languageMode,
  setLanguageMode,
}: {
  onRegenerateGemini: () => void;
  languageMode: 'fr' | 'ar' | 'en';
  setLanguageMode: (lang: 'fr' | 'ar' | 'en') => void;
}) {
  const { currentPhase, completedPhases, advancePhase, jumpToPhase, scriptLoading, script, prospect } = useCallStore();
  const [copiedSpeech, setCopiedSpeech] = useState(false);

  const hasSite = hasValidWebsite(prospect?.url);

  // Dynamic fallback steps generated from prospect data
  const fallbackSteps = useMemo(() => {
    const pName = prospect?.name || 'Responsable';
    const cName = prospect?.company || 'votre entreprise';
    const score = prospect?.score || 48;

    if (!hasSite) {
      return [
        {
          id: 1,
          phase: 'opener',
          label: 'Ouverture Maps',
          script: `Bonjour ${pName}, je suis Abdelhadi de Stepping Stones Agency. J'ai vu votre excellente réputation et vos avis élogieux sur Google Maps pour ${cName}. Cependant, en cherchant votre site internet officiel pour consulter vos offres, impossible de le trouver. Vous avez 2 minutes ?`,
          tip: 'Ton chaleureux et élogieux. Pause après la question.',
        },
        {
          id: 2,
          phase: 'audit_reveal',
          label: 'Constat d\'Invisibilité',
          script: `Aujourd'hui, quand des clients à fort pouvoir d'achat recherchent vos prestations et ne trouvent pas de site officiel, ils pensent souvent que l'établissement est fermé et cliquent directement sur un concurrent qui a un site web. Vous perdez des clients prêts à payer chaque semaine.`,
          tip: 'Mettre le doigt sur le manque à gagner sans accuser le prospect.',
        },
        {
          id: 3,
          phase: 'pitch',
          label: 'Vitrine Clé en Main',
          script: `La bonne nouvelle, c'est que nous avons déjà modélisé une vitrine digitale moderne pour ${cName}, pensée pour capturer les appels immédiatement et asseoir votre autorité n°1 dans votre ville. Je peux vous l'envoyer gratuitement par email aujourd'hui pour que vous la voyiez.`,
          tip: 'Insister sur "gratuit", "déjà modélisé" et "sans engagement".',
        },
        {
          id: 4,
          phase: 'social_proof',
          label: 'Preuve Sociale',
          script: `Nous avons récemment digitalisé un professionnel de votre secteur qui n'avait qu'une page sur les réseaux sociaux. Dès le premier mois de mise en ligne, ses demandes de rendez-vous qualifiés ont doublé.`,
          tip: 'Démontrer que le site attire des clients plus rentables que les réseaux.',
        },
        {
          id: 5,
          phase: 'transition',
          label: 'Transmission Maquette',
          script: `Pour vous faire parvenir l'accès à votre maquette aujourd'hui, sur quelle adresse email professionnelle puis-je vous l'adresser ?`,
          tip: 'Accord implicite : demander directement l\'adresse email.',
        },
        {
          id: 6,
          phase: 'close',
          label: 'Clôture & RDV',
          script: `C'est noté ${pName}. Je vous transmets le lien dans les 15 minutes. Je vous propose un point rapide de 5 minutes demain après-midi pour avoir votre ressenti. 14h vous convient ?`,
          tip: 'Technique de l\'agenda : verrouiller le créneau.',
        },
      ];
    }

    return [
      {
        id: 1,
        phase: 'opener',
        label: 'Ouverture Audit',
        script: `Bonjour ${pName}, je suis Abdelhadi de Stepping Stones Agency. Je vous contacte car j'ai analysé le site de ${cName} ce matin et j'ai relevé des points techniques critiques qui affectent directement vos conversions. Vous avez 2 minutes ?`,
        tip: 'Ton professionnel, direct et factuel. Laisser un blanc après la question.',
      },
      {
        id: 2,
        phase: 'audit_reveal',
        label: 'Révélation Audit',
        script: `J'ai passé votre site dans nos audits de performance Google : votre score n'est que de ${score}/100. Cela signifie qu'une part importante de vos visiteurs sur mobile quitte la page par lenteur ou manque de clarté avant même de vous appeler.`,
        tip: 'Laisser un silence après l\'annonce du score.',
      },
      {
        id: 3,
        phase: 'pitch',
        label: 'La Solution Refonte',
        script: `Nous avons conçu un modèle modernisé, ultra-rapide et taillé pour convertir vos visiteurs en clients payants. On peut vous montrer gratuitement à quoi ressemblerait votre nouveau site avec votre identité visuelle.`,
        tip: 'Mettre l\'accent sur le gain de clients concrets.',
      },
      {
        id: 4,
        phase: 'social_proof',
        label: 'Preuve Sociale',
        script: `Sur une refonte similaire effectuée pour un confrère, le volume d'appels entrants a grimpé de 45% en moins de 6 semaines grâce à l'optimisation mobile.`,
        tip: 'Chiffre concret et crédible.',
      },
      {
        id: 5,
        phase: 'transition',
        label: 'Transition',
        script: `Pour vous faire parvenir le prototype personnalisé dans l'heure, confirmez-moi simplement votre adresse email professionnelle ?`,
        tip: 'Passer à l\'action naturellement.',
      },
      {
        id: 6,
        phase: 'close',
        label: 'Clôture & RDV',
        script: `Parfait ${pName}. Je vous envoie l'accès dès maintenant. On se cale un bref appel de 5 minutes demain à 14h pour avoir votre avis ?`,
        tip: 'Proposer un horaire ferme.',
      },
    ];
  }, [prospect, hasSite]);

  // Darija & English pitches from our specialized generator
  const localizedPitches = useMemo(() => {
    if (!prospect) return null;
    return generatePitches({
      Businessname: prospect.company,
      Niche: prospect.sector,
      Website: hasSite ? prospect.url : '',
      WebsiteScore: hasSite ? Math.round(prospect.score / 10) : null,
      Googlemapsscore: '4.8',
      Wilaya: extractArea(prospect),
    });
  }, [prospect, hasSite]);

  const rawPhases = script?.steps && script.steps.length > 0 ? script.steps : fallbackSteps;
  const currentStep = rawPhases[currentPhase] || rawPhases[0];

  // Pick text according to language tab & active phase
  const displayText = useMemo(() => {
    if (currentPhase === 0) {
      if (languageMode === 'ar' && localizedPitches?.pitches?.ar) {
        return localizedPitches.pitches.ar;
      }
      if (languageMode === 'en' && localizedPitches?.pitches?.en) {
        return localizedPitches.pitches.en;
      }
    } else {
      if (languageMode === 'ar') {
        return `${currentStep?.script || ''}\n\n💡 En Darija : ركز على تقديم الماكيت المجانية واقتراح إرسال تفاصيل العرض في ملف PDF عبر واتساب مباشرة بعد المكالمة.`;
      }
      if (languageMode === 'en') {
        return `${currentStep?.script || ''}\n\n💡 In English: Keep the conversation focused on sending the custom free interactive mock-up and delivering the formal PDF proposal via WhatsApp.`;
      }
    }
    return currentStep?.script || '';
  }, [languageMode, localizedPitches, currentStep, currentPhase]);

  const copySpeech = () => {
    navigator.clipboard.writeText(displayText);
    setCopiedSpeech(true);
    setTimeout(() => setCopiedSpeech(false), 2000);
  };

  const handlePrev = () => {
    if (currentPhase > 0) {
      jumpToPhase(currentPhase - 1);
    }
  };

  return (
    <GlassPanel variant="gold-accent" className="p-6 flex flex-col h-full min-h-[520px] justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div>
        {/* Header & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059] animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-body font-semibold text-[#e8e4dc]">
                  Script de Vente Intelligent
                </h3>
                <span className="text-[10px] font-body uppercase tracking-[0.08em] px-2 py-0.5 rounded-full bg-[rgba(197,160,89,0.12)] text-[#c5a059]">
                  Gemini Flash
                </span>
              </div>
              <p className="text-[11px] font-body text-[rgba(232,228,220,0.45)] mt-0.5">
                {hasSite ? "Angle technique : Audit & Conversion Leaks" : "Angle visibilité : Réputation Google Maps & Vitrine"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Regenerate Button */}
            <button
              onClick={onRegenerateGemini}
              disabled={scriptLoading}
              className="h-8 px-3 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(197,160,89,0.3)] text-[12px] font-body text-[#e8e4dc] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Régénérer une nouvelle variante avec Gemini 3.8 Flash"
            >
              {scriptLoading ? <Loader2 size={13} className="animate-spin text-[#c5a059]" /> : <Sparkles size={13} className="text-[#c5a059]" />}
              <span className="hidden sm:inline">Régénérer</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center rounded-lg bg-[#0e0e17] border border-[rgba(255,255,255,0.08)] p-1 text-[12px]">
              <button
                onClick={() => setLanguageMode('fr')}
                className={`px-2.5 py-1 rounded-md font-body font-medium transition-colors cursor-pointer ${
                  languageMode === 'fr' ? 'bg-[#c5a059] text-[#0a0a12]' : 'text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc]'
                }`}
              >
                🇫🇷 FR
              </button>
              <button
                onClick={() => setLanguageMode('ar')}
                className={`px-2.5 py-1 rounded-md font-body font-medium transition-colors cursor-pointer ${
                  languageMode === 'ar' ? 'bg-[#c5a059] text-[#0a0a12]' : 'text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc]'
                }`}
              >
                🇩🇿 Darija
              </button>
              <button
                onClick={() => setLanguageMode('en')}
                className={`px-2.5 py-1 rounded-md font-body font-medium transition-colors cursor-pointer ${
                  languageMode === 'en' ? 'bg-[#c5a059] text-[#0a0a12]' : 'text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc]'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>
        </div>

        {/* Phase Stepper Pills */}
        <div className="grid grid-cols-6 gap-1.5 mb-6">
          {rawPhases.map((phaseItem: any, idx: number) => {
            const isCompleted = completedPhases.includes(idx);
            const isCurrent = idx === currentPhase;
            return (
              <button
                key={idx}
                onClick={() => jumpToPhase(idx)}
                className={`py-2 px-1 text-center rounded-[8px] border transition-all cursor-pointer text-[11px] font-body truncate ${
                  isCurrent
                    ? 'bg-[rgba(197,160,89,0.15)] border-[#c5a059] text-[#c5a059] font-semibold'
                    : isCompleted
                    ? 'bg-[rgba(74,222,128,0.10)] border-[rgba(74,222,128,0.3)] text-[#4ade80]'
                    : 'bg-[#11111a] border-[rgba(255,255,255,0.05)] text-[rgba(232,228,220,0.45)] hover:border-[rgba(255,255,255,0.15)]'
                }`}
                title={phaseItem.label}
              >
                <div className="font-mono text-[10px] opacity-75">0{idx + 1}</div>
                <div className="truncate">{phaseItem.label}</div>
              </button>
            );
          })}
        </div>

        {/* Script Speech Display */}
        <div className="relative p-5 rounded-[12px] bg-[rgba(17,17,26,0.6)] border border-[rgba(255,255,255,0.06)] shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-body font-semibold uppercase tracking-[0.1em] text-[#c5a059] flex items-center gap-1.5">
              <MessageSquare size={13} />
              {languageMode === 'ar' ? 'الحديث المقترح (الدارجة)' : `Phase ${currentPhase + 1} : ${currentStep?.label}`}
            </span>
            <button
              onClick={copySpeech}
              className="text-[12px] font-body text-[rgba(232,228,220,0.5)] hover:text-[#c5a059] flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedSpeech ? (
                <>
                  <Check size={13} className="text-[#4ade80]" />
                  <span className="text-[#4ade80]">Copié</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>

          <p
            className={`text-[16px] sm:text-[17px] font-body text-[#e8e4dc] leading-[1.8] whitespace-pre-line ${
              languageMode === 'ar' ? 'font-arabic text-right leading-[2.1] text-[18px]' : ''
            }`}
            style={{ direction: languageMode === 'ar' ? 'rtl' : 'ltr' }}
          >
            &ldquo;{displayText}&rdquo;
          </p>

          {/* Tactical Advice Box */}
          {currentStep?.tip && languageMode === 'fr' && (
            <div className="mt-4 p-3.5 rounded-[9px] bg-[rgba(197,160,89,0.06)] border border-[rgba(197,160,89,0.2)] flex items-start gap-2.5">
              <Sparkles size={15} className="text-[#c5a059] mt-0.5 flex-shrink-0" />
              <div className="text-[12.5px] font-body text-[rgba(232,228,220,0.75)] leading-relaxed">
                <strong className="text-[#c5a059] font-medium mr-1">Consigne psychologique :</strong>
                {currentStep.tip}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-5 mt-5 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          disabled={currentPhase === 0}
          className="h-11 px-4 rounded-full border border-[rgba(255,255,255,0.1)] text-[13px] font-body text-[rgba(232,228,220,0.7)] hover:text-[#e8e4dc] hover:border-[rgba(255,255,255,0.25)] disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Précédent</span>
        </button>

        <AnimatedButton
          variant="primary"
          onClick={advancePhase}
          icon={<ChevronRight size={16} />}
        >
          {currentPhase >= rawPhases.length - 1 ? "Revoir les phases" : "Phase suivante"}
        </AnimatedButton>
      </div>
    </GlassPanel>
  );
}

/* ─── Tactical Objection Battlecards Panel ─── */
function ObjectionPanel() {
  const { script, prospect } = useCallStore();
  const [activeObjection, setActiveObjection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedResponse, setCopiedResponse] = useState(false);

  const hasSite = hasValidWebsite(prospect?.url);

  // Fallback objections adapted if prospect has no website
  const adaptedDefaultObjections = useMemo(() => {
    if (!hasSite) {
      return [
        {
          id: 'o_fb',
          category: 'CANAL',
          label: 'Une page Facebook / Instagram me suffit',
          response: `Je comprends tout à fait, les réseaux sociaux sont parfaits pour poster des photos. Mais quand un client a un besoin urgent et solvable, il ne va pas chercher sur Instagram, il tape directement sur Google. S'il n'y a pas de site officiel avec vos coordonnées nettes, il clique sur le concurrent immédiat.`,
          pivot: 'Voulez-vous qu\'on regarde comment capter ces recherches Google avec la maquette ?',
        },
        {
          id: 'o_bouche',
          category: 'RECOMMANDATION',
          label: 'Le bouche-à-oreille me suffit',
          response: `C'est une grande force, et c'est la preuve de votre savoir-faire. Mais aujourd'hui, même quand un ami vous recommande, la première chose que fait le client est de taper votre nom sur Google avant de se déplacer. S'il ne trouve rien, le doute s'installe.`,
          pivot: 'La maquette renforce précisément ce bouche-à-oreille. Je vous l\'envoie pour voir ?',
        },
        {
          id: 'o_temps',
          category: 'TEMPS',
          label: 'Pas le temps de gérer un site web',
          response: `C'est précisément pour cela que nous existons : vous n'avez absolument rien à gérer. Le site est 100% autonome, sécurisé et hébergé pour que votre téléphone sonne sans que vous n'ayez à toucher à une seule ligne de code.`,
          pivot: 'Cela ne vous prendra que 5 minutes pour valider la maquette qu\'on a préparée.',
        },
        {
          id: 'o_prix',
          category: 'BUDGET',
          label: 'Combien ça coûte ? / Trop cher',
          response: `Nous préparons une proposition chiffrée détaillée sur-mesure que je vous envoie directement en PDF sur WhatsApp juste après notre échange. Comme ça vous avez le détail exact des prestations sans mauvaise surprise. L'important aujourd'hui est d'évaluer le gain de clients concrets avec notre maquette gratuite.`,
          pivot: 'Sur quel numéro WhatsApp puis-je vous transmettre ce devis PDF chiffré ?',
        },
        {
          id: 'o_rappel',
          category: 'TIMING',
          label: 'Rappelez-moi plus tard',
          response: `Avec plaisir. Je vous transmets la maquette maintenant pour que vous puissiez l'ouvrir tranquillement à votre rythme ce soir.`,
          pivot: 'Je vous rappelle jeudi matin à 10h pour un échange rapide ?',
        },
      ];
    }
    return mockObjections;
  }, [hasSite]);

  const rawObjections = script?.objections && script.objections.length > 0 ? script.objections : adaptedDefaultObjections;

  const filteredObjections = useMemo(() => {
    if (!searchQuery.trim()) return rawObjections;
    const q = searchQuery.toLowerCase();
    return rawObjections.filter((o: any) =>
      (o.label && o.label.toLowerCase().includes(q)) ||
      (o.category && o.category.toLowerCase().includes(q)) ||
      (o.response && o.response.toLowerCase().includes(q))
    );
  }, [rawObjections, searchQuery]);

  const activeObj = rawObjections.find(
    (o: any) => o.trigger === activeObjection || o.id === activeObjection
  );

  const copyResponseText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const getCategoryColor = (cat: string = '') => {
    const c = cat.toLowerCase();
    if (c.includes('prix') || c.includes('budget')) return { text: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
    if (c.includes('prestataire') || c.includes('concurrence') || c.includes('canal')) return { text: '#a78bfa', bg: 'rgba(167,139,250,0.12)' };
    if (c.includes('temps') || c.includes('moment') || c.includes('timing')) return { text: '#60a5fa', bg: 'rgba(96,165,250,0.12)' };
    if (c.includes('urgence')) return { text: '#f87171', bg: 'rgba(248,113,113,0.12)' };
    return { text: '#4ade80', bg: 'rgba(74,222,128,0.12)' };
  };

  return (
    <GlassPanel className="p-5 flex flex-col h-full min-h-[520px] relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Header & Search */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[17px] font-body font-semibold text-[#e8e4dc]">
              Battlecards d&apos;Objections
            </h3>
            <p className="text-[11px] font-body text-[rgba(232,228,220,0.4)] uppercase tracking-[0.06em]">
              {hasSite ? "Objections Refonte & Performance" : "Objections Création & Réseaux Sociaux"}
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.6)]">
            {filteredObjections.length} tactiques
          </span>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.35)]" />
          <input
            type="text"
            placeholder="Rechercher une objection (prix, réseaux, temps...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.07)] pl-9 pr-3 text-[12px] font-body text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.3)] focus:outline-none focus:border-[rgba(197,160,89,0.3)]"
          />
        </div>
      </div>

      {/* Grid of Objections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto flex-1 pr-1">
        {filteredObjections.map((obj: any, i: number) => {
          const catColors = getCategoryColor(obj.category);
          const isSelected = (obj.trigger || obj.id) === activeObjection;
          return (
            <motion.button
              key={obj.trigger || obj.id || i}
              onClick={() => setActiveObjection(obj.trigger || obj.id)}
              className={`w-full text-left p-3.5 rounded-[10px] border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[rgba(197,160,89,0.12)] border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.15)]'
                  : 'bg-[rgba(17,17,26,0.6)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(197,160,89,0.3)] hover:bg-[rgba(17,17,26,0.9)]'
              }`}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span
                  className="text-[10px] font-body font-semibold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full"
                  style={{ color: catColors.text, backgroundColor: catColors.bg }}
                >
                  {obj.category || 'OBJECTION'}
                </span>
                <ChevronRight size={14} className="text-[rgba(232,228,220,0.35)]" />
              </div>
              <p className="text-[13px] font-body font-medium text-[#e8e4dc] line-clamp-2">
                &ldquo;{obj.label}&rdquo;
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Response Drawer Modal */}
      <AnimatePresence>
        {activeObj && (
          <>
            <motion.div
              className="absolute inset-0 bg-[rgba(5,5,9,0.6)] backdrop-blur-[2px] z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveObjection(null)}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-20 p-5 bg-[rgba(20,20,32,0.98)] border-t border-[rgba(197,160,89,0.3)] rounded-t-[16px] backdrop-blur-[24px] shadow-[0_-8px_30px_rgba(0,0,0,0.6)] max-h-[85%] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(255,255,255,0.08)]">
                <span
                  className="text-[11px] font-body font-semibold uppercase tracking-[0.08em] px-2.5 py-0.5 rounded-full"
                  style={{
                    color: getCategoryColor(activeObj.category).text,
                    backgroundColor: getCategoryColor(activeObj.category).bg,
                  }}
                >
                  {activeObj.category}
                </span>
                <button
                  onClick={() => setActiveObjection(null)}
                  className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <h4 className="text-[15px] font-body font-semibold text-[#e8e4dc]">
                Objection : &ldquo;{activeObj.label}&rdquo;
              </h4>

              {/* Ready script response */}
              <div className="mt-3 p-3.5 rounded-[10px] bg-[rgba(10,10,18,0.7)] border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center justify-between text-[11px] font-body text-[rgba(232,228,220,0.5)] mb-1.5 uppercase">
                  <span>Réponse Préparée</span>
                  <button
                    onClick={() => copyResponseText(activeObj.response)}
                    className="text-[#c5a059] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedResponse ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedResponse ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>
                <p className="text-[14px] font-body text-[#e8e4dc] leading-[1.7] whitespace-pre-line">
                  {activeObj.response}
                </p>
              </div>

              {/* Tactical Pivot */}
              {activeObj.pivot && (
                <div className="mt-3 p-3 rounded-[9px] bg-[rgba(197,160,89,0.08)] border border-[rgba(197,160,89,0.25)] text-[13px] font-body text-[rgba(232,228,220,0.85)]">
                  <strong className="text-[#c5a059] font-medium mr-1.5">⚡ Le Pivot Verbal :</strong>
                  {activeObj.pivot}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}

/* ─── Call Outcome Modal ─── */
function OutcomeModal({ onClose }: { onClose: () => void }) {
  const { elapsedSeconds, setOutcome, prospect } = useCallStore();
  const { addToast } = useUIStore();
  const router = useRouter();
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const outcomes = [
    { id: 'rdv', label: 'Rendez-vous Conclu', icon: Calendar, color: '#4ade80', bg: 'rgba(74,222,128,0.12)', stage: 'ferme' as PipelineStage },
    { id: 'prototype', label: 'Prototype Validé', icon: Send, color: '#a855f7', bg: 'rgba(168,85,247,0.12)', stage: 'prototype' as PipelineStage },
    { id: 'rappeler', label: 'À Recontacter', icon: Clock, color: '#f97316', bg: 'rgba(249,115,22,0.15)', stage: 'recontacter' as PipelineStage },
    { id: 'perdu', label: 'Sans Suite / Perdu', icon: X, color: '#f87171', bg: 'rgba(248,113,113,0.12)', stage: 'perdu' as PipelineStage },
  ];

  const handleSave = async () => {
    if (selectedOutcome && prospect) {
      setOutcome(selectedOutcome as 'rdv' | 'prototype' | 'rappeler' | 'perdu');
      const found = outcomes.find((o) => o.id === selectedOutcome);
      const newStage = found ? found.stage : 'contacte';

      const { updateStage, updateNotes } = useProspectsStore.getState();
      await updateStage(prospect.id, newStage);
      if (notes.trim()) {
        const fullNotes = prospect.notes ? `${prospect.notes}\n[Appel] ${notes.trim()}` : `[Appel] ${notes.trim()}`;
        await updateNotes(prospect.id, fullNotes);
      }

      addToast({ type: 'success', message: `Appel archivé : statut ${STAGE_LABELS[newStage]}.` });
      onClose();
      setTimeout(() => router.push('/crm'), 600);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="absolute inset-0 bg-[rgba(5,5,9,0.8)] backdrop-blur-[10px]" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-[460px] p-7 rounded-[16px] bg-[rgba(20,20,32,0.98)] border border-[rgba(255,255,255,0.10)] shadow-2xl backdrop-blur-[24px]"
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      >
        <h2 className="font-display text-[28px] font-normal text-[#e8e4dc]">
          Bilan de l&apos;Appel
        </h2>
        <p className="text-[13.5px] font-body text-[rgba(232,228,220,0.55)] mt-1">
          Durée effective : <strong className="text-[#c5a059]">{Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s</strong>
        </p>

        {/* Outcome Selector */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          {outcomes.map((out) => {
            const Icon = out.icon;
            const isSelected = selectedOutcome === out.id;
            return (
              <button
                key={out.id}
                onClick={() => setSelectedOutcome(out.id)}
                className={`p-3.5 rounded-[12px] border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[rgba(255,255,255,0.25)] shadow-lg'
                    : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]'
                }`}
                style={
                  isSelected
                    ? { borderColor: out.color, backgroundColor: out.bg }
                    : undefined
                }
              >
                <Icon size={22} style={{ color: out.color }} className="mx-auto" />
                <p className="text-[13px] font-body font-medium text-[#e8e4dc] mt-2">{out.label}</p>
              </button>
            );
          })}
        </div>

        {/* Notes */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes d'échange, objections soulevées, prochain créneau convenu..."
          className="w-full mt-4 min-h-[90px] p-3 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.35)] resize-none focus:outline-none focus:border-[rgba(197,160,89,0.35)]"
        />

        <div className="mt-5 space-y-2.5">
          <AnimatedButton
            variant="primary"
            fullWidth
            onClick={handleSave}
            disabled={!selectedOutcome}
          >
            Enregistrer dans le CRM
          </AnimatedButton>

          <button
            type="button"
            onClick={() => {
              handleSave();
              if (prospect?.id) {
                window.location.href = `/contracts?prospectId=${prospect.id}`;
              } else {
                window.location.href = '/contracts';
              }
            }}
            className="w-full py-2.5 rounded-[10px] bg-[rgba(197,160,89,0.12)] hover:bg-[rgba(197,160,89,0.22)] border border-[rgba(197,160,89,0.35)] text-[#c5a059] text-[12px] font-body font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FileText size={14} />
            <span>Générer le Contrat Clé en Main (IA) ➔</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Call Studio Component ─── */
export default function Call() {
  const { isActive, startCall, endCall, resetCall } = useCallStore();
  const [showOutcome, setShowOutcome] = useState(false);
  const [languageMode, setLanguageMode] = useState<'fr' | 'ar' | 'en'>('fr');

  // Active call timer
  useEffect(() => {
    const interval = setInterval(() => {
      useCallStore.getState().incrementTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch script via Gemini 3.8 Flash
  const { prospect, script, scriptLoading } = useCallStore();

  const fetchGeminiScript = async () => {
    if (!prospect) return;
    useCallStore.getState().setScriptLoading(true);
    try {
      const res = await fetch('/api/call/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectId: prospect.id,
          companyName: prospect.company,
          contactName: prospect.name,
          niche: prospect.sector,
          city: extractArea(prospect),
          country: 'Algérie',
          lighthouseScore: prospect.score,
          website: prospect.url,
          phone: prospect.phone,
        })
      });

      if (!res.body || !res.ok) {
        throw new Error('API response invalid');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedRaw = '';

      while (!done) {
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
                if (parsed.steps) {
                  useCallStore.getState().setScript(parsed);
                  useCallStore.getState().setScriptLoading(false);
                  return;
                }
              } catch (e) {}
            }
          }
        }
      }
      useCallStore.getState().setScriptLoading(false);
    } catch (err) {
      console.warn("Using deterministic fallback engine:", err);
      useCallStore.getState().setScriptLoading(false);
    }
  };

  useEffect(() => {
    if (prospect && !script && scriptLoading) {
      fetchGeminiScript();
    }
  }, [prospect, script, scriptLoading]);

  const handleStartCall = (p: typeof mockProspects[0]) => {
    setShowOutcome(false);
    startCall(p);
  };

  const handleEndCall = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    endCall();
    setShowOutcome(true);
  };

  const handleCloseOutcome = () => {
    setShowOutcome(false);
    resetCall();
  };

  return (
    <>
      {!isActive ? (
        <PreCallState onStartCall={handleStartCall} />
      ) : (
        <div className="min-h-screen bg-[#060610] text-[#e8e4dc] pb-8">
          {/* Single, Unified, Executive Status Bar */}
          <UnifiedCallHeader onEndCall={handleEndCall} />

          {/* Main Dual-Column Grid with Voice Agent Live Console */}
          <main className="max-w-[1580px] mx-auto p-4 sm:p-6 space-y-6">
            {/* Real-time Voice Agent & Copilot Console */}
            <VoiceAgentLiveConsole languageMode={languageMode} />

            <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-6">
              <ScriptReaderPanel
                onRegenerateGemini={fetchGeminiScript}
                languageMode={languageMode}
                setLanguageMode={setLanguageMode}
              />
              <ObjectionPanel />
            </div>
          </main>
        </div>
      )}

      {/* Outcome Modal: Displays immediately when call ends */}
      <AnimatePresence>
        {showOutcome && <OutcomeModal onClose={handleCloseOutcome} />}
      </AnimatePresence>
    </>
  );
}
