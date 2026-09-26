"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, List, Search, Plus, MoreHorizontal, X, Phone, Trash2, Globe, Mail, ShieldAlert, Upload } from 'lucide-react';
import { GlassPanel } from '@/components/ui/custom/GlassPanel';
import { AnimatedButton } from '@/components/ui/custom/AnimatedButton';
import { useUIStore } from '@/hooks/useUIStore';
import { mockProspects } from '@/data/prospects';
import { STAGE_COLORS, STAGE_LABELS, mapBackendProspect } from '@/types';
import type { PipelineStage, Prospect, CallRecord } from '@/types';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const stages: PipelineStage[] = ['nouveau', 'contacte', 'prototype', 'ferme', 'perdu'];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? '#4ade80' : score >= 40 ? '#60a5fa' : '#f87171';
  const bg = score >= 70 ? 'rgba(74,222,128,0.10)' : score >= 40 ? 'rgba(96,165,250,0.10)' : 'rgba(248,113,113,0.10)';
  return (
    <span className="inline-block text-[11px] font-body font-medium px-2 py-0.5 rounded-full" style={{ color, backgroundColor: bg }}>
      L: {score}
    </span>
  );
}

function StatusBadge({ stage }: { stage: PipelineStage }) {
  const colors: Record<PipelineStage, { color: string; bg: string }> = {
    nouveau: { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)' },
    contacte: { color: '#c5a059', bg: 'rgba(197,160,89,0.15)' },
    prototype: { color: '#4ade80', bg: 'rgba(74,222,128,0.10)' },
    ferme: { color: '#4ade80', bg: 'rgba(74,222,128,0.10)' },
    perdu: { color: '#f87171', bg: 'rgba(248,113,113,0.10)' },
  };
  const c = colors[stage] || colors.nouveau;
  return (
    <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] px-2 py-0.5 rounded-full" style={{ color: c.color, backgroundColor: c.bg }}>
      {STAGE_LABELS[stage]}
    </span>
  );
}

/* ─── Detail Drawer ─── */
function DetailDrawer({
  prospect,
  onClose,
  onUpdateStage,
  onUpdateNotes,
  onDelete,
}: {
  prospect: Prospect;
  onClose: () => void;
  onUpdateStage: (id: string, stage: PipelineStage) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const [activeStage, setActiveStage] = useState<PipelineStage>(prospect.stage);
  const [notes, setNotes] = useState<string>(prospect.notes || '');

  useEffect(() => {
    setActiveStage(prospect.stage);
    setNotes(prospect.notes || '');
  }, [prospect]);

  const handleStageSelect = (s: PipelineStage) => {
    setActiveStage(s);
    onUpdateStage(prospect.id, s);
  };

  const handleNotesBlur = () => {
    if (notes !== prospect.notes) {
      onUpdateNotes(prospect.id, notes);
    }
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-[rgba(5,5,9,0.6)] backdrop-blur-[4px] z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />
      <motion.aside
        className="fixed top-0 right-0 w-full sm:w-[440px] h-[100dvh] bg-[rgba(15,15,28,0.98)] border-l border-[rgba(255,255,255,0.10)] shadow-modal backdrop-blur-[24px] z-50 overflow-y-auto flex flex-col justify-between"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          {/* Header */}
          <div className="p-6 border-b border-[rgba(255,255,255,0.06)] relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <h2 className="font-display text-[30px] font-normal text-[#e8e4dc] leading-tight pr-8">{prospect.name}</h2>
            <p className="text-[16px] font-body text-[#c5a059] mt-1">{prospect.company}</p>
          </div>

          {/* Contact Info */}
          <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
            <h3 className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.5)] mb-3">Contact Direct</h3>
            <div className="space-y-2.5">
              {prospect.phone && (
                <div className="flex items-center gap-2 text-[13px] font-body text-[#e8e4dc]">
                  <Phone size={14} className="text-[#c5a059]" />
                  <span>{prospect.phone}</span>
                </div>
              )}
              {prospect.email && (
                <div className="flex items-center gap-2 text-[13px] font-body text-[#e8e4dc]">
                  <Mail size={14} className="text-[#c5a059]" />
                  <a href={`mailto:${prospect.email}`} className="hover:underline">{prospect.email}</a>
                </div>
              )}
              {prospect.url && (
                <div className="flex items-center gap-2 text-[13px] font-body text-[rgba(232,228,220,0.7)]">
                  <Globe size={14} className="text-[#c5a059]" />
                  <a href={prospect.url} target="_blank" rel="noreferrer" className="hover:underline truncate">{prospect.url}</a>
                </div>
              )}
            </div>
          </div>

          {/* Score & Niche */}
          <div className="p-6 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
            <div>
              <h3 className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.5)] mb-1">Score Lighthouse</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-[32px] font-body font-normal tracking-[-0.02em]"
                  style={{ color: prospect.score >= 70 ? '#4ade80' : prospect.score >= 40 ? '#60a5fa' : '#f87171' }}>
                  {prospect.score}
                </span>
                <span className="text-[14px] font-body text-[rgba(232,228,220,0.5)]">/100</span>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.5)] mb-1">Secteur</h3>
              <span className="inline-block px-3 py-1 rounded-full bg-[rgba(255,255,255,0.06)] text-[12px] font-body text-[#e8e4dc]">
                {prospect.sector}
              </span>
            </div>
          </div>

          {/* Pipeline Stage Transition */}
          <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
            <h3 className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.5)] mb-3">
              Changer l'Étape du Deal
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {stages.map((s) => {
                const isSelected = activeStage === s;
                return (
                  <button
                    key={s}
                    onClick={() => handleStageSelect(s)}
                    className={cn(
                      'px-3 py-2 rounded-[8px] text-[12px] font-body font-medium transition-all cursor-pointer flex items-center gap-2 border',
                      isSelected
                        ? 'border-[#c5a059] bg-[rgba(197,160,89,0.15)] text-[#e8e4dc]'
                        : 'border-[rgba(255,255,255,0.08)] bg-[#11111a] text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] hover:border-[rgba(255,255,255,0.15)]'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STAGE_COLORS[s] }} />
                    <span className="truncate">{STAGE_LABELS[s]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Call History */}
          {prospect.callHistory && prospect.callHistory.length > 0 && (
            <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.5)] mb-3">Historique des Échanges</h3>
              <div className="space-y-3">
                {prospect.callHistory.map((call: CallRecord) => (
                  <div key={call.id} className="p-3 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.05)]">
                    <div className="flex items-center justify-between text-[11px] font-body text-[rgba(232,228,220,0.5)]">
                      <span>{call.date}</span>
                      <span className="text-[#c5a059]">{call.duration}</span>
                    </div>
                    <p className="text-[13px] font-body text-[#e8e4dc] mt-1">{call.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes Area */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.5)]">Notes Stratégiques</h3>
              <span className="text-[10px] text-[rgba(232,228,220,0.4)]">Enregistrement auto</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Ajouter des notes sur le prospect..."
              rows={4}
              className="w-full p-3 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.25)] resize-vertical focus:outline-none focus:border-[#c5a059]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[rgba(20,20,34,0.98)] border-t border-[rgba(255,255,255,0.08)] flex gap-3">
          <AnimatedButton
            variant="primary"
            icon={<Phone size={16} />}
            className="flex-1"
            onClick={() => router.push(`/call?prospectId=${prospect.id}`)}
          >
            Lancer l'Appel Studio
          </AnimatedButton>
          <AnimatedButton
            variant="danger"
            icon={<Trash2 size={16} />}
            onClick={() => onDelete(prospect.id)}
          >
            Supprimer
          </AnimatedButton>
        </div>
      </motion.aside>
    </>
  );
}

/* ─── Pipeline Card ─── */
function PipelineCard({
  prospect,
  onClick,
  onUpdateStage,
}: {
  prospect: Prospect;
  onClick: () => void;
  onUpdateStage: (id: string, stage: PipelineStage) => void;
}) {
  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className="p-4 rounded-[10px] bg-[rgba(17,17,26,0.85)] border border-[rgba(255,255,220,0.06)] shadow-glass cursor-pointer hover:border-[rgba(197,160,89,0.3)] transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-body font-semibold text-[#e8e4dc] truncate group-hover:text-[#c5a059] transition-colors">
            {prospect.name}
          </p>
          <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)] truncate mt-0.5">
            {prospect.company}
          </p>
        </div>
        <ScoreBadge score={prospect.score} />
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.65)]">
          {prospect.sector}
        </span>
        <span className="text-[11px] font-body text-[rgba(232,228,220,0.35)]">
          {prospect.lastContact}
        </span>
      </div>

      {/* Quick Stage Progression */}
      <div
        className="flex items-center justify-between mt-3 pt-2.5 border-t border-[rgba(255,255,255,0.05)]"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[10px] font-body uppercase tracking-[0.06em] text-[rgba(232,228,220,0.35)]">
          Étape
        </span>
        <div className="flex items-center gap-1.5">
          {stages.map((s) => (
            <button
              key={s}
              title={`Passer à : ${STAGE_LABELS[s]}`}
              onClick={() => onUpdateStage(prospect.id, s)}
              className={cn(
                'w-3 h-3 rounded-full transition-transform hover:scale-125 cursor-pointer',
                prospect.stage === s
                  ? 'ring-2 ring-offset-1 ring-[#c5a059] scale-110'
                  : 'opacity-35 hover:opacity-100'
              )}
              style={{ backgroundColor: STAGE_COLORS[s] }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Kanban Board ─── */
function KanbanBoard({
  prospects,
  onSelect,
  onUpdateStage,
  onAddClick,
}: {
  prospects: Prospect[];
  onSelect: (p: Prospect) => void;
  onUpdateStage: (id: string, stage: PipelineStage) => void;
  onAddClick: () => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 px-6">
      {stages.map((stage, colIdx) => {
        const stageProspects = prospects.filter((p) => p.stage === stage);
        return (
          <motion.div
            key={stage}
            className="flex-shrink-0 w-[290px] flex flex-col"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: colIdx * 0.06, duration: 0.4 }}
          >
            {/* Column header */}
            <div
              className="flex items-center justify-between pb-3 mb-3"
              style={{ borderBottom: `2px solid ${STAGE_COLORS[stage]}` }}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] font-body font-semibold text-[#e8e4dc]">{STAGE_LABELS[stage]}</h3>
                <span className="text-[11px] font-body font-medium px-2 py-0.5 rounded-full bg-[#11111a] text-[rgba(232,228,220,0.55)]">
                  {stageProspects.length}
                </span>
              </div>
              <button
                onClick={onAddClick}
                title="Ajouter un prospect"
                className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-[rgba(232,228,220,0.55)] hover:text-[#e8e4dc] hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Cards */}
            <div className="flex-1 flex flex-col gap-2.5 min-h-[220px]">
              <AnimatePresence>
                {stageProspects.map((prospect) => (
                  <motion.div
                    key={prospect.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PipelineCard
                      prospect={prospect}
                      onClick={() => onSelect(prospect)}
                      onUpdateStage={onUpdateStage}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              {stageProspects.length === 0 && (
                <div className="text-center py-10 rounded-[10px] border border-dashed border-[rgba(255,255,255,0.06)]">
                  <p className="text-[12px] font-body text-[rgba(232,228,220,0.30)]">Aucun prospect</p>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── List View ─── */
function ListView({
  prospects,
  onSelect,
  onUpdateStage,
}: {
  prospects: Prospect[];
  onSelect: (p: Prospect) => void;
  onUpdateStage: (id: string, stage: PipelineStage) => void;
}) {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(prospects.length / perPage) || 1;
  const paginated = prospects.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="px-6">
      <div className="overflow-x-auto rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[#0d0d16]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[#11111a]">
              {['Contact & Entreprise', 'Lighthouse', 'Secteur', 'Statut Pipeline', 'Dernier Contact', 'Actions'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((prospect) => (
              <tr
                key={prospect.id}
                className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-pointer"
                onClick={() => onSelect(prospect)}
              >
                <td className="px-5 py-3.5">
                  <p className="text-[14px] font-body font-semibold text-[#e8e4dc]">{prospect.name}</p>
                  <p className="text-[12px] font-body text-[#c5a059]">{prospect.company}</p>
                </td>
                <td className="px-5 py-3.5">
                  <ScoreBadge score={prospect.score} />
                </td>
                <td className="px-5 py-3.5 text-[13px] font-body text-[rgba(232,228,220,0.65)]">
                  {prospect.sector}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge stage={prospect.stage} />
                </td>
                <td className="px-5 py-3.5 text-[12px] font-body text-[rgba(232,228,220,0.4)]">
                  {prospect.lastContact}
                </td>
                <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={prospect.stage}
                    onChange={(e) => onUpdateStage(prospect.id, e.target.value as PipelineStage)}
                    className="h-8 px-2.5 rounded-[6px] bg-[#141422] border border-[rgba(255,255,255,0.1)] text-[11px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
                  >
                    {stages.map((s) => (
                      <option key={s} value={s}>
                        {STAGE_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[rgba(232,228,220,0.55)] hover:bg-[#11111a] disabled:opacity-30 cursor-pointer transition-colors"
          >
            &#8249;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                'w-8 h-8 rounded-full text-[12px] font-body font-medium cursor-pointer transition-colors',
                page === p
                  ? 'bg-[#c5a059] text-[#0a0a12]'
                  : 'text-[rgba(232,228,220,0.55)] hover:bg-[#11111a]'
              )}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[rgba(232,228,220,0.55)] hover:bg-[#11111a] disabled:opacity-30 cursor-pointer transition-colors"
          >
            &#8250;
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Pipeline Stats ─── */
function PipelineStats({ prospects }: { prospects: Prospect[] }) {
  const stats = stages.map((s) => ({
    stage: s,
    count: prospects.filter((p) => p.stage === s).length,
    color: STAGE_COLORS[s],
  }));

  return (
    <div className="flex gap-3 px-6 pb-5 overflow-x-auto">
      {stats.map((s) => (
        <GlassPanel key={s.stage} className="px-4 py-2.5 flex items-center gap-2.5 flex-shrink-0">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
          <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)]">
            {STAGE_LABELS[s.stage]}
          </span>
          <span className="text-[15px] font-body font-semibold text-[#e8e4dc]">{s.count}</span>
        </GlassPanel>
      ))}
    </div>
  );
}

/* ─── CRM Main Page ─── */
export default function CRM() {
  const { crmView, setCrmView, addToast } = useUIStore();
  const [search, setSearch] = useState('');
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch prospects from backend or memory fallback
  const fetchProspects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/prospects');
      if (!res.ok) throw new Error('Erreur de chargement');
      const json = await res.json();
      
      if (json.source === 'memory_fallback') {
        setIsFallbackMode(true);
      }
      
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        setProspects(json.data.map(mapBackendProspect));
      } else {
        setProspects(mockProspects);
      }
    } catch (err) {
      console.warn('API error, using mock prospects fallback', err);
      setIsFallbackMode(true);
      setProspects(mockProspects);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  const handleUpdateStage = async (id: string, stage: PipelineStage) => {
    // 1. Optimistic update
    setProspects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stage } : p))
    );
    if (selectedProspect && selectedProspect.id === id) {
      setSelectedProspect((prev) => (prev ? { ...prev, stage } : null));
    }
    addToast({ type: 'success', message: `Statut mis à jour : ${STAGE_LABELS[stage]}` });

    // 2. Persist to API
    try {
      await fetch(`/api/prospects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });
    } catch (err) {
      console.warn('Server sync error, kept in local state', err);
    }
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    setProspects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, notes } : p))
    );
    if (selectedProspect && selectedProspect.id === id) {
      setSelectedProspect((prev) => (prev ? { ...prev, notes } : null));
    }
    addToast({ type: 'success', message: 'Notes enregistrées' });

    try {
      await fetch(`/api/prospects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
    } catch (err) {
      console.warn('Server sync error, kept in local state', err);
    }
  };

  const handleDeleteProspect = async (id: string) => {
    setProspects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProspect && selectedProspect.id === id) {
      setSelectedProspect(null);
    }
    addToast({ type: 'info', message: 'Prospect supprimé' });

    try {
      await fetch(`/api/prospects/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Server sync error', err);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const text = await file.text();
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        addToast({ type: 'error', message: 'Fichier CSV vide ou invalide' });
        return;
      }

      const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim().toLowerCase());
      const nameIdx = headers.findIndex((h) => h.includes('business') || h.includes('nom') || h.includes('name') || h.includes('company'));
      const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('tel') || h.includes('telephone'));
      const webIdx = headers.findIndex((h) => h.includes('web') || h.includes('site') || h.includes('url'));
      const emailIdx = headers.findIndex((h) => h.includes('email') || h.includes('mail'));
      const scoreIdx = headers.findIndex((h) => h.includes('score') || h.includes('lighthouse'));

      const leadsToImport = lines.slice(1).map((row, idx) => {
        const cells = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => (c || '').replace(/^"|"$/g, '').trim());
        const companyName = cells[nameIdx !== -1 ? nameIdx : 0] || `Lead #${idx + 1}`;
        const phone = phoneIdx !== -1 ? cells[phoneIdx] : cells[1] || '';
        const website = webIdx !== -1 ? cells[webIdx] : cells[2] || '';
        const email = emailIdx !== -1 ? cells[emailIdx] : cells[4] || '';
        const rawScore = scoreIdx !== -1 ? Number(cells[scoreIdx]) : NaN;
        const score = !isNaN(rawScore) && rawScore > 0 ? rawScore : Math.floor(Math.random() * (75 - 35) + 35);

        let niche = 'Général';
        const fn = file.name.toLowerCase();
        if (fn.includes('dental') || fn.includes('dentiste')) niche = 'Santé / Dentaire';
        else if (fn.includes('voyage') || fn.includes('travel')) niche = 'Voyage & Tourisme';
        else if (fn.includes('law') || fn.includes('avocat')) niche = 'Juridique';
        else if (fn.includes('immo') || fn.includes('real-estate') || fn.includes('property')) niche = 'Immobilier';
        else if (fn.includes('derma') || fn.includes('plastic') || fn.includes('spa')) niche = 'Santé / Esthétique';
        else if (fn.includes('yacht') || fn.includes('boat')) niche = 'Nautisme & Yachting';

        return {
          companyName,
          contactName: `Responsable ${companyName}`,
          phone,
          website,
          email: email || `contact@${companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'lead'}.com`,
          score,
          sector: niche,
          niche: niche.toLowerCase().split(' ')[0],
          stage: 'nouveau' as PipelineStage,
          priority: score < 45 ? ('hot' as const) : ('warm' as const),
          city: 'Paris',
          country: 'FR',
          lastContact: "Aujourd'hui (Bot-Search)",
          callHistory: [],
          notes: `Importé depuis ${file.name}`,
          scriptReady: true,
        };
      });

      // Post to /api/prospects/import
      const res = await fetch('/api/prospects/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: leadsToImport }),
      });

      const resJson = await res.json();
      const importedDocs = (resJson.data || leadsToImport).map(mapBackendProspect);

      setProspects((prev) => [...importedDocs, ...prev]);
      addToast({
        type: 'success',
        message: `${importedDocs.length} leads importés avec succès depuis Bot-Search !`,
      });
    } catch (err: any) {
      console.error('Import error:', err);
      addToast({ type: 'error', message: "Erreur lors de l'import du fichier CSV" });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddProspect = (newProspect: Prospect) => {
    setProspects((prev) => [newProspect, ...prev]);
    setShowAddModal(false);
    addToast({ type: 'success', message: 'Prospect ajouté au pipeline' });
  };

  const filteredProspects = useMemo(() => {
    if (!search.trim()) return prospects;
    const q = search.toLowerCase();
    return prospects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.sector.toLowerCase().includes(q)
    );
  }, [search, prospects]);

  return (
    <div className="min-h-[calc(100dvh-56px)] pb-10">
      {/* Fallback Banner if Atlas IP is not whitelisted */}
      {isFallbackMode && (
        <div className="mx-6 mt-4 p-3 rounded-[10px] bg-[rgba(197,160,89,0.08)] border border-[rgba(197,160,89,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] font-body text-[#e8e4dc]">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-[#c5a059] flex-shrink-0" />
            <span>
              <strong>Mode Résilient Local Actif</strong> : Votre IP n'est pas whitelistée sur MongoDB Atlas. Le CRM fonctionne en mémoire avec persistance instantanée.
            </span>
          </div>
          <span className="text-[11px] text-[rgba(232,228,220,0.55)]">
            Pour synchroniser avec Atlas : ajoutez votre IP dans Atlas &gt; Network Access
          </span>
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-light text-[clamp(32px,4vw,44px)] text-[#e8e4dc] tracking-[-0.01em]">
            CRM & Pipeline
          </h1>
          <span className="text-[11px] font-body font-medium px-2.5 py-1 rounded-full bg-[#11111a] text-[rgba(232,228,220,0.6)]">
            {prospects.length} prospects
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-[#11111a] rounded-full p-[3px]">
            <button
              onClick={() => setCrmView('kanban')}
              className={cn(
                'relative px-4 py-1.5 rounded-full text-[13px] font-body font-medium flex items-center gap-1.5 cursor-pointer transition-colors',
                crmView === 'kanban' ? 'text-[#e8e4dc]' : 'text-[rgba(232,228,220,0.55)]'
              )}
            >
              {crmView === 'kanban' && (
                <motion.div
                  layoutId="crmViewToggle"
                  className="absolute inset-0 bg-[#181824] rounded-full shadow-glass"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <LayoutGrid size={14} />
                <span className="hidden sm:inline">Kanban</span>
              </span>
            </button>
            <button
              onClick={() => setCrmView('list')}
              className={cn(
                'relative px-4 py-1.5 rounded-full text-[13px] font-body font-medium flex items-center gap-1.5 cursor-pointer transition-colors',
                crmView === 'list' ? 'text-[#e8e4dc]' : 'text-[rgba(232,228,220,0.55)]'
              )}
            >
              {crmView === 'list' && (
                <motion.div
                  layoutId="crmViewToggle"
                  className="absolute inset-0 bg-[#181824] rounded-full shadow-glass"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <List size={14} />
                <span className="hidden sm:inline">Liste</span>
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-48 sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.5)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher nom, société..."
              className="w-full h-9 pl-9 pr-3 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.06)] text-[13px] font-body text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.30)] focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          {/* Importer CSV */}
          <AnimatedButton
            variant="secondary"
            icon={<Upload size={15} />}
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="hidden sm:inline">Importer CSV</span>
          </AnimatedButton>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCsvUpload}
          />

          {/* Ajouter un prospect manuel */}
          <AnimatedButton variant="primary" icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>
            <span className="hidden sm:inline">Ajouter</span>
          </AnimatedButton>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-5">
        <PipelineStats prospects={filteredProspects} />
      </div>

      {/* Content */}
      <div className="mt-4 relative min-h-[350px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#c5a059]" size={32} />
          </div>
        ) : crmView === 'kanban' ? (
          <KanbanBoard
            prospects={filteredProspects}
            onSelect={setSelectedProspect}
            onUpdateStage={handleUpdateStage}
            onAddClick={() => setShowAddModal(true)}
          />
        ) : (
          <ListView
            prospects={filteredProspects}
            onSelect={setSelectedProspect}
            onUpdateStage={handleUpdateStage}
          />
        )}
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedProspect && (
          <DetailDrawer
            prospect={selectedProspect}
            onClose={() => setSelectedProspect(null)}
            onUpdateStage={handleUpdateStage}
            onUpdateNotes={handleUpdateNotes}
            onDelete={handleDeleteProspect}
          />
        )}
      </AnimatePresence>

      {/* Add Prospect Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddProspectModal
            onClose={() => setShowAddModal(false)}
            onAdded={handleAddProspect}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Add Prospect Modal ─── */
function AddProspectModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: (p: Prospect) => void;
}) {
  const { addToast } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contactName: '',
    companyName: '',
    website: '',
    phone: '',
    email: '',
    sector: 'Sante',
  });

  const handleSubmit = async () => {
    if (!formData.companyName.trim()) {
      addToast({ type: 'error', message: "Veuillez renseigner le nom de l'entreprise" });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: formData.contactName || 'Contact',
          companyName: formData.companyName,
          email: formData.email || `contact@${formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'lead'}.com`,
          website: formData.website || '',
          phone: formData.phone || '',
          niche: formData.sector || 'dental',
          country: 'FR',
          city: 'Paris',
        }),
      });

      const json = await res.json();
      const raw = json.data || json;
      const mapped = mapBackendProspect(raw);
      onAdded(mapped);
    } catch (err: any) {
      // Local fallback
      const localP: Prospect = {
        id: 'local_' + Date.now(),
        name: formData.contactName || 'Nouveau Contact',
        company: formData.companyName,
        url: formData.website || '',
        phone: formData.phone || '',
        email: formData.email || '',
        score: 55,
        sector: formData.sector,
        stage: 'nouveau',
        lastContact: 'Aujourd\'hui',
        callHistory: [],
        notes: '',
        scriptReady: true,
      };
      onAdded(localP);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-[rgba(5,5,9,0.75)] backdrop-blur-[8px]" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-[460px] p-7 rounded-[14px] bg-[rgba(20,20,34,0.98)] border border-[rgba(255,255,255,0.12)] shadow-modal"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <h2 className="font-display text-[28px] font-normal text-[#e8e4dc]">Nouveau Prospect</h2>
        <div className="space-y-3.5 mt-5">
          <input
            className="w-full h-10 px-3.5 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
            placeholder="Nom du contact"
            value={formData.contactName}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
          />
          <input
            className="w-full h-10 px-3.5 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
            placeholder="Entreprise *"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />
          <input
            className="w-full h-10 px-3.5 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            className="w-full h-10 px-3.5 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
            placeholder="Site web (https://...)"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
          <input
            className="w-full h-10 px-3.5 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
            placeholder="Téléphone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <select
            className="w-full h-10 px-3 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
            value={formData.sector}
            onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
          >
            <option value="Sante">Santé / Dentaire</option>
            <option value="Immobilier">Immobilier</option>
            <option value="Juridique">Juridique / Avocats</option>
            <option value="E-commerce">E-commerce</option>
            <option value="BTP">BTP & Construction</option>
            <option value="Voyage">Voyage & Tourisme</option>
          </select>
        </div>
        <div className="flex gap-3 mt-6">
          <AnimatedButton variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Annuler
          </AnimatedButton>
          <AnimatedButton variant="primary" className="flex-1" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Créer'}
          </AnimatedButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
