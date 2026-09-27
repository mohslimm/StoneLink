"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, Calendar, MapPin, Target, Sparkles, Download, 
  Trash2, Play, Search, ShieldCheck, ChevronRight, BarChart2,
  Users, AlertCircle, CheckCircle2, Clock, Globe, Phone, 
  Copy, Check, ExternalLink, ArrowUpDown, X, Layers, Filter,
  Star, RefreshCw, ChevronDown, Eye, EyeOff, FlaskConical, Globe2, Plus
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/custom/GlassPanel';
import { AnimatedButton } from '@/components/ui/custom/AnimatedButton';
import { StatCard } from '@/components/ui/custom/StatCard';
import { ToggleSwitch } from '@/components/ui/custom/ToggleSwitch';
import { useUIStore } from '@/hooks/useUIStore';
import { useCrawlerStore } from '@/hooks/useCrawlerStore';
import { mockProspects } from '@/data/prospects';
import { cn } from '@/lib/utils';

interface CampaignSummary {
  id: string;
  name: string;
  date: string;
  area: string;
  niche: string;
  totalLeads: number;
  noWebsiteLeads: number;
  priorityLeads: number;
  contactedLeads: number;
  avgScore: number;
  leads: any[];
}

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
  if (p.notes && p.notes.includes('Zone:')) {
    const match = p.notes.match(/Zone:\s*([^|]+)/);
    if (match) return match[1].trim();
  }
  if (p.city) return p.city.trim();
  return 'Général';
}

export default function CampaignsPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const {
    isRunning,
    currentCount,
    targetCount,
    latestResults,
    setIsMonitorOpen,
    startCrawler,
  } = useCrawlerStore();
  const [prospects, setProspects] = useState<any[]>(mockProspects);
  const [search, setSearch] = useState('');
  const [nicheFilter, setNicheFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [noWebsiteOnly, setNoWebsiteOnly] = useState(false);
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'leads_desc' | 'noweb_desc' | 'score_asc'>('recent');
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignSummary | null>(null);
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);

  // Scraper Modal State (Bot-Se Sovereign Multi-Search Engine)
  const [botQueries, setBotQueries] = useState<string[]>(['Dentiste']);
  const [botQueryInput, setBotQueryInput] = useState('');
  const [botAreas, setBotAreas] = useState<string[]>(['Alger']);
  const [botAreaInput, setBotAreaInput] = useState('');
  const [botCount, setBotCount] = useState(25);
  const [botOnlyNoWebsite, setBotOnlyNoWebsite] = useState(true);
  const [botTestMode, setBotTestMode] = useState(false);
  const [botOpenBrowser, setBotOpenBrowser] = useState(false);

  const handleAddQueryTag = (q: string) => {
    const clean = q.trim();
    if (!clean) return;
    if (!botQueries.some(x => x.toLowerCase() === clean.toLowerCase())) {
      setBotQueries(prev => [...prev, clean]);
    }
    setBotQueryInput('');
  };

  const handleToggleQueryTag = (q: string) => {
    if (botQueries.some(x => x.toLowerCase() === q.toLowerCase())) {
      if (botQueries.length > 1) {
        setBotQueries(prev => prev.filter(x => x.toLowerCase() !== q.toLowerCase()));
      }
    } else {
      setBotQueries(prev => [...prev, q]);
    }
  };

  const handleAddAreaTag = (a: string) => {
    const clean = a.trim();
    if (!clean) return;
    if (!botAreas.some(x => x.toLowerCase() === clean.toLowerCase())) {
      setBotAreas(prev => [...prev, clean]);
    }
    setBotAreaInput('');
  };

  const handleToggleAreaTag = (a: string) => {
    if (botAreas.some(x => x.toLowerCase() === a.toLowerCase())) {
      if (botAreas.length > 1) {
        setBotAreas(prev => prev.filter(x => x.toLowerCase() !== a.toLowerCase()));
      }
    } else {
      setBotAreas(prev => [...prev, a]);
    }
  };

  // Modal Campaign Detail Search & Filter
  const [modalSearch, setModalSearch] = useState('');
  const [modalFilter, setModalFilter] = useState<'all' | 'noweb' | 'web'>('all');
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // 1. DYNAMIC EXTRACTION OF NICHES & AREAS FROM SCRAPED PROSPECTS
  const dynamicNiches = useMemo(() => {
    const set = new Set<string>();
    prospects.forEach(p => {
      if (p.sector) set.add(p.sector);
    });
    const list = Array.from(set).sort();
    return [{ label: 'Toutes les niches', value: 'all' }, ...list.map(n => ({ label: n, value: n }))];
  }, [prospects]);

  const dynamicAreas = useMemo(() => {
    const set = new Set<string>();
    prospects.forEach(p => {
      const area = extractArea(p);
      if (area && area !== 'Général') set.add(area);
    });
    const list = Array.from(set).sort();
    return [{ label: 'Toutes les wilayas / zones', value: 'all' }, ...list.map(a => ({ label: a, value: a }))];
  }, [prospects]);

  // 2. GROUP PROSPECTS INTO CAMPAIGNS (Dynamic Bot-Se format)
  const campaigns = useMemo(() => {
    const groups: Record<string, CampaignSummary> = {};

    prospects.forEach((p) => {
      const area = extractArea(p);
      const niche = p.sector || 'Général';
      const campId = p.campaignId || `camp-${niche.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${area.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const campName = `Scan ${niche} — ${area}`;

      if (!groups[campId]) {
        groups[campId] = {
          id: campId,
          name: campName,
          date: p.lastContact && p.lastContact !== 'Jamais' ? p.lastContact : 'Campagne Active',
          area,
          niche,
          totalLeads: 0,
          noWebsiteLeads: 0,
          priorityLeads: 0,
          contactedLeads: 0,
          avgScore: 0,
          leads: []
        };
      }

      const g = groups[campId];
      g.totalLeads += 1;
      g.leads.push(p);
      const hasWeb = hasValidWebsite(p.url);
      if (!hasWeb) g.noWebsiteLeads += 1;
      if (p.stage === 'contacte') g.contactedLeads += 1;
      if (p.score < 45 || !hasWeb) g.priorityLeads += 1;
      g.avgScore += (p.score || 50);
    });

    return Object.values(groups).map(g => ({
      ...g,
      avgScore: g.totalLeads > 0 ? Math.round(g.avgScore / g.totalLeads) : 50
    }));
  }, [prospects]);

  // 3. STATS SUMMARY FOR QUIET LUXURY TOP BANNER
  const globalStats = useMemo(() => {
    let totalLeads = prospects.length;
    let noWebsiteCount = 0;
    let priorityCount = 0;
    let totalScore = 0;
    let scoredCount = 0;

    prospects.forEach(p => {
      const hasWeb = hasValidWebsite(p.url);
      if (!hasWeb) noWebsiteCount += 1;
      if (p.score < 45 || !hasWeb) priorityCount += 1;
      if (hasWeb && p.score) {
        totalScore += p.score;
        scoredCount += 1;
      }
    });

    const avgWebScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;
    return {
      totalCampaigns: campaigns.length,
      totalLeads,
      noWebsiteCount,
      priorityCount,
      avgWebScore
    };
  }, [campaigns, prospects]);

  // 4. FILTERED AND SORTED CAMPAIGNS
  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter(c => {
        const matchNiche = nicheFilter === 'all' || c.niche === nicheFilter;
        const matchArea = areaFilter === 'all' || c.area === areaFilter;
        const matchNoWeb = !noWebsiteOnly || c.noWebsiteLeads > 0;
        const matchPriority = !priorityOnly || c.priorityLeads > 0;

        const q = search.toLowerCase().trim();
        const matchSearch = !q ||
          c.name.toLowerCase().includes(q) ||
          c.area.toLowerCase().includes(q) ||
          c.niche.toLowerCase().includes(q) ||
          c.leads.some(l => (l.company && l.company.toLowerCase().includes(q)) || (l.name && l.name.toLowerCase().includes(q)));

        return matchNiche && matchArea && matchNoWeb && matchPriority && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'leads_desc') return b.totalLeads - a.totalLeads;
        if (sortBy === 'noweb_desc') return b.noWebsiteLeads - a.noWebsiteLeads;
        if (sortBy === 'score_asc') return a.avgScore - b.avgScore;
        return 0; // Default order
      });
  }, [campaigns, nicheFilter, areaFilter, noWebsiteOnly, priorityOnly, search, sortBy]);

  // Filtered Leads inside Selected Campaign Modal
  const modalFilteredLeads = useMemo(() => {
    if (!selectedCampaign) return [];
    return selectedCampaign.leads.filter(l => {
      const hasWeb = hasValidWebsite(l.url);
      if (modalFilter === 'noweb' && hasWeb) return false;
      if (modalFilter === 'web' && !hasWeb) return false;

      const q = modalSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        (l.company && l.company.toLowerCase().includes(q)) ||
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.phone && l.phone.includes(q)) ||
        (l.notes && l.notes.toLowerCase().includes(q))
      );
    });
  }, [selectedCampaign, modalFilter, modalSearch]);

  const handleExportCsv = (camp: CampaignSummary) => {
    const headers = ['Nom', 'Entreprise', 'Telephone', 'Email', 'Site', 'Score', 'Statut', 'Notes'];
    const rows = camp.leads.map(l => [
      `"${l.name || ''}"`,
      `"${l.company || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      `"${l.url || ''}"`,
      l.score || '',
      `"${l.stage || ''}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${camp.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ type: 'success', message: `Export CSV de ${camp.totalLeads} prospects téléchargé.` });
  };

  const handleCopyPhone = (leadId: string, phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!phone || phone === 'Non renseigné') {
      addToast({ type: 'info', message: 'Numéro de téléphone non renseigné.' });
      return;
    }
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(leadId);
    setTimeout(() => setCopiedPhoneId(null), 2000);
    addToast({ type: 'success', message: `Numéro copié : ${phone}` });
  };

  const handleStartScrape = async () => {
    if (botQueries.length === 0) {
      addToast({ type: 'info', message: 'Veuillez sélectionner au moins une niche.' });
      return;
    }
    if (botAreas.length === 0) {
      addToast({ type: 'info', message: 'Veuillez sélectionner au moins une wilaya/ville.' });
      return;
    }

    const queryStr = botQueries.join(', ');
    const areaStr = botAreas.join(', ');
    const countPerZone = botTestMode ? 3 : botCount;
    const totalCombos = botQueries.length * botAreas.length;

    setIsBotModalOpen(false); // Close setup modal, monitor modal opens automatically!

    const res = await startCrawler({
      query: queryStr,
      area: areaStr,
      count: countPerZone,
      onlyNoWebsite: botOnlyNoWebsite,
      testMode: botTestMode,
      openBrowser: botOpenBrowser,
    });

    if (res.success) {
      addToast({ type: 'success', message: `Scan Bot-Se démarré pour ${totalCombos} combinaisons !` });
    } else {
      addToast({ type: 'error', message: res.error || 'Erreur lors du lancement' });
    }
  };

  const hasActiveFilters = nicheFilter !== 'all' || areaFilter !== 'all' || noWebsiteOnly || priorityOnly || search !== '';

  return (
    <div className="min-h-[calc(100dvh-56px)] pb-16 pt-6 px-4 sm:px-6 max-w-[1580px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Radio size={16} className="text-[#c5a059] animate-pulse" />
            <span className="text-[11px] font-body font-medium uppercase tracking-[0.12em] text-[#c5a059]">
              FLOTTE D&apos;ACQUISITION &bull; STEALTH SCRAPING
            </span>
          </div>
          <h1 className="font-display font-light text-[clamp(28px,3.5vw,42px)] text-[#e8e4dc] tracking-[-0.01em]">
            Campagnes & Extractions
          </h1>
          <p className="text-[14px] font-body text-[rgba(232,228,220,0.55)] mt-1">
            Gérez vos scans territoriaux Google Maps, filtrez par opportunité (avec ou sans site) et convertissez dans le Call Studio.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {isRunning ? (
            <button
              onClick={() => setIsMonitorOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[rgba(197,160,89,0.15)] border border-[rgba(197,160,89,0.4)] hover:bg-[rgba(197,160,89,0.25)] text-[#e8e4dc] transition-all cursor-pointer shadow-[0_0_15px_rgba(197,160,89,0.2)] animate-pulse"
              title="Suivre et contrôler le bot en direct"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]" />
              </span>
              <span className="text-[12px] font-body font-medium">
                Bot en Cours : <strong className="text-[#c5a059]">{currentCount}{targetCount > 0 ? `/${targetCount}` : ''}</strong>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[rgba(197,160,89,0.2)] text-[#c5a059]">
                Suivre &bull; Stop
              </span>
            </button>
          ) : latestResults && latestResults.leads && latestResults.leads.length > 0 ? (
            <button
              onClick={() => setIsMonitorOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#10101c] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(197,160,89,0.3)] text-[rgba(232,228,220,0.8)] hover:text-[#e8e4dc] transition-all cursor-pointer text-[12px] font-body"
              title="Voir le résultat du dernier scan"
            >
              <Layers size={14} className="text-[#c5a059]" />
              <span>Dernier Scan ({latestResults.leads.length})</span>
            </button>
          ) : null}

          <AnimatedButton icon={<Play size={15} />} onClick={() => setIsBotModalOpen(true)}>
            Nouveau Scan Bot
          </AnimatedButton>
        </div>
      </div>

      {/* Executive Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassPanel className="p-4 sm:p-5 border-[rgba(255,255,255,0.06)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[rgba(232,228,220,0.45)]">
              Campagnes Actives
            </p>
            <Layers size={16} className="text-[#c5a059]" />
          </div>
          <div className="text-[30px] font-display font-light text-[#e8e4dc] mt-2">
            {globalStats.totalCampaigns}
          </div>
          <div className="text-[11px] font-body text-[rgba(232,228,220,0.4)] mt-1">
            Zones & Niches cartographiées
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 sm:p-5 border-[rgba(255,255,255,0.06)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[rgba(232,228,220,0.45)]">
              Prospects Scrappés
            </p>
            <Users size={16} className="text-[#60a5fa]" />
          </div>
          <div className="text-[30px] font-display font-light text-[#e8e4dc] mt-2">
            {globalStats.totalLeads}
          </div>
          <div className="text-[11px] font-body text-[rgba(232,228,220,0.4)] mt-1">
            Entreprises enrichies prêtes à closer
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 sm:p-5 border-[rgba(255,255,255,0.06)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[rgba(232,228,220,0.45)]">
              Cibles Sans Site
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]">
              Clé en main
            </span>
          </div>
          <div className="text-[30px] font-display font-light text-[#f87171] mt-2">
            {globalStats.noWebsiteCount}
          </div>
          <div className="text-[11px] font-body text-[rgba(232,228,220,0.4)] mt-1">
            Fiches Maps sans vitrine web active
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 sm:p-5 border-[rgba(255,255,255,0.06)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-body font-semibold uppercase tracking-[0.08em] text-[rgba(232,228,220,0.45)]">
              Score Web Moyen
            </p>
            <BarChart2 size={16} className="text-[#4ade80]" />
          </div>
          <div className="text-[30px] font-display font-light text-[#4ade80] mt-2">
            {globalStats.avgWebScore}<span className="text-[16px] text-[rgba(232,228,220,0.4)]">/100</span>
          </div>
          <div className="text-[11px] font-body text-[rgba(232,228,220,0.4)] mt-1">
            Audit technique moyen des sites existants
          </div>
        </GlassPanel>
      </div>

      {/* Dynamic Bot-Se Filter Bar */}
      <GlassPanel className="p-4 mb-8 border-[rgba(255,255,255,0.08)]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left: Search input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)]" />
            <input
              type="text"
              placeholder="Rechercher par campagne, entreprise, ville, prospect..."
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

          {/* Center: Dynamic Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Dynamic Niches */}
            <div className="relative">
              <select
                value={nicheFilter}
                onChange={(e) => setNicheFilter(e.target.value)}
                className="h-10 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] px-3 pr-8 text-[12.5px] text-[#e8e4dc] focus:outline-none focus:border-[rgba(197,160,89,0.35)] appearance-none cursor-pointer"
              >
                {dynamicNiches.map((n) => (
                  <option key={n.value} value={n.value} className="bg-[#0e0e18] text-[#e8e4dc]">
                    {n.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)] pointer-events-none" />
            </div>

            {/* Dynamic Wilayas / Areas */}
            <div className="relative">
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="h-10 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] px-3 pr-8 text-[12.5px] text-[#e8e4dc] focus:outline-none focus:border-[rgba(197,160,89,0.35)] appearance-none cursor-pointer"
              >
                {dynamicAreas.map((a) => (
                  <option key={a.value} value={a.value} className="bg-[#0e0e18] text-[#e8e4dc]">
                    {a.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)] pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 rounded-[10px] bg-[#11111a] border border-[rgba(255,255,255,0.08)] px-3 pr-8 text-[12.5px] text-[#e8e4dc] focus:outline-none focus:border-[rgba(197,160,89,0.35)] appearance-none cursor-pointer"
              >
                <option value="recent" className="bg-[#0e0e18]">Trier par : Récents</option>
                <option value="leads_desc" className="bg-[#0e0e18]">Trier par : Plus de prospects</option>
                <option value="noweb_desc" className="bg-[#0e0e18]">Trier par : Plus d&apos;opportunités sans site</option>
                <option value="score_asc" className="bg-[#0e0e18]">Trier par : Score audit faible (priorité)</option>
              </select>
              <ArrowUpDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)] pointer-events-none" />
            </div>
          </div>

          {/* Right: Quick Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setNoWebsiteOnly(!noWebsiteOnly)}
              className={`h-10 px-3.5 rounded-[10px] text-[12px] font-body font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                noWebsiteOnly
                  ? 'bg-[rgba(239,68,68,0.18)] border border-[rgba(239,68,68,0.4)] text-[#f87171] shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                  : 'bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.65)] hover:border-[rgba(239,68,68,0.3)]'
              }`}
            >
              <span>🚫</span>
              <span>Sans site</span>
            </button>

            <button
              onClick={() => setPriorityOnly(!priorityOnly)}
              className={`h-10 px-3.5 rounded-[10px] text-[12px] font-body font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                priorityOnly
                  ? 'bg-[rgba(197,160,89,0.18)] border border-[rgba(197,160,89,0.4)] text-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.15)]'
                  : 'bg-[#11111a] border border-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.65)] hover:border-[rgba(197,160,89,0.3)]'
              }`}
            >
              <Star size={13} className={priorityOnly ? 'fill-[#c5a059]' : ''} />
              <span>Prioritaires</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearch('');
                  setNicheFilter('all');
                  setAreaFilter('all');
                  setNoWebsiteOnly(false);
                  setPriorityOnly(false);
                }}
                className="h-10 px-3 rounded-[10px] text-[12px] font-body text-[rgba(232,228,220,0.45)] hover:text-[#e8e4dc] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                title="Réinitialiser les filtres"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </GlassPanel>

      {/* Campaigns Grid */}
      {filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCampaigns.map((camp) => (
            <GlassPanel 
              key={camp.id} 
              className="p-5 flex flex-col justify-between hover:border-[rgba(197,160,89,0.35)] transition-all duration-300 group cursor-pointer hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
              onClick={() => {
                setSelectedCampaign(camp);
                setModalFilter('all');
                setModalSearch('');
              }}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-body font-semibold uppercase tracking-[0.08em] px-2.5 py-0.5 rounded-full bg-[rgba(197,160,89,0.12)] text-[#c5a059] border border-[rgba(197,160,89,0.2)]">
                        {camp.niche}
                      </span>
                      <span className="text-[10px] font-body text-[rgba(232,228,220,0.5)] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
                        📍 {camp.area}
                      </span>
                    </div>
                    <h3 className="font-display font-medium text-[20px] text-[#e8e4dc] mt-2 group-hover:text-[#c5a059] transition-colors leading-snug">
                      {camp.name}
                    </h3>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[26px] font-display font-light text-[#e8e4dc]">
                      {camp.totalLeads}
                    </div>
                    <div className="text-[10px] font-body text-[rgba(232,228,220,0.4)] uppercase tracking-wider">
                      Prospects
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[12px] font-body text-[rgba(232,228,220,0.5)] mb-4">
                  <Calendar size={13} className="text-[rgba(232,228,220,0.4)]" />
                  <span>{camp.date}</span>
                </div>

                {/* Key indicators row */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[rgba(255,255,255,0.06)] text-center">
                  <div className="bg-[#11111a] rounded-[10px] p-2">
                    <div className="text-[15px] font-display font-medium text-[#f87171]">{camp.noWebsiteLeads}</div>
                    <div className="text-[9.5px] font-body text-[rgba(232,228,220,0.4)] uppercase">Sans site</div>
                  </div>
                  <div className="bg-[#11111a] rounded-[10px] p-2">
                    <div className="text-[15px] font-display font-medium text-[#c5a059]">{camp.priorityLeads}</div>
                    <div className="text-[9.5px] font-body text-[rgba(232,228,220,0.4)] uppercase">Prioritaires</div>
                  </div>
                  <div className="bg-[#11111a] rounded-[10px] p-2">
                    <div className="text-[15px] font-display font-medium text-[#4ade80]">{camp.avgScore}/100</div>
                    <div className="text-[9.5px] font-body text-[rgba(232,228,220,0.4)] uppercase">Score Web</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-[rgba(255,255,255,0.05)]">
                <button
                  onClick={(e) => { e.stopPropagation(); handleExportCsv(camp); }}
                  className="text-[11.5px] font-body text-[rgba(232,228,220,0.6)] hover:text-[#c5a059] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={13} />
                  <span>Export CSV</span>
                </button>
                <span className="text-[11.5px] font-body text-[rgba(197,160,89,0.85)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Explorer les {camp.totalLeads} prospects</span>
                  <ChevronRight size={13} />
                </span>
              </div>
            </GlassPanel>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center mx-auto mb-3 text-[rgba(232,228,220,0.4)]">
            <Filter size={20} />
          </div>
          <h3 className="font-display font-medium text-[18px] text-[#e8e4dc]">
            Aucune campagne ne correspond à ces critères
          </h3>
          <p className="text-[13px] font-body text-[rgba(232,228,220,0.5)] mt-1 max-w-[420px] mx-auto">
            Ajustez vos filtres de niche, wilaya ou statut de site web pour afficher les campagnes disponibles.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setNicheFilter('all');
              setAreaFilter('all');
              setNoWebsiteOnly(false);
              setPriorityOnly(false);
            }}
            className="mt-4 px-4 py-2 rounded-full text-[12px] font-body bg-[#1a1a28] text-[#c5a059] hover:bg-[#252538] transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Modal: Interactive Campaign Prospect Explorer */}
      <AnimatePresence>
        {selectedCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[rgba(5,5,9,0.85)] backdrop-blur-[12px]"
              onClick={() => setSelectedCampaign(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-[960px] max-h-[90vh] bg-[#0c0c16] border border-[rgba(197,160,89,0.25)] rounded-[20px] shadow-2xl z-10 flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-[rgba(255,255,255,0.06)] bg-[#0f0f1c]/60">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-body font-semibold uppercase tracking-[0.08em] px-2.5 py-0.5 rounded-full bg-[rgba(197,160,89,0.15)] text-[#c5a059] border border-[rgba(197,160,89,0.25)]">
                        {selectedCampaign.niche}
                      </span>
                      <span className="text-[10px] font-body text-[rgba(232,228,220,0.5)] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)]">
                        📍 {selectedCampaign.area}
                      </span>
                      <span className="text-[10px] font-body text-[rgba(232,228,220,0.4)]">
                        &bull; {selectedCampaign.totalLeads} prospects cartographiés
                      </span>
                    </div>
                    <h2 className="font-display font-medium text-[24px] text-[#e8e4dc]">
                      {selectedCampaign.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportCsv(selectedCampaign)}
                      className="px-3.5 py-2 rounded-[10px] bg-[#141424] hover:bg-[#1c1c32] border border-[rgba(255,255,255,0.08)] text-[12px] font-body text-[#e8e4dc] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Download size={13} className="text-[#c5a059]" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      onClick={() => setSelectedCampaign(null)}
                      className="w-9 h-9 rounded-full bg-[#141424] hover:bg-[#202036] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[rgba(232,228,220,0.6)] hover:text-[#e8e4dc] transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Sub-Filters inside campaign modal */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-5">
                  <div className="relative flex-1 max-w-[340px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)]" />
                    <input
                      type="text"
                      placeholder="Rechercher dans cette campagne..."
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      className="w-full h-9 rounded-[8px] bg-[#141424] border border-[rgba(255,255,255,0.08)] pl-8 pr-3 text-[12px] text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.35)] focus:outline-none focus:border-[rgba(197,160,89,0.35)]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModalFilter('all')}
                      className={`px-3 py-1.5 rounded-[8px] text-[11px] font-body font-medium transition-all ${
                        modalFilter === 'all'
                          ? 'bg-[rgba(197,160,89,0.2)] text-[#c5a059] border border-[rgba(197,160,89,0.3)]'
                          : 'bg-[#141424] text-[rgba(232,228,220,0.5)] border border-[rgba(255,255,255,0.06)] hover:text-[#e8e4dc]'
                      }`}
                    >
                      Tous ({selectedCampaign.leads.length})
                    </button>
                    <button
                      onClick={() => setModalFilter('noweb')}
                      className={`px-3 py-1.5 rounded-[8px] text-[11px] font-body font-medium transition-all ${
                        modalFilter === 'noweb'
                          ? 'bg-[rgba(239,68,68,0.2)] text-[#f87171] border border-[rgba(239,68,68,0.3)]'
                          : 'bg-[#141424] text-[rgba(232,228,220,0.5)] border border-[rgba(255,255,255,0.06)] hover:text-[#e8e4dc]'
                      }`}
                    >
                      🚫 Sans site ({selectedCampaign.noWebsiteLeads})
                    </button>
                    <button
                      onClick={() => setModalFilter('web')}
                      className={`px-3 py-1.5 rounded-[8px] text-[11px] font-body font-medium transition-all ${
                        modalFilter === 'web'
                          ? 'bg-[rgba(96,165,250,0.2)] text-[#60a5fa] border border-[rgba(96,165,250,0.3)]'
                          : 'bg-[#141424] text-[rgba(232,228,220,0.5)] border border-[rgba(255,255,255,0.06)] hover:text-[#e8e4dc]'
                      }`}
                    >
                      🌐 Avec site ({selectedCampaign.totalLeads - selectedCampaign.noWebsiteLeads})
                    </button>
                  </div>
                </div>
              </div>

              {/* Prospects Scrollable List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                {modalFilteredLeads.length > 0 ? (
                  modalFilteredLeads.map((lead) => {
                    const hasWeb = hasValidWebsite(lead.url);
                    const leadScoreColor = lead.score >= 70 ? '#4ade80' : lead.score >= 40 ? '#60a5fa' : '#f87171';

                    return (
                      <div
                        key={lead.id}
                        className="p-4 rounded-[12px] bg-[#11111d] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(197,160,89,0.3)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-display font-medium text-[16px] text-[#e8e4dc] group-hover:text-[#c5a059] transition-colors truncate">
                              {lead.company}
                            </span>
                            {hasWeb ? (
                              <span
                                className="text-[10px] font-body font-bold px-2 py-0.5 rounded-full"
                                style={{ color: leadScoreColor, backgroundColor: `${leadScoreColor}15` }}
                              >
                                Score {lead.score}/100
                              </span>
                            ) : (
                              <span className="text-[10px] font-body font-bold px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.25)]">
                                🚫 Zéro site web
                              </span>
                            )}
                          </div>

                          <div className="text-[12px] font-body text-[rgba(232,228,220,0.6)] flex items-center gap-3 flex-wrap">
                            <span>Interlocuteur : <strong className="text-[#e8e4dc] font-normal">{lead.name || 'Dirigeant'}</strong></span>
                            <span>&bull;</span>
                            {hasWeb ? (
                              <a
                                href={lead.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[rgba(96,165,250,0.85)] hover:underline flex items-center gap-1"
                              >
                                <Globe size={11} />
                                <span className="truncate max-w-[180px]">{lead.url.replace(/^https?:\/\//, '')}</span>
                                <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span className="text-[#fbbf24] flex items-center gap-1">
                                ⭐ 4.8★ Google Maps
                              </span>
                            )}
                          </div>

                          {lead.notes && (
                            <p className="text-[11px] font-mono text-[rgba(232,228,220,0.4)] mt-2 line-clamp-1">
                              {lead.notes}
                            </p>
                          )}
                        </div>

                        {/* Actions for this lead */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {lead.phone && lead.phone !== 'Non renseigné' && (
                            <button
                              onClick={(e) => handleCopyPhone(lead.id, lead.phone, e)}
                              className="h-9 px-3 rounded-[8px] bg-[#19192a] hover:bg-[#222238] border border-[rgba(255,255,255,0.06)] text-[11.5px] font-body text-[rgba(232,228,220,0.8)] flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Copier le numéro"
                            >
                              {copiedPhoneId === lead.id ? (
                                <>
                                  <Check size={12} className="text-[#4ade80]" />
                                  <span className="text-[#4ade80]">Copié</span>
                                </>
                              ) : (
                                <>
                                  <Phone size={12} className="text-[rgba(232,228,220,0.5)]" />
                                  <span>{lead.phone}</span>
                                  <Copy size={11} className="text-[rgba(232,228,220,0.3)] ml-0.5" />
                                </>
                              )}
                            </button>
                          )}

                          <Link
                            href={`/call?id=${lead.id}`}
                            className="h-9 px-3.5 rounded-[8px] bg-[rgba(197,160,89,0.15)] hover:bg-[rgba(197,160,89,0.25)] border border-[rgba(197,160,89,0.3)] text-[12px] font-body font-medium text-[#c5a059] flex items-center gap-1.5 transition-colors"
                          >
                            <Phone size={12} />
                            <span>Lancer l&apos;Appel</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-[13px] font-body text-[rgba(232,228,220,0.4)]">
                    Aucun prospect ne correspond à ce filtre interne.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: New Bot Scrape Run (Bot-Se Sovereign Engine) */}
      <AnimatePresence>
        {isBotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[rgba(5,5,10,0.85)] backdrop-blur-[12px]"
              onClick={() => !isRunning && setIsBotModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto bg-[rgba(12,12,22,0.98)] border border-[rgba(197,160,89,0.3)] rounded-[20px] p-6 sm:p-7 shadow-[0_24px_80px_rgba(0,0,0,0.9)] z-10 custom-scrollbar"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5 border-b border-[rgba(255,255,255,0.06)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[rgba(197,160,89,0.15)] border border-[rgba(197,160,89,0.3)] flex items-center justify-center text-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.15)]">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-medium text-[20px] text-[#e8e4dc]">
                        Lancer un Scan Furtif
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[rgba(197,160,89,0.15)] border border-[rgba(197,160,89,0.3)] text-[#c5a059]">
                        Bot-Se Engine
                      </span>
                    </div>
                    <p className="text-[12px] font-body text-[rgba(232,228,220,0.5)] mt-0.5">
                      Extraction Playwright Stealth + enrichissement multi-canal Google Maps
                    </p>
                  </div>
                </div>
                  <button
                    onClick={() => setIsBotModalOpen(false)}
                    className="p-1.5 rounded-full text-[rgba(232,228,220,0.4)] hover:text-[#e8e4dc] hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Field: Niches Multi-Select */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11.5px] font-body text-[rgba(232,228,220,0.7)] uppercase tracking-[0.08em] flex items-center gap-1.5">
                        <Target size={13} className="text-[#c5a059]" />
                        <span>Niches / Métiers Ciblés ({botQueries.length})</span>
                      </label>
                      <span className="text-[10.5px] text-[rgba(232,228,220,0.4)]">
                        Multi-sélection &bull; [Entrée] ou [,] pour ajouter
                      </span>
                    </div>

                    {/* Active Niches Tags Box */}
                    <div className="min-h-[46px] p-2 rounded-[12px] bg-[#10101c] border border-[rgba(255,255,255,0.08)] flex items-center gap-2 flex-wrap focus-within:border-[rgba(197,160,89,0.5)] transition-colors">
                      {botQueries.map((niche) => (
                        <span
                          key={niche}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(197,160,89,0.15)] border border-[rgba(197,160,89,0.35)] text-[#e8e4dc] text-[12px] font-body shadow-[0_0_10px_rgba(197,160,89,0.1)]"
                        >
                          <span className="font-medium">{niche}</span>
                          {botQueries.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleToggleQueryTag(niche)}
                              className="text-[rgba(232,228,220,0.45)] hover:text-[#f87171] transition-colors cursor-pointer"
                              title={`Retirer ${niche}`}
                            >
                              <X size={12} />
                            </button>
                          )}
                        </span>
                      ))}

                      {/* Inline Input for custom tag */}
                      <input
                        type="text"
                        value={botQueryInput}
                        onChange={(e) => setBotQueryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            handleAddQueryTag(botQueryInput);
                          }
                        }}
                        onBlur={() => {
                          if (botQueryInput.trim()) handleAddQueryTag(botQueryInput);
                        }}
                        placeholder={botQueries.length === 0 ? "Ajouter une niche (ex: Dentiste)..." : "+ Ajouter..."}
                        className="flex-1 min-w-[120px] bg-transparent border-none text-[13px] font-body text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.3)] focus:outline-none px-1"
                      />
                    </div>

                    {/* Quick suggestion toggle chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10.5px] text-[rgba(232,228,220,0.4)] mr-1">Suggestions :</span>
                      {['Dentiste', 'Agence de voyage', 'Clinique privée', 'Restaurant', 'Avocat', 'Architecte', 'Hôtel'].map((s) => {
                        const isSelected = botQueries.some(x => x.toLowerCase() === s.toLowerCase());
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleToggleQueryTag(s)}
                            className={cn(
                              "px-2.5 py-1 rounded-[8px] text-[11px] font-body transition-all cursor-pointer flex items-center gap-1 border",
                              isSelected
                                ? "bg-[rgba(197,160,89,0.2)] text-[#c5a059] border-[rgba(197,160,89,0.45)] font-medium shadow-[0_0_10px_rgba(197,160,89,0.15)]"
                                : "bg-[rgba(255,255,255,0.03)] text-[rgba(232,228,220,0.55)] border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.07)] hover:text-[#e8e4dc]"
                            )}
                          >
                            <span>{s}</span>
                            {isSelected ? <Check size={10} /> : <Plus size={10} className="opacity-60" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Field: Areas Multi-Select */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11.5px] font-body text-[rgba(232,228,220,0.7)] uppercase tracking-[0.08em] flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#60a5fa]" />
                        <span>Wilayas / Villes Ciblées ({botAreas.length})</span>
                      </label>
                      <span className="text-[10.5px] text-[rgba(232,228,220,0.4)]">
                        Multi-zones &bull; [Entrée] ou [,] pour ajouter
                      </span>
                    </div>

                    {/* Active Areas Tags Box */}
                    <div className="min-h-[46px] p-2 rounded-[12px] bg-[#10101c] border border-[rgba(255,255,255,0.08)] flex items-center gap-2 flex-wrap focus-within:border-[rgba(96,165,250,0.5)] transition-colors">
                      {botAreas.map((area) => (
                        <span
                          key={area}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(96,165,250,0.15)] border border-[rgba(96,165,250,0.35)] text-[#e8e4dc] text-[12px] font-body shadow-[0_0_10px_rgba(96,165,250,0.1)]"
                        >
                          <span className="font-medium">{area}</span>
                          {botAreas.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleToggleAreaTag(area)}
                              className="text-[rgba(232,228,220,0.45)] hover:text-[#f87171] transition-colors cursor-pointer"
                              title={`Retirer ${area}`}
                            >
                              <X size={12} />
                            </button>
                          )}
                        </span>
                      ))}

                      {/* Inline Input for custom area */}
                      <input
                        type="text"
                        value={botAreaInput}
                        onChange={(e) => setBotAreaInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            handleAddAreaTag(botAreaInput);
                          }
                        }}
                        onBlur={() => {
                          if (botAreaInput.trim()) handleAddAreaTag(botAreaInput);
                        }}
                        placeholder={botAreas.length === 0 ? "Ajouter une ville (ex: Alger)..." : "+ Ajouter..."}
                        className="flex-1 min-w-[120px] bg-transparent border-none text-[13px] font-body text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.3)] focus:outline-none px-1"
                      />
                    </div>

                    {/* Quick suggestion toggle chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10.5px] text-[rgba(232,228,220,0.4)] mr-1">Suggestions :</span>
                      {['Alger', 'Oran', 'Constantine', 'Sétif', 'Annaba', 'Riyadh', 'Doha', 'Paris'].map((a) => {
                        const isSelected = botAreas.some(x => x.toLowerCase() === a.toLowerCase());
                        return (
                          <button
                            key={a}
                            type="button"
                            onClick={() => handleToggleAreaTag(a)}
                            className={cn(
                              "px-2.5 py-1 rounded-[8px] text-[11px] font-body transition-all cursor-pointer flex items-center gap-1 border",
                              isSelected
                                ? "bg-[rgba(96,165,250,0.2)] text-[#60a5fa] border-[rgba(96,165,250,0.45)] font-medium shadow-[0_0_10px_rgba(96,165,250,0.15)]"
                                : "bg-[rgba(255,255,255,0.03)] text-[rgba(232,228,220,0.55)] border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.07)] hover:text-[#e8e4dc]"
                            )}
                          >
                            <span>{a}</span>
                            {isSelected ? <Check size={10} /> : <Plus size={10} className="opacity-60" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Field: Luxury Segmented Target Volume (No crude slider) */}
                  <div className="p-4 rounded-[14px] bg-[#10101c] border border-[rgba(197,160,89,0.22)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[11.5px] font-body text-[#e8e4dc] font-medium uppercase tracking-[0.08em] block">
                          Volume de Cibles par Zone
                        </label>
                        <span className="text-[11px] text-[rgba(232,228,220,0.45)]">
                          Nombre d&apos;entreprises extraites par combinaison
                        </span>
                      </div>
                      {botTestMode ? (
                        <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] text-[#fbbf24] flex items-center gap-1">
                          <FlaskConical size={12} />
                          <span>3 cibles (Mode Test Actif)</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[rgba(197,160,89,0.12)] border border-[rgba(197,160,89,0.3)] focus-within:border-[#c5a059] transition-all" title="Cliquez pour taper directement le nombre">
                          <input
                            type="number"
                            min={1}
                            max={500}
                            value={botCount}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setBotCount(isNaN(val) ? 1 : Math.max(1, Math.min(500, val)));
                            }}
                            className="w-12 text-center bg-transparent border-none text-[14px] font-mono font-bold text-[#c5a059] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text"
                          />
                          <span className="text-[11px] text-[rgba(232,228,220,0.6)]">cibles / zone</span>
                        </div>
                      )}
                    </div>

                    {/* Segmented Volume Cards + Custom Direct Input */}
                    <div className={cn("grid grid-cols-2 sm:grid-cols-5 gap-2", botTestMode && "opacity-40 pointer-events-none")}>
                      {[
                        { value: 15, label: '15', tag: 'Éclair' },
                        { value: 25, label: '25', tag: 'Standard' },
                        { value: 50, label: '50', tag: 'Approfondi' },
                        { value: 100, label: '100', tag: 'Max Maps' }
                      ].map((preset) => {
                        const isSelected = botCount === preset.value && !botTestMode;
                        return (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => setBotCount(preset.value)}
                            className={cn(
                              "py-2 px-1.5 rounded-[10px] text-center transition-all cursor-pointer border",
                              isSelected
                                ? "bg-[linear-gradient(180deg,rgba(197,160,89,0.22),rgba(197,160,89,0.08))] border-[#c5a059] text-[#e8e4dc] shadow-[0_0_15px_rgba(197,160,89,0.15)]"
                                : "bg-[#0b0b14] border-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.6)] hover:border-[rgba(255,255,255,0.15)] hover:text-[#e8e4dc]"
                            )}
                          >
                            <div className="text-[14px] font-mono font-bold">{preset.label}</div>
                            <div className="text-[9.5px] font-body text-[rgba(232,228,220,0.4)] mt-0.5">{preset.tag}</div>
                          </button>
                        );
                      })}

                      {/* 5th Segment: Custom Editable Input */}
                      <div
                        onClick={() => document.getElementById('custom-volume-input')?.focus()}
                        className={cn(
                          "py-2 px-1.5 rounded-[10px] text-center transition-all border cursor-text col-span-2 sm:col-span-1 flex flex-col justify-center items-center",
                          (![15, 25, 50, 100].includes(botCount) && !botTestMode)
                            ? "bg-[linear-gradient(180deg,rgba(197,160,89,0.22),rgba(197,160,89,0.08))] border-[#c5a059] text-[#e8e4dc] shadow-[0_0_15px_rgba(197,160,89,0.15)]"
                            : "bg-[#0b0b14] border-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.6)] hover:border-[rgba(255,255,255,0.15)] focus-within:border-[rgba(197,160,89,0.6)]"
                        )}
                      >
                        <div className="flex items-center justify-center">
                          <input
                            id="custom-volume-input"
                            type="number"
                            min={1}
                            max={500}
                            value={(![15, 25, 50, 100].includes(botCount) && !botTestMode) ? botCount : ''}
                            placeholder="Autre..."
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val)) {
                                setBotCount(Math.max(1, Math.min(500, val)));
                              } else {
                                setBotCount(1);
                              }
                            }}
                            className={cn(
                              "w-full text-center bg-transparent border-none text-[14px] font-mono font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                              (![15, 25, 50, 100].includes(botCount) && !botTestMode)
                                ? "text-[#c5a059]"
                                : "text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.35)]"
                            )}
                          />
                        </div>
                        <div className="text-[9.5px] font-body text-[rgba(232,228,220,0.4)] mt-0.5">
                          {(![15, 25, 50, 100].includes(botCount) && !botTestMode) ? 'Sur-mesure' : 'Personnalisé'}
                        </div>
                      </div>
                    </div>

                    {/* Live Combined Calculation Banner */}
                    <div className="p-3 rounded-[10px] bg-[rgba(10,10,18,0.7)] border border-[rgba(255,255,255,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] font-body">
                      <div className="text-[rgba(232,228,220,0.6)] flex items-center gap-2">
                        <Sparkles size={13} className="text-[#c5a059]" />
                        <span>
                          <strong className="text-[#e8e4dc]">{botQueries.length}</strong> niche{botQueries.length > 1 ? 's' : ''} &times; <strong className="text-[#e8e4dc]">{botAreas.length}</strong> zone{botAreas.length > 1 ? 's' : ''} = <strong className="text-[#c5a059]">{botQueries.length * botAreas.length}</strong> scan{botQueries.length * botAreas.length > 1 ? 's' : ''} combiné{botQueries.length * botAreas.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="font-mono text-[12px] text-[#4ade80] sm:text-right">
                        Total attendu : <strong>~{(botQueries.length * botAreas.length) * (botTestMode ? 3 : botCount)} prospects</strong>
                      </div>
                    </div>
                  </div>

                  {/* ─── Bot-Se Core Features & Controls ─── */}
                  <div className="space-y-2.5 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                    <span className="text-[10.5px] font-body font-semibold uppercase tracking-[0.12em] text-[#c5a059] block mb-2">
                      Paramètres Avancés Bot-Se (.env)
                    </span>

                    {/* Switch 1: ONLY_NO_WEBSITE */}
                    <div className="p-3.5 rounded-[12px] bg-[#0f0f1b] border border-[rgba(197,160,89,0.22)] flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px] font-body font-medium text-[#e8e4dc]">
                            Cibles Sans Site Web Uniquement
                          </span>
                          <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]">
                            ONLY_NO_WEBSITE
                          </span>
                        </div>
                        <p className="text-[11.5px] font-body text-[rgba(232,228,220,0.5)] leading-relaxed">
                          Ignore les commerces ayant déjà un site. Ne capture que les entreprises sans vitrine web (gain de temps 3x et closing maximal).
                        </p>
                      </div>
                      <ToggleSwitch checked={botOnlyNoWebsite} onChange={setBotOnlyNoWebsite} />
                    </div>

                    {/* Switch 2: TEST_MODE */}
                    <div className="p-3.5 rounded-[12px] bg-[#0f0f1b] border border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px] font-body font-medium text-[#e8e4dc]">
                            Mode Test Rapide (Validation 3 leads)
                          </span>
                          <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-[#fbbf24] border border-[rgba(245,158,11,0.3)]">
                            TEST_MODE
                          </span>
                        </div>
                        <p className="text-[11.5px] font-body text-[rgba(232,228,220,0.5)] leading-relaxed">
                          Scrappe seulement 3 fiches pour valider vos sélecteurs et la zone avant de lancer un scan massif.
                        </p>
                      </div>
                      <ToggleSwitch checked={botTestMode} onChange={setBotTestMode} />
                    </div>

                    {/* Switch 3: OPEN_BROWSER (Headed vs Headless) */}
                    <div className="p-3.5 rounded-[12px] bg-[#0f0f1b] border border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px] font-body font-medium text-[#e8e4dc]">
                            Afficher le Navigateur à l&apos;Écran
                          </span>
                          <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(96,165,250,0.15)] text-[#60a5fa] border border-[rgba(96,165,250,0.3)]">
                            OPEN_BROWSER
                          </span>
                        </div>
                        <p className="text-[11.5px] font-body text-[rgba(232,228,220,0.5)] leading-relaxed">
                          Ouvre une fenêtre Chromium visible pour observer les actions et scrolls du bot en direct sur Google Maps.
                        </p>
                      </div>
                      <ToggleSwitch checked={botOpenBrowser} onChange={setBotOpenBrowser} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                    <button
                      type="button"
                      onClick={() => setIsBotModalOpen(false)}
                      className="px-4 py-2 rounded-full text-[13px] font-body text-[rgba(232,228,220,0.5)] hover:text-[#e8e4dc] transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                    <AnimatedButton icon={<Play size={14} />} onClick={handleStartScrape}>
                      Démarrer le Scraping Furtif
                    </AnimatedButton>
                  </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
