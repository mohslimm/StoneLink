"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, List, Search, Plus, MoreHorizontal, X, Phone, Trash2, Globe, Mail, 
  ShieldAlert, Upload, ChevronDown, ArrowUpDown, Star, Filter, CheckCircle2, RotateCcw,
  FileText, Save, Check, Send, Sparkles, CheckSquare, Square
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/custom/GlassPanel';
import { AnimatedButton } from '@/components/ui/custom/AnimatedButton';
import { LuxurySelect } from '@/components/ui/custom/LuxurySelect';
import { WhatsAppBulkModal } from '@/components/ui/custom/WhatsAppBulkModal';
import { useUIStore } from '@/hooks/useUIStore';
import { useProspectsStore } from '@/hooks/useProspectsStore';
import { mockProspects } from '@/data/prospects';
import { STAGE_COLORS, STAGE_LABELS, mapBackendProspect } from '@/types';
import type { PipelineStage, Prospect, CallRecord } from '@/types';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { TRAVEL_AGENCY_PROTOTYPE_MESSAGE, openWhatsAppDirect, formatPhoneForWhatsApp } from '@/lib/whatsapp';

const stages: PipelineStage[] = ['nouveau', 'contacte', 'recontacter', 'prototype', 'ferme', 'perdu'];

const stageOptions = [
  { label: 'Tous statuts', value: 'all' },
  { label: 'Nouveaux', value: 'nouveau', color: STAGE_COLORS.nouveau },
  { label: 'Contactés', value: 'contacte', color: STAGE_COLORS.contacte },
  { label: 'À recontacter', value: 'recontacter', color: STAGE_COLORS.recontacter },
  { label: 'Prototypes', value: 'prototype', color: STAGE_COLORS.prototype },
  { label: 'Fermés', value: 'ferme', color: STAGE_COLORS.ferme },
  { label: 'Perdus', value: 'perdu', color: STAGE_COLORS.perdu },
];

const sortOptions = [
  { label: 'Trier : Récents', value: 'recent' },
  { label: 'Trier : Score faible', value: 'score_asc' },
  { label: 'Trier : Score élevé', value: 'score_desc' },
  { label: 'Trier : Nom (A-Z)', value: 'name_asc' },
];

function hasValidWebsite(url?: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return clean !== '' &&
         clean !== 'pas de site web' &&
         clean !== 'non renseigné' &&
         clean !== 'aucun' &&
         clean.length > 3;
}

function extractArea(p: any): string {
  if (p.city && typeof p.city === 'string' && p.city.trim() && p.city.trim() !== 'Général') {
    return p.city.trim();
  }
  if (p.Wilaya && typeof p.Wilaya === 'string' && p.Wilaya.trim()) {
    return p.Wilaya.trim();
  }
  if (p.notes && p.notes.includes('Zone:')) {
    const match = p.notes.match(/Zone:\s*([^|\n\r]+)/);
    if (match) return match[1].trim();
  }
  return 'Général';
}

function getDisplayNote(notes?: string): string | null {
  if (!notes) return null;
  const lines = notes.split('\n').map((l) => l.trim()).filter(Boolean);
  const userLines = lines.filter((l) => !l.startsWith('Zone:') && !l.startsWith('Faiblesses détectées :'));
  if (userLines.length > 0) {
    return userLines.join(' · ');
  }
  const clean = lines.join(' · ').replace(/Zone:\s*[^·|]+[·|]?/g, '').trim();
  return clean.length > 2 ? clean : null;
}

function getLeadBatchInfo(p: any): { label: string; dateStr: string; key: string; isToday: boolean; isYesterday: boolean } {
  const raw = p.runDate || p.createdAt || p.RunDate;
  if (!raw) {
    return { label: 'Initial', dateStr: 'Initial', key: 'initial', isToday: false, isYesterday: false };
  }
  const d = new Date(raw);
  if (isNaN(d.getTime())) {
    return { label: 'Initial', dateStr: 'Initial', key: 'initial', isToday: false, isYesterday: false };
  }
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const dateStr = `${day}/${month}`;
  const key = `${d.getFullYear()}-${month}-${day}`;
  const label = isToday ? `Aujourd'hui (${dateStr})` : isYesterday ? `Hier (${dateStr})` : `Lot du ${dateStr}`;

  return { label, dateStr, key, isToday, isYesterday };
}

function ScoreBadge({ score, hasWeb }: { score: number; hasWeb?: boolean }) {
  if (hasWeb === false || score === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10.5px] font-body font-semibold px-2 py-0.5 rounded-full text-[#f87171] bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.22)]">
        🚫 Sans site
      </span>
    );
  }
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
    recontacter: { color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
    prototype: { color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
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
  onSendWhatsApp,
}: {
  prospect: Prospect;
  onClose: () => void;
  onUpdateStage: (id: string, stage: PipelineStage) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
  onSendWhatsApp: (p: Prospect) => void;
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
    if (s === 'prototype') {
      onSendWhatsApp(prospect);
    }
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
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <p className="text-[16px] font-body text-[#c5a059]">{prospect.company}</p>
              {(() => {
                const b = getLeadBatchInfo(prospect);
                if (b.dateStr === 'Initial') return null;
                return (
                  <span className={cn(
                    "text-[10.5px] font-mono px-2 py-0.5 rounded border tracking-wide",
                    b.isToday
                      ? "bg-[rgba(74,222,128,0.12)] border-[rgba(74,222,128,0.35)] text-[#4ade80]"
                      : b.isYesterday
                      ? "bg-[rgba(245,158,11,0.12)] border-[rgba(245,158,11,0.35)] text-[#fbbf24]"
                      : "bg-[rgba(197,160,89,0.10)] border-[rgba(197,160,89,0.25)] text-[#c5a059]"
                  )}>
                    {b.label}
                  </span>
                );
              })()}
            </div>
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
              {hasValidWebsite(prospect.url) ? (
                <div className="flex items-center gap-2 text-[13px] font-body text-[rgba(232,228,220,0.7)]">
                  <Globe size={14} className="text-[#c5a059]" />
                  <a href={prospect.url} target="_blank" rel="noreferrer" className="hover:underline truncate">{prospect.url}</a>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[13px] font-body text-[#f87171]">
                  <Globe size={14} className="text-[#f87171]" />
                  <span>🚫 Aucun site web officiel</span>
                </div>
              )}
            </div>
          </div>

          {/* Score & Niche */}
          <div className="p-6 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
            <div>
              <h3 className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.5)] mb-1">
                {hasValidWebsite(prospect.url) && prospect.score > 0 ? 'Score Lighthouse' : 'Présence Web'}
              </h3>
              {hasValidWebsite(prospect.url) && prospect.score > 0 ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-[32px] font-body font-normal tracking-[-0.02em]"
                    style={{ color: prospect.score >= 70 ? '#4ade80' : prospect.score >= 40 ? '#60a5fa' : '#f87171' }}>
                    {prospect.score}
                  </span>
                  <span className="text-[14px] font-body text-[rgba(232,228,220,0.5)]">/100</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="px-2.5 py-1 rounded-full text-[12px] font-body font-semibold text-[#f87171] bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.25)]">
                    🚫 Sans site web
                  </span>
                </div>
              )}
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

          {/* Prototype WhatsApp Fast-Dispatch Block */}
          <div className="p-6 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(197,160,89,0.03)]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[#c5a059] flex items-center gap-1.5">
                <Sparkles size={12} />
                <span>Prototype Plateforme Démo</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[rgba(197,160,89,0.1)] text-[#c5a059] border border-[rgba(197,160,89,0.2)]">
                Parfait Voyage (Algérie)
              </span>
            </div>
            <p className="text-[12px] font-body text-[rgba(232,228,220,0.65)] leading-relaxed mb-3">
              Envoie instantanément le pitch complet via WhatsApp avec liens du prototype et flyer des 3 formules.
            </p>
            <button
              type="button"
              onClick={() => onSendWhatsApp(prospect)}
              className="w-full py-2.5 px-3 rounded-[9px] bg-gradient-to-r from-[#B8924A] via-[#c5a059] to-[#D4B57A] hover:opacity-95 text-[#1A1200] font-body font-semibold text-[12.5px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_2px_14px_rgba(197,160,89,0.25)] hover:scale-[1.01]"
            >
              <Send size={13} />
              <span>Envoyer Prototype sur WhatsApp</span>
            </button>
          </div>

          {/* Notes Area */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.5)]">Notes Stratégiques</h3>
              <span className="text-[10px] text-[#4ade80] flex items-center gap-1 font-body">
                <Check size={11} /> Sauvegarde auto
              </span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Ajouter des notes (ex: rappeler demain 14h, ne décroche pas, nouveau numéro, etc.)..."
              rows={4}
              className="w-full p-3 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.25)] resize-vertical focus:outline-none focus:border-[#c5a059]"
            />
            {notes !== prospect.notes && (
              <button
                onClick={handleNotesBlur}
                className="mt-2.5 w-full py-2 rounded-[8px] bg-[rgba(197,160,89,0.18)] hover:bg-[rgba(197,160,89,0.28)] border border-[rgba(197,160,89,0.35)] text-[12px] font-body font-medium text-[#c5a059] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_2px_12px_rgba(197,160,89,0.1)]"
              >
                <Save size={13} />
                <span>Enregistrer la note maintenant</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[rgba(20,20,34,0.98)] border-t border-[rgba(255,255,255,0.08)] flex gap-2.5 flex-col sm:flex-row">
          <AnimatedButton
            variant="primary"
            icon={<Phone size={15} />}
            className="flex-1"
            onClick={() => router.push(`/call?prospectId=${prospect.id}`)}
          >
            Appel Studio
          </AnimatedButton>
          <button
            onClick={() => onSendWhatsApp(prospect)}
            className="flex-1 h-10 px-3 rounded-[8px] bg-[rgba(34,197,94,0.12)] hover:bg-[rgba(34,197,94,0.22)] border border-[rgba(34,197,94,0.35)] text-[#4ade80] font-body font-medium text-[12.5px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send size={14} />
            <span>WhatsApp</span>
          </button>
          <AnimatedButton
            variant="danger"
            icon={<Trash2 size={15} />}
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
  onSendWhatsApp,
}: {
  prospect: Prospect;
  onClick: () => void;
  onUpdateStage: (id: string, stage: PipelineStage) => void;
  onSendWhatsApp: (p: Prospect) => void;
}) {
  return (
    <div
      className="p-4 rounded-[10px] bg-[rgba(17,17,26,0.85)] border border-[rgba(255,255,220,0.06)] shadow-glass cursor-pointer hover:border-[rgba(197,160,89,0.3)] hover:-translate-y-0.5 transition-all group"
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
        <ScoreBadge score={prospect.score} hasWeb={hasValidWebsite(prospect.url)} />
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.65)]">
          {prospect.sector}
        </span>
        {(() => {
          const b = getLeadBatchInfo(prospect);
          if (b.dateStr === 'Initial') return null;
          return (
            <span className={cn(
              "text-[10px] font-mono px-1.5 py-0.5 rounded border tracking-wide",
              b.isToday
                ? "bg-[rgba(74,222,128,0.12)] border-[rgba(74,222,128,0.35)] text-[#4ade80]"
                : b.isYesterday
                ? "bg-[rgba(245,158,11,0.12)] border-[rgba(245,158,11,0.35)] text-[#fbbf24]"
                : "bg-[rgba(197,160,89,0.10)] border-[rgba(197,160,89,0.25)] text-[#c5a059]"
            )}>
              Lot {b.dateStr}
            </span>
          );
        })()}
        <span className="text-[11px] font-body text-[rgba(232,228,220,0.35)]">
          {prospect.lastContact}
        </span>
      </div>

      {/* Note preview snippet on card */}
      {getDisplayNote(prospect.notes) && (
        <div className="mt-2.5 px-2.5 py-1.5 rounded-[8px] bg-[rgba(197,160,89,0.08)] border border-[rgba(197,160,89,0.2)] flex items-start gap-1.5 text-[11.5px] font-body text-[#e8e4dc]">
          <FileText size={12} className="text-[#c5a059] shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-relaxed italic text-[rgba(232,228,220,0.85)]">
            &ldquo;{getDisplayNote(prospect.notes)}&rdquo;
          </span>
        </div>
      )}

      {/* Quick Stage Progression & Direct WhatsApp Action */}
      <div
        className="flex items-center justify-between mt-3 pt-2.5 border-t border-[rgba(255,255,255,0.05)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onSendWhatsApp(prospect)}
          className="h-6 px-2 rounded-[6px] bg-[rgba(34,197,94,0.12)] hover:bg-[rgba(34,197,94,0.22)] border border-[rgba(34,197,94,0.3)] text-[#4ade80] text-[10px] font-body font-medium flex items-center gap-1 transition-colors cursor-pointer"
          title="Envoyer Prototype Voyage (WhatsApp)"
        >
          <Send size={10} />
          <span>WhatsApp</span>
        </button>

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
    </div>
  );
}

/* ─── Kanban Column ─── */
function KanbanColumn({
  stage,
  prospects,
  onSelect,
  onUpdateStage,
  onAddClick,
  onSendWhatsApp,
}: {
  stage: PipelineStage;
  prospects: Prospect[];
  onSelect: (p: Prospect) => void;
  onUpdateStage: (id: string, stage: PipelineStage) => void;
  onAddClick: () => void;
  onSendWhatsApp: (p: Prospect) => void;
}) {
  const [limit, setLimit] = useState(25);
  const stageProspects = useMemo(() => prospects.filter((p) => p.stage === stage), [prospects, stage]);
  const visible = stageProspects.slice(0, limit);
  const hasMore = stageProspects.length > limit;

  return (
    <div className="flex-shrink-0 w-[290px] flex flex-col">
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
        {visible.map((prospect) => (
          <PipelineCard
            key={prospect.id}
            prospect={prospect}
            onClick={() => onSelect(prospect)}
            onUpdateStage={onUpdateStage}
            onSendWhatsApp={onSendWhatsApp}
          />
        ))}

        {hasMore && (
          <button
            onClick={() => setLimit((prev) => prev + 25)}
            className="w-full py-2 text-center text-[12px] font-body text-[#c5a059] bg-[#11111a] hover:bg-[#181826] rounded-[8px] border border-[rgba(197,160,89,0.2)] transition-colors cursor-pointer"
          >
            Afficher +25 (sur {stageProspects.length - limit} restants)
          </button>
        )}

        {stageProspects.length === 0 && (
          <div className="text-center py-10 rounded-[10px] border border-dashed border-[rgba(255,255,255,0.06)]">
            <p className="text-[12px] font-body text-[rgba(232,228,220,0.30)]">Aucun prospect</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Kanban Board ─── */
function KanbanBoard({
  prospects,
  onSelect,
  onUpdateStage,
  onAddClick,
  onSendWhatsApp,
}: {
  prospects: Prospect[];
  onSelect: (p: Prospect) => void;
  onUpdateStage: (id: string, stage: PipelineStage) => void;
  onAddClick: () => void;
  onSendWhatsApp: (p: Prospect) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 px-6">
      {stages.map((stage) => (
        <KanbanColumn
          key={stage}
          stage={stage}
          prospects={prospects}
          onSelect={onSelect}
          onUpdateStage={onUpdateStage}
          onAddClick={onAddClick}
          onSendWhatsApp={onSendWhatsApp}
        />
      ))}
    </div>
  );
}

/* ─── List View ─── */
function ListView({
  prospects,
  onSelect,
  onUpdateStage,
  selectedIds,
  onToggleSelect,
  onToggleSelectPage,
  onSendWhatsApp,
}: {
  prospects: Prospect[];
  onSelect: (p: Prospect) => void;
  onUpdateStage: (id: string, stage: PipelineStage) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectPage: (pageProspects: Prospect[]) => void;
  onSendWhatsApp: (p: Prospect) => void;
}) {
  const [page, setPage] = useState(1);
  const perPage = 15;
  const totalPages = Math.ceil(prospects.length / perPage) || 1;
  const paginated = prospects.slice((page - 1) * perPage, page * perPage);

  const isAllPageSelected = paginated.length > 0 && paginated.every((p) => selectedIds.includes(p.id));

  return (
    <div className="px-6">
      <div className="overflow-x-auto rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[#0d0d16]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[#11111a]">
              <th className="w-10 px-4 py-3.5 text-center">
                <input
                  type="checkbox"
                  aria-label="Sélectionner tous les prospects affichés"
                  checked={isAllPageSelected}
                  onChange={() => onToggleSelectPage(paginated)}
                  className="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] bg-[#11111a] text-[#c5a059] focus:ring-[#c5a059] cursor-pointer accent-[#c5a059]"
                />
              </th>
              {['Contact & Entreprise', 'Lighthouse', 'Secteur', 'Statut Pipeline', 'Dernier Contact', 'Actions Directes'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((prospect) => {
              const isSelected = selectedIds.includes(prospect.id);
              return (
                <tr
                  key={prospect.id}
                  className={cn(
                    "border-b border-[rgba(255,255,255,0.04)] transition-colors cursor-pointer",
                    isSelected 
                      ? "bg-[rgba(197,160,89,0.08)] hover:bg-[rgba(197,160,89,0.12)]" 
                      : "hover:bg-[rgba(255,255,255,0.02)]"
                  )}
                  onClick={() => onSelect(prospect)}
                >
                  <td className="w-10 px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={`Sélectionner ${prospect.company}`}
                      checked={isSelected}
                      onChange={() => onToggleSelect(prospect.id)}
                      className="w-4 h-4 rounded border-[rgba(255,255,255,0.2)] bg-[#11111a] text-[#c5a059] focus:ring-[#c5a059] cursor-pointer accent-[#c5a059]"
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-body font-semibold text-[#e8e4dc]">{prospect.name}</p>
                      {(() => {
                        const b = getLeadBatchInfo(prospect);
                        if (b.dateStr === 'Initial') return null;
                        return (
                          <span className={cn(
                            "text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border tracking-wide whitespace-nowrap",
                            b.isToday
                              ? "bg-[rgba(74,222,128,0.12)] border-[rgba(74,222,128,0.35)] text-[#4ade80]"
                              : b.isYesterday
                              ? "bg-[rgba(245,158,11,0.12)] border-[rgba(245,158,11,0.35)] text-[#fbbf24]"
                              : "bg-[rgba(197,160,89,0.10)] border-[rgba(197,160,89,0.25)] text-[#c5a059]"
                          )}>
                            Lot {b.dateStr}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-[12px] font-body text-[#c5a059]">{prospect.company}</p>
                    {getDisplayNote(prospect.notes) && (
                      <p className="text-[11px] font-body text-[rgba(232,228,220,0.6)] italic mt-1 line-clamp-1 flex items-center gap-1">
                        <FileText size={11} className="text-[#c5a059] shrink-0" />
                        <span>{getDisplayNote(prospect.notes)}</span>
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <ScoreBadge score={prospect.score} hasWeb={hasValidWebsite(prospect.url)} />
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSendWhatsApp(prospect)}
                        className="h-8 px-2.5 rounded-[7px] bg-[rgba(34,197,94,0.12)] hover:bg-[rgba(34,197,94,0.25)] border border-[rgba(34,197,94,0.3)] text-[#4ade80] flex items-center gap-1.5 transition-colors cursor-pointer text-[11.5px]"
                        title="Envoyer Prototype Voyage (WhatsApp)"
                      >
                        <Send size={12} />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>
                      <LuxurySelect
                        value={prospect.stage}
                        onChange={(val) => onUpdateStage(prospect.id, val as PipelineStage)}
                        options={stageOptions.filter((s) => s.value !== 'all')}
                        className="w-[130px]"
                        align="right"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
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
  const {
    prospects,
    loading,
    isFallbackMode,
    trashCount,
    fetchProspects,
    updateStage,
    batchUpdateStage,
    updateNotes,
    deleteProspect,
    addProspect,
    importProspects,
  } = useProspectsStore();

  const [search, setSearch] = useState('');
  const [nicheFilter, setNicheFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState<'all' | PipelineStage>('all');
  const [noWebsiteOnly, setNoWebsiteOnly] = useState(false);
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'score_asc' | 'score_desc' | 'name_asc'>('recent');
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Multi-Selection and Bulk WhatsApp Automation State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkWhatsAppOpen, setIsBulkWhatsAppOpen] = useState(false);
  const [bulkModalProspects, setBulkModalProspects] = useState<Prospect[]>([]);

  // Real-time multi-user SSE synchronization
  const { isConnected: isRealtimeConnected } = useRealtimeSync();

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  const handleOpenWhatsApp = (prospect: Prospect) => {
    const formatted = formatPhoneForWhatsApp(prospect.phone);
    if (!formatted) {
      addToast({
        type: 'error',
        message: `Numéro de téléphone absent ou invalide pour « ${prospect.company} »`,
      });
      return;
    }
    openWhatsAppDirect(formatted, TRAVEL_AGENCY_PROTOTYPE_MESSAGE);
    updateStage(prospect.id, 'prototype');
    if (selectedProspect && selectedProspect.id === prospect.id) {
      setSelectedProspect((prev) => (prev ? { ...prev, stage: 'prototype' } : null));
    }
    addToast({
      type: 'success',
      message: `WhatsApp ouvert & deal passé en « Prototypes envoyés » pour ${prospect.company} !`,
    });
  };

  const handleUpdateStage = async (id: string, stage: PipelineStage) => {
    await updateStage(id, stage);
    if (selectedProspect && selectedProspect.id === id) {
      setSelectedProspect((prev) => (prev ? { ...prev, stage } : null));
    }

    if (stage === 'prototype') {
      const p = prospects.find((item) => item.id === id);
      if (p) {
        const formatted = formatPhoneForWhatsApp(p.phone);
        if (formatted) {
          openWhatsAppDirect(formatted, TRAVEL_AGENCY_PROTOTYPE_MESSAGE);
          addToast({
            type: 'success',
            message: `Deal passé en « Prototypes envoyés » → WhatsApp lancé pour ${p.company} !`,
          });
          return;
        }
      }
    }

    addToast({ type: 'success', message: `Statut mis à jour : ${STAGE_LABELS[stage]}` });
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectPage = (pageProspects: Prospect[]) => {
    const pageIds = pageProspects.map((p) => p.id);
    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds(filteredProspects.map((p) => p.id));
    addToast({ type: 'info', message: `${filteredProspects.length} prospects sélectionnés` });
  };

  const handleSelectTravelAgencies = () => {
    const travelLeads = prospects.filter(
      (p) =>
        (p.sector && p.sector.toLowerCase().includes('voyage')) ||
        (p.company && p.company.toLowerCase().includes('voyage')) ||
        (p.company && p.company.toLowerCase().includes('travel')) ||
        (p.company && p.company.toLowerCase().includes('tour'))
    );
    setSelectedIds(travelLeads.map((p) => p.id));
    setNicheFilter('Agence de voyage');
    addToast({
      type: 'success',
      message: `${travelLeads.length} agences de voyage sélectionnées pour l'outreach WhatsApp !`,
    });
  };

  const handleBatchMarkAsPrototype = async () => {
    if (selectedIds.length === 0) return;
    await batchUpdateStage(selectedIds, 'prototype');
    addToast({
      type: 'success',
      message: `${selectedIds.length} prospects marqués comme « Prototypes envoyés »`,
    });
    setSelectedIds([]);
  };

  const handleOpenBulkModalForSelected = () => {
    const targetProspects = prospects.filter((p) => selectedIds.includes(p.id));
    if (targetProspects.length === 0) {
      addToast({ type: 'error', message: 'Veuillez sélectionner au moins un prospect' });
      return;
    }
    setBulkModalProspects(targetProspects);
    setIsBulkWhatsAppOpen(true);
  };

  const handleOpenBulkModalForAllFiltered = () => {
    if (filteredProspects.length === 0) {
      addToast({ type: 'error', message: 'Aucun prospect dans le filtre actuel' });
      return;
    }
    setBulkModalProspects(filteredProspects);
    setIsBulkWhatsAppOpen(true);
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    await updateNotes(id, notes);
    if (selectedProspect && selectedProspect.id === id) {
      setSelectedProspect((prev) => (prev ? { ...prev, notes } : null));
    }
    addToast({ type: 'success', message: 'Notes enregistrées' });
  };

  const handleDeleteProspect = async (id: string) => {
    await deleteProspect(id);
    if (selectedProspect && selectedProspect.id === id) {
      setSelectedProspect(null);
    }
    addToast({ type: 'info', message: 'Prospect déplacé dans la corbeille' });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
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

      importProspects(importedDocs);
      addToast({
        type: 'success',
        message: `${importedDocs.length} leads importés avec succès depuis Bot-Search !`,
      });
    } catch (err: any) {
      console.error('Import error:', err);
      addToast({ type: 'error', message: "Erreur lors de l'import du fichier CSV" });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddProspect = (newProspect: Prospect) => {
    addProspect(newProspect);
    setShowAddModal(false);
    addToast({ type: 'success', message: 'Prospect ajouté au pipeline' });
  };

  // Dynamic Extraction of Niches and Areas from CRM prospects
  const dynamicNiches = useMemo(() => {
    const set = new Set<string>();
    prospects.forEach((p) => {
      if (p.sector) set.add(p.sector);
    });
    const list = Array.from(set).sort();
    return [{ label: 'Toutes les niches', value: 'all' }, ...list.map((n) => ({ label: n, value: n }))];
  }, [prospects]);

  const dynamicAreas = useMemo(() => {
    const set = new Set<string>();
    prospects.forEach((p) => {
      const area = extractArea(p);
      if (area && area !== 'Général') set.add(area);
    });
    const list = Array.from(set).sort();
    return [{ label: 'Toutes les wilayas / zones', value: 'all' }, ...list.map((a) => ({ label: a, value: a }))];
  }, [prospects]);

  // Dynamic Extraction of Scrape Batches / Dates from CRM prospects
  const dynamicBatches = useMemo(() => {
    const batchMap = new Map<string, { label: string; count: number; sortKey: string }>();
    prospects.forEach((p) => {
      const info = getLeadBatchInfo(p);
      if (info.key !== 'initial') {
        if (!batchMap.has(info.key)) {
          batchMap.set(info.key, { label: info.label, count: 1, sortKey: info.key });
        } else {
          batchMap.get(info.key)!.count++;
        }
      }
    });

    const sorted = Array.from(batchMap.entries()).sort((a, b) => b[1].sortKey.localeCompare(a[1].sortKey));

    return [
      { label: 'Tous les scans / arrivages', value: 'all' },
      { label: "Aujourd'hui", value: 'today' },
      { label: 'Hier', value: 'yesterday' },
      ...sorted.map(([key, item]) => ({
        label: `${item.label} (${item.count})`,
        value: key,
      })),
    ];
  }, [prospects]);

  // Multi-criteria Filtering & Sorting (matching Campaigns engine)
  const filteredProspects = useMemo(() => {
    return prospects
      .filter((p) => {
        const matchNiche = nicheFilter === 'all' || p.sector === nicheFilter;
        const area = extractArea(p);
        const matchArea = areaFilter === 'all' || area === areaFilter;

        // Batch / Date filter
        const batchInfo = getLeadBatchInfo(p);
        let matchBatch = true;
        if (batchFilter === 'today') {
          matchBatch = batchInfo.isToday;
        } else if (batchFilter === 'yesterday') {
          matchBatch = batchInfo.isYesterday;
        } else if (batchFilter !== 'all') {
          matchBatch = batchInfo.key === batchFilter;
        }

        const hasWeb = hasValidWebsite(p.url);
        const matchNoWeb = !noWebsiteOnly || !hasWeb;
        const matchPriority = !priorityOnly || p.score < 45 || !hasWeb;
        const matchStage = stageFilter === 'all' || p.stage === stageFilter;

        const q = search.toLowerCase().trim();
        const matchSearch =
          !q ||
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.company && p.company.toLowerCase().includes(q)) ||
          (p.sector && p.sector.toLowerCase().includes(q)) ||
          (p.phone && p.phone.includes(q)) ||
          (p.notes && p.notes.toLowerCase().includes(q)) ||
          area.toLowerCase().includes(q);

        return matchNiche && matchArea && matchBatch && matchNoWeb && matchPriority && matchStage && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'score_asc') return (a.score || 0) - (b.score || 0);
        if (sortBy === 'score_desc') return (b.score || 0) - (a.score || 0);
        if (sortBy === 'name_asc') return (a.company || a.name || '').localeCompare(b.company || b.name || '');
        return 0; // Default recent
      });
  }, [prospects, search, nicheFilter, areaFilter, batchFilter, stageFilter, noWebsiteOnly, priorityOnly, sortBy]);

  const hasActiveFilters =
    search !== '' ||
    nicheFilter !== 'all' ||
    areaFilter !== 'all' ||
    batchFilter !== 'all' ||
    stageFilter !== 'all' ||
    noWebsiteOnly ||
    priorityOnly ||
    sortBy !== 'recent';

  const handleResetFilters = () => {
    setSearch('');
    setNicheFilter('all');
    setAreaFilter('all');
    setBatchFilter('all');
    setStageFilter('all');
    setNoWebsiteOnly(false);
    setPriorityOnly(false);
    setSortBy('recent');
  };

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
            {filteredProspects.length === prospects.length
              ? `${prospects.length} prospects`
              : `${filteredProspects.length} sur ${prospects.length} prospects`}
          </span>
          {isRealtimeConnected && (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-body font-medium text-[#4ade80] bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.22)]"
              title="Synchronisation temps réel active (SSE)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
              <span>En direct</span>
            </span>
          )}
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

          {/* Cibler Agences de Voyage */}
          <button
            onClick={handleSelectTravelAgencies}
            className="h-9 px-3 rounded-[8px] bg-[rgba(197,160,89,0.12)] hover:bg-[rgba(197,160,89,0.22)] border border-[rgba(197,160,89,0.35)] text-[#c5a059] transition-all flex items-center gap-1.5 text-[12px] font-body font-medium cursor-pointer"
            title="Sélectionner toutes les Agences de voyage pour l'outreach WhatsApp"
          >
            <span>✈️</span>
            <span className="hidden xl:inline">Cibler Agences Voyage</span>
          </button>

          {/* Outreach WhatsApp */}
          <button
            onClick={selectedIds.length > 0 ? handleOpenBulkModalForSelected : handleOpenBulkModalForAllFiltered}
            className="h-9 px-3 rounded-[8px] bg-[rgba(34,197,94,0.14)] hover:bg-[rgba(34,197,94,0.24)] border border-[rgba(34,197,94,0.35)] text-[#4ade80] transition-all flex items-center gap-1.5 text-[12px] font-body font-medium cursor-pointer shadow-[0_2px_12px_rgba(34,197,94,0.15)]"
            title="Ouvrir la file d'automatisation WhatsApp pour les prospects"
          >
            <Send size={13} />
            <span className="hidden sm:inline">Outreach WhatsApp</span>
            {selectedIds.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#4ade80] text-[#060610]">
                {selectedIds.length}
              </span>
            )}
          </button>

          {/* Corbeille */}
          <Link
            href="/crm/trash"
            className="h-9 px-3 rounded-[8px] bg-[#11111a] hover:bg-[rgba(239,68,68,0.1)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(239,68,68,0.3)] text-[rgba(232,228,220,0.65)] hover:text-[#f87171] transition-all flex items-center gap-2 text-[12px] font-body font-medium cursor-pointer"
            title="Accéder à la corbeille des prospects supprimés"
          >
            <Trash2 size={14} className="text-[#f87171]" />
            <span className="hidden sm:inline">Corbeille</span>
            {trashCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[rgba(239,68,68,0.2)] text-[#f87171] border border-[rgba(239,68,68,0.3)]">
                {trashCount}
              </span>
            )}
          </Link>

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

      {/* Dynamic Filter Bar — Matching Campagnes Engine */}
      <div className="px-6 mt-4 relative z-30">
        <GlassPanel className="p-3.5 border-[rgba(255,255,255,0.08)] relative z-30 overflow-visible">
          <div className="flex flex-col 2xl:flex-row items-stretch 2xl:items-center justify-between gap-3 relative z-30">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)]" />
              <input
                type="text"
                placeholder="Rechercher par prospect, entreprise, wilaya, téléphone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] pl-9 pr-9 text-[13px] text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.35)] focus:outline-none focus:border-[rgba(197,160,89,0.35)] transition-colors"
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

            {/* Dropdowns & Filters Container */}
            <div className="flex items-center gap-2 flex-wrap relative z-30">
              {/* Niches */}
              <LuxurySelect
                value={nicheFilter}
                onChange={setNicheFilter}
                options={dynamicNiches}
                placeholder="Toutes les niches"
                className="w-full sm:w-[155px] shrink-0"
                title="Filtrer par secteur d'activité / niche"
              />

              {/* Wilayas / Zones */}
              <LuxurySelect
                value={areaFilter}
                onChange={setAreaFilter}
                options={dynamicAreas}
                placeholder="Toutes les wilayas"
                className="w-full sm:w-[170px] shrink-0"
                title="Filtrer par wilaya ou ville"
              />

              {/* Sessions de Scan / Arrivages */}
              <LuxurySelect
                value={batchFilter}
                onChange={setBatchFilter}
                options={dynamicBatches}
                placeholder="Tous les scans"
                className="w-full sm:w-[180px] shrink-0"
                title="Filtrer par arrivage ou date de scan"
              />

              {/* Statut Pipeline */}
              <LuxurySelect
                value={stageFilter}
                onChange={(val) => setStageFilter(val as any)}
                options={stageOptions}
                placeholder="Tous statuts"
                className="w-full sm:w-[145px] shrink-0"
                title="Filtrer par étape du pipeline"
              />

              {/* Sort Dropdown */}
              <LuxurySelect
                value={sortBy}
                onChange={(val) => setSortBy(val as any)}
                options={sortOptions}
                icon={<ArrowUpDown size={13} />}
                className="w-full sm:w-[160px] shrink-0"
                align="right"
                title="Trier la liste des prospects"
              />

              {/* Quick Toggle Chips */}
              <button
                onClick={() => setNoWebsiteOnly(!noWebsiteOnly)}
                className={`h-10 px-3 rounded-[10px] text-[12px] font-body font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  noWebsiteOnly
                    ? 'bg-[rgba(239,68,68,0.18)] border border-[rgba(239,68,68,0.4)] text-[#f87171] shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                    : 'bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.65)] hover:border-[rgba(239,68,68,0.3)]'
                }`}
                title="Afficher uniquement les prospects sans site web"
              >
                <span>🚫</span>
                <span>Sans site</span>
              </button>

              <button
                onClick={() => setPriorityOnly(!priorityOnly)}
                className={`h-10 px-3 rounded-[10px] text-[12px] font-body font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  priorityOnly
                    ? 'bg-[rgba(197,160,89,0.18)] border border-[rgba(197,160,89,0.4)] text-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.15)]'
                    : 'bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.65)] hover:border-[rgba(197,160,89,0.3)]'
                }`}
                title="Afficher uniquement les prospects prioritaires"
              >
                <Star size={13} className={priorityOnly ? 'fill-[#c5a059]' : ''} />
                <span>Prioritaires</span>
              </button>

              {/* Reset Icon Button */}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="w-10 h-10 rounded-[10px] bg-[#11111a] hover:bg-[rgba(197,160,89,0.15)] border border-[rgba(197,160,89,0.35)] text-[#c5a059] flex items-center justify-center transition-all cursor-pointer shrink-0"
                  title="Réinitialiser tous les filtres"
                >
                  <RotateCcw size={15} />
                </button>
              )}
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Stats */}
      <div className="mt-4 relative z-10">
        <PipelineStats prospects={filteredProspects} />
      </div>

      {/* Content */}
      <div className="mt-4 relative z-0 min-h-[350px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#c5a059]" size={32} />
          </div>
        ) : filteredProspects.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center mx-auto mb-3 text-[rgba(232,228,220,0.4)]">
              <Filter size={20} />
            </div>
            <h3 className="font-display font-medium text-[18px] text-[#e8e4dc]">
              Aucun prospect ne correspond à ces critères
            </h3>
            <p className="text-[13px] font-body text-[rgba(232,228,220,0.5)] mt-1 max-w-[420px] mx-auto">
              Ajustez vos filtres de recherche, niche, zone géographique ou statut pour afficher vos prospects.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-full text-[12px] font-body bg-[#1a1a28] text-[#c5a059] hover:bg-[#252538] transition-colors cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : crmView === 'kanban' ? (
          <KanbanBoard
            prospects={filteredProspects}
            onSelect={setSelectedProspect}
            onUpdateStage={handleUpdateStage}
            onAddClick={() => setShowAddModal(true)}
            onSendWhatsApp={handleOpenWhatsApp}
          />
        ) : (
          <ListView
            prospects={filteredProspects}
            onSelect={setSelectedProspect}
            onUpdateStage={handleUpdateStage}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectPage={handleToggleSelectPage}
            onSendWhatsApp={handleOpenWhatsApp}
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
            onSendWhatsApp={handleOpenWhatsApp}
          />
        )}
      </AnimatePresence>

      {/* Floating Bottom Action Bar for Multi-Selection */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-5 py-3 rounded-full bg-[rgba(15,15,30,0.96)] border border-[rgba(197,160,89,0.4)] shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-[24px] flex items-center gap-3 max-w-[95vw] overflow-x-auto"
          >
            <div className="flex items-center gap-2 pr-2 border-r border-[rgba(255,255,255,0.1)] shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" />
              <span className="text-[12.5px] font-body text-[#e8e4dc]">
                <strong className="text-[#c5a059] font-semibold">{selectedIds.length}</strong> prospect{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
              </span>
            </div>

            <button
              onClick={handleOpenBulkModalForSelected}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#B8924A] via-[#c5a059] to-[#D4B57A] text-[#1A1200] font-body font-semibold text-[12px] flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 shadow-[0_2px_14px_rgba(197,160,89,0.3)] cursor-pointer shrink-0"
            >
              <Send size={13} />
              <span>Envoyer Prototype WhatsApp ({selectedIds.length})</span>
            </button>

            <button
              onClick={handleBatchMarkAsPrototype}
              className="px-3.5 py-2 rounded-full bg-[rgba(168,85,247,0.15)] hover:bg-[rgba(168,85,247,0.25)] text-[#c084fc] border border-[rgba(168,85,247,0.35)] font-body text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Passer tous les sélectionnés au statut 'Prototypes envoyés'"
            >
              <CheckCircle2 size={13} />
              <span className="hidden sm:inline">Marquer Prototypes envoyés</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.15)] text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
              title="Désélectionner tout"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Bulk Outreach Automation Modal */}
      <WhatsAppBulkModal
        isOpen={isBulkWhatsAppOpen}
        onClose={() => setIsBulkWhatsAppOpen(false)}
        prospects={bulkModalProspects}
        onComplete={() => {
          setSelectedIds([]);
        }}
      />

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
    sector: 'Agence de voyage',
    city: 'Alger',
    notes: '',
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
          contactName: formData.contactName || `Responsable ${formData.companyName}`,
          companyName: formData.companyName,
          email: formData.email || `contact@${formData.companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'lead'}.com`,
          website: formData.website || '',
          phone: formData.phone || '',
          niche: formData.sector || 'Agence de voyage',
          country: 'Algérie',
          city: formData.city || 'Alger',
          notes: formData.notes ? `${formData.notes} | Zone: ${formData.city || 'Alger'}` : `Zone: ${formData.city || 'Alger'}`,
        }),
      });

      const json = await res.json();
      const raw = json.data || json;
      const mapped = mapBackendProspect(raw);
      onAdded(mapped);
      addToast({ type: 'success', message: `Prospect « ${formData.companyName} » créé avec succès !` });
      onClose();
    } catch (err: any) {
      // Local fallback
      const localP: Prospect = {
        id: 'local_' + Date.now(),
        name: formData.contactName || `Responsable ${formData.companyName}`,
        company: formData.companyName,
        url: formData.website || '',
        phone: formData.phone || '',
        email: formData.email || '',
        score: 0,
        sector: formData.sector,
        stage: 'nouveau',
        city: formData.city || 'Alger',
        lastContact: 'Non contacté',
        callHistory: [],
        notes: formData.notes ? `${formData.notes} | Zone: ${formData.city}` : `Zone: ${formData.city}`,
        scriptReady: true,
      };
      onAdded(localP);
      addToast({ type: 'info', message: `Prospect « ${formData.companyName} » ajouté en mémoire locale` });
      onClose();
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
        className="relative w-full max-w-[480px] p-7 rounded-[14px] bg-[rgba(20,20,34,0.98)] border border-[rgba(255,255,255,0.12)] shadow-modal max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <h2 className="font-display text-[26px] font-normal text-[#e8e4dc]">Nouveau Prospect</h2>
        <p className="text-[12px] font-body text-[rgba(232,228,220,0.5)] mt-1">
          Ajout direct dans votre CRM et synchronisation MongoDB Atlas.
        </p>

        <div className="space-y-3 mt-5">
          <input
            className="w-full h-10 px-3.5 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
            placeholder="Entreprise * (ex: Atlas Voyages)"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />
          <input
            className="w-full h-10 px-3.5 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
            placeholder="Nom du contact / Responsable"
            value={formData.contactName}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              className="w-full h-10 px-3.5 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
              placeholder="Téléphone (05/06/07...)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <input
              className="w-full h-10 px-3.5 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
              placeholder="Wilaya (ex: Alger, Oran)"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <select
              className="w-full h-10 px-3 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[12.5px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
            >
              <option value="Agence de voyage">Agence de voyage</option>
              <option value="Santé / Dentaire">Santé / Dentaire</option>
              <option value="Immobilier">Immobilier</option>
              <option value="Juridique / Avocats">Juridique / Avocats</option>
              <option value="BTP & Construction">BTP & Construction</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Général">Général</option>
            </select>
            <input
              className="w-full h-10 px-3.5 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
              placeholder="Email (optionnel)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <input
            className="w-full h-10 px-3.5 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
            placeholder="Site web (laisser vide si aucun site)"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
          <input
            className="w-full h-10 px-3.5 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
            placeholder="Notes (ex: intéressé par refonte web...)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
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
