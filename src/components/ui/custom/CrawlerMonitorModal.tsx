"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, X, Square, Download, ArrowRight, CheckCircle2, 
  AlertTriangle, Globe, Phone, MapPin, Eye, ExternalLink,
  ShieldCheck, RefreshCw, Layers
} from 'lucide-react';
import { useCrawlerStore } from '@/hooks/useCrawlerStore';
import { useUIStore } from '@/hooks/useUIStore';
import { cn } from '@/lib/utils';

export function CrawlerMonitorModal() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const {
    isRunning,
    status,
    pid,
    query,
    area,
    targetCount,
    currentCount,
    currentCombination,
    currentLead,
    openBrowser,
    testMode,
    logs,
    latestResults,
    isMonitorOpen,
    setIsMonitorOpen,
    fetchStatus,
    stopCrawler,
  } = useCrawlerStore();

  const [isStopping, setIsStopping] = useState(false);

  // Poll status periodically
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      fetchStatus();
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleStop = async () => {
    if (isStopping) return;
    setIsStopping(true);
    addToast({ type: 'info', message: 'Arrêt du bot en cours... Sauvegarde des prospects.' });
    const res = await stopCrawler();
    setIsStopping(false);
    if (res.success) {
      addToast({ 
        type: 'success', 
        message: `Bot arrêté. ${res.savedCount} prospects ont été préservés et ajoutés au CRM !` 
      });
    } else {
      addToast({ type: 'error', message: 'Erreur lors de l’arrêt du bot.' });
    }
  };

  const handleDownloadCsv = () => {
    const leads = latestResults?.leads || [];
    if (leads.length === 0) {
      addToast({ type: 'info', message: 'Aucun prospect dans ce scan à exporter.' });
      return;
    }

    const headers = ['Nom Entreprise', 'Téléphone', 'Site Web', 'Wilaya', 'Niche', 'Score Site'];
    const rows = leads.map((l: any) => [
      `"${l.Businessname || ''}"`,
      `"${l.Phonenumber || ''}"`,
      `"${l.Website || ''}"`,
      `"${l.Wilaya || ''}"`,
      `"${l.Niche || ''}"`,
      l.WebsiteScore || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dernier_scan_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ type: 'success', message: `${leads.length} prospects exportés en CSV.` });
  };

  if (!isMonitorOpen) return null;

  const progressPercent = targetCount > 0 
    ? Math.min(100, Math.round((currentCount / targetCount) * 100)) 
    : 0;

  const leads = latestResults?.leads || [];
  const noWebCount = leads.filter((l: any) => !l.Website || l.Website.length < 4).length;

  return (
    <AnimatePresence>
      <div 
        onClick={() => setIsMonitorOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl rounded-[20px] bg-[#0c0c16] border border-[rgba(197,160,89,0.3)] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between bg-[rgba(16,16,28,0.7)]">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center border",
                isRunning 
                  ? "bg-[rgba(74,222,128,0.15)] border-[rgba(74,222,128,0.35)] text-[#4ade80]" 
                  : status === 'stopped'
                  ? "bg-[rgba(245,158,11,0.15)] border-[rgba(245,158,11,0.35)] text-[#fbbf24]"
                  : "bg-[rgba(197,160,89,0.15)] border-[rgba(197,160,89,0.35)] text-[#c5a059]"
              )}>
                {isRunning ? (
                  <Radio size={18} className="animate-pulse" />
                ) : (
                  <Layers size={18} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-medium text-[18px] text-[#e8e4dc]">
                    {isRunning ? "Moteur Bot-Se en Cours" : "Résultats du Dernier Scan"}
                  </h3>
                  <span className={cn(
                    "text-[10px] font-mono uppercase tracking-[0.1em] px-2 py-0.5 rounded-full border",
                    isRunning 
                      ? "bg-[rgba(74,222,128,0.15)] text-[#4ade80] border-[rgba(74,222,128,0.3)] animate-pulse" 
                      : status === 'stopped'
                      ? "bg-[rgba(245,158,11,0.15)] text-[#fbbf24] border-[rgba(245,158,11,0.3)]"
                      : "bg-[rgba(197,160,89,0.15)] text-[#c5a059] border-[rgba(197,160,89,0.3)]"
                  )}>
                    {isRunning ? `Actif (PID: ${pid || 'Auto'})` : status === 'stopped' ? 'Interrompu' : 'Terminé'}
                  </span>
                </div>
                <p className="text-[12px] font-body text-[rgba(232,228,220,0.5)] mt-0.5">
                  {isRunning 
                    ? currentCombination || `Recherche : ${query} à ${area}`
                    : `Cible : ${query || 'Scan récent'} à ${area || 'Algérie'}`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsMonitorOpen(false)}
              className="p-1.5 rounded-full text-[rgba(232,228,220,0.4)] hover:text-[#e8e4dc] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer"
              title="Réduire"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar flex-1">
            {/* Progress Section (when running or summary) */}
            <div className="p-4 rounded-[14px] bg-[#10101c] border border-[rgba(255,255,255,0.06)] space-y-3">
              <div className="flex items-center justify-between text-[12px] font-body">
                <span className="text-[rgba(232,228,220,0.6)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#c5a059] inline-block" />
                  <span>Progression de la récolte</span>
                </span>
                <span className="font-mono text-[#c5a059] font-bold">
                  {currentCount} {targetCount > 0 ? `/ ${targetCount}` : 'prospects'} ({progressPercent}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                <motion.div
                  className="h-full bg-[linear-gradient(90deg,#c5a059,#e8e4dc)] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {isRunning && currentLead && (
                <div className="text-[12px] font-body text-[rgba(232,228,220,0.7)] flex items-center gap-2 pt-1">
                  <span className="text-[#60a5fa] font-mono text-[11px]">&gt;&gt;</span>
                  <span className="truncate">
                    Cible active : <strong className="text-[#e8e4dc]">{currentLead}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* If Not Running: Show Stats Summary of the last scrap */}
            {!isRunning && leads.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-[12px] bg-[#10101c] border border-[rgba(255,255,255,0.06)]">
                  <span className="text-[10px] font-body uppercase tracking-[0.1em] text-[rgba(232,228,220,0.4)] block">
                    Total Récolté
                  </span>
                  <span className="text-[20px] font-mono font-bold text-[#e8e4dc] mt-0.5 block">
                    {leads.length}
                  </span>
                </div>
                <div className="p-3.5 rounded-[12px] bg-[#10101c] border border-[rgba(239,68,68,0.2)]">
                  <span className="text-[10px] font-body uppercase tracking-[0.1em] text-[#f87171] block">
                    Sans Site Web
                  </span>
                  <span className="text-[20px] font-mono font-bold text-[#f87171] mt-0.5 block">
                    {noWebCount}
                  </span>
                </div>
                <div className={cn(
                  "p-3.5 rounded-[12px] bg-[#10101c] border",
                  testMode ? "border-[rgba(245,158,11,0.25)]" : "border-[rgba(74,222,128,0.2)]"
                )}>
                  <span className={cn(
                    "text-[10px] font-body uppercase tracking-[0.1em] block",
                    testMode ? "text-[#fbbf24]" : "text-[#4ade80]"
                  )}>
                    {testMode ? "Mode Bac à Sable" : "Statut Sauvegarde"}
                  </span>
                  <span className={cn(
                    "text-[12.5px] font-body font-medium mt-1 block",
                    testMode ? "text-[#fbbf24]" : "text-[#4ade80]"
                  )}>
                    {testMode ? "🧪 Test (Non injecté au CRM)" : "✓ Sauvegardé en CRM"}
                  </span>
                </div>
              </div>
            )}

            {/* Leads Table Preview (if results available) */}
            {leads.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-body uppercase tracking-[0.08em] text-[rgba(232,228,220,0.6)]">
                    Prospects du Scan ({leads.length})
                  </span>
                  <button
                    onClick={handleDownloadCsv}
                    className="text-[11px] font-body text-[#c5a059] hover:text-[#e8e4dc] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Download size={12} />
                    <span>Télécharger CSV</span>
                  </button>
                </div>

                <div className="max-h-[220px] overflow-y-auto rounded-[12px] border border-[rgba(255,255,255,0.06)] bg-[#07070d] custom-scrollbar">
                  <table className="w-full text-left text-[11.5px] font-body">
                    <thead className="bg-[#0f0f1c] text-[rgba(232,228,220,0.4)] text-[10px] uppercase tracking-[0.08em] sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Entreprise</th>
                        <th className="py-2 px-3">Téléphone</th>
                        <th className="py-2 px-3">Site Web</th>
                        <th className="py-2 px-3 text-right">Zone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                      {leads.map((lead: any, idx: number) => {
                        const hasWeb = !!lead.Website && lead.Website.length > 3 && !lead.Website.toLowerCase().includes('pas de site');
                        return (
                          <tr key={lead.id || idx} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                            <td className="py-2 px-3 font-medium text-[#e8e4dc] truncate max-w-[180px]">
                              {lead.Businessname || 'Commerce'}
                            </td>
                            <td className="py-2 px-3 font-mono text-[rgba(232,228,220,0.7)]">
                              {lead.Phonenumber || 'Non renseigné'}
                            </td>
                            <td className="py-2 px-3">
                              {hasWeb ? (
                                <span className="inline-flex items-center gap-1 text-[#60a5fa] hover:underline truncate max-w-[140px]">
                                  <Globe size={11} />
                                  <span className="truncate">{lead.Website.replace(/^https?:\/\//, '')}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]">
                                  Sans site web
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right text-[rgba(232,228,220,0.5)]">
                              {lead.Wilaya || area}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Live Terminal Logs */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-body uppercase tracking-[0.08em] text-[rgba(232,228,220,0.4)] block">
                Journal d&apos;exécution en Direct
              </span>
              <div className="bg-[#05050a] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-3 text-[11px] font-mono text-[rgba(232,228,220,0.7)] space-y-1 max-h-[140px] overflow-y-auto custom-scrollbar">
                {logs.length === 0 ? (
                  <div className="text-[rgba(232,228,220,0.3)] italic">En attente de messages...</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-[#c5a059] flex-shrink-0">&gt;</span>
                      <span className="break-all">{log}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(16,16,28,0.7)] flex items-center justify-between gap-3">
            {isRunning ? (
              <>
                <button
                  type="button"
                  onClick={handleStop}
                  disabled={isStopping}
                  className="px-4 py-2 rounded-full text-[12.5px] font-body bg-[rgba(239,68,68,0.15)] hover:bg-[rgba(239,68,68,0.25)] text-[#f87171] border border-[rgba(239,68,68,0.35)] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Square size={13} className="fill-current" />
                  <span>{isStopping ? "Arrêt en cours..." : "Arrêter le Bot (Conserver les leads)"}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMonitorOpen(false);
                      router.push('/crm');
                    }}
                    className="px-4 py-2 rounded-full text-[12.5px] font-body bg-[rgba(197,160,89,0.15)] hover:bg-[rgba(197,160,89,0.25)] text-[#c5a059] border border-[rgba(197,160,89,0.35)] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Aller au CRM (Laisser tourner)</span>
                    <ArrowRight size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMonitorOpen(false)}
                    className="px-4 py-2 rounded-full text-[12.5px] font-body bg-[#1a1a2c] hover:bg-[#25253e] text-[#e8e4dc] border border-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
                  >
                    Réduire
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="px-4 py-2 rounded-full text-[12px] font-body bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-[#e8e4dc] border border-[rgba(255,255,255,0.08)] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Download size={13} />
                    <span>Exporter CSV</span>
                  </button>

                  {!testMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMonitorOpen(false);
                        router.push('/crm');
                      }}
                      className="px-4 py-2 rounded-full text-[12px] font-body bg-[rgba(197,160,89,0.15)] hover:bg-[rgba(197,160,89,0.25)] text-[#c5a059] border border-[rgba(197,160,89,0.35)] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Voir dans le CRM</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsMonitorOpen(false)}
                  className="px-5 py-2 rounded-full text-[12px] font-body bg-[#1a1a2c] hover:bg-[#25253e] text-[#e8e4dc] border border-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
