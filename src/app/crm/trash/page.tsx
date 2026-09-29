"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Trash2, RotateCcw, Search, X, AlertTriangle, 
  MapPin, Phone, Building2, Clock, CheckCircle2, Filter, 
  Sparkles, RefreshCw, Loader2, Globe
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/custom/GlassPanel';
import { AnimatedButton } from '@/components/ui/custom/AnimatedButton';
import { useUIStore } from '@/hooks/useUIStore';
import { useProspectsStore } from '@/hooks/useProspectsStore';
import { STAGE_COLORS, STAGE_LABELS } from '@/types';
import type { PipelineStage } from '@/types';
import { cn } from '@/lib/utils';

interface DeletedProspect {
  _id: string;
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  website: string;
  niche: string;
  city: string;
  country: string;
  stage: PipelineStage;
  score: number;
  notes: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
}

export default function TrashPage() {
  const { addToast } = useUIStore();
  const { fetchProspects } = useProspectsStore();

  const [deletedList, setDeletedList] = useState<DeletedProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [nicheFilter, setNicheFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');

  // Action states
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [prospectToDelete, setProspectToDelete] = useState<DeletedProspect | null>(null);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [showRestoreAllModal, setShowRestoreAllModal] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Fetch trash items
  const loadTrash = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/prospects?trash=true&limit=1000');
      if (!res.ok) throw new Error('Erreur de chargement');
      const json = await res.json();
      setDeletedList(json.data || []);
    } catch (err: any) {
      console.error('Failed to load trash:', err);
      addToast({ type: 'error', message: 'Impossible de charger la corbeille' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  // Restore single prospect
  const handleRestore = async (prospect: DeletedProspect) => {
    const id = prospect.id || prospect._id;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/prospects/${id}/restore`, { method: 'POST' });
      if (!res.ok) throw new Error('Erreur lors de la restauration');

      setDeletedList((prev) => prev.filter((p) => (p.id || p._id) !== id));
      addToast({
        type: 'success',
        message: `« ${prospect.companyName || 'Prospect'} » a été restauré dans le CRM !`,
      });
      // Refresh active prospects in global store
      fetchProspects(true);
    } catch (err: any) {
      console.error(err);
      addToast({ type: 'error', message: 'Échec de la restauration du prospect' });
    } finally {
      setProcessingId(null);
    }
  };

  // Hard delete single prospect
  const handlePermanentDelete = async () => {
    if (!prospectToDelete) return;
    const id = prospectToDelete.id || prospectToDelete._id;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/prospects/${id}?permanent=true`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur de suppression définitive');

      setDeletedList((prev) => prev.filter((p) => (p.id || p._id) !== id));
      addToast({
        type: 'info',
        message: `« ${prospectToDelete.companyName} » supprimé définitivement.`,
      });
    } catch (err: any) {
      console.error(err);
      addToast({ type: 'error', message: 'Échec de la suppression définitive' });
    } finally {
      setProcessingId(null);
      setProspectToDelete(null);
    }
  };

  // Bulk restore all
  const handleRestoreAll = async () => {
    setIsBulkProcessing(true);
    try {
      const res = await fetch('/api/prospects/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore-all' }),
      });
      if (!res.ok) throw new Error('Erreur lors de la restauration groupée');
      const json = await res.json();

      setDeletedList([]);
      addToast({
        type: 'success',
        message: `Succès : ${json.restoredCount ?? 'Tous les'} prospects restaurés dans le CRM !`,
      });
      setShowRestoreAllModal(false);
      fetchProspects(true);
    } catch (err: any) {
      console.error(err);
      addToast({ type: 'error', message: 'Échec de la restauration groupée' });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk empty trash
  const handleEmptyTrash = async () => {
    setIsBulkProcessing(true);
    try {
      const res = await fetch('/api/prospects/trash', { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur vidage corbeille');
      const json = await res.json();

      setDeletedList([]);
      addToast({
        type: 'info',
        message: `Corbeille vidée : ${json.deletedCount ?? 0} prospects purgés définitivement.`,
      });
      setShowEmptyModal(false);
    } catch (err: any) {
      console.error(err);
      addToast({ type: 'error', message: 'Échec du vidage de la corbeille' });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Dynamic filter sets
  const dynamicNiches = useMemo(() => {
    const set = new Set<string>();
    deletedList.forEach((p) => {
      if (p.niche && p.niche.trim()) set.add(p.niche.trim());
    });
    return ['all', ...Array.from(set).sort()];
  }, [deletedList]);

  const dynamicAreas = useMemo(() => {
    const set = new Set<string>();
    deletedList.forEach((p) => {
      const area = p.city || (p.notes && p.notes.includes('Zone:') ? p.notes.split('Zone:')[1]?.split('|')[0]?.trim() : '');
      if (area && area !== 'Général') set.add(area);
    });
    return ['all', ...Array.from(set).sort()];
  }, [deletedList]);

  // Filtered list
  const filteredList = useMemo(() => {
    return deletedList.filter((p) => {
      const matchNiche = nicheFilter === 'all' || p.niche === nicheFilter;
      const area = p.city || (p.notes && p.notes.includes('Zone:') ? p.notes.split('Zone:')[1]?.split('|')[0]?.trim() : '') || 'Général';
      const matchArea = areaFilter === 'all' || area === areaFilter;

      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (p.companyName && p.companyName.toLowerCase().includes(q)) ||
        (p.contactName && p.contactName.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q)) ||
        (p.niche && p.niche.toLowerCase().includes(q)) ||
        area.toLowerCase().includes(q);

      return matchNiche && matchArea && matchSearch;
    });
  }, [deletedList, search, nicheFilter, areaFilter]);

  // Format relative date
  const formatDeletionDate = (dateStr: string | null) => {
    if (!dateStr) return 'Date inconnue';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 2) return "À l'instant";
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      if (diffDays === 1) return 'Hier';
      if (diffDays < 7) return `Il y a ${diffDays} jours`;

      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-[calc(100dvh-56px)] pb-16 px-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="pt-6">
        <Link
          href="/crm"
          className="inline-flex items-center gap-2 text-[12px] font-body text-[rgba(232,228,220,0.6)] hover:text-[#c5a059] transition-colors mb-4 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Retour au CRM</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[10px] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] flex items-center justify-center">
                <Trash2 size={20} className="text-[#f87171]" />
              </div>
              <div>
                <h1 className="font-display font-light text-[clamp(28px,3.5vw,38px)] text-[#e8e4dc] tracking-[-0.01em] leading-tight">
                  Corbeille & Archives
                </h1>
                <p className="text-[13px] font-body text-[rgba(232,228,220,0.5)] mt-0.5">
                  Tous les prospects supprimés sont conservés ici en toute sécurité. Restaurez-les à tout moment.
                </p>
              </div>
            </div>
          </div>

          {/* Action cluster */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={loadTrash}
              disabled={loading}
              className="p-2.5 rounded-[8px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] hover:border-[rgba(255,255,255,0.15)] transition-all cursor-pointer disabled:opacity-50"
              title="Rafraîchir"
            >
              <RefreshCw size={15} className={cn(loading && 'animate-spin')} />
            </button>

            {deletedList.length > 0 && (
              <>
                <button
                  onClick={() => setShowRestoreAllModal(true)}
                  className="px-3.5 py-2 rounded-[8px] bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.25)] text-[#4ade80] hover:bg-[rgba(74,222,128,0.18)] transition-all text-[12px] font-body font-medium flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(74,222,128,0.1)]"
                >
                  <RotateCcw size={14} />
                  <span>Tout restaurer ({deletedList.length})</span>
                </button>

                <button
                  onClick={() => setShowEmptyModal(true)}
                  className="px-3.5 py-2 rounded-[8px] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] text-[#f87171] hover:bg-[rgba(239,68,68,0.18)] transition-all text-[12px] font-body font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Vider la corbeille</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      {deletedList.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par entreprise, contact, téléphone ou wilaya..."
              className="w-full h-10 pl-10 pr-9 rounded-[8px] bg-[#0d0d16] border border-[rgba(255,255,255,0.08)] text-[13px] font-body text-[#e8e4dc] placeholder-[rgba(232,228,220,0.35)] focus:outline-none focus:border-[#c5a059] transition-colors"
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

          {/* Wilaya Filter */}
          {dynamicAreas.length > 2 && (
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="h-10 px-3 rounded-[8px] bg-[#0d0d16] border border-[rgba(255,255,255,0.08)] text-[12px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
            >
              <option value="all">Toutes les wilayas ({deletedList.length})</option>
              {dynamicAreas.filter((a) => a !== 'all').map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          )}

          {/* Niche Filter */}
          {dynamicNiches.length > 2 && (
            <select
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
              className="h-10 px-3 rounded-[8px] bg-[#0d0d16] border border-[rgba(255,255,255,0.08)] text-[12px] font-body text-[#e8e4dc] focus:outline-none focus:border-[#c5a059]"
            >
              <option value="all">Tous les secteurs</option>
              {dynamicNiches.filter((n) => n !== 'all').map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}

          {(search !== '' || nicheFilter !== 'all' || areaFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setNicheFilter('all');
                setAreaFilter('all');
              }}
              className="h-10 px-3 rounded-[8px] bg-[#141422] border border-[rgba(255,255,255,0.08)] text-[11px] font-body text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] transition-colors flex items-center gap-1.5"
            >
              <X size={12} />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[rgba(232,228,220,0.5)]">
            <Loader2 size={32} className="animate-spin text-[#c5a059] mb-3" />
            <p className="text-[13px] font-body">Chargement des éléments supprimés...</p>
          </div>
        ) : deletedList.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-[16px] bg-[#0d0d16] border border-[rgba(255,255,255,0.06)] relative overflow-hidden"
          >
            <div className="w-16 h-16 rounded-full bg-[rgba(197,160,89,0.08)] border border-[rgba(197,160,89,0.2)] flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-[#c5a059]" />
            </div>
            <h3 className="font-display font-light text-[24px] text-[#e8e4dc]">
              La corbeille est parfaitement vide
            </h3>
            <p className="text-[13px] font-body text-[rgba(232,228,220,0.5)] max-w-md mt-2 leading-relaxed">
              Aucun prospect supprimé. Tous vos leads qualifiés sont sains et actifs dans votre pipeline CRM.
            </p>
            <Link
              href="/crm"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-[8px] bg-gradient-to-r from-[#c5a059] to-[#d4b470] text-[#0a0a12] font-body font-semibold text-[13px] shadow-[0_4px_16px_rgba(197,160,89,0.25)] hover:brightness-110 transition-all"
            >
              <span>Accéder au CRM</span>
              <ArrowLeft size={14} className="rotate-180" />
            </Link>
          </motion.div>
        ) : filteredList.length === 0 ? (
          /* Filtered to zero */
          <div className="text-center py-16 text-[rgba(232,228,220,0.5)]">
            <Filter size={24} className="mx-auto mb-2 text-[rgba(232,228,220,0.3)]" />
            <p className="text-[14px] font-body">Aucun prospect supprimé ne correspond à vos filtres.</p>
          </div>
        ) : (
          /* Table of deleted leads */
          <div className="overflow-x-auto rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-[#0d0d16]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[#11111a]">
                  <th className="px-5 py-3.5 text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)]">
                    Entreprise & Contact
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)]">
                    Wilaya / Secteur
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)]">
                    Statut précédent
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)]">
                    Supprimé
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                <AnimatePresence initial={false}>
                  {filteredList.map((prospect) => {
                    const id = prospect.id || prospect._id;
                    const isProcessing = processingId === id;
                    const area = prospect.city || (prospect.notes && prospect.notes.includes('Zone:') ? prospect.notes.split('Zone:')[1]?.split('|')[0]?.trim() : '') || 'Algérie';

                    return (
                      <motion.tr
                        key={id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        className="hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                      >
                        {/* Company & Contact */}
                        <td className="px-5 py-4">
                          <p className="text-[14px] font-body font-semibold text-[#e8e4dc]">
                            {prospect.companyName || 'Sans entreprise'}
                          </p>
                          <div className="flex items-center gap-3 text-[12px] font-body text-[rgba(232,228,220,0.55)] mt-0.5">
                            {prospect.contactName && (
                              <span>{prospect.contactName}</span>
                            )}
                            {prospect.phone && (
                              <span className="flex items-center gap-1 text-[rgba(232,228,220,0.7)]">
                                <Phone size={11} className="text-[#c5a059]" />
                                {prospect.phone}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Wilaya & Sector */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-[12.5px] font-body text-[#e8e4dc]">
                            <MapPin size={12} className="text-[#c5a059] shrink-0" />
                            <span>{area}</span>
                          </div>
                          <span className="inline-block mt-1 text-[11px] font-body text-[rgba(232,228,220,0.5)]">
                            {prospect.niche || 'Général'}
                          </span>
                        </td>

                        {/* Previous Stage */}
                        <td className="px-5 py-4">
                          <span
                            className="inline-block text-[11px] font-body font-medium uppercase tracking-[0.06em] px-2 py-0.5 rounded-full"
                            style={{
                              color: STAGE_COLORS[prospect.stage] || '#60a5fa',
                              backgroundColor: `${STAGE_COLORS[prospect.stage] || '#60a5fa'}1A`,
                            }}
                          >
                            {STAGE_LABELS[prospect.stage] || prospect.stage || 'Nouveau'}
                          </span>
                        </td>

                        {/* Deletion Date */}
                        <td className="px-5 py-4 text-[12px] font-body text-[rgba(232,228,220,0.5)]">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-[rgba(232,228,220,0.4)]" />
                            <span>{formatDeletionDate(prospect.deletedAt)}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Restore Button */}
                            <button
                              onClick={() => handleRestore(prospect)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-[6px] bg-[rgba(74,222,128,0.12)] border border-[rgba(74,222,128,0.25)] text-[#4ade80] hover:bg-[rgba(74,222,128,0.22)] transition-all text-[11.5px] font-body font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              title="Restaurer dans le CRM"
                            >
                              {isProcessing ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <RotateCcw size={12} />
                              )}
                              <span>Restaurer</span>
                            </button>

                            {/* Permanent Delete Button */}
                            <button
                              onClick={() => setProspectToDelete(prospect)}
                              disabled={isProcessing}
                              className="p-1.5 rounded-[6px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.4)] hover:text-[#f87171] hover:border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.08)] transition-all cursor-pointer disabled:opacity-50"
                              title="Supprimer définitivement"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal: Single Prospect Permanent Delete */}
      <AnimatePresence>
        {prospectToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[rgba(5,5,9,0.7)] backdrop-blur-[6px]"
              onClick={() => setProspectToDelete(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-[16px] bg-[#0f0f1c] border border-[rgba(239,68,68,0.3)] p-6 shadow-2xl z-10"
            >
              <div className="w-12 h-12 rounded-full bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.3)] flex items-center justify-center mb-4 text-[#f87171]">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-display font-light text-[20px] text-[#e8e4dc]">
                Supprimer définitivement ?
              </h3>
              <p className="text-[13px] font-body text-[rgba(232,228,220,0.6)] mt-2 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement{' '}
                <strong className="text-[#e8e4dc]">
                  « {prospectToDelete.companyName || 'ce prospect'} »
                </strong>{' '}
                ? Cette action est irréversible et supprimera le document de MongoDB Atlas.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setProspectToDelete(null)}
                  className="px-4 py-2 rounded-[8px] text-[12px] font-body text-[rgba(232,228,220,0.65)] hover:text-[#e8e4dc] hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handlePermanentDelete}
                  disabled={processingId !== null}
                  className="px-4 py-2 rounded-[8px] bg-[#dc2626] hover:bg-[#ef4444] text-white font-body font-medium text-[12px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                >
                  {processingId ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  <span>Supprimer pour toujours</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal: Empty Trash */}
      <AnimatePresence>
        {showEmptyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[rgba(5,5,9,0.7)] backdrop-blur-[6px]"
              onClick={() => setShowEmptyModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-[16px] bg-[#0f0f1c] border border-[rgba(239,68,68,0.3)] p-6 shadow-2xl z-10"
            >
              <div className="w-12 h-12 rounded-full bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.3)] flex items-center justify-center mb-4 text-[#f87171]">
                <Trash2 size={24} />
              </div>
              <h3 className="font-display font-light text-[20px] text-[#e8e4dc]">
                Vider toute la corbeille ?
              </h3>
              <p className="text-[13px] font-body text-[rgba(232,228,220,0.6)] mt-2 leading-relaxed">
                Cette action supprimera définitivement les{' '}
                <strong className="text-[#f87171]">{deletedList.length} prospects</strong> de MongoDB Atlas.
                Aucune restauration ultérieure ne sera possible.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowEmptyModal(false)}
                  className="px-4 py-2 rounded-[8px] text-[12px] font-body text-[rgba(232,228,220,0.65)] hover:text-[#e8e4dc] hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleEmptyTrash}
                  disabled={isBulkProcessing}
                  className="px-4 py-2 rounded-[8px] bg-[#dc2626] hover:bg-[#ef4444] text-white font-body font-medium text-[12px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                >
                  {isBulkProcessing ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  <span>Confirmer et Vider</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal: Restore All */}
      <AnimatePresence>
        {showRestoreAllModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[rgba(5,5,9,0.7)] backdrop-blur-[6px]"
              onClick={() => setShowRestoreAllModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-[16px] bg-[#0f0f1c] border border-[rgba(74,222,128,0.3)] p-6 shadow-2xl z-10"
            >
              <div className="w-12 h-12 rounded-full bg-[rgba(74,222,128,0.12)] border border-[rgba(74,222,128,0.3)] flex items-center justify-center mb-4 text-[#4ade80]">
                <RotateCcw size={24} />
              </div>
              <h3 className="font-display font-light text-[20px] text-[#e8e4dc]">
                Restaurer tous les prospects ?
              </h3>
              <p className="text-[13px] font-body text-[rgba(232,228,220,0.6)] mt-2 leading-relaxed">
                Les <strong className="text-[#4ade80]">{deletedList.length} prospects</strong> retourneront
                immédiatement dans votre pipeline actif avec leurs notes, wilayas et numéros de téléphone respectifs.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowRestoreAllModal(false)}
                  className="px-4 py-2 rounded-[8px] text-[12px] font-body text-[rgba(232,228,220,0.65)] hover:text-[#e8e4dc] hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRestoreAll}
                  disabled={isBulkProcessing}
                  className="px-4 py-2 rounded-[8px] bg-[#16a34a] hover:bg-[#22c55e] text-white font-body font-medium text-[12px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_15px_rgba(22,163,74,0.3)]"
                >
                  {isBulkProcessing ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                  <span>Confirmer la restauration</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
