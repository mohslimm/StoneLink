"use client";
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, List, Search, Plus, MoreHorizontal, X, Phone, Trash2 } from 'lucide-react';
import { GlassPanel } from '@/components/ui/custom/GlassPanel';
import { AnimatedButton } from '@/components/ui/custom/AnimatedButton';
import { InputField } from '@/components/ui/custom/InputField';
import { useUIStore } from '@/hooks/useUIStore';
import { mockProspects } from '@/data/prospects';
import { STAGE_COLORS, STAGE_LABELS } from '@/types';
import type { PipelineStage, Prospect, CallRecord } from '@/types';
import { cn } from '@/lib/utils';

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
  const c = colors[stage];
  return (
    <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] px-2 py-0.5 rounded-full" style={{ color: c.color, backgroundColor: c.bg }}>
      {STAGE_LABELS[stage]}
    </span>
  );
}

/* ─── Detail Drawer ─── */
function DetailDrawer({ prospect, onClose }: { prospect: Prospect; onClose: () => void }) {
  const [activeStage, setActiveStage] = useState<PipelineStage>(prospect.stage);

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-[rgba(5,5,9,0.5)] backdrop-blur-[4px] z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <motion.aside
        className="fixed top-0 right-0 w-full sm:w-[420px] h-[100dvh] bg-[rgba(24,24,36,0.95)] border-l border-[rgba(255,255,255,0.10)] shadow-modal backdrop-blur-[20px] z-40 overflow-y-auto"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
          <button onClick={onClose} className="absolute top-4 right-4 text-[rgba(232,228,220,0.55)] hover:text-[#e8e4dc] transition-colors">
            <X size={20} />
          </button>
          <h2 className="font-display text-[32px] font-normal text-[#e8e4dc]">{prospect.name}</h2>
          <p className="text-[18px] font-body text-[rgba(232,228,220,0.55)] mt-1">{prospect.company}</p>
        </div>

        {/* Contact Info */}
        <div className="p-6 border-b border-[rgba(255,255,220,0.06)]">
          <h3 className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)] mb-3">Contact</h3>
          <div className="space-y-2">
            <p className="text-[13px] font-body text-[#e8e4dc]">{prospect.phone}</p>
            <p className="text-[13px] font-body text-[#e8e4dc]">{prospect.email}</p>
            <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)]">{prospect.url}</p>
          </div>
        </div>

        {/* Score */}
        <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
          <h3 className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)] mb-3">Lighthouse</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[36px] font-body font-normal tracking-[-0.02em]"
              style={{ color: prospect.score >= 70 ? '#4ade80' : prospect.score >= 40 ? '#60a5fa' : '#f87171' }}>
              {prospect.score}
            </span>
            <span className="text-[15px] font-body text-[rgba(232,228,220,0.55)]">/100</span>
          </div>
        </div>

        {/* Pipeline Stage */}
        <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
          <h3 className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)] mb-4">Pipeline</h3>
          <div className="flex items-center gap-0">
            {stages.map((s, i) => (
              <div key={s} className="flex items-center">
                <button
                  onClick={() => setActiveStage(s)}
                  className="w-4 h-4 rounded-full transition-all cursor-pointer"
                  style={{
                    backgroundColor: activeStage === s ? STAGE_COLORS[s] : 'transparent',
                    border: `2px solid ${activeStage === s ? STAGE_COLORS[s] : 'rgba(255,255,255,0.10)'}`,
                  }}
                />
                {i < stages.length - 1 && (
                  <div className="w-8 h-[2px]" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
                )}
              </div>
            ))}
          </div>
          <p className="text-[13px] font-body text-[#e8e4dc] mt-2">{STAGE_LABELS[activeStage]}</p>
        </div>

        {/* Call History */}
        {prospect.callHistory.length > 0 && (
          <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
            <h3 className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)] mb-4">Historique</h3>
            <div className="space-y-4">
              {prospect.callHistory.map((call: CallRecord) => {
                const outcomeColors: Record<string, string> = {
                  rdv: '#4ade80', prototype: '#c5a059', rappeler: '#60a5fa', perdu: '#f87171',
                };
                return (
                  <div key={call.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: outcomeColors[call.outcome] || '#60a5fa' }} />
                      <div className="w-[1px] flex-1 bg-[rgba(255,255,255,0.06)]" />
                    </div>
                    <div className="pb-4">
                      <p className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)]">{call.date}</p>
                      <p className="text-[13px] font-body text-[#e8e4dc] mt-0.5">{call.duration}</p>
                      <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)] mt-0.5">{call.notes}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="p-6">
          <h3 className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)] mb-3">Notes</h3>
          <textarea
            defaultValue={prospect.notes}
            className="w-full min-h-[100px] p-3 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.06)] text-[13px] font-body text-[#e8e4dc] resize-vertical focus:outline-none focus:border-[rgba(197,160,89,0.25)]"
          />
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 p-4 bg-[rgba(24,24,36,0.95)] border-t border-[rgba(255,255,255,0.06)] flex gap-3">
          <AnimatedButton variant="primary" icon={<Phone size={16} />} className="flex-1">
            Appeler
          </AnimatedButton>
          <AnimatedButton variant="danger" icon={<Trash2 size={16} />}>
            Supprimer
          </AnimatedButton>
        </div>
      </motion.aside>
    </>
  );
}

/* ─── Pipeline Card ─── */
function PipelineCard({ prospect, onClick }: { prospect: Prospect; onClick: () => void }) {
  return (
    <motion.div
      layout
      drag
      dragSnapToOrigin
      whileDrag={{ scale: 1.02, opacity: 0.9, boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)' }}
      className="p-4 rounded-[10px] bg-[rgba(17,17,26,0.7)] border border-[rgba(255,255,220,0.06)] shadow-glass cursor-grab hover:border-[rgba(255,255,255,0.10)] transition-colors"
      onClick={onClick}
    >
      <p className="text-[15px] font-body font-semibold text-[#e8e4dc]">{prospect.name}</p>
      <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)]">{prospect.company}</p>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <ScoreBadge score={prospect.score} />
        <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.55)]">
          {prospect.sector}
        </span>
        <span className="text-[11px] font-body text-[rgba(232,228,220,0.30)]">{prospect.lastContact}</span>
      </div>
    </motion.div>
  );
}

/* ─── Kanban Board ─── */
function KanbanBoard({ prospects, onSelect }: { prospects: Prospect[]; onSelect: (p: Prospect) => void }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-6">
      {stages.map((stage, colIdx) => {
        const stageProspects = prospects.filter((p) => p.stage === stage);
        return (
          <motion.div
            key={stage}
            className="flex-shrink-0 w-[300px] flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: colIdx * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Column header */}
            <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom: `2px solid ${STAGE_COLORS[stage]}` }}>
              <div className="flex items-center gap-2">
                <h3 className="text-[18px] font-body font-semibold text-[#e8e4dc]">{STAGE_LABELS[stage]}</h3>
                <span className="text-[11px] font-body font-medium text-[rgba(232,228,220,0.55)]">({stageProspects.length})</span>
              </div>
              <button className="text-[rgba(232,228,220,0.55)] hover:text-[#e8e4dc] transition-colors cursor-pointer">
                <Plus size={16} />
              </button>
            </div>

            {/* Cards */}
            <div className="flex-1 flex flex-col gap-2 min-h-[200px]">
              <AnimatePresence>
                {stageProspects.map((prospect) => (
                  <motion.div
                    key={prospect.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PipelineCard prospect={prospect} onClick={() => onSelect(prospect)} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {stageProspects.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[13px] font-body text-[rgba(232,228,220,0.30)]">Aucun prospect</p>
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
function ListView({ prospects, onSelect }: { prospects: Prospect[]; onSelect: (p: Prospect) => void }) {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(prospects.length / perPage);
  const paginated = prospects.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="px-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.10)] bg-[#11111a]">
              {['Nom', 'Score', 'Secteur', 'Statut', 'Dernier contact', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((prospect, i) => (
              <motion.tr
                key={prospect.id}
                className="border-b border-[rgba(255,255,255,0.06)] hover:bg-[#11111a] transition-colors cursor-pointer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelect(prospect)}
              >
                <td className="px-5 py-3">
                  <p className="text-[15px] font-body font-medium text-[#e8e4dc]">{prospect.name}</p>
                  <p className="text-[13px] font-body text-[rgba(232,228,220,0.55)]">{prospect.company}</p>
                </td>
                <td className="px-5 py-3">
                  <ScoreBadge score={prospect.score} />
                </td>
                <td className="px-5 py-3 text-[13px] font-body text-[rgba(232,228,220,0.55)]">
                  {prospect.sector}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge stage={prospect.stage} />
                </td>
                <td className="px-5 py-3 text-[13px] font-body text-[rgba(232,228,220,0.30)]">
                  {prospect.lastContact}
                </td>
                <td className="px-5 py-3">
                  <button className="text-[rgba(232,228,220,0.55)] hover:text-[#e8e4dc] transition-colors cursor-pointer">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </motion.tr>
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
            <span className="text-xs">&#8249;</span>
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
            <span className="text-xs">&#8250;</span>
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
        <GlassPanel key={s.stage} className="px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
          <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)]">
            {STAGE_LABELS[s.stage]}
          </span>
          <span className="text-[15px] font-body font-semibold text-[#e8e4dc]">{s.count}</span>
        </GlassPanel>
      ))}
      <GlassPanel className="px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
        <span className="text-[15px] font-body font-semibold text-[#4ade80]">+23.4%</span>
      </GlassPanel>
    </div>
  );
}

/* ─── CRM Page ─── */
export default function CRM() {
  const { crmView, setCrmView } = useUIStore();
  const [search, setSearch] = useState('');
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredProspects = useMemo(() => {
    if (!search.trim()) return mockProspects;
    const q = search.toLowerCase();
    return mockProspects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.sector.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-[calc(100dvh-56px)] pb-8">
      {/* Header */}
      <div className="px-6 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-light text-[clamp(32px,4vw,48px)] text-[#e8e4dc] tracking-[-0.01em]">
            Prospects
          </h1>
          <span className="text-[11px] font-body font-medium px-2.5 py-1 rounded-full bg-[#11111a] text-[rgba(232,228,220,0.55)]">
            {mockProspects.length}
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
          <div className="relative w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.55)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full h-10 pl-9 pr-4 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.06)] text-[13px] font-body text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.30)] focus:outline-none focus:border-[rgba(197,160,89,0.25)]"
            />
          </div>

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
      <div className="mt-5">
        {crmView === 'kanban' ? (
          <KanbanBoard prospects={filteredProspects} onSelect={setSelectedProspect} />
        ) : (
          <ListView prospects={filteredProspects} onSelect={setSelectedProspect} />
        )}
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedProspect && (
          <DetailDrawer prospect={selectedProspect} onClose={() => setSelectedProspect(null)} />
        )}
      </AnimatePresence>

      {/* Add Prospect Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddProspectModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Add Prospect Modal ─── */
function AddProspectModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-[rgba(5,5,9,0.7)] backdrop-blur-[8px]" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-[480px] p-8 rounded-[14px] bg-[rgba(24,24,36,0.95)] border border-[rgba(255,255,255,0.10)] shadow-modal"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <h2 className="font-display text-[32px] font-normal text-[#e8e4dc]">Nouveau prospect</h2>
        <div className="space-y-4 mt-6">
          <InputField placeholder="Nom du contact" />
          <InputField placeholder="Entreprise" />
          <InputField placeholder="https://..." />
          <InputField placeholder="+33..." />
        </div>
        <div className="flex gap-3 mt-6">
          <AnimatedButton variant="secondary" className="flex-1" onClick={onClose}>
            Annuler
          </AnimatedButton>
          <AnimatedButton variant="primary" className="flex-1">
            Ajouter
          </AnimatedButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

