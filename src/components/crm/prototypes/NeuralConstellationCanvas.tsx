"use client";

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Send, Zap, AlertTriangle, ZoomIn, ZoomOut, 
  RotateCcw, Sparkles, Filter, Eye, ChevronRight, Activity,
  Brain, Radio, Maximize2
} from 'lucide-react';
import type { Prospect } from '@/types';
import { 
  FollowUpStep, 
  STEP_NAMES, 
  REACTION_CONFIG, 
  parseLeadFollowUp, 
  LeadFollowUpData 
} from '@/lib/followup';
import { cn } from '@/lib/utils';

interface NeuralConstellationCanvasProps {
  prospects: Prospect[];
  selectedProspect: Prospect | null;
  onSelectProspect: (prospect: Prospect) => void;
  onQuickWhatsApp: (prospect: Prospect, step: FollowUpStep) => void;
}

interface ConstellationNode {
  prospect: Prospect;
  data: LeadFollowUpData;
  x: number;
  y: number;
  cluster: FollowUpStep;
  size: number;
  rank: number;
  totalInCluster: number;
  delayDays: number;
  isCriticalCore: boolean;
}

export function NeuralConstellationCanvas({
  prospects,
  selectedProspect,
  onSelectProspect,
  onQuickWhatsApp,
}: NeuralConstellationCanvasProps) {
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'critical' | 'today' | 'overdue'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const scrollToCluster = (step: FollowUpStep) => {
    if (!canvasContainerRef.current) return;
    const center = clusterCenters[step];
    const containerWidth = canvasContainerRef.current.clientWidth;
    const targetScroll = center.cx * zoomLevel - containerWidth / 2;
    canvasContainerRef.current.scrollTo({
      left: Math.max(0, targetScroll),
      behavior: 'smooth',
    });
  };

  // Parse all leads
  const enrichedLeads = useMemo(() => {
    return prospects.map((p) => {
      const data = parseLeadFollowUp(p);
      return {
        prospect: p,
        data,
      };
    });
  }, [prospects]);

  // Filter leads
  const filtered = useMemo(() => {
    return enrichedLeads.filter(({ prospect, data }) => {
      const delay = data.currentStep === 0
        ? (data.daysSincePrototype || 0)
        : Math.max(data.daysSinceLastAction || 0, data.daysSincePrototype || 0);
      if (urgencyFilter === 'critical' && delay < 10) return false;
      if (urgencyFilter === 'today' && data.urgency !== 'today') return false;
      if (urgencyFilter === 'overdue' && data.urgency !== 'overdue') return false;

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

  // Spatial Constellation Coordinates Calculation
  // 4 Main Neural Clusters laid out with generous spacing & clean gaps across the Zuma Pipeline
  const clusterCenters: Record<FollowUpStep, { cx: number; cy: number; radius: number }> = {
    0: { cx: 340, cy: 450, radius: 240 },  // Step 0: Prototype Envoyé (Zuma Reservoir)
    1: { cx: 960, cy: 450, radius: 240 },  // Step 1: Relance #1 (Synapse I Zuma Rail)
    2: { cx: 1580, cy: 450, radius: 220 }, // Step 2: Relance #2 (Synapse II Zuma Rail)
    3: { cx: 2180, cy: 450, radius: 200 }, // Step 3: Closing & Décision (Terminal Zuma Rail)
  };

  // Dynamic Zuma Rails Generator for ALL Steps (0, 1, 2, 3)
  const allZumaRails = useMemo(() => {
    const stepCounts: Record<FollowUpStep, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    filtered.forEach((item) => {
      stepCounts[item.data.currentStep]++;
    });

    return ([0, 1, 2, 3] as FollowUpStep[]).map((step) => {
      const { cx, cy } = clusterCenters[step];
      const count = stepCounts[step];
      const meta = STEP_NAMES[step];

      if (count > 12) {
        // Full winding Zuma Spiral Rail (e.g. Step 0 with 58 leads)
        const r0 = 54;
        const radialPitch = 56 / (2 * Math.PI);
        const steps = 180;
        const maxTheta = 3.25 * 2 * Math.PI;
        let d = '';
        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * maxTheta;
          const r = r0 + radialPitch * t;
          const px = cx + r * Math.cos(t);
          const py = cy + r * Math.sin(t);
          d += (i === 0 ? 'M ' : ' L ') + px.toFixed(1) + ' ' + py.toFixed(1);
        }
        return { step, type: 'spiral' as const, path: d, cx, cy, count, meta };
      } else if (count >= 2) {
        // Curved Zuma Arc Rail (e.g. 2 to 12 leads): a sweeping semi-spiral queue
        const r0 = 46;
        const radialPitch = 24 / (2 * Math.PI);
        const steps = 80;
        const maxTheta = Math.min(Math.PI * 1.8, 0.9 + count * 0.45);
        let d = '';
        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * maxTheta;
          const r = r0 + radialPitch * t;
          const px = cx + r * Math.cos(t);
          const py = cy + r * Math.sin(t);
          d += (i === 0 ? 'M ' : ' L ') + px.toFixed(1) + ' ' + py.toFixed(1);
        }
        return { step, type: 'arc' as const, path: d, cx, cy, count, meta };
      } else {
        // Single lead or dormant standby portal
        return { step, type: 'portal' as const, path: '', cx, cy, count, meta };
      }
    });
  }, [filtered, clusterCenters]);

  const constellationNodes: ConstellationNode[] = useMemo(() => {
    // Group by step
    const stepGroups: Record<FollowUpStep, Array<{ prospect: Prospect; data: LeadFollowUpData }>> = {
      0: [],
      1: [],
      2: [],
      3: [],
    };

    filtered.forEach((item) => {
      stepGroups[item.data.currentStep].push(item);
    });

    const nodes: ConstellationNode[] = [];

    const getDelayScore = (item: { prospect: Prospect; data: LeadFollowUpData }, step: FollowUpStep) => {
      // Step 0 is 'Prototype Envoyé': delay is strictly days since prototype was sent
      // Step 1, 2, 3: delay is days since last recorded follow-up action
      const delayDays = step === 0
        ? (item.data.daysSincePrototype ?? 0)
        : Math.max(item.data.daysSinceLastAction ?? 0, item.data.daysSincePrototype ?? 0);

      // Stable base timestamp:
      // In Step 0: anchor to prototypeSentAt / createdAt so editing notes or testing doesn't reshuffle positions.
      // In Step 1-3: anchor to lastActionAt (or prototypeSentAt if no action yet).
      const baseDate = step === 0
        ? (item.data.prototypeSentAt || item.prospect.createdAt)
        : (item.data.lastActionAt || item.data.prototypeSentAt || item.prospect.createdAt);

      const timeMs = baseDate ? new Date(baseDate).getTime() : 0;

      return { delayDays, timeMs };
    };

    ([0, 1, 2, 3] as FollowUpStep[]).forEach((step) => {
      const list = stepGroups[step];
      const { cx, cy } = clusterCenters[step];
      const totalInCluster = list.length;

      // In each relance step, sort descending by delay so the most overdue lead sits at #1 (Rail Head)
      const sortedList = [...list].sort((a, b) => {
        const scoreA = getDelayScore(a, step);
        const scoreB = getDelayScore(b, step);
        if (scoreB.delayDays !== scoreA.delayDays) {
          return scoreB.delayDays - scoreA.delayDays;
        }
        if (scoreA.timeMs !== scoreB.timeMs) {
          return scoreA.timeMs - scoreB.timeMs;
        }
        return a.prospect.company.localeCompare(b.prospect.company);
      });

      if (totalInCluster > 12) {
        // Full winding Zuma Spiral Rail (for large clusters like Step 0)
        const r0 = 54;
        const radialGrowthPerRadian = 56 / (2 * Math.PI);
        const stepArcLength = 47;
        let currentTheta = 0;

        sortedList.forEach((item, idx) => {
          const rank = idx + 1;
          const delayDays = step === 0
            ? (item.data.daysSincePrototype ?? 0)
            : Math.max(item.data.daysSinceLastAction ?? 0, item.data.daysSincePrototype ?? 0);
          const isCriticalCore = delayDays >= 10 || idx === 0;

          const r = r0 + radialGrowthPerRadian * currentTheta;
          const x = cx + r * Math.cos(currentTheta);
          const y = cy + r * Math.sin(currentTheta);

          const dTheta = stepArcLength / r;
          currentTheta += dTheta;

          const size = idx === 0 ? 48 : isCriticalCore ? 42 : 38;

          nodes.push({
            prospect: item.prospect,
            data: item.data,
            x,
            y,
            cluster: step,
            size,
            rank,
            totalInCluster,
            delayDays,
            isCriticalCore,
          });
        });
      } else if (totalInCluster >= 2) {
        // Curved Zuma Arc Rail (for 2 to 12 leads)
        const r0 = 46;
        const radialGrowth = 24 / (2 * Math.PI);
        const stepArcLength = 48;
        let currentTheta = 0;

        sortedList.forEach((item, idx) => {
          const rank = idx + 1;
          const delayDays = step === 0
            ? (item.data.daysSincePrototype ?? 0)
            : Math.max(item.data.daysSinceLastAction ?? 0, item.data.daysSincePrototype ?? 0);
          const isCriticalCore = delayDays >= (step === 0 ? 10 : step === 1 ? 4 : 3) || idx === 0;

          const r = r0 + radialGrowth * currentTheta;
          const x = cx + r * Math.cos(currentTheta);
          const y = cy + r * Math.sin(currentTheta);

          const dTheta = stepArcLength / r;
          currentTheta += dTheta;

          const size = idx === 0 ? 46 : isCriticalCore ? 42 : 38;

          nodes.push({
            prospect: item.prospect,
            data: item.data,
            x,
            y,
            cluster: step,
            size,
            rank,
            totalInCluster,
            delayDays,
            isCriticalCore,
          });
        });
      } else if (totalInCluster === 1) {
        // Single lead (e.g. Melouka Voyage): sits proudly in the center aperture of this step
        const item = sortedList[0];
        const delayDays = step === 0
          ? (item.data.daysSincePrototype ?? 0)
          : Math.max(item.data.daysSinceLastAction ?? 0, item.data.daysSincePrototype ?? 0);
        nodes.push({
          prospect: item.prospect,
          data: item.data,
          x: cx,
          y: cy,
          cluster: step,
          size: 48,
          rank: 1,
          totalInCluster: 1,
          delayDays,
          isCriticalCore: true,
        });
      }
    });

    return nodes;
  }, [filtered]);

  // Inter-cluster and inter-neuron synaptic connections
  const synapticAxons = useMemo(() => {
    const axons: Array<{ id: string; d: string; color: string; pulse: boolean }> = [];

    // 1. Massive trunk axons between Zuma pipeline stages
    for (let s = 0; s < 3; s++) {
      const current = clusterCenters[s as FollowUpStep];
      const next = clusterCenters[(s + 1) as FollowUpStep];
      // Start from current step exit and curve into next step entrance
      const startX = s === 0 ? current.cx + 54 : current.cx + 40;
      const startY = current.cy;
      const endX = next.cx - 40;
      const endY = next.cy;
      const midX = (startX + endX) / 2;
      const arcY = s % 2 === 0 ? current.cy - 105 : current.cy + 105;

      axons.push({
        id: `trunk_${s}`,
        d: `M ${startX} ${startY} Q ${midX} ${arcY} ${endX} ${endY}`,
        color: s === 0 ? '#a855f7' : s === 1 ? '#eab308' : '#3b82f6',
        pulse: true,
      });
    }

    // 2. Faint dendrites between consecutive nodes along each Zuma rail
    const clusterMap: Record<number, ConstellationNode[]> = { 0: [], 1: [], 2: [], 3: [] };
    constellationNodes.forEach((n) => clusterMap[n.cluster].push(n));

    Object.entries(clusterMap).forEach(([stepStr, group]) => {
      const stepNum = parseInt(stepStr, 10);
      const stepColor = STEP_NAMES[stepNum as FollowUpStep]?.color || '#a855f7';
      // Connect sequential nodes along the Zuma rail smoothly
      for (let i = 0; i < group.length - 1; i++) {
        const a = group[i];
        const b = group[i + 1];
        axons.push({
          id: `zuma_link_${a.prospect.id}_${b.prospect.id}`,
          d: `M ${a.x} ${a.y} L ${b.x} ${b.y}`,
          color: a.isCriticalCore ? 'rgba(239, 68, 68, 0.28)' : `${stepColor}28`,
          pulse: false,
        });
      }
    });

    return axons;
  }, [constellationNodes]);

  const activeHoveredNode = useMemo(() => {
    return constellationNodes.find((n) => n.prospect.id === hoveredNodeId) || null;
  }, [constellationNodes, hoveredNodeId]);

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* ─── Neural Control HUD ─── */}
      <div className="p-4 rounded-[18px] bg-[#080812]/90 border border-[rgba(168,85,247,0.25)] shadow-[0_4px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 relative z-20">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)]" />
          <input
            type="text"
            placeholder="Localiser un neurone dans la constellation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-[12px] bg-[#0f0f1e] border border-[rgba(255,255,255,0.08)] pl-9 pr-9 text-[13px] text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.35)] focus:outline-none focus:border-[#c5a059] transition-colors"
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
              "h-9 px-3.5 rounded-[10px] text-[12px] font-body font-medium transition-all cursor-pointer",
              urgencyFilter === 'all'
                ? "bg-[rgba(197,160,89,0.22)] border border-[#c5a059] text-[#c5a059] shadow-[0_0_12px_rgba(197,160,89,0.2)]"
                : "bg-[#111120] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.65)] hover:border-[rgba(255,255,255,0.2)]"
            )}
          >
            <span>Tous les neurones ({constellationNodes.length})</span>
          </button>

          <button
            onClick={() => setUrgencyFilter('critical')}
            className={cn(
              "h-9 px-3.5 rounded-[10px] text-[12px] font-body font-medium transition-all cursor-pointer flex items-center gap-1.5",
              urgencyFilter === 'critical'
                ? "bg-[rgba(239,68,68,0.28)] border border-[#ef4444] text-[#fca5a5] shadow-[0_0_16px_rgba(239,68,68,0.4)]"
                : "bg-[#111120] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.65)] hover:border-[rgba(239,68,68,0.4)]"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
            <span>🎯 Cœur Critique +10j ({enrichedLeads.filter((l) => (l.data.currentStep === 0 ? (l.data.daysSincePrototype || 0) : Math.max(l.data.daysSinceLastAction || 0, l.data.daysSincePrototype || 0)) >= 10).length})</span>
          </button>

          <button
            onClick={() => setUrgencyFilter('today')}
            className={cn(
              "h-9 px-3.5 rounded-[10px] text-[12px] font-body font-medium transition-all cursor-pointer flex items-center gap-1.5",
              urgencyFilter === 'today'
                ? "bg-[rgba(74,222,128,0.22)] border border-[rgba(74,222,128,0.55)] text-[#4ade80] shadow-[0_0_16px_rgba(74,222,128,0.25)]"
                : "bg-[#111120] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.65)] hover:border-[rgba(74,222,128,0.3)]"
            )}
          >
            <Zap size={13} className={urgencyFilter === 'today' ? "fill-[#4ade80]" : "text-[#4ade80]"} />
            <span>⚡ Impulsions Actives</span>
          </button>

          <button
            onClick={() => setUrgencyFilter('overdue')}
            className={cn(
              "h-9 px-3.5 rounded-[10px] text-[12px] font-body font-medium transition-all cursor-pointer flex items-center gap-1.5",
              urgencyFilter === 'overdue'
                ? "bg-[rgba(239,68,68,0.22)] border border-[rgba(239,68,68,0.55)] text-[#f87171] shadow-[0_0_16px_rgba(239,68,68,0.25)]"
                : "bg-[#111120] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.65)] hover:border-[rgba(239,68,68,0.3)]"
            )}
          >
            <AlertTriangle size={13} className="text-[#f87171]" />
            <span>⚠️ Synapses Bloquées</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center rounded-[10px] bg-[#111120] border border-[rgba(255,255,255,0.08)] p-0.5 ml-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="w-7 h-7 flex items-center justify-center text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] cursor-pointer"
              title="Dézoomer"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-[11px] font-mono px-2 text-[rgba(232,228,220,0.5)]">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="w-7 h-7 flex items-center justify-center text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] cursor-pointer"
              title="Zoomer"
            >
              <ZoomIn size={13} />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="w-7 h-7 flex items-center justify-center text-[rgba(232,228,220,0.4)] hover:text-[#c5a059] cursor-pointer border-l border-[rgba(255,255,255,0.06)]"
              title="Réinitialiser zoom"
            >
              <RotateCcw size={12} />
            </button>
          </div>

          {/* Quick Step Navigation Pills */}
          <div className="flex items-center gap-1 rounded-[10px] bg-[#111120] border border-[rgba(255,255,255,0.08)] p-1 ml-1">
            {([0, 1, 2, 3] as FollowUpStep[]).map((step) => {
              const meta = STEP_NAMES[step];
              const count = enrichedLeads.filter((l) => l.data.currentStep === step).length;
              return (
                <button
                  key={`nav_step_${step}`}
                  onClick={() => scrollToCluster(step)}
                  className="px-2.5 py-1 rounded-[7px] text-[11px] font-mono font-semibold transition-all hover:bg-[rgba(255,255,255,0.08)] flex items-center gap-1.5 cursor-pointer"
                  style={{ color: meta.color }}
                  title={`Naviguer vers ${meta.title}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                  <span>#{step}</span>
                  <span className="text-[10px] text-[rgba(232,228,220,0.55)]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Spatial Bio-Cosmic Canvas Outer Shell ─── */}
      <div className="relative rounded-[28px] overflow-hidden border border-[rgba(168,85,247,0.22)] shadow-[inset_0_0_120px_rgba(0,0,0,0.95)] bg-[#04040a]">
        {/* Dynamic Nebular Energy Glows */}
        <div className="absolute top-1/4 left-[340px] -translate-x-1/2 w-[540px] h-[540px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.14),transparent_70%)] pointer-events-none blur-3xl" />
        <div className="absolute top-1/3 left-[960px] -translate-x-1/2 w-[540px] h-[540px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(234,179,8,0.12),transparent_70%)] pointer-events-none blur-3xl" />
        <div className="absolute bottom-1/4 left-[1580px] -translate-x-1/2 w-[540px] h-[540px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12),transparent_70%)] pointer-events-none blur-3xl" />
        <div className="absolute top-1/4 left-[2180px] -translate-x-1/2 w-[540px] h-[540px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.14),transparent_70%)] pointer-events-none blur-3xl" />

        {/* Horizontal Scrollable Viewport */}
        <div
          ref={canvasContainerRef}
          className="relative overflow-x-auto custom-scrollbar min-h-[860px] scroll-smooth"
        >
          {/* Scaled Spatial Canvas with Wide Panorama Layout */}
          <div
            className="min-w-[2560px] w-max h-[860px] relative transition-transform duration-200 origin-top-left"
            style={{
              transform: `scale(${zoomLevel})`,
            }}
          >
          {/* ─── SVG Synaptic Axons & Flowing Particles ─── */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#c5a059" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
              </linearGradient>

              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Axon Highway Conduits between Zuma pipeline stages */}
            {synapticAxons.map((axon) => (
              <path
                key={axon.id}
                d={axon.d}
                fill="none"
                stroke={axon.pulse ? 'url(#trunkGrad)' : axon.color}
                strokeWidth={axon.pulse ? 3 : 1.2}
                strokeDasharray={axon.pulse ? '6,6' : '3,3'}
                className={axon.pulse ? 'opacity-85' : 'opacity-40'}
                filter={axon.pulse ? 'url(#glow)' : undefined}
              />
            ))}

            {/* ─── Multi-Stage Zuma Pipeline Energy Rails (All Steps 0, 1, 2, 3) ─── */}
            {allZumaRails.map((rail) => {
              if (rail.path) {
                return (
                  <g key={`zuma_rail_${rail.step}`}>
                    {/* Outer Dark Trench Bed */}
                    <path
                      d={rail.path}
                      fill="none"
                      stroke="rgba(8, 7, 18, 0.95)"
                      strokeWidth="50"
                      strokeLinecap="round"
                    />
                    {/* Glowing Rail Bed with step theme color */}
                    <path
                      d={rail.path}
                      fill="none"
                      stroke={`${rail.meta.color}28`}
                      strokeWidth="48"
                      strokeLinecap="round"
                    />
                    {/* Metallic Double Laser Guide Rails */}
                    <path
                      d={rail.path}
                      fill="none"
                      stroke="rgba(197, 160, 89, 0.32)"
                      strokeWidth="24"
                      strokeDasharray="4,6"
                    />
                    {/* Superconducting Center Beam */}
                    <path
                      d={rail.path}
                      fill="none"
                      stroke={rail.meta.color}
                      strokeWidth="2.5"
                      strokeDasharray="8,6"
                      className="opacity-80"
                      filter="url(#glow)"
                    />
                    {/* Zuma Mouth Aperture at (cx + 50, cy) */}
                    <g transform={`translate(${rail.cx + (rail.step === 0 ? 54 : 40)}, ${rail.cy})`}>
                      <circle
                        r="30"
                        fill={`${rail.meta.color}15`}
                        stroke={rail.meta.color}
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                        className="animate-spin"
                        style={{ animationDuration: '24s' }}
                      />
                      <circle
                        r="20"
                        fill="none"
                        stroke="rgba(239, 68, 68, 0.4)"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                      <circle
                        r="5"
                        fill={rail.meta.color}
                        className="animate-ping opacity-75"
                      />
                    </g>
                  </g>
                );
              } else {
                // Standby / Single Lead Receptor Portal Pad
                return (
                  <g key={`zuma_portal_${rail.step}`} transform={`translate(${rail.cx}, ${rail.cy})`}>
                    {/* Glowing Base Platform */}
                    <circle
                      r="44"
                      fill={`${rail.meta.color}08`}
                      stroke={`${rail.meta.color}35`}
                      strokeWidth="1.2"
                      strokeDasharray="4,4"
                      className="animate-spin"
                      style={{ animationDuration: '40s' }}
                    />
                    <circle
                      r="30"
                      fill="none"
                      stroke={`${rail.meta.color}20`}
                      strokeWidth="0.8"
                    />
                    {rail.count === 0 && (
                      <circle
                        r="4"
                        fill={`${rail.meta.color}40`}
                        className="animate-pulse"
                      />
                    )}
                  </g>
                );
              }
            })}

            {/* Final Closing Victory Portal (Step 3 Output Gateway) */}
            <g transform={`translate(${clusterCenters[3].cx + 74}, ${clusterCenters[3].cy})`}>
              <line
                x1="-32"
                y1="0"
                x2="0"
                y2="0"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="3,3"
                className="opacity-70"
              />
              <circle
                r="26"
                fill="rgba(16, 185, 129, 0.12)"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="3,3"
                className="animate-spin"
                style={{ animationDuration: '16s' }}
              />
              <circle
                r="16"
                fill="none"
                stroke="#4ade80"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <circle r="4" fill="#10b981" className="animate-ping opacity-80" />
            </g>

            {/* Ambient Celestial Cluster Orbit Rings */}
            {([0, 1, 2, 3] as FollowUpStep[]).map((step) => {
              const { cx, cy, radius } = clusterCenters[step];
              const meta = STEP_NAMES[step];

              return (
                <g key={`hub_bg_${step}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="none"
                    stroke={meta.color}
                    strokeWidth="1"
                    strokeDasharray="4,8"
                    className="opacity-15 animate-spin"
                    style={{ animationDuration: `${50 + step * 10}s` }}
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius - 50}
                    fill="none"
                    stroke={meta.color}
                    strokeWidth="0.8"
                    strokeDasharray="3,6"
                    className="opacity-10"
                  />
                </g>
              );
            })}
          </svg>

          {/* ─── Cluster Center Labels & Floating Hubs (Elevated to Top Stage) ─── */}
          {([0, 1, 2, 3] as FollowUpStep[]).map((step) => {
            const { cx } = clusterCenters[step];
            const meta = STEP_NAMES[step];
            const clusterNodes = constellationNodes.filter((n) => n.cluster === step);
            const count = clusterNodes.length;
            const criticalCount = clusterNodes.filter((n) => n.isCriticalCore).length;

            return (
              <div
                key={`hub_label_${step}`}
                className="absolute -translate-x-1/2 pointer-events-none z-10 flex flex-col items-center"
                style={{ left: cx, top: 46 }}
              >
                <div
                  className="px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase flex items-center gap-2 shadow-[0_0_24px_rgba(0,0,0,0.9)] border backdrop-blur-md"
                  style={{
                    backgroundColor: `${meta.color}18`,
                    borderColor: `${meta.color}55`,
                    color: meta.color,
                  }}
                >
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: meta.color }} />
                  <span>{meta.badge}</span>
                  <span className="text-[12px] font-bold text-[#e8e4dc]">({count})</span>
                  <span className="text-[10px] text-[rgba(232,228,220,0.5)] font-mono pl-1 border-l border-[rgba(255,255,255,0.1)]">
                    {meta.daysTarget}
                  </span>
                </div>
                <h4 className="font-display text-[16px] font-bold text-[#e8e4dc] mt-1.5 tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  {meta.title}
                </h4>
                <span
                  className={cn(
                    "text-[10.5px] font-mono font-medium mt-1 px-3 py-0.5 rounded-full border shadow-md flex items-center gap-1.5 backdrop-blur-sm",
                    count > 0
                      ? "text-[#c5a059] bg-[rgba(197,160,89,0.12)] border-[rgba(197,160,89,0.35)]"
                      : "text-[rgba(232,228,220,0.45)] bg-[#101020]/80 border-[rgba(255,255,255,0.06)]"
                  )}
                >
                  <span>⚡</span>
                  <span>
                    {step === 0
                      ? `Rail Spiral Zuma • ${criticalCount} critiques (+10j)`
                      : count > 1
                      ? `Rail Zuma Arc • ${count} en cours`
                      : count === 1
                      ? `Recepteur Zuma Actif (1)`
                      : `En attente de relance`}
                  </span>
                </span>
              </div>
            );
          })}

          {/* ─── Floating Cellular Somas (Neuron Nodes) ─── */}
          {constellationNodes.map((node) => {
            const { prospect, data, x, y, size, rank, delayDays, isCriticalCore } = node;
            const isHovered = hoveredNodeId === prospect.id;
            const isSelected = selectedProspect?.id === prospect.id;
            const initial = (prospect.company || 'A').trim().charAt(0).toUpperCase();
            const reactionMeta = data.primaryObjection ? REACTION_CONFIG[data.primaryObjection] : null;

            return (
              <motion.div
                key={prospect.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.25, zIndex: 60 }}
                onMouseEnter={() => setHoveredNodeId(prospect.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => onSelectProspect(prospect)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: x,
                  top: y,
                  zIndex: isSelected ? 50 : rank === 1 ? 35 : isCriticalCore ? 30 : 20,
                }}
              >
                {/* Micro Rank Badge (#1, #2, #3...) */}
                <div
                  className={cn(
                    "absolute -top-2.5 -left-2.5 min-w-[20px] h-[18px] px-1 rounded-full flex items-center justify-center font-mono text-[9px] font-black tracking-tight border shadow-lg z-30 transition-transform group-hover:scale-110 select-none",
                    rank === 1
                      ? "bg-gradient-to-r from-[#ef4444] via-[#f59e0b] to-[#ef4444] text-white border-[#fef08a] shadow-[0_0_15px_rgba(239,68,68,0.95)] ring-1 ring-[#fef08a]/60 animate-pulse scale-110"
                      : delayDays >= 10
                      ? "bg-[#581014] text-[#fca5a5] border-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                      : rank <= 5
                      ? "bg-[#251833] text-[#c5a059] border-[#c5a059] shadow-[0_0_6px_rgba(197,160,89,0.35)]"
                      : "bg-[#0b0b16] text-[rgba(232,228,220,0.6)] border-[rgba(255,255,255,0.15)]"
                  )}
                >
                  #{rank}
                </div>

                {/* Cellular Membrane (Halo) */}
                <div
                  className={cn(
                    "rounded-full flex items-center justify-center transition-all relative",
                    isSelected
                      ? "ring-4 ring-[#c5a059] shadow-[0_0_35px_rgba(197,160,89,0.9)] bg-gradient-to-br from-[#2a2245] to-[#121020]"
                      : rank === 1
                      ? "ring-3 ring-[#f59e0b] shadow-[0_0_35px_rgba(239,68,68,0.95),0_0_15px_rgba(245,158,11,0.85)] bg-gradient-to-br from-[#450a0a] via-[#2a060a] to-[#140406] animate-pulse"
                      : delayDays >= 10
                      ? "ring-2 ring-[#ef4444] shadow-[0_0_24px_rgba(239,68,68,0.65)] bg-gradient-to-br from-[#3b080d] to-[#160406]"
                      : data.urgency === 'today'
                      ? "ring-2 ring-[#4ade80] shadow-[0_0_26px_rgba(74,222,128,0.55)] bg-gradient-to-br from-[#122b1e] to-[#0a1410] animate-pulse"
                      : data.urgency === 'overdue'
                      ? "ring-1.5 ring-[rgba(248,113,113,0.5)] shadow-[0_0_14px_rgba(239,68,68,0.25)] bg-gradient-to-br from-[#1c0e14] to-[#0c080d]"
                      : "ring-1 ring-[rgba(168,85,247,0.4)] shadow-[0_0_15px_rgba(168,85,247,0.25)] bg-gradient-to-br from-[#1b1530] to-[#0e0c18] hover:ring-[#c5a059]"
                  )}
                  style={{ width: size, height: size }}
                >
                  {/* Inner Nucleus Core */}
                  <span
                    className={cn(
                      "font-display font-bold select-none",
                      rank === 1
                        ? "font-black text-[15px] text-[#fef08a]"
                        : delayDays >= 10
                        ? "text-[13px] text-[#fca5a5]"
                        : data.urgency === 'today'
                        ? "text-[13px] text-[#4ade80]"
                        : data.urgency === 'overdue'
                        ? "text-[12px] text-[#f87171]"
                        : "text-[12px] text-[#e8e4dc] group-hover:text-[#c5a059]"
                    )}
                  >
                    {initial}
                  </span>

                  {/* Pulsating electrical spark particle for today urgency */}
                  {data.urgency === 'today' && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#4ade80] shadow-[0_0_10px_#4ade80] animate-ping" />
                  )}

                  {/* Reaction icon badge */}
                  {reactionMeta && (
                    <span className="absolute -bottom-1 -right-1 text-[11px] leading-none bg-[#090814] rounded-full p-0.5 border border-[rgba(255,255,255,0.1)]">
                      {reactionMeta.emoji}
                    </span>
                  )}

                  {/* Apex Crown Indicator for #1 */}
                  {rank === 1 && (
                    <span className="absolute -bottom-1.5 -left-1 text-[10px] select-none" title="Cœur Bullseye #1">
                      👑
                    </span>
                  )}
                </div>

                {/* Micro Label under node */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap pointer-events-none">
                  {(rank <= 5 || isHovered) && (
                    <span
                      className={cn(
                        "text-[9.5px] font-body font-semibold px-1.5 py-0.5 rounded shadow-md transition-all truncate max-w-[105px] block text-center backdrop-blur-md",
                        rank === 1
                          ? "bg-[rgba(197,160,89,0.28)] border border-[#fef08a] text-[#fef08a] font-bold shadow-[0_0_8px_rgba(197,160,89,0.4)]"
                          : delayDays >= 10
                          ? "bg-[rgba(239,68,68,0.25)] border border-[rgba(239,68,68,0.45)] text-[#fca5a5]"
                          : "bg-[#0c0c16]/95 border border-[rgba(255,255,255,0.15)] text-[rgba(232,228,220,0.85)]"
                      )}
                    >
                      {prospect.company}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ─── Hovered Holographic Inspection Card (Floating HUD) ─── */}
      <AnimatePresence>
          {activeHoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-6 right-6 z-40 p-4 rounded-[18px] bg-[#0c0c1c]/95 border border-[rgba(197,160,89,0.45)] shadow-[0_16px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl w-[340px] pointer-events-auto"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={cn(
                        "text-[10px] font-mono font-black px-2 py-0.5 rounded-full border shadow-sm",
                        activeHoveredNode.rank === 1
                          ? "bg-gradient-to-r from-[#ef4444] to-[#f59e0b] text-white border-[#fef08a] shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                          : activeHoveredNode.delayDays >= 10
                          ? "bg-[#581014] text-[#fca5a5] border-[#ef4444]"
                          : "bg-[#1f1938] text-[#c5a059] border-[rgba(197,160,89,0.3)]"
                      )}
                    >
                      {activeHoveredNode.rank === 1
                        ? '👑 Rang #1 Cœur'
                        : `Rang #${activeHoveredNode.rank} / ${activeHoveredNode.totalInCluster}`}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[rgba(168,85,247,0.18)] text-[#c084fc] border border-[rgba(168,85,247,0.3)]">
                      {STEP_NAMES[activeHoveredNode.cluster].title}
                    </span>
                  </div>

                  <h4 className="font-display font-semibold text-[15px] text-[#e8e4dc] mt-2 leading-snug">
                    {activeHoveredNode.prospect.company}
                  </h4>
                  <p className="text-[11.5px] font-body text-[rgba(232,228,220,0.6)]">
                    {activeHoveredNode.prospect.name} • {activeHoveredNode.prospect.city || 'Algérie'}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={cn(
                      "text-[11px] font-mono font-bold px-2 py-0.5 rounded border shadow-sm",
                      activeHoveredNode.delayDays >= 10
                        ? "bg-[rgba(239,68,68,0.25)] border-[#ef4444] text-[#fca5a5] shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                        : activeHoveredNode.data.urgency === 'today'
                        ? "bg-[rgba(74,222,128,0.2)] border-[#4ade80] text-[#4ade80]"
                        : "bg-[#18182b] border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.6)]"
                    )}
                  >
                    {activeHoveredNode.delayDays === 0
                      ? "Aujourd'hui"
                      : `J+${activeHoveredNode.delayDays}`}
                  </span>
                  {activeHoveredNode.delayDays >= 10 && (
                    <span className="text-[9px] font-mono font-bold text-[#ef4444] uppercase tracking-wider">
                      🚨 Retard Critique (+10j)
                    </span>
                  )}
                </div>
              </div>

              {/* Reaction */}
              {activeHoveredNode.data.primaryObjection && (
                <div className="mt-2.5 p-2 rounded-[8px] bg-[#121224] border border-[rgba(255,255,255,0.06)] flex items-center gap-2 text-[11.5px] font-body text-[#e8e4dc]">
                  <span>{REACTION_CONFIG[activeHoveredNode.data.primaryObjection].emoji}</span>
                  <span className="font-medium text-[#c5a059]">
                    {REACTION_CONFIG[activeHoveredNode.data.primaryObjection].label}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-3.5 pt-2.5 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onQuickWhatsApp(activeHoveredNode.prospect, activeHoveredNode.data.currentStep)}
                  className="flex-1 h-8 rounded-[8px] bg-[rgba(34,197,94,0.18)] hover:bg-[rgba(34,197,94,0.3)] border border-[rgba(34,197,94,0.4)] text-[#4ade80] text-[11px] font-body font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send size={11} />
                  <span>Impulsion WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectProspect(activeHoveredNode.prospect)}
                  className="h-8 px-3 rounded-[8px] bg-[#1a1a2e] hover:bg-[#25253d] border border-[rgba(255,255,255,0.1)] text-[#c5a059] text-[11px] font-body font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Saisie</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
