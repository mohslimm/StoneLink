'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  KanbanSquare, List, Plus, Upload, Search, AlertTriangle,
  TrendingUp, Flame, Users, Send, DollarSign, LayoutDashboard
} from 'lucide-react'
import { usePipeline } from './pipeline.hooks'
import { StageColumn } from './StageColumn'
import { ProspectDrawer } from './ProspectDrawer'
import { AddProspectModal } from './AddProspectModal'
import { ImportCSVModal } from './ImportCSVModal'
import { PipelineDashboard } from './PipelineDashboard'
import {
  KANBAN_STAGES, STAGE_CONFIG, NICHE_CONFIG, COUNTRY_CONFIG,
  PRIORITY_CONFIG, formatTimeAgo, formatCurrency,
} from '@/lib/pipelineConfig'
import type { Prospect, DealStage, NicheType, Country, Priority } from '@/types/pipeline'
import { PIPELINE_VARIANTS } from './PipelineModule.variants'
import { useStoneStore } from '@/stores/useStoneStore'

// ─── List Row ────────────────────────────────────────────────────

const ListRow = memo(({ prospect, onClick }: { prospect: Prospect; onClick: () => void }) => {
  const stage    = STAGE_CONFIG[prospect.stage]
  const niche    = NICHE_CONFIG[prospect.niche]
  const priority = PRIORITY_CONFIG[prospect.priority]
  
  return (
    <tr onClick={onClick} className="cursor-pointer transition-colors hover:bg-white/3 border-t border-white/5">
      <td className="px-4 py-3">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: priority.color, background: priority.bg }}>
          {priority.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="text-[13px] font-semibold text-[#f0ede8] truncate max-w-[180px] font-body">{prospect.companyName}</div>
        <div className="text-[11px] text-[rgba(240,237,232,0.4)] font-body">{prospect.contactName}</div>
      </td>
      <td className="px-4 py-3">
        <span className="text-[11px]">{niche.icon} {niche.label}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ color: stage.color, background: stage.bgColor }}>
          {stage.icon} {stage.label}
        </span>
      </td>
      <td className="px-4 py-3 text-[12px] text-[#c5a059] font-semibold">
        {prospect.estimatedDealValue ? formatCurrency(prospect.estimatedDealValue) : '—'}
      </td>
      <td className="px-4 py-3 text-[11px] text-[rgba(240,237,232,0.35)]">
        {prospect.lastContactedAt ? formatTimeAgo(prospect.lastContactedAt) : '—'}
      </td>
    </tr>
  )
})
ListRow.displayName = 'ListRow'

// ─── Filter Pill ─────────────────────────────────────────────────

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap border ${
        active 
          ? 'bg-[rgba(197,160,89,0.15)] border-[rgba(197,160,89,0.4)] text-[#c5a059]' 
          : 'bg-white/5 border-white/7 text-[rgba(240,237,232,0.4)]'
      }`}>
      {label}
    </button>
  )
}

// ─── Stats Bar ───────────────────────────────────────────────────

const StatsBar = memo(() => {
  const { stats } = usePipeline()
  
  const items = [
    { icon: Users,    value: stats.totalProspects,       label: 'Prospects',     color: '#94a3b8' },
    { icon: Flame,    value: stats.hotLeads,             label: 'Hot Leads',     color: '#ef4444' },
    { icon: Send,     value: stats.prototypesSent,       label: 'Protos Envoyés',color: '#0891b2' },
    { icon: TrendingUp, value: `${formatCurrency(stats.pipelineValue)}`, label: 'Pipeline', color: '#c5a059' },
    { icon: DollarSign, value: stats.closedWonThisMonth, label: 'Signés (mois)', color: '#22c55e' },
  ]

  return (
    <div className="flex items-center gap-2 px-6 py-2.5 border-b border-white/5 overflow-x-auto bg-white/[0.015]">
      {items.map(({ icon: Icon, value, label, color }) => (
        <div key={label} className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
          <Icon className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-[13px] font-bold" style={{ color }}>{value}</span>
          <span className="text-[10px] text-[rgba(240,237,232,0.3)] uppercase tracking-wider">{label}</span>
        </div>
      ))}
    </div>
  )
})
StatsBar.displayName = 'StatsBar'

// ─── Main Board ──────────────────────────────────────────────────

export const PipelineBoard = memo(() => {
  const { 
    prospects, 
    stats, 
    updateProspectStage, 
    getFilteredProspects 
  } = usePipeline()

  // We still need some parts of the store for global UI states until fully migrated
  const store = useStoneStore()
  const filters = store.filters
  const viewMode = store.viewMode
  const isDrawerOpen = store.isDrawerOpen
  const setFilters = store.setFilters
  const setViewMode = store.setViewMode
  const openDrawer = store.openDrawer
  const closeDrawer = store.closeDrawer
  const getPendingReminders = store.getPendingReminders
  const dismissReminder = store.dismissReminder

  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [listPage, setListPage] = useState(0)
  const PAGE_SIZE = 20

  const filtered = getFilteredProspects()
  const reminders = getPendingReminders()

  const byStage = useMemo(() => {
    const map: Partial<Record<DealStage, Prospect[]>> = {}
    KANBAN_STAGES.forEach((s) => { map[s] = [] })
    filtered.forEach((p) => { map[p.stage]?.push(p) })
    return map
  }, [filtered])

  const handleProspectClick = useCallback((p: Prospect) => openDrawer(p.id), [openDrawer])
  const handleQuickCall = useCallback((p: Prospect) => openDrawer(p.id, 'call'), [openDrawer])

  const listItems = filtered.slice(listPage * PAGE_SIZE, (listPage + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const nicheEntries = Object.entries(NICHE_CONFIG) as [NicheType, { label: string; icon: string }][]
  const countryEntries = Object.entries(COUNTRY_CONFIG) as [string, { label: string; flag: string }][]

  return (
    <div className="flex flex-col h-full bg-[#060610] min-h-screen font-body">
      {/* ── Top Header ────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/6 bg-black/40">
        <div>
          <h1 className="font-display text-2xl text-[#f0ede8]">
            Pipeline
          </h1>
          <p className="text-[11px] text-[rgba(240,237,232,0.35)] mt-0.5 uppercase tracking-widest">
            {filtered.length} prospects · {filtered.filter((p) => p.priority === 'hot').length} hot leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {([['dashboard', LayoutDashboard], ['kanban', KanbanSquare], ['list', List]] as const).map(([mode, Icon]) => (
              <button key={mode} onClick={() => setViewMode(mode as 'kanban' | 'list' | 'dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  viewMode === mode ? 'bg-[#c5a059]/10 text-[#c5a059]' : 'text-white/30 hover:text-white/50'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {mode === 'kanban' ? 'Kanban' : mode === 'list' ? 'Liste' : 'Dashboard'}
              </button>
            ))}
          </div>
          <button onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors bg-white/5 border border-white/10 text-white/50 hover:bg-white/10">
            <Upload className="w-3.5 h-3.5" /> Importer
          </button>
          <button onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-gradient-to-br from-[#B8924A] via-[#c5a059] to-[#D4B57A] text-[#1A1200] hover:brightness-110 shadow-lg shadow-[#c5a059]/20">
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
      </header>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      <StatsBar />

      {/* ── Reminders Banner ──────────────────────────────────── */}
      <AnimatePresence>
        {reminders.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="px-6 py-3 flex items-center gap-3 border-b border-amber-500/20 bg-amber-500/5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-[12px] text-amber-300 flex-1">{reminders[0]?.message}</p>
            <button onClick={() => reminders[0] && openDrawer(reminders[0].prospectId)}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors">
              Voir →
            </button>
            <button onClick={() => reminders[0] && dismissReminder(reminders[0].id)}
              className="text-[10px] text-white/30 hover:text-white/60 transition-colors ml-2">
              Ignorer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filters ───────────────────────────────────────────── */}
      <div className="shrink-0 px-6 py-3 border-b border-white/5 space-y-2.5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
          <input
            className="w-full bg-white/5 border border-white/8 rounded-lg pl-9 pr-4 py-2 text-[13px] text-[#f0ede8] outline-none focus:border-[#c5a059]/40 transition-colors font-body"
            placeholder="Rechercher une entreprise, contact..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </div>
        {/* Niche pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] text-white/25 uppercase tracking-wider shrink-0 font-bold">Niche</span>
          <FilterPill label="Tous" active={filters.niche === 'all'} onClick={() => setFilters({ niche: 'all' })} />
          {nicheEntries.map(([key, cfg]) => (
            <FilterPill key={key} label={`${cfg.icon} ${cfg.label}`} active={filters.niche === key} onClick={() => setFilters({ niche: key })} />
          ))}
        </div>
        {/* Priority + Country */}
        <div className="flex items-center gap-4 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-white/25 uppercase tracking-wider font-bold">Priorité</span>
            <FilterPill label="Tous" active={filters.priority === 'all'} onClick={() => setFilters({ priority: 'all' })} />
            {(Object.entries(PRIORITY_CONFIG) as [Priority, { label: string; color: string; bg: string; pulse: boolean }][]).map(([k, v]) => (
              <FilterPill key={k} label={v.label} active={filters.priority === k} onClick={() => setFilters({ priority: k })} />
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-white/25 uppercase tracking-wider font-bold">Pays</span>
            <FilterPill label="Tous" active={filters.country === 'all'} onClick={() => setFilters({ country: 'all' })} />
            {countryEntries.map(([code, cfg]) => (
              <FilterPill key={code} label={`${cfg.flag} ${cfg.label}`} active={filters.country === code} onClick={() => setFilters({ country: code as Country })} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 px-6">
            <div className="text-5xl mb-4 opacity-50">🔍</div>
            <h3 className="font-display text-xl text-[#f0ede8] mb-2">Aucun prospect trouvé</h3>
            <p className="text-[13px] text-white/35 mb-6 max-w-sm mx-auto">
              Ajustez vos filtres ou importez votre lead list pour commencer à générer des opportunités.
            </p>
            <button onClick={() => setImportOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-[12px] font-bold uppercase tracking-wider bg-gradient-to-br from-[#B8924A] via-[#c5a059] to-[#D4B57A] text-[#1A1200]">
              <Upload className="w-4 h-4" /> Importer CSV
            </button>
          </div>
        ) : viewMode === 'dashboard' ? (
          <div className="h-full overflow-y-auto">
            <PipelineDashboard onAction={(id, tab) => openDrawer(id, tab)} />
          </div>
        ) : viewMode === 'kanban' ? (
          <div className="h-full overflow-x-auto overflow-y-hidden no-scrollbar">
            <motion.div 
              variants={PIPELINE_VARIANTS.container} 
              initial="initial" 
              animate="animate"
              className="flex gap-3 p-4 h-full"
              style={{ width: 'max-content' }}
            >
              {KANBAN_STAGES.map((stage) => (
                <StageColumn
                  key={stage}
                  stage={stage}
                  prospects={byStage[stage] ?? []}
                  onProspectClick={handleProspectClick}
                  onQuickCall={handleQuickCall}
                  onStageChange={updateProspectStage}
                />
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="h-full overflow-auto p-6 no-scrollbar">
            <div className="rounded-xl overflow-hidden border border-white/7 bg-white/[0.02]">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/[0.03]">
                    {['Priorité', 'Entreprise', 'Niche', 'Stage', 'Valeur', 'Dernier contact'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-white/35 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listItems.map((p) => (
                    <ListRow key={p.id} prospect={p} onClick={() => handleProspectClick(p)} />
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button onClick={() => setListPage((p) => Math.max(0, p - 1))} disabled={listPage === 0}
                  className="px-4 py-2 rounded-lg text-[11px] font-bold disabled:opacity-30 bg-white/5 border border-white/10 text-white/50">
                  ← Précédent
                </button>
                <span className="text-[11px] text-white/35 font-mono">
                  Page {listPage + 1} / {totalPages}
                </span>
                <button onClick={() => setListPage((p) => Math.min(totalPages - 1, p + 1))} disabled={listPage === totalPages - 1}
                  className="px-4 py-2 rounded-lg text-[11px] font-bold disabled:opacity-30 bg-white/5 border border-white/10 text-white/50">
                  Suivant →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Drawer & Modals ───────────────────────────────────── */}
      <ProspectDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
      <AddProspectModal  isOpen={addOpen}    onClose={() => setAddOpen(false)}    />
      <ImportCSVModal    isOpen={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
})

PipelineBoard.displayName = 'PipelineBoard'
