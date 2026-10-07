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
}

export function NeuralConstellationCanvas({
  prospects,
  selectedProspect,
  onSelectProspect,
  onQuickWhatsApp,
}: NeuralConstellationCanvasProps) {
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'today' | 'overdue'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

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
  // 4 Main Neural Clusters laid out in organic spatial arcs (scaled to fit screen seamlessly)
  const clusterCenters: Record<FollowUpStep, { cx: number; cy: number; radius: number }> = {
    0: { cx: 200, cy: 360, radius: 175 },  // Core Soma Reservoir (Left)
    1: { cx: 540, cy: 360, radius: 145 },  // Synapse I Hub (Mid-left)
    2: { cx: 850, cy: 360, radius: 145 },  // Synapse II Hub (Mid-right)
    3: { cx: 1140, cy: 360, radius: 135 }, // Axon Terminals / Closing (Right)
  };

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
    const GOLDEN_ANGLE = 137.5 * (Math.PI / 180);

    ([0, 1, 2, 3] as FollowUpStep[]).forEach((step) => {
      const list = stepGroups[step];
      const { cx, cy, radius } = clusterCenters[step];
      const totalInCluster = list.length;

      list.forEach((item, idx) => {
        let x: number;
        let y: number;

        if (totalInCluster > 18) {
          // Fermat Golden Spiral packing: spreads smoothly in all directions with zero clumping
          const angle = idx * GOLDEN_ANGLE;
          const spreadFactor = totalInCluster > 40 ? 19.5 : 24;
          const currentRadius = 30 + Math.sqrt(idx) * spreadFactor;
          x = cx + Math.cos(angle) * currentRadius;
          y = cy + Math.sin(angle) * currentRadius;
        } else {
          // Multi-ring organic celestial distribution for smaller clusters
          const ring = Math.floor(idx / 6);
          const posInRing = idx % 6;
          const currentRadius = 42 + ring * 46;
          const angle = (posInRing / 6) * Math.PI * 2 + (ring * 0.5);
          x = cx + Math.cos(angle) * currentRadius;
          y = cy + Math.sin(angle) * currentRadius;
        }

        // Tailored node size so all nodes remain distinct and non-overlapping
        const size = totalInCluster > 35 ? 38 : (item.data.urgency === 'today' ? 48 : 42);

        nodes.push({
          prospect: item.prospect,
          data: item.data,
          x,
          y,
          cluster: step,
          size,
        });
      });
    });

    return nodes;
  }, [filtered]);

  // Inter-cluster and inter-neuron synaptic connections
  const synapticAxons = useMemo(() => {
    const axons: Array<{ id: string; d: string; color: string; pulse: boolean }> = [];

    // 1. Massive trunk axons between Ganglion cluster hubs
    for (let s = 0; s < 3; s++) {
      const current = clusterCenters[s as FollowUpStep];
      const next = clusterCenters[(s + 1) as FollowUpStep];
      const midX = (current.cx + next.cx) / 2;
      const arcY = s % 2 === 0 ? current.cy - 120 : current.cy + 120;
      axons.push({
        id: `trunk_${s}`,
        d: `M ${current.cx} ${current.cy} Q ${midX} ${arcY} ${next.cx} ${next.cy}`,
        color: s === 0 ? '#a855f7' : s === 1 ? '#eab308' : '#3b82f6',
        pulse: true,
      });
    }

    // 2. Faint dendrites between neighboring nodes within each cluster
    const clusterMap: Record<number, ConstellationNode[]> = { 0: [], 1: [], 2: [], 3: [] };
    constellationNodes.forEach((n) => clusterMap[n.cluster].push(n));

    Object.values(clusterMap).forEach((group) => {
      for (let i = 0; i < group.length; i++) {
        // Connect each node to next 1-2 neighbors
        const a = group[i];
        const nextIdx = (i + 1) % group.length;
        const b = group[nextIdx];
        if (b && a !== b) {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 130) {
            axons.push({
              id: `dendrite_${a.prospect.id}_${b.prospect.id}`,
              d: `M ${a.x} ${a.y} Q ${(a.x + b.x) / 2 + 10} ${(a.y + b.y) / 2 - 10} ${b.x} ${b.y}`,
              color: 'rgba(168, 85, 247, 0.16)',
              pulse: false,
            });
          }
        }
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
        </div>
      </div>

      {/* ─── Spatial Bio-Cosmic Canvas Container ─── */}
      <div className="relative rounded-[28px] bg-[#04040a] border border-[rgba(168,85,247,0.22)] shadow-[inset_0_0_120px_rgba(0,0,0,0.95)] overflow-x-auto custom-scrollbar min-h-[740px]">
        {/* Dynamic Nebular Energy Glows */}
        <div className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.12),transparent_70%)] pointer-events-none blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.10),transparent_70%)] pointer-events-none blur-3xl" />

        {/* Scaled Spatial Canvas */}
        <div
          className="min-w-[1300px] w-full h-[740px] relative transition-transform duration-200 origin-top-left"
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

            {/* Axon Curves */}
            {synapticAxons.map((axon) => (
              <path
                key={axon.id}
                d={axon.d}
                fill="none"
                stroke={axon.pulse ? 'url(#trunkGrad)' : axon.color}
                strokeWidth={axon.pulse ? 3 : 1.2}
                strokeDasharray={axon.pulse ? '6,6' : '3,3'}
                className={axon.pulse ? 'opacity-80' : 'opacity-40'}
                filter={axon.pulse ? 'url(#glow)' : undefined}
              />
            ))}

            {/* Cluster Hub Background Auroras */}
            {([0, 1, 2, 3] as FollowUpStep[]).map((step) => {
              const { cx, cy, radius } = clusterCenters[step];
              const meta = STEP_NAMES[step];

              return (
                <g key={`hub_bg_${step}`}>
                  {/* Outer Orbit Rings */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill="none"
                    stroke={meta.color}
                    strokeWidth="1"
                    strokeDasharray="4,8"
                    className="opacity-20 animate-spin"
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
                    className="opacity-15"
                  />
                </g>
              );
            })}
          </svg>

          {/* ─── Cluster Center Labels & Floating Hubs ─── */}
          {([0, 1, 2, 3] as FollowUpStep[]).map((step) => {
            const { cx, cy } = clusterCenters[step];
            const meta = STEP_NAMES[step];
            const count = constellationNodes.filter((n) => n.cluster === step).length;

            return (
              <div
                key={`hub_label_${step}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center"
                style={{ left: cx, top: cy - 135 }}
              >
                <div
                  className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,0,0,0.8)] border"
                  style={{
                    backgroundColor: `${meta.color}15`,
                    borderColor: `${meta.color}45`,
                    color: meta.color,
                  }}
                >
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: meta.color }} />
                  <span>{meta.badge}</span>
                  <span className="text-[12px] text-[#e8e4dc]">({count})</span>
                </div>
                <h4 className="font-display text-[15px] font-semibold text-[#e8e4dc] mt-1 shadow-sm">
                  {meta.title}
                </h4>
              </div>
            );
          })}

          {/* ─── Floating Cellular Somas (Neuron Nodes) ─── */}
          {constellationNodes.map((node) => {
            const { prospect, data, x, y, size } = node;
            const isHovered = hoveredNodeId === prospect.id;
            const isSelected = selectedProspect?.id === prospect.id;
            const initial = (prospect.company || 'A').trim().charAt(0).toUpperCase();
            const reactionMeta = data.primaryObjection ? REACTION_CONFIG[data.primaryObjection] : null;

            return (
              <motion.div
                key={prospect.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.25, zIndex: 50 }}
                onMouseEnter={() => setHoveredNodeId(prospect.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => onSelectProspect(prospect)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                style={{ left: x, top: y }}
              >
                {/* Cellular Membrane (Halo) */}
                <div
                  className={cn(
                    "rounded-full flex items-center justify-center transition-all relative",
                    isSelected
                      ? "ring-4 ring-[#c5a059] shadow-[0_0_35px_rgba(197,160,89,0.8)] bg-gradient-to-br from-[#2a2245] to-[#121020]"
                      : data.urgency === 'today'
                      ? "ring-2 ring-[#4ade80] shadow-[0_0_26px_rgba(74,222,128,0.55)] bg-gradient-to-br from-[#122b1e] to-[#0a1410] animate-pulse"
                      : data.urgency === 'overdue'
                      ? "ring-2 ring-[#f87171] shadow-[0_0_20px_rgba(239,68,68,0.45)] bg-gradient-to-br from-[#2b1216] to-[#140a0c]"
                      : "ring-1 ring-[rgba(168,85,247,0.4)] shadow-[0_0_15px_rgba(168,85,247,0.25)] bg-gradient-to-br from-[#1b1530] to-[#0e0c18] hover:ring-[#c5a059]"
                  )}
                  style={{ width: size, height: size }}
                >
                  {/* Inner Nucleus Core */}
                  <span
                    className={cn(
                      "font-display font-bold text-[13px] select-none",
                      data.urgency === 'today'
                        ? "text-[#4ade80]"
                        : data.urgency === 'overdue'
                        ? "text-[#f87171]"
                        : "text-[#e8e4dc] group-hover:text-[#c5a059]"
                    )}
                  >
                    {initial}
                  </span>

                  {/* Pulsating electrical spark particle */}
                  {data.urgency === 'today' && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#4ade80] shadow-[0_0_10px_#4ade80] animate-ping" />
                  )}

                  {/* Reaction icon badge */}
                  {reactionMeta && (
                    <span className="absolute -bottom-1 -right-1 text-[11px] leading-none bg-[#090814] rounded-full p-0.5 border border-[rgba(255,255,255,0.1)]">
                      {reactionMeta.emoji}
                    </span>
                  )}
                </div>

                {/* Micro Label under node */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap pointer-events-none">
                  <span className="text-[10px] font-body font-medium text-[rgba(232,228,220,0.7)] group-hover:text-[#c5a059] transition-colors truncate max-w-[90px] block">
                    {prospect.company}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ─── Hovered Holographic Inspection Card (Floating HUD) ─── */}
        <AnimatePresence>
          {activeHoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-6 right-6 z-40 p-4 rounded-[18px] bg-[#0c0c1c]/95 border border-[rgba(197,160,89,0.45)] shadow-[0_16px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl w-[330px] pointer-events-auto"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[rgba(168,85,247,0.18)] text-[#c084fc] border border-[rgba(168,85,247,0.3)]">
                    {STEP_NAMES[activeHoveredNode.cluster].title}
                  </span>
                  <h4 className="font-display font-semibold text-[15px] text-[#e8e4dc] mt-1.5 leading-snug">
                    {activeHoveredNode.prospect.company}
                  </h4>
                  <p className="text-[11.5px] font-body text-[rgba(232,228,220,0.6)]">
                    {activeHoveredNode.prospect.name} • {activeHoveredNode.prospect.city || 'Algérie'}
                  </p>
                </div>

                <span
                  className={cn(
                    "text-[10.5px] font-mono font-bold px-2 py-0.5 rounded border",
                    activeHoveredNode.data.urgency === 'today'
                      ? "bg-[rgba(74,222,128,0.2)] border-[#4ade80] text-[#4ade80]"
                      : activeHoveredNode.data.urgency === 'overdue'
                      ? "bg-[rgba(239,68,68,0.2)] border-[#f87171] text-[#f87171]"
                      : "bg-[#18182b] border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.6)]"
                  )}
                >
                  {activeHoveredNode.data.daysSinceLastAction === 0
                    ? "Aujourd'hui"
                    : `J+${activeHoveredNode.data.daysSinceLastAction}`}
                </span>
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
